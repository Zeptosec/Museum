import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { formatToErrors } from "../utils/zod";


export default function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log("custom err");
    if (err instanceof ZodError) {
        if (err instanceof ZodError) {
            return res.status(422).json({ errors: formatToErrors(err) });
        }
    } else if (err instanceof TypeError) {
        return res.status(400).json({ errors: [err.message] });
    } else if (err instanceof Error) {
        return res.status(400).json({ errors: [err.message] });
    }
    // this in theory should never get called but just in case
    return res.status(500).json({ errors: ["Server error!"] });
}