import { z } from "zod";

export const validateMuseumId = z.object({
    museumId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
});

export const validateCategoryId = z.object({
    categoryId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
});

export const validateItemId = z.object({
    itemId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
});
const maxFileSize = 1024 ** 2
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const validateImage = z.object({
    image: z.any()
        .refine(image => image?.size <= maxFileSize, "File is too big! Max 1MB!")
        .refine(image => ACCEPTED_IMAGE_TYPES.includes(image?.type), "Wrong file type accepted types are .jpg or .png").optional()
})

export const validateMuseumIdCategoryId = z.object({
    museumId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    ),
    categoryId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
});

export const validateCategoryIdItemId = z.object({
    categoryId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    ),
    itemId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
});

export const validatePagination = z.object({
    page: z.preprocess(
        (a) => a === undefined ? 1 : parseInt(z.string().parse(a), 10),
        z.number().min(1)
    ),
    pageSize: z.preprocess(
        a => a === undefined ? 10 : parseInt(z.string().parse(a), 10),
        z.number().min(5).max(30)
    )
});