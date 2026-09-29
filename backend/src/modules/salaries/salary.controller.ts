import type { Request, Response } from 'express';

import { routeId } from '../../common/pagination';
import * as salaryService from './salary.service';

export async function listSalaries(req: Request, res: Response) {
  const data = await salaryService.listSalaries(routeId(req.params.id));
  res.json({
    success: true,
    message: 'Salary history fetched',
    data,
  });
}

export async function createSalary(req: Request, res: Response) {
  const data = await salaryService.createSalary(routeId(req.params.id), req.body ?? {});
  res.status(201).json({
    success: true,
    message: 'Salary recorded',
    data,
  });
}
