// src/middleware/localAuth.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export function localAuthGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const payload = authService.verifyLocalToken(token);
  if (!payload) return res.status(403).json({ error: 'Invalid token' });

  req.user = payload;
  next();
}