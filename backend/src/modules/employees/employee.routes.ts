import { Router } from 'express';

import { asyncHandler } from '../../common/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import * as employeeController from './employee.controller';

const router = Router();

/**
 * @openapi
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: List employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches name, email, or employee code
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [employee_code, first_name, last_name, email, country, department, designation, created_at]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paged employees with current salary
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', authenticate, asyncHandler(employeeController.listEmployees));

/**
 * @openapi
 * /api/employees/filters:
 *   get:
 *     tags: [Employees]
 *     summary: Distinct country and department filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Countries and departments present in the employee table
 *       401:
 *         description: Missing or invalid token
 */
router.get('/filters', authenticate, asyncHandler(employeeController.listFilters));

/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get one employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Employee and current salary
 *       404:
 *         description: Employee not found
 */
router.get('/:id', authenticate, asyncHandler(employeeController.getEmployee));

export default router;
