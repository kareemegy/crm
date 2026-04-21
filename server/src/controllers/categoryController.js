import { categoryService } from '../services/categoryService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { broadcast } from '../events/eventBus.js';

export const categoryController = {
  list:   asyncHandler((_req, res) => res.json(categoryService.list())),
  create: asyncHandler((req,  res) => {
    const row = categoryService.create(req.body);
    broadcast('categories.created', { id: row.id, name: row.name });
    res.status(201).json(row);
  }),
  update: asyncHandler((req,  res) => {
    const row = categoryService.update(Number(req.params.id), req.body);
    broadcast('categories.updated', { id: row.id, name: row.name });
    res.json(row);
  }),
  remove: asyncHandler((req,  res) => {
    const id = Number(req.params.id);
    categoryService.remove(id);
    broadcast('categories.deleted', { id });
    res.status(204).end();
  })
};
