import { SignJWT, JWTPayload, jwtVerify } from 'jose'
import { $Enums } from "@prisma/client";

const accessSecret = new TextEncoder().encode(
    process.env.ACCESS_SECRET
)

const refreshSecret = new TextEncoder().encode(
    process.env.REFRESH_SECRET
)


type TokenData = {
    id: number,
    role: $Enums.Role
}

export type TokenPayload = JWTPayload & TokenData

/**
 * Creates a new token
 * @param data data to encode into token
 * @param secret secret to use to encode the token
 * @param time time in ms the token is valid from creation
 * @returns the token and expires in
 */
async function generateToken(data: TokenPayload, secret: Uint8Array = accessSecret, time: number = 1000 * 60 * 60 * 2) {
    const _expTime = new Date().getTime() + time;
    const jwt = await new SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer('server')
        .setAudience('user')
        .setExpirationTime(_expTime)
        .sign(secret);

    // adjusting for time jitter
    return { token: jwt, expiresIn: time - 3000 };
}

/**
 * Generates new refresh token and access token
 * @param data data to encode into the token
 * @returns newly created refresh and access tokens
 */
export async function generateTokens(data: TokenPayload) {
    const _expTimeAccess = 1000 * 60 * 60 * 2; // 2h
    const _expTimeRefresh = 1000 * 60 * 60 * 24 * 7; // 1w

    const accessToken = await generateToken(data, accessSecret, _expTimeAccess);
    const refreshToken = await generateToken(data, refreshSecret, _expTimeRefresh);

    return { accessToken, refreshToken };
}

/**
 * Validates jwt token string. Throws an error on invalid tokens
 * @param token jwt token string
 * @param secret secret for decoding the token
 * @returns token payload if passed the validation
 */
async function validateToken(token: string, secret: Uint8Array): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, secret, {
        issuer: 'server',
        audience: 'user',
    })
    return payload as TokenPayload
}

/**
 * Validates access token and return the data stored in the token
 * @param token jwt token string
 * @returns token payload
 */
export async function validateAccessToken(token: string) {
    return await validateToken(token, accessSecret);
}

/**
 * Validates refresh token and return the data stored in the token
 * @param token jwt token string
 * @returns token payload 
 */
export async function validateRefreshToken(token: string) {
    return await validateToken(token, refreshSecret);
}