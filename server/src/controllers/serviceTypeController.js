import { serviceTypeService } from '../services/serviceTypeService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { broadcast } from '../events/eventBus.js';

export const serviceTypeController = {
  list:   asyncHandler((_req, res) => res.json(serviceTypeService.list())),
  create: asyncHandler((req,  res) => {
    const row = serviceTypeService.create(req.body);
    broadcast('service-types.created', { id: row.id, name: row.name });
    res.status(201).json(row);
  }),
  update: asyncHandler((req,  res) => {
    const row = serviceTypeService.update(Number(req.params.id), req.body);
    broadcast('service-types.updated', { id: row.id, name: row.name });
    res.json(row);
  }),
  remove: asyncHandler((req,  res) => {
    const id = Number(req.params.id);
    serviceTypeService.remove(id);
    broadcast('service-types.deleted', { id });
    res.status(204).end();
  })
};
