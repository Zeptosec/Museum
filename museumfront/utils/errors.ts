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
        return rez;
    }
}