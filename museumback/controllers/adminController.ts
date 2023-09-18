import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "../utils/tokenator";
import { prisma } from "../lib/prisma";
import { ZodError, z } from "zod";

const pageSize = 30;

const validatePageParams = z.object({
    page: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().positive().max(100)
    )
})

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
                surname:true,
                role: true
            }
        });
        return res.status(200).json({users});
    } catch (err: unknown) {
        next(err);
    }
}