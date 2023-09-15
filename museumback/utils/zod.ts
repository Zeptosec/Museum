import { ZodError } from "zod";

export function formatToErrors(err: ZodError): string[] {
    return err.issues.map(w => `${w.path.join(', ')}: ${w.message}`);
}