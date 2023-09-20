import { NextFunction, Request, Response } from "express";
import { pageSize } from "./adminController";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const validateGetParams = z.object({
    museumId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    ),
    page: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
})

export async function getCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateGetParams.parse(req.query);
        const categories = await prisma.category.findMany({
            take: pageSize,
            skip: (pageSize - 1) * params.page,
            where: {
                museumId: params.museumId
            }
        });
        return res.status(200).json({ categories });
    } catch (rr) {
        next(rr);
    }
}


const validateCreateParams = z.object({
    description: z.string(),
    name: z.string(),
    museumId: z.number().min(0)
})
export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCreateParams.parse(req.body);
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
                description: params.description,
                name: params.name
            }
        })
        return res.status(201).json({ category });
    } catch (rr) {
        next(rr);
    }
}

const validateUpdateParams = z.object({
    id: z.number().min(0),
    description: z.string(),
    name: z.string(),
    museumId: z.number().min(0)
})
export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateUpdateParams.parse(req.body);
        const mus = await prisma.museum.findFirst({
            where: {
                id: params.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        const category = await prisma.category.update({
            where: {
                id: params.id
            },
            data: {
                museumId: params.museumId,
                description: params.description,
                name: params.name
            }
        });
        return res.status(200).json({ category });
    } catch (rr) {
        next(rr);
    }
}

const validateDeleteParams = z.object({
    id: z.number().min(0)
})
export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateDeleteParams.parse(req.body);
        await prisma.category.delete({
            where: {
                id: params.id
            }
        });
        return res.status(204).send();
    } catch (rr) {
        next(rr);
    }
}