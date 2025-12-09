export { }

declare global {
    namespace Express {
        export interface Request {
            user: jwt.JwtPayload;
            db: string | undefined;
        }
    }
}

