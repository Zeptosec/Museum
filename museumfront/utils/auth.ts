import { useUserStore } from "~/stores/userStore";
import { RefreshError } from "~/types/errors";

type RefreshResponse = {
    accessToken: string,
    expiresIn: number
}

export async function refreshTheToken() {
    const { user } = useUserStore();
    const config = useRuntimeConfig();
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
    const { user } = useUserStore();
    const headers = new Headers(options.headers);
    if (!user) throw Error("Missing a user");
    headers.set('Authorization', user.accessToken);
    let rs = await fetch(url, options);
    let json = undefined;
    const contentType = rs.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        json = await rs.json();
    }
    if (rs.ok) {
        return { response: rs, json };
    } else {
        if (rs.status === 401) {
            const accessToken = await refreshTheToken();
            //const headers = new Headers(options.headers);
            headers.set('Authorization', accessToken);
            rs = await fetch(url, {
                ...options,
                headers: headers
            });
            const contentType = rs.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                json = await rs.json();
            } else json = undefined;

            if (rs.ok) {
                return { response: rs, json };
            } else {
                throw new RefreshError("Failed to refresh the token.")
            }
        }
        const contentType = rs.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1 && json.errors && json.errors.length > 0) {
            const zodrr = getZodError(json);
            if (zodrr) {
                throw new Error(zodrr.map(w => `${w.field}: ${w.message}`).join(', '));
            } else {
                throw new Error(json.errors.join(', '));
            }
        }
        throw new Error("Failed to fetch. Unauthorized");
    }
}