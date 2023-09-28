import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateCategoryId, validateImage, validateMuseumId, validateMuseumIdCategoryId, validatePagination } from "../utils/validations";
import { uploadFile } from "../lib/storage";

export async function searchCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const query = z.object({
            name: z.string().default(''),
        }).parse(req.query);
        const params = validateMuseumId.parse(req.params);
        const categories = await prisma.category.findMany({
            take: 5,
            where: {
                name: {
                    contains: query.name,
                    mode: 'insensitive'
                },
                museumId: params.museumId
            },
            select: {
                name: true,
                id: true
            }
        })
        return res.status(200).json({ categories });
    } catch (err) {
        next(err);
    }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const query = validatePagination.parse(req.query);

        const categories = await prisma.category.findMany({
            take: query.pageSize + 1,
            skip: (query.page - 1) * query.pageSize,
            where: {
                museumId: params.museumId
            }
        });
        let hasNext = false;
        if (categories.length - 1 === query.pageSize) {
            hasNext = true;
            categories.pop();
        }
        return res.status(200).json({ categories, hasNext });
    } catch (rr) {
        next(rr);
    }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.parse(req.params);
        const category = await prisma.category.findFirst({
            where: {
                museumId: params.museumId,
                id: params.categoryId
            },
            include: {
                museum: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!category) return res.status(404).json({ errors: ['Category is not found'] });
        return res.status(200).json({ category });
    } catch (rr) {
        next(rr);
    }
}

const validateCreateParams = z.object({
    description: z.string(),
    name: z.string().trim().min(1),
})
export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const body = validateCreateParams.parse(req.fields);
        const mus = await prisma.museum.findFirst({
            where: {
                id: params.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        const category = await prisma.category.create({
            data: {
                museumId: params.museumId,
                description: body.description,
                name: body.name,
            }
        })
        return res.status(201).json({ category });
    } catch (rr) {
        next(rr);
    }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.parse(req.params);
        const body = validateCreateParams.merge(validateMuseumId).parse(req.fields);
        // check if the current museum exists
        const mus = await prisma.museum.findFirst({
            where: {
                id: params.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        // check if new museum exists
        const newMus = await prisma.museum.findFirst({
            where: {
                id: body.museumId
            },
            select: {
                id: true
            }
        });
        if (!newMus) return res.status(404).json({ errors: [`Can't change to a museum that doesn't exist!`] });
        // update category
        const category = await prisma.category.update({
            where: {
                id: params.categoryId
            },
            data: {
                description: body.description,
                name: body.name,
                museumId: body.museumId
            }
        });
        return res.status(200).json({ category });
    } catch (rr) {
        next(rr);
    }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCategoryId.parse(req.params);
        await prisma.category.delete({
            where: {
                id: params.categoryId
            }
        });
        return res.status(204).send();
    } catch (rr) {
        next(rr);
    }
}

export async function updateImage(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.parse(req.params);
        const files = validateImage.parse(req.files);
        if (!files.image) {
            return res.status(400).json({ errors: [`Missing image file`] });
        }
        let url = await uploadFile(files.image.path);
        await prisma.category.update({
            where: {
                id: params.categoryId,
                museumId: params.museumId,
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