import { categoryService } from '../services/categoryService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const categoryController = {
  list:   asyncHandler((_req, res) => res.json(categoryService.list())),
  create: asyncHandler((req,  res) => res.status(201).json(categoryService.create(req.body))),
  update: asyncHandler((req,  res) => res.json(categoryService.update(Number(req.params.id), req.body))),
  remove: asyncHandler((req,  res) => { categoryService.remove(Number(req.params.id)); res.status(204).end(); })
};
