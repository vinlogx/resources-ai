import { Request, Response, NextFunction } from 'express';

const TOKEN = '1132183b1f1c8f297278c62315ceabf8'

export function authGuard(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Missing token' });

        if (token !== token) return res.status(403).json({ error: 'Invalid token' });

        next();
    } catch (err: any) {
        return res.json({ error: "Something went wrong.", errorMessage: err.message })
    }
}