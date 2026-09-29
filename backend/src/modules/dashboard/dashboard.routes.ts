import { Router } from 'express';

import { asyncHandler } from '../../common/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import * as dashboardController from './dashboard.controller';

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Organization salary insights in USD
 *     description: Stored salaries stay in local currency. Totals use the fixed rate table in config/exchangeRates.ts.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee count, USD averages, country and department totals, and salary bands
 *       401:
 *         description: Missing or invalid token
 */
router.get('/', authenticate, asyncHandler(dashboardController.getDashboard));

export default router;
