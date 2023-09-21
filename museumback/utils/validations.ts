import { z } from "zod";

export const validateMuseumId = z.object({
    museumId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
})

export const validateCategoryId = z.object({
    categoryId: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().min(0)
    )
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
})

export const validatePagination = z.object({
    page: z.preprocess(
        (a) => a === undefined ? 1 : parseInt(z.string().parse(a), 10),
        z.number().min(1)
    ),
    pageSize: z.preprocess(
        a => a === undefined ? 10 : parseInt(z.string().parse(a), 10),
        z.number().min(5).max(30)
    )
})