import { Router } from 'express';
import * as controller from './tour-schedule.controller';
import * as validation from './tour-schedule.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router({ mergeParams: true });

router.get('/', 
  requirePermission('tour.schedule.read'), 
  validateRequest(validation.listSchedulesSchema), 
  controller.listSchedules
);

router.get('/:scheduleId', 
  requirePermission('tour.schedule.read'), 
  controller.getSchedule
);

router.post('/', 
  requirePermission('tour.schedule.create'), 
  validateRequest(validation.createScheduleSchema), 
  controller.createSchedule
);

router.post('/bulk', 
  requirePermission('tour.schedule.bulkCreate'), 
  validateRequest(validation.bulkCreateSchedulesSchema), 
  controller.bulkCreateSchedules
);

router.patch('/:scheduleId', 
  requirePermission('tour.schedule.update'), 
  validateRequest(validation.updateScheduleSchema), 
  controller.updateSchedule
);

router.delete('/:scheduleId', 
  requirePermission('tour.schedule.delete'), 
  controller.deleteSchedule
);

router.post('/:scheduleId/duplicate', 
  requirePermission('tour.schedule.duplicate'), 
  controller.duplicateSchedule
);

export const tourScheduleRoutes = router;
