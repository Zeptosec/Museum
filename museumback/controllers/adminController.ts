import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "../utils/tokenator";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { validatePagination } from "../utils/validations";

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