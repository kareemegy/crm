import { Router } from 'express';
import { clientController      } from '../controllers/clientController.js';
import { projectController     } from '../controllers/projectController.js';
import { videoController       } from '../controllers/videoController.js';
import { categoryController    } from '../controllers/categoryController.js';
import { employeeController    } from '../controllers/employeeController.js';
import { reportController      } from '../controllers/reportController.js';
import { serviceTypeController } from '../controllers/serviceTypeController.js';
import eventsRouter             from './events.js';

const router = Router();

router.use(eventsRouter);

// Clients
router.get   ('/clients',     clientController.list);
router.get   ('/clients/:id', clientController.get);
router.post  ('/clients',     clientController.create);
router.put   ('/clients/:id', clientController.update);
router.delete('/clients/:id', clientController.remove);

// Projects
router.get   ('/projects',     projectController.list);
router.get   ('/projects/:id', projectController.get);
router.post  ('/projects',     projectController.create);
router.put   ('/projects/:id', projectController.update);
router.delete('/projects/:id', projectController.remove);

// Videos (nested under projects for list/create; id-keyed for update/delete)
router.get   ('/projects/:projectId/videos', videoController.listByProject);
router.post  ('/projects/:projectId/videos', videoController.create);
router.put   ('/videos/:id',                 videoController.update);
router.delete('/videos/:id',                 videoController.remove);

// Categories / Employees
router.get   ('/categories',     categoryController.list);
router.post  ('/categories',     categoryController.create);
router.put   ('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);

router.get   ('/employees',     employeeController.list);
router.post  ('/employees',     employeeController.create);
router.put   ('/employees/:id', employeeController.update);
router.delete('/employees/:id', employeeController.remove);

// Service types (Reel / Podcast / Design / Script / Long Video / …)
router.get   ('/service-types',     serviceTypeController.list);
router.post  ('/service-types',     serviceTypeController.create);
router.put   ('/service-types/:id', serviceTypeController.update);
router.delete('/service-types/:id', serviceTypeController.remove);

// Reports
router.get('/reports/summary',     reportController.summary);
router.get('/reports/workload',    reportController.workload);
router.get('/reports/by-status',   reportController.byStatus);
router.get('/reports/by-category', reportController.byCategory);
router.get('/reports/monthly',     reportController.monthly);

export default router;
