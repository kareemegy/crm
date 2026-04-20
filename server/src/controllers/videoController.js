import { videoService } from '../services/videoService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const videoController = {
  listByProject: asyncHandler((req, res) =>
    res.json(videoService.listByProject(Number(req.params.projectId)))
  ),
  create: asyncHandler((req, res) =>
    res.status(201).json(videoService.create({ ...req.body, project_id: Number(req.params.projectId) }))
  ),
  update: asyncHandler((req, res) =>
    res.json(videoService.update(Number(req.params.id), req.body))
  ),
  remove: asyncHandler((req, res) => {
    videoService.remove(Number(req.params.id));
    res.status(204).end();
  })
};
