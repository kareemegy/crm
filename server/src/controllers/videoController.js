import { videoService } from '../services/videoService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { broadcast } from '../events/eventBus.js';

export const videoController = {
  listByProject: asyncHandler((req, res) =>
    res.json(videoService.listByProject(Number(req.params.projectId)))
  ),
  create: asyncHandler((req, res) => {
    const row = videoService.create({ ...req.body, project_id: Number(req.params.projectId) });
    broadcast('videos.created', { id: row.id, project_id: row.project_id });
    res.status(201).json(row);
  }),
  update: asyncHandler((req, res) => {
    const row = videoService.update(Number(req.params.id), req.body);
    broadcast('videos.updated', { id: row.id, project_id: row.project_id });
    res.json(row);
  }),
  remove: asyncHandler((req, res) => {
    const id = Number(req.params.id);
    videoService.remove(id);
    broadcast('videos.deleted', { id });
    res.status(204).end();
  })
};
