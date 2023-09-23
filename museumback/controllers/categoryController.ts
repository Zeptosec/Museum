import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateCategoryId, validateImage, validateMuseumId, validateMuseumIdCategoryId, validatePagination } from "../utils/validations";
import { uploadFile } from "../lib/storage";

export async function getCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const query = validatePagination.parse(req.query);

        const categories = await prisma.category.findMany({
            take: query.pageSize,
            skip: (query.page - 1) * query.pageSize,
            where: {
                museumId: params.museumId
            }
        });
        return res.status(200).json({ categories });
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
    name: z.string()
})
export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const body = validateCreateParams.parse(req.fields);
        const files = validateImage.parse(req.files);
        const mus = await prisma.museum.findFirst({
            where: {
                id: params.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        let url = undefined;
        if (files?.image) {
            url = await uploadFile(files.image.path);
        }
        const category = await prisma.category.create({
            data: {
                museumId: params.museumId,
                description: body.description,
                name: body.name,
                imageUrl: url
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
    museumId: z.preprocess(
        a => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
})
export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCategoryId.parse(req.params);
        const body = validateUpdateParams.parse(req.fields);
        const files = validateImage.parse(req.files);
        const mus = await prisma.museum.findFirst({
            where: {
                id: body.museumId
            },
            select: {
                id: true
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found!'] });
        let url = undefined;
        if (files?.image) {
            url = await uploadFile(files.image.path);
        }
        const category = await prisma.category.update({
            where: {
                id: params.categoryId
            },
            data: {
                museumId: body.museumId,
                description: body.description,
                name: body.name,
                ...(url ? { imageUrl: url } : {})

            }
        });
        return res.status(200).json({ category });
    } catch (rr) {
        next(rr);
    }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        await prisma.category.delete({
            where: {
                id: params.museumId
            }
        });
        return res.status(204).send();
    } catch (rr) {
        next(rr);
    }
}