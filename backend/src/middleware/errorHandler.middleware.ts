import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err.message.includes('already exists')) {
    return res.status(409).json({ error: err.message });
  }

  if (err.message.includes('Invalid')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes('not found')) {
    return res.status(404).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
};