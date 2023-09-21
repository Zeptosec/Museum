type FormattedZodError = {
    field: string,
    message: string
}

export function getZodError(err: unknown): FormattedZodError[] | undefined {
    if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)) {
        let rez: FormattedZodError[] = []
        for (let i = 0; i < err.errors.length; i++) {
            const errObj = err.errors[i];
            if (typeof errObj === 'object' && 'field' in errObj && 'message' in errObj) {
                rez.push({
                    field: errObj.field,
                    message: errObj.message
                })
            }
        }
        if (rez.length === 0) return undefined;
        return rez;
    }
}

/**
 * get error text from a response
 * @param err response json object 
 * @returns string containing the error
 */
export function getError(err: unknown): string {
    const rr = getZodError(err);
    if (rr) {
        return rr.map(w => `${w.field}: ${w.message}`).join(', ');
    } else if (err && typeof (err) === 'object' && "errors" in err && Array.isArray(err.errors)) {
        return err.errors.join(', ');
    } else {
        return "An error occurred!";
    }
}