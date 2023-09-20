import { NextFunction, Request, Response } from "express";
import { pageSize, validatePageParams } from "./adminController";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function getMuseums(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validatePageParams.parse(req.params);
        const mus = await prisma.museum.findMany({
            take: pageSize,
            skip: (params.page - 1) * pageSize
        });
        return res.status(200).json({ museums: mus });
    } catch (rr) {
        next(rr);
    }
}

export async function getMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateParamId.parse(req.params);
        const mus = await prisma.museum.findFirst({
            where: {
                id: params.id
            }
        });
        if (!mus) return res.status(404).json({ errors: ['Museum not found'] });
        return res.status(200).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

const validateCreateParams = z.object({
    description: z.string(),
    name: z.string()
})
export async function createMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCreateParams.parse(req.body);
        const mus = await prisma.museum.create({
            data: {
                description: params.description,
                name: params.name
            }
        })
        return res.status(201).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

const validateUpdateParams = z.object({
    id: z.number().min(0),
    description: z.string(),
    name: z.string()
})
export const validateParamId = z.object({
    id: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    ),
});
export async function updateMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const urlParams = validateParamId.parse(req.params);
        const params = validateUpdateParams.parse(req.body);
        const mus = await prisma.museum.update({
            where: {
                id: urlParams.id
            },
            data: {
                description: params.description,
                name: params.name,
            }
        })
        return res.status(200).json({ museum: mus });
    } catch (rr) {
        next(rr);
    }
}

export async function deleteMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateParamId.parse(req.params);
        await prisma.museum.delete({
            where: {
                id: params.id
            }
        })
        return res.status(204).send();
    } catch (rr) {
        next(rr);
    }
}