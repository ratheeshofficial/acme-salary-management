import type { Request, Response } from 'express';

import * as dashboardService from './dashboard.service';

export async function getDashboard(_req: Request, res: Response) {
  const data = await dashboardService.getDashboard();
  res.json({
    success: true,
    message: 'Dashboard fetched',
    data,
  });
}
