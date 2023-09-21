import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { uploadFile } from "../lib/storage";
import { prisma } from "../lib/prisma";
import { validateCategoryId } from "../utils/validations";
const maxFileSize = 1024 ** 2
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const validateItemData = z.object({
    title: z.string(),
    description: z.string(),

})

export async function createItem(req: Request, res: Response, next: NextFunction) {
    try {
        const params = validateCategoryId.parse(req.params);
        const files = z.object({
            image: z.any().optional()
                .refine(image => image?.size <= maxFileSize, "File is too big! Max 1MB!")
                .refine(image => ACCEPTED_IMAGE_TYPES.includes(image?.type), "Wrong file type accepted types are .jpg or .png")
        }).optional().parse(req.files)
        const fields = validateItemData.parse(req.fields);

        let url = undefined;
        if (files?.image) {
            url = await uploadFile(files.image.path);
        }
        await prisma.item.create({
            data: {
                description: fields.description,
                title: fields.title,
                imageUrl: url,
                categoryId: params.categoryId
            }
        })
        return res.status(201).send();
    } catch (rr) {
        next(rr);
    }
}