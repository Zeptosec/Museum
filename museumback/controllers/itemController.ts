import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { s3, uploadFile } from "../lib/aws";
const maxFileSize = 1024 ** 2
const validateUpToCategory = z.object({
    museumId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    ),
    categoryId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
})
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const validateItemData = z.object({
    title: z.string(),
    description: z.string(),
    image: z.any().optional()
        // .refine((files) => files?.length === 1)
        .refine((files) => files?.[0]?.size <= maxFileSize)
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png files are accepted."
        ),
})

export async function createItem(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.body);
        const params = validateUpToCategory.parse(req.params);
        const body = validateItemData.parse(req.body);
        if (body.image)
            uploadFile(body.image);
        return res.status(201).json({ item: { id: '1' } });
    } catch (rr) {
        next(rr);
    }
}