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
        console.log("rr1")
        return res.status(400).json({ errors: [err.message] });
    } else if (err instanceof SyntaxError) {
        return res.status(422).json({ errors: [err.message] });
    } else if (err instanceof Error) {
        if (err.message.endsWith('no content-type'))
            return res.status(422).json({ errors: [err.message] });
        if (err.message.startsWith('bad content-type'))
            return res.status(415).json({ errors: [err.message] });
        return res.status(400).json({ errors: [err.message] });
    }
    // this in theory should never get called but just in case
    return res.status(500).json({ errors: ["Server error!"] });
}