import { NextFunction, Request, Response } from "express";
import { loginValidation, registerValidation } from "../utils/userValidations";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { generateTokens, validateAccessToken, validateRefreshToken } from "../utils/tokenator";
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const userdata = registerValidation.parse(req.body);
        const dbuser = await prisma.user.findUnique({
            where: {
                email: userdata.email
            }
        })
        if (dbuser) return res.status(409).json({ errors: [`user with that email already exists!`] });
        const hashedPass = await bcrypt.hash(userdata.password, 10);
        await prisma.user.create({
            data: {
                email: userdata.email,
                name: userdata.name,
                password: hashedPass,
                surname: userdata.surname,
            },
        });
        return res.status(201).send();
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const userdata = loginValidation.parse(req.body);
        const user = await prisma.user.findUnique({
            where: {
                email: userdata.email
            }
        });
        if (!user) return res.status(400).json({ errors: [`email or password is incorrect!`] });
        const isMatch = await bcrypt.compare(userdata.password, user.password);
        if (!isMatch) return res.status(400).json({ errors: [`email or password is incorrect!`] })
        const payload = {
            id: user.id,
            role: user.role
        }
        // generate access and refresh tokens
        const { accessToken, refreshToken } = await generateTokens(payload);
        // store refresh token in a database
        await prisma.refreshTokens.create({
            data: {
                token: refreshToken.token,
                expires: new Date(new Date().getTime() + refreshToken.expiresIn),
                userId: user.id
            }
        })
        // set refresh token as a cookie
        res.cookie('refreshToken', refreshToken.token, { httpOnly: true, maxAge: refreshToken.expiresIn, sameSite: 'none', secure: true })
        // probably should send access token in an authorization header
        return res.status(200).json({
            accessToken: accessToken.token,
            expiresIn: accessToken.expiresIn,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role
        })
    } catch (err) {
        next(err);
    }
}

export async function refresh(req: Request, res: Response) {
    try {
        const rt = req.cookies.refreshToken;
        if (!rt) {
            return res.status(403).json({ errors: [`Missing a refresh token!`] });
        }
        const rtdata = await validateRefreshToken(rt);
        const user = await prisma.user.findFirst({
            where: {
                refreshTokens: {
                    some: {
                        token: rt
                    }
                }
            },
            include: {
                refreshTokens: {
                    select: {
                        id: true,
                        token: true
                    }
                }
            }
        })

        if (!user) {
            // refresh token reuse detected
            // invalidate all tokens for security purposes
            await prisma.user.update({
                where: {
                    id: rtdata.id
                },
                data: {
                    refreshTokens: {
                        set: []
                    }
                }
            })
            return res.status(403).json({ errors: [`Refresh token reuse detected!`] });
        }

        // generate new tokens
        const { accessToken, refreshToken } = await generateTokens({
            id: user.id,
            role: user.role
        });
        const prevRt = user.refreshTokens.find(w => w.token === rt);
        if (!prevRt) return res.status(500).json({ errors: [`Failed to find the refresh token`] });
        // update refresh token in a database
        await prisma.refreshTokens.update({
            where: {
                id: prevRt.id
            },
            data: {
                token: refreshToken.token,
                expires: new Date(new Date().getTime() + refreshToken.expiresIn)
            }
        })
        // set refresh token as a cookie
        res.cookie('refreshToken', refreshToken.token, { httpOnly: true, maxAge: refreshToken.expiresIn, sameSite: 'strict' })
        // send access token
        // probably should send access token in an authorization header
        return res.status(201).json({ accessToken: accessToken.token, expiresIn: accessToken.expiresIn });
    } catch (err: unknown) {
        console.log(err);
        return res.status(403).json({ errors: [`Invalid or expired refresh token`] });
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.headers.authorization) return res.status(401).json({ errors: ['Missing accessToken in headers!'] });
        if (!req.headers.authorization.startsWith('Bearer ')) return res.status(400).json({ errors: [`Token must be a Bearer!`] });
        const token = req.headers.authorization.slice(7);
        const data = await validateAccessToken(token);
        // removing refresh tokens if they exist
        // invalidating all user refresh tokens
        await prisma.refreshTokens.deleteMany({
            where: {
                userId: data.id
            }
        })
        res.clearCookie('refreshToken');
        // sadly account will still be valid while accessToken is valid.
        // but refreshToken is invalid.
        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
        next(err);
    }
}