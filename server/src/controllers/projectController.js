import { projectService } from '../services/projectService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { broadcast } from '../events/eventBus.js';

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
  create: asyncHandler((req, res) => {
    const row = projectService.create(req.body);
    broadcast('projects.created', { id: row.id, name: row.name });
    res.status(201).json(row);
  }),
  update: asyncHandler((req, res) => {
    const row = projectService.update(Number(req.params.id), req.body);
    broadcast('projects.updated', { id: row.id, name: row.name });
    res.json(row);
  }),
  remove: asyncHandler((req, res) => {
    const id = Number(req.params.id);
    projectService.remove(id);
    broadcast('projects.deleted', { id });
    res.status(204).end();
  })
};
