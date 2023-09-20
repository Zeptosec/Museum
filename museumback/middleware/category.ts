import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { TokenPayload } from "../utils/tokenator";

export default function categoryAuthorize(categoryParamName: string) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            const user = res.locals.user as TokenPayload | undefined;
            if (!user) {
                return res.status(500).json({ errors: ['Missing a user!'] });
            }
            if (user.role === 'ADMIN') return next();
            if (user.role === 'CURATOR') {
                const catid = parseInt(req.params[categoryParamName]);
                if (!catid) {
                    return res.status(500).json({ errors: ['Missing category id!'] });
                }
                const cat = await prisma.userCategory.findFirst({
                    where: {
                        userId: user.id,
                        categoryId: catid
                    }
                });
                if (cat) {
                    return next();
                }
            }
            return res.status(403).json({ errors: ['Access to the resource is forbidden!'] });
        } catch (rr) {
            console.log(rr);
            return res.status(500).json({ errors: ['Something went wrong in user category authorization!'] });
        }
    }
}