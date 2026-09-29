import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { HttpError } from '../common/httpError';
import { env } from '../config/env';

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing or invalid token'));
    return;
  }

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), env.jwtSecret) as TokenPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new HttpError(401, 'Missing or invalid token'));
  }
}
