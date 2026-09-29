import { Router } from 'express';

import { asyncHandler } from '../../common/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import * as salaryController from './salary.controller';

const router = Router();

/**
 * @openapi
 * /api/employees/{id}/salaries:
 *   get:
 *     tags: [Salaries]
 *     summary: Salary history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: History ordered by effective date, newest first
 *       404:
 *         description: Employee not found
 *   post:
 *     tags: [Salaries]
 *     summary: Record a new salary
 *     description: Inserts a new local-currency row. Existing history is kept.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency, effectiveFrom]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 120000
 *               currency:
 *                 type: string
 *                 example: INR
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *                 example: '2026-04-01'
 *     responses:
 *       201:
 *         description: Salary recorded
 *       400:
 *         description: Invalid amount, currency, or date
 *       409:
 *         description: A salary already exists for this effective date
 */
router.get('/:id/salaries', authenticate, asyncHandler(salaryController.listSalaries));
router.post('/:id/salaries', authenticate, asyncHandler(salaryController.createSalary));

export default router;
