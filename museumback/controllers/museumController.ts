import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateMuseumId, validatePagination } from "../utils/validations";

export async function getMuseums(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.parse(req.query);
        const mus = await prisma.museum.findMany({
            take: query.pageSize,
            skip: (query.page - 1) * query.pageSize
        });
        return res.status(200).json({ museums: mus });
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
    name: z.string()
})
export async function createMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const body = validateCreateParams.parse(req.body);
        const mus = await prisma.museum.create({
            data: {
                description: body.description,
                name: body.name
            }
        })
        return res.status(201).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

const validateUpdateParams = z.object({
    id: z.number().min(0),
    description: z.string(),
    name: z.string()
})

export async function updateMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const urlParams = validateMuseumId.parse(req.params);
        const params = validateUpdateParams.parse(req.body);
        const mus = await prisma.museum.update({
            where: {
                id: urlParams.museumId
            },
            data: {
                description: params.description,
                name: params.name,
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