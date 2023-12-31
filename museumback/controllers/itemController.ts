import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateCategoryId, validateCategoryIdItemId, validateImage, validateItemId, validateMuseumId, validateMuseumIdCategoryId, validatePagination } from "../utils/validations";
import { TokenPayload } from "../utils/tokenator";
import { uploadFile } from "../lib/storage";

const validateItemData = z.object({
    title: z.string().trim().min(1),
    description: z.string(),
})

export async function validatedMuseumAndCategory(museumId: number, categoryId: number, res: Response): Promise<boolean> {
    const mus = await prisma.museum.findFirst({
        where: {
            id: museumId
        }
    })
    if (!mus) {
        res.status(404).json({ errors: ['Museum not found!'] });
        return false;
    }
    const categ = await prisma.category.findFirst({
        where: {
            id: categoryId,
            museumId: museumId
        }
    });
    if (!categ) {
        res.status(404).json({ errors: ['Category not found!'] });
        return false;
    }
    return true;
}

/**
 * Validates if museum, category and item exists
 * @param museumId 
 * @param categoryId 
 * @param itemId 
 * @param res 
 * @returns true if everything exists
 */
async function validatedMCI(museumId: number, categoryId: number, itemId: number, res: Response): Promise<boolean> {
    if (!await validatedMuseumAndCategory(museumId, categoryId, res))
        return false;
    const item = await prisma.item.findFirst({
        where: {
            id: itemId
        }
    });
    if (!item) {
        res.status(404).json({ errors: [`Item not found!`] });
        return false;
    }
    return true;
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.parse(req.params);
        const fields = validateItemData.parse(req.fields);

        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;

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

        const item = await prisma.item.create({
            data: {
                description: fields.description,
                title: fields.title,
                categoryId: params.categoryId
            }
        })
        return res.status(201).json({ item });
    } catch (rr) {
        next(rr);
    }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.parse(req.query);
        const params = validateMuseumIdCategoryId.parse(req.params);

        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;

        const items = await prisma.item.findMany({
            take: query.pageSize + 1,
            skip: (query.page - 1) * query.pageSize,
            where: {
                categoryId: params.categoryId,
                Category: {
                    museumId: params.museumId
                }
            }
        })
        let hasNext = false;
        if (items.length - 1 === query.pageSize) {
            hasNext = true;
            items.pop();
        }
        return res.status(200).json({ items, hasNext });
    } catch (err) {
        next(err);
    }
}

export async function getItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCategoryIdItemId.merge(validateMuseumId).parse(req.params);
        if (!await validatedMCI(params.museumId, params.categoryId, params.itemId, res))
            return;
        const item = await prisma.item.findFirst({
            where: {
                categoryId: params.categoryId,
                Category: {
                    museumId: params.museumId
                },
                id: params.itemId
            },
            include: {
                Category: {
                    include: {
                        museum: {
                            select: {
                                name: true,
                                id: true
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
        const params = validateMuseumIdCategoryId.merge(validateItemId).parse(req.params);
        const body = validateItemData.merge(z.object({
            newCategoryId: z.coerce.number().min(0).optional(),
        })).parse(req.fields);

        if (!await validatedMCI(params.museumId, params.categoryId, params.itemId, res))
            return;

        const user = res.locals.user as TokenPayload;
        const item = await prisma.item.findFirst({
            where: {
                id: params.itemId,
                categoryId: params.categoryId,
                Category: {
                    museumId: params.museumId
                }
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
            // checking if curator has access to category to which he is trying to move the item
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
                ...(body.newCategoryId ? { categoryId: body.newCategoryId } : {})
            }
        })
        return res.status(200).send({ item: updatedItem });
    } catch (err) {
        next(err);
    }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.merge(validateItemId).parse(req.params);
        if (!await validatedMCI(params.museumId, params.categoryId, params.itemId, res))
            return;
        const user = res.locals.user as TokenPayload;
        const item = await prisma.item.findFirst({
            where: {
                id: params.itemId,
                categoryId: params.categoryId,
                Category: {
                    museumId: params.museumId
                }
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

export async function updateImage(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.merge(validateItemId).parse(req.params);
        if (!await validatedMCI(params.museumId, params.categoryId, params.itemId, res))
            return;
        const user = res.locals.user as TokenPayload;
        if (user.role === 'CURATOR') {
            const userCategory = await prisma.userCategory.findFirst({
                where: {
                    userId: user.id,
                    categoryId: params.categoryId
                }
            })
            if (!userCategory) return res.status(403).json({ errors: [`You don't have privileges to change this item image!`] });
        }
        const files = validateImage.parse(req.files);
        if (!files.image) {
            return res.status(400).json({ errors: [`Missing image file`] });
        }
        let url = await uploadFile(files.image.path);
        await prisma.item.update({
            where: {
                id: params.itemId,
                categoryId: params.categoryId,
                Category: {
                    museumId: params.museumId
                }
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