import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateCategoryId, validateImage, validateMuseumId, validateMuseumIdCategoryId, validatePagination } from "../utils/validations";
import { uploadFile } from "../lib/storage";
import { getCurrentUser } from "../middleware/authenticated";
import { TokenPayload } from "../utils/tokenator";
import { validatedMuseumAndCategory } from "./itemController";

export async function validatedMuseum(museumId: number, res: Response): Promise<boolean> {
    const mus = await prisma.museum.findFirst({
        where: {
            id: museumId
        }
    });
    if (!mus) {
        res.status(404).json({ errors: [`Museum not found!`] });
        return false;
    }
    return true;
}

export async function searchCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.merge(z.object({
            name: z.string().default(''),
        })).parse(req.query);
        const params = validateMuseumId.parse(req.params);
        // validating if museum exists
        if (!await validatedMuseum(params.museumId, res))
            return;
        const user = res.locals.user as TokenPayload;
        let categories = []
        switch (user.role) {
            case 'CURATOR':
                categories = await prisma.category.findMany({
                    take: query.pageSize + 1,
                    skip: (query.page - 1) * query.pageSize,
                    where: {
                        UserCategory: {
                            some: {
                                userId: user.id,
                                category: {
                                    museumId: params.museumId
                                }
                            }
                        }
                    },
                    select: {
                        name: true,
                        id: true,
                        description: true,
                        imageUrl: true
                    }
                });
                break;
            case 'ADMIN':
                categories = await prisma.category.findMany({
                    take: query.pageSize + 1,
                    skip: (query.page - 1) * query.pageSize,
                    where: {
                        name: {
                            contains: query.name,
                            mode: 'insensitive'
                        },
                        museumId: params.museumId
                    },
                    select: {
                        name: true,
                        id: true,
                        description: true,
                        imageUrl: true
                    }
                });
                break;
            default:
                return res.status(501).json({ errors: [`Category search for user role '${user.role}' is not implemented!`] });
        }
        let hasNext = false;
        if (categories.length - 1 === query.pageSize) {
            hasNext = true;
            categories.pop();
        }
        return res.status(200).json({ categories, hasNext });
    } catch (err) {
        next(err);
    }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumId.parse(req.params);
        const query = validatePagination.parse(req.query);
        // validating if museum exists
        if (!await validatedMuseum(params.museumId, res))
            return;
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
        // validating if museum exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
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
                },
            }
        });
        if (!category) return res.status(404).json({ errors: ['Category is not found'] });
        const user = await getCurrentUser(req);
        let canEdit = false;
        if (user) {
            switch (user.role) {
                case 'ADMIN':
                    canEdit = true;
                    break;
                case 'CURATOR':
                    const userCat = await prisma.userCategory.findFirst({
                        where: {
                            userId: user.id,
                            categoryId: params.categoryId
                        }
                    })
                    if (userCat) canEdit = true;
                    break;
            }
        }
        return res.status(200).json({ category, canEdit });
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
        // validating if museum exists
        if (!await validatedMuseum(params.museumId, res))
            return;
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
        // validating if museum exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
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
        const params = validateMuseumIdCategoryId.parse(req.params);
        // validating if museum exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
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
        // validating if museum and category exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
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

export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.parse(req.params);
        // validating if museum exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
        const users = await prisma.userCategory.findMany({
            where: {
                categoryId: params.categoryId,
            },
            select: {
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
        const formattedUsers = users.map(w => ({
            id: w.user.id,
            email: w.user.email
        }))
        return res.status(200).json({ users: formattedUsers });
    } catch (err) {
        next(err);
    }
}

const validateUserId = z.object({
    id: z.number().min(0)
})

export async function addUser(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.parse(req.params);
        const body = validateUserId.parse(req.fields);
        // validating if museum and category exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
        const user = await prisma.user.findFirst({
            where: {
                id: body.id
            }
        });
        if (!user) return res.status(404).json({ errors: ['User not found'] });
        if (user.role !== 'CURATOR') return res.status(403).json({ errors: [`Can't add non curator user to a category!`] });
        const userCat = await prisma.userCategory.findFirst({
            where: {
                categoryId: params.categoryId,
                userId: body.id
            }
        })
        if (userCat) return res.status(409).json({ errors: ['User is already added to this category!'] });
        await prisma.userCategory.create({
            data: {
                userId: body.id,
                categoryId: params.categoryId,
                assignorId: res.locals.user.id
            }
        });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateMuseumIdCategoryId.merge(z.object({
            id: z.coerce.number().min(0)
        })).parse(req.params);

        // validating if museum and category exists
        if (!await validatedMuseumAndCategory(params.museumId, params.categoryId, res))
            return;
        const userCat = await prisma.userCategory.findFirst({
            where: {
                categoryId: params.categoryId,
                userId: params.id,
            }
        })
        if (!userCat) return res.status(404).json({ errors: ['User is not found on that category!'] });
        await prisma.userCategory.delete({
            where: {
                userId_categoryId: {
                    userId: params.id,
                    categoryId: params.categoryId
                }
            }
        });
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}