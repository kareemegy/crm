import { clientService } from '../services/clientService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const clientController = {
  list:   asyncHandler((_req, res) => res.json(clientService.list())),
  get:    asyncHandler((req,  res) => res.json(clientService.get(Number(req.params.id)))),
  create: asyncHandler((req,  res) => res.status(201).json(clientService.create(req.body))),
  update: asyncHandler((req,  res) => res.json(clientService.update(Number(req.params.id), req.body))),
  remove: asyncHandler((req,  res) => { clientService.remove(Number(req.params.id)); res.status(204).end(); })
};
