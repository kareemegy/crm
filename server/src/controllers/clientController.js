import { clientService } from '../services/clientService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { broadcast } from '../events/eventBus.js';

export const clientController = {
  list:   asyncHandler((_req, res) => res.json(clientService.list())),
  get:    asyncHandler((req,  res) => res.json(clientService.get(Number(req.params.id)))),
  create: asyncHandler((req,  res) => {
    const row = clientService.create(req.body);
    broadcast('clients.created', { id: row.id, name: row.name });
    res.status(201).json(row);
  }),
  update: asyncHandler((req,  res) => {
    const row = clientService.update(Number(req.params.id), req.body);
    broadcast('clients.updated', { id: row.id, name: row.name });
    res.json(row);
  }),
  remove: asyncHandler((req,  res) => {
    const id = Number(req.params.id);
    clientService.remove(id);
    broadcast('clients.deleted', { id });
    res.status(204).end();
  })
};
