import { z } from 'zod';
import * as validation from './tour-schedule.validation';

export type ListSchedulesQuery = z.infer<typeof validation.listSchedulesSchema>['query'];
export type CreateScheduleInput = z.infer<typeof validation.createScheduleSchema>['body'];
export type UpdateScheduleInput = z.infer<typeof validation.updateScheduleSchema>['body'];
export type BulkCreateSchedulesInput = z.infer<typeof validation.bulkCreateSchedulesSchema>['body'];
