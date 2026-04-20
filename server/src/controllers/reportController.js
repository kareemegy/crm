import { reportService } from '../services/reportService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const reportController = {
  summary:    asyncHandler((_req, res) => res.json(reportService.financialSummary())),
  workload:   asyncHandler((_req, res) => res.json(reportService.employeeWorkload())),
  byStatus:   asyncHandler((_req, res) => res.json(reportService.statusBreakdown())),
  byCategory: asyncHandler((_req, res) => res.json(reportService.categoryBreakdown())),
  monthly:    asyncHandler((_req, res) => res.json(reportService.monthlyRevenue()))
};
