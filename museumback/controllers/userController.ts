import { NextFunction, Request, Response } from "express";
import { loginValidation, registerValidation } from "../utils/userValidations";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/tokenator";

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
        const accessToken = await generateToken(payload);
        // i probably should use a different secret for a refresh token
        const refreshToken = await generateToken(payload);

        // set refresh token as cookie!
        return res.status(200).json({
            accessToken,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role
        })
    } catch (err) {
        next(err);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {

}