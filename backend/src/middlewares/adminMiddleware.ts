import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // @ts-ignore - req.user is populated by authMiddleware
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Access denied. Admin only.' });
    return;
  }
  next();
};
