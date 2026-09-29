import type { Request, Response } from 'express';

import * as authService from './auth.service';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  const data = await authService.login(email ?? '', password ?? '');
  res.json({
    success: true,
    message: 'Logged in',
    data,
  });
}

export async function logout(_req: Request, res: Response) {
  res.json({
    success: true,
    message: 'Logged out',
  });
}
