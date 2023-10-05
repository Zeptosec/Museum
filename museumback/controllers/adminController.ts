import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "../utils/tokenator";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validateMuseumIdCategoryId, validatePagination } from "../utils/validations";
import { validatedMuseumAndCategory } from "./itemController";

export const pageSize = 30;

const validateSetRole = z.object({
    newRole: z.enum(['ADMIN', 'GUEST', 'CURATOR'])
})

export async function setRole(req: Request, res: Response, next: NextFunction) {
    try {
        const params = z.object({
            userId: z.coerce.number().min(0)
        }).parse(req.params);
        const body = validateSetRole.parse(req.fields);
        const user = res.locals.user as TokenPayload;
        if (user.id === params.userId) return res.status(400).json({ errors: ["Can't change your own role!"] })
        await prisma.user.update({
            where: {
                id: params.userId,
            },
            data: {
                role: body.newRole
            }
        })
        return res.status(204).send();
    } catch (err: unknown) {
        next(err);
    }
}
const validateUserSearch = z.object({
    email: z.string().trim().default(''),
    role: z.enum(['ADMIN', 'CURATOR', 'GUEST']).optional()
})
export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const query = validatePagination.merge(validateUserSearch).parse(req.query);
        const user = res.locals.user as TokenPayload;
        const users = await prisma.user.findMany({
            take: pageSize + 1,
            skip: (query.page - 1) * pageSize,
            where: {
                NOT: {
                    id: user.id
                },
                email: {
                    contains: query.email,
                    mode: 'insensitive'
                },
                ...(query.role ? { role: query.role } : {})
            },
            select: {
                createdAt: true,
                email: true,
                id: true,
                name: true,
                surname: true,
                role: true
            }
        });
        let hasNext = false;
        if (users.length - 1 === query.pageSize) {
            hasNext = true;
            users.pop();
        }
        return res.status(200).json({ users, hasNext });
    } catch (err: unknown) {
        next(err);
    }
}

export async function getCategoryUsers(req: Request, res: Response, next: NextFunction) {
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