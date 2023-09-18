import { TokenPayload } from "./utils/tokenator";

declare namespace Express {
    export interface Response {
        locals: {
            user?: TokenPayload
        }
    }
 }