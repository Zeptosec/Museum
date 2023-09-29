import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateImage, validateMuseumId, validatePagination } from "../utils/validations";
import { uploadFile } from "../lib/storage";
import { TokenPayload } from "../utils/tokenator";
import { validatedMuseum } from "./categoryController";

export async function searchMuseums(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.merge(z.object({
            name: z.string().default('')
        })).parse(req.query);
        const user = res.locals.user as TokenPayload;
        let museums = [];
        switch (user.role) {
            case 'CURATOR':
                const curatorMuseums = await prisma.museum.findMany({
                    take: query.pageSize + 1,
                    skip: (query.page - 1) * query.pageSize,
                    where: {
                        categories: {
                            some: {
                                UserCategory: {
                                    some: {
                                        userId: res.locals.user.id
                                    }
                                }
                            }
                        },
                        name: {
                            contains: query.name,
                            mode: 'insensitive'
                        }
                    },
                    select: {
                        name: true,
                        id: true,
                        imageUrl: true,
                        description: true
                    }
                })
                museums = curatorMuseums;
                break;
            case 'ADMIN':
                museums = await prisma.museum.findMany({
                    take: query.pageSize + 1,
                    skip: (query.page - 1) * query.pageSize,
                    where: {
                        name: {
                            contains: query.name,
                            mode: 'insensitive'
                        }
                    },
                    select: {
                        name: true,
                        id: true
                    }
                })
                break;
            default:
                return res.status(501).json({ errors: [`Method for user role '${user.role}' is not implemented!`] });
        }
        let hasNext = false;
        if (museums.length - 1 === query.pageSize) {
            hasNext = true;
            museums.pop();
        }
        return res.status(200).json({ museums, hasNext });
    } catch (err) {
        next(err);
    }
}

export async function getMuseums(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.parse(req.query);
        const mus = await prisma.museum.findMany({
            take: query.pageSize + 1,
            skip: (query.page - 1) * query.pageSize
        });
        let hasNext = false;
        if (mus.length - 1 === query.pageSize) {
            hasNext = true;
            mus.pop();
        }
        return res.status(200).json({ museums: mus, hasNext });
    } catch (rr) {
        next(rr);
    }
}

export async function getMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const mus = await prisma.museum.findFirst({
            where: {
                id: params.museumId
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found'] });
        return res.status(200).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

const validateCreateParams = z.object({
    description: z.string(),
    name: z.string().trim().min(1),
})
export async function createMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const body = validateCreateParams.parse(req.fields);
        const mus = await prisma.museum.create({
            data: {
                description: body.description,
                name: body.name,
            }
        })
        return res.status(201).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

export async function updateMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const body = validateCreateParams.parse(req.fields);
        if (!await validatedMuseum(params.museumId, res))
            return;
        const mus = await prisma.museum.update({
            where: {
                id: params.museumId
            },
            data: {
                description: body.description,
                name: body.name,
            }
        })
        return res.status(200).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

export async function deleteMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        if (!await validatedMuseum(params.museumId, res))
            return;
        await prisma.museum.delete({
            where: {
                id: params.museumId
            }
        })
        return res.status(204).send();
    } catch (rr) {
        next(rr);
    }
}

export async function updateImage(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const files = validateImage.parse(req.files);
        if (!await validatedMuseum(params.museumId, res))
            return;
        if (!files.image) {
            return res.status(400).json({ errors: [`Missing image file`] });
        }
        let url = await uploadFile(files.image.path);
        await prisma.museum.update({
            where: {
                id: params.museumId
            },
            data: {
                imageUrl: url
            }
        })
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}