import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { TourScheduleService } from './tour-schedule.service';
import { AppError } from '../../common/errors/AppError';

export const listSchedules = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await TourScheduleService.listSchedules(req.params.tourId, req.auth.organizationId, req.query as any);
  res.status(200).json({ success: true, data: result, message: 'Schedules retrieved' });
});

export const getSchedule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const schedule = await TourScheduleService.getSchedule(req.params.scheduleId, req.params.tourId, req.auth.organizationId);
  res.status(200).json({ success: true, data: schedule, message: 'Schedule retrieved' });
});

export const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const schedule = await TourScheduleService.createSchedule(req.params.tourId, req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: schedule, message: 'Schedule created' });
});

export const bulkCreateSchedules = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await TourScheduleService.bulkCreateSchedules(req.params.tourId, req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: result, message: 'Schedules bulk created' });
});

export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const schedule = await TourScheduleService.updateSchedule(req.params.scheduleId, req.params.tourId, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: schedule, message: 'Schedule updated' });
});

export const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  await TourScheduleService.deleteSchedule(req.params.scheduleId, req.params.tourId, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: {}, message: 'Schedule deleted' });
});

export const duplicateSchedule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const { newStartDate, newEndDate } = req.body;
  if (!newStartDate || !newEndDate) {
    throw new AppError(400, 'VALIDATION_ERROR', 'newStartDate and newEndDate are required');
  }
  const schedule = await TourScheduleService.duplicateSchedule(req.params.scheduleId, req.params.tourId, req.auth.organizationId, req.auth.userId, newStartDate, newEndDate);
  res.status(201).json({ success: true, data: schedule, message: 'Schedule duplicated' });
});
