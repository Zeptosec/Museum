import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { uploadFile } from "../lib/storage";
import { prisma } from "../lib/prisma";
import { validateCategoryId, validateCategoryIdItemId, validateImage, validateItemId, validatePagination } from "../utils/validations";
import { TokenPayload } from "../utils/tokenator";

const validateItemData = z.object({
    title: z.string(),
    description: z.string(),

})

export async function createItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCategoryId.parse(req.params);
        const files = validateImage.parse(req.files)
        const fields = validateItemData.parse(req.fields);

        const user = res.locals.user as TokenPayload;
        if (user.role === 'CURATOR') {
            const userCat = await prisma.userCategory.findFirst({
                where: {
                    categoryId: params.categoryId,
                    userId: user.id
                }
            });
            if (!userCat) return res.status(403).json({ errors: [`You don't have access to this category!`] });
        }

        let url = undefined;
        if (files?.image) {
            url = await uploadFile(files.image.path);
        }
        await prisma.item.create({
            data: {
                description: fields.description,
                title: fields.title,
                ...(url ? { imageUrl: url } : {}),
                categoryId: params.categoryId
            }
        })
        return res.status(201).send();
    } catch (rr) {
        next(rr);
    }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.parse(req.query);
        const params = validateCategoryId.parse(req.params);
        const items = await prisma.item.findMany({
            take: query.pageSize,
            skip: (query.page - 1) * query.pageSize,
            where: {
                categoryId: params.categoryId
            }
        })
        return res.status(200).json({ items });
    } catch (err) {
        next(err);
    }
}

export async function getItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCategoryIdItemId.parse(req.params);
        const item = await prisma.item.findFirst({
            where: {
                categoryId: params.categoryId,
                id: params.itemId
            },
            include: {
                Category: {
                    include: {
                        museum: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
        if (!item) return res.status(404).json({ errors: ['Item not found'] });
        return res.status(200).json({ item });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateItemId.parse(req.params);
        const body = validateItemData.merge(z.object({
            newCategoryId: z.preprocess(
                a => parseInt(z.string().parse(a), 10),
                z.number().min(0)
            ),
        })).parse(req.fields);

        const user = res.locals.user as TokenPayload;
        const item = await prisma.item.findFirst({
            where: {
                id: params.itemId
            }
        })
        if (!item) return res.status(404).json({ errors: [`Item does not exist!`] });
        const newCategory = await prisma.category.findFirst({
            where: {
                id: body.newCategoryId
            },
            select: {
                id: true,
            }
        });
        if (!newCategory) return res.status(404).json({ errors: ["New category doesn't exists"] });
        if (user.role === 'CURATOR') {
            const newUserCat = await prisma.userCategory.findFirst({
                where: {
                    userId: user.id,
                    categoryId: newCategory.id
                }
            })
            if (!newUserCat) return res.status(403).json({ errors: [`You don't have access to the new category.`] });
            const userCat = await prisma.userCategory.findFirst({
                where: {
                    userId: user.id,
                    categoryId: item.categoryId
                }
            });
            if (!userCat) return res.status(403).json({ errors: [`You don't have access to update this item!`] });
        }

        const updatedItem = await prisma.item.update({
            where: {
                id: params.itemId
            },
            data: {
                title: body.title,
                description: body.description,
                categoryId: body.newCategoryId,
            }
        })
        return res.status(200).send({ item: updatedItem });
    } catch (err) {
        next(err);
    }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateItemId.parse(req.params);
        const user = res.locals.user as TokenPayload;
        const item = await prisma.item.findFirst({
            where: {
                id: params.itemId
            }
        })
        if (!item) return res.status(404).json({ errors: [`Can't delete something that doesn't exist!`] });
        if (user.role === 'CURATOR') {
            const userCat = await prisma.userCategory.findFirst({
                where: {
                    userId: user.id,
                    categoryId: item.categoryId
                }
            });
            if (!userCat) return res.status(403).json({ errors: [`You don't have access to delete this item!`] });
        }
        await prisma.item.delete({
            where: {
                id: params.itemId
            }
        });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}