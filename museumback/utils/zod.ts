import { ZodError } from "zod";

type FormattedZodError = {
    field: string,
    message: string
}

export function formatToErrors(err: ZodError): FormattedZodError[] {
    return err.issues.map(w => ({
        field: w.path[0].toString(),
        message: w.message
    }));
}