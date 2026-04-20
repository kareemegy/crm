import { employeeService } from '../services/employeeService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const employeeController = {
  list:   asyncHandler((_req, res) => res.json(employeeService.list())),
  create: asyncHandler((req,  res) => res.status(201).json(employeeService.create(req.body))),
  update: asyncHandler((req,  res) => res.json(employeeService.update(Number(req.params.id), req.body))),
  remove: asyncHandler((req,  res) => { employeeService.remove(Number(req.params.id)); res.status(204).end(); })
};
