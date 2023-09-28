export function safeParseInt(num: any, fallback: number = 1) {
    if (Array.isArray(num) || typeof (num) === 'object') return fallback;
    const rs = parseInt(num);
    if (isNaN(rs))
        return fallback;
    return rs;
}