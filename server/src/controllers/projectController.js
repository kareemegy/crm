import { projectService } from '../services/projectService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const projectController = {
  list: asyncHandler((req, res) => {
    const { status, categoryId, assigneeId, clientId, from, to } = req.query;
    const hasFilters = status || categoryId || assigneeId || clientId || from || to;
    const rows = hasFilters
      ? projectService.filter({
          status,
          categoryId: categoryId ? Number(categoryId) : undefined,
          assigneeId: assigneeId ? Number(assigneeId) : undefined,
          clientId:   clientId   ? Number(clientId)   : undefined,
          from, to
        })
      : projectService.list();
    res.json(rows);
  }),

  get:    asyncHandler((req, res) => res.json(projectService.get(Number(req.params.id)))),
  create: asyncHandler((req, res) => res.status(201).json(projectService.create(req.body))),
  update: asyncHandler((req, res) => res.json(projectService.update(Number(req.params.id), req.body))),
  remove: asyncHandler((req, res) => { projectService.remove(Number(req.params.id)); res.status(204).end(); })
};
