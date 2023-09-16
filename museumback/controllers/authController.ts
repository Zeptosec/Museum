import { NextFunction, Request, Response } from "express";
import { loginValidation, registerValidation } from "../utils/userValidations";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { generateTokens, validateRefreshToken } from "../utils/tokenator";
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
        // generate access and refresh tokens
        const payload = {
            id: user.id,
            role: user.role
        }
        const { accessToken, refreshToken } = await generateTokens(payload);

        // set refresh token as a cookie
        res.cookie('refreshToken', refreshToken.token, { httpOnly: true, maxAge: refreshToken.expiresIn, sameSite: 'strict' })
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
        // update refresh token in database
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshTokens: {
                    update: {
                        where: {
                            id: prevRt.id
                        },
                        data: {
                            token: refreshToken.token,
                            expires: new Date(new Date().getTime() + refreshToken.expiresIn)
                        }
                    }
                }
            }
        })
        // set refresh token as a cookie
        res.cookie('refreshToken', refreshToken.token, { httpOnly: true, maxAge: refreshToken.expiresIn, sameSite: 'strict' })
        // send access token
        return res.status(201).json({ accessToken: accessToken.token, expiresIn: accessToken.expiresIn });
    } catch (err: unknown) {
        console.log(err);
        return res.status(403).json({ errors: [`Invalid or expired refresh token`] });
    }
}