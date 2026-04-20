import { serviceTypeService } from '../services/serviceTypeService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const serviceTypeController = {
  list:   asyncHandler((_req, res) => res.json(serviceTypeService.list())),
  create: asyncHandler((req,  res) => res.status(201).json(serviceTypeService.create(req.body))),
  update: asyncHandler((req,  res) => res.json(serviceTypeService.update(Number(req.params.id), req.body))),
  remove: asyncHandler((req,  res) => { serviceTypeService.remove(Number(req.params.id)); res.status(204).end(); })
};
