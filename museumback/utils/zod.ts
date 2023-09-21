import { ZodError } from "zod";

type FormattedZodError = {
    field: string,
    message: string
}

export function formatToErrors(err: ZodError): FormattedZodError[] {
    return err.issues.map(w => ({
        field: w.path.length > 0 ? w.path[0].toString() : 'unknown field',
        message: w.message
    }));
}