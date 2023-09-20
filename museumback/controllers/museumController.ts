import { NextFunction, Request, Response } from "express";
import { pageSize, validatePageParams } from "./adminController";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function getMuseums(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validatePageParams.parse(req.query);
        const mus = await prisma.museum.findMany({
            take: pageSize,
            skip: (pageSize - 1) * params.page
        });
        return res.status(200).json({ museums: mus });
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
export async function updateMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateUpdateParams.parse(req.body);
        const mus = await prisma.museum.update({
            where: {
                id: params.id
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

const validateDeleteParams = z.object({
    id: z.number().min(0),
})
export async function deleteMuseum(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateDeleteParams.parse(req.body);
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