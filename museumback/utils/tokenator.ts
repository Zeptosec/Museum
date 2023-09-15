import { User } from "@prisma/client";
import jose, { JWTPayload } from 'jose'

const secret = new TextEncoder().encode(
    process.env.SECRET
)

export async function generateToken(data: JWTPayload, time: number = 1000 * 60 * 60 * 2) {
    const _expTime = new Date().getTime() + time;
    const jwt = await new jose.SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer('server')
        .setAudience('user')
        .setExpirationTime(_expTime)
        .sign(secret);
    // adjusting for time jitter
    return { token: jwt, expiresIn: time - 3000 };
}

export async function validateToken(token: string): Promise<JWTPayload> {
    const { payload } = await jose.jwtVerify(token, secret, {
        issuer: 'server',
        audience: 'user',
    })
    return payload
}