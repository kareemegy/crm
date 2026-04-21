import { employeeService } from '../services/employeeService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { broadcast } from '../events/eventBus.js';

export const employeeController = {
  list:   asyncHandler((_req, res) => res.json(employeeService.list())),
  create: asyncHandler((req,  res) => {
    const row = employeeService.create(req.body);
    broadcast('employees.created', { id: row.id, name: row.name });
    res.status(201).json(row);
  }),
  update: asyncHandler((req,  res) => {
    const row = employeeService.update(Number(req.params.id), req.body);
    broadcast('employees.updated', { id: row.id, name: row.name });
    res.json(row);
  }),
  remove: asyncHandler((req,  res) => {
    const id = Number(req.params.id);
    employeeService.remove(id);
    broadcast('employees.deleted', { id });
    res.status(204).end();
  })
};
