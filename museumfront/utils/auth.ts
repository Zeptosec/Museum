import { useUserStore } from "~/stores/userStore";
const config = useRuntimeConfig();

type RefreshResponse = {
    accessToken: string,
    expiresIn: number
}

const { user } = useUserStore();
export async function refreshTheToken() {
    if (!user) throw new RefreshError("Missing a user");
    const rs = await fetch(`${config.public.apiBase}/auth/refresh`);
    if (!rs.ok) {
        const errJson = await rs.json();
        if (errJson.errors && errJson.errors.length > 0) throw new RefreshError(errJson.errors.join(', '));
        throw new RefreshError("Failed to refresh");
    };
    const json = await rs.json() as RefreshResponse;
    user.accessTime = new Date().getTime();
    user.accessToken = json.accessToken;
    user.expiresIn = json.expiresIn;
    return json.accessToken;
}

/**
 * Adds authorization header and refreshes the token if it is expired.
 * @param url Url to fetch from
 * @param options Request options
 * @returns response object and json
 */
export async function AuthFetch(url: RequestInfo | URL, options: RequestInit) {
    const headers = new Headers(options.headers);
    if (!user) throw Error("Missing a user");
    headers.set('Authorization', user.accessToken);
    const rs = await fetch(url, options);
    const json = await rs.json();
    if (rs.ok) {
        return { response: rs, json };
    } else {
        if (rs.status === 401) {
            const accessToken = await refreshTheToken();
            //const headers = new Headers(options.headers);
            headers.set('Authorization', accessToken);
            const rs2 = await fetch(url, {
                ...options,
                headers: headers
            });
            const json2 = await rs2.json();
            if (rs2.ok) {
                return { response: rs2, json: json2 };
            } else {
                throw new RefreshError("Failed to refresh the token.")
            }
        }
        if (json.errors && json.errors.length > 0)
            throw new Error(json.errors.join(', '));
        throw new Error("Failed to fetch. Unauthorized");
    }
}