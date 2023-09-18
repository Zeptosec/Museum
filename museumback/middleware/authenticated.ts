import { Request, Response } from "express";
import { NextFunction } from "express";
import { validateAccessToken } from "../utils/tokenator";
import { $Enums } from "@prisma/client";

export default function authenticate(role: $Enums.Role = 'GUEST') {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            const accessToken = req.headers.authorization;
            if (!accessToken || Array.isArray(accessToken)) return res.status(401).json({ errors: ['Missing Access Token!'] });
            if (!accessToken.startsWith('Bearer ')) return res.status(400).json({errors:['Access token must be a Bearer!']})
            const user = await validateAccessToken(accessToken.slice(7));
            if(user.role === role){
                res.locals.user = user;
                next();
            }else{
                return res.status(403).json({errors:['Insufficient priveleges!']});
            }
        } catch (rr: unknown) {
            console.log(rr);
            if(rr && typeof(rr) === 'object' && 'code' in rr) {
                if(rr.code === 'ERR_JWT_EXPIRED')
                    return res.status(401).json({errors: ['Expired access token']});
                else
                    return res.status(401).json({errors: ['Invalid access token']});

            }
            else
                return res.status(500).json({errors:['Failed to authenticate!']});
        }
    }
}