import type { Request, Response } from 'express';

import { routeId } from '../../common/pagination';
import * as employeeService from './employee.service';

export async function listEmployees(req: Request, res: Response) {
  const data = await employeeService.listEmployees(req.query as Record<string, unknown>);
  res.json({
    success: true,
    message: 'Employees fetched',
    data,
  });
}

export async function listFilters(_req: Request, res: Response) {
  const data = await employeeService.listFilters();
  res.json({
    success: true,
    message: 'Filters fetched',
    data,
  });
}

export async function getEmployee(req: Request, res: Response) {
  const data = await employeeService.getEmployee(routeId(req.params.id));
  res.json({
    success: true,
    message: 'Employee fetched',
    data,
  });
}
