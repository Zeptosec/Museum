import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "../utils/tokenator";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const pageSize = 30;

const validatePageParams = z.object({
    page: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().positive().max(100)
    )
})

const validateSetRole = z.object({
    userid: z.number().min(0),
    newRole: z.enum(['ADMIN', 'GUEST', 'CURATOR'])
})

export async function setRole(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateSetRole.parse(req.body);
        const user = res.locals.user as TokenPayload;
        if(user.id === params.userid) return res.status(400).json({errors: ["Can't change your own role!"]})
        await prisma.user.update({
            where: {
                id: params.userid,
            },
            data: {
                role: params.newRole
            }
        })
        return res.status(200).send();
    } catch (err: unknown) {
        next(err);
    }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validatePageParams.parse(req.query);
        const user = res.locals.user as TokenPayload;
        const users = await prisma.user.findMany({
            take: pageSize,
            skip: (params.page - 1) * pageSize,
            where: {
                NOT: {
                    id: user.id
                }
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
        return res.status(200).json({ users });
    } catch (err: unknown) {
        next(err);
    }
}