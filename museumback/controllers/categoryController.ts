import { NextFunction, Request, Response } from "express";
import { pageSize } from "./adminController";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateParamId } from "./museumController";

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
        const params = validateGetParams.parse(req.params);
        const categories = await prisma.category.findMany({
            take: pageSize,
            skip: (params.page - 1) * pageSize,
            where: {
                museumId: params.museumId
            }
        });
        return res.status(200).json({ categories });
    } catch (rr) {
        next(rr);
    }
}

const validateGetSingleParams = z.object({
    museumId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    ),
    categoryId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
})

export async function getCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateGetSingleParams.parse(req.params);
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
    name: z.string()
})
export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const urlParams = z.object({
            museumId: z.preprocess(
                (a) => parseInt(z.string().parse(a), 10),
                z.number().min(0)
            )
        }).parse(req.params);
        const params = validateCreateParams.parse(req.body);
        const mus = await prisma.museum.findFirst({
            where: {
                id: urlParams.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        const category = await prisma.category.create({
            data: {
                museumId: urlParams.museumId,
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
    description: z.string(),
    name: z.string(),
})
export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const urlParams = validateGetSingleParams.parse(req.params);
        const params = validateUpdateParams.parse(req.body);
        const mus = await prisma.museum.findFirst({
            where: {
                id: urlParams.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        const category = await prisma.category.update({
            where: {
                id: urlParams.categoryId
            },
            data: {
                museumId: urlParams.museumId,
                description: params.description,
                name: params.name
            }
        });
        return res.status(200).json({ category });
    } catch (rr) {
        next(rr);
    }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateParamId.parse(req.params);
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