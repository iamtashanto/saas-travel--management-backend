import { Router } from 'express';
import { HotelController } from './hotel.controller';
import { hotelSchema, hotelRoomTypeSchema } from './hotel.validation';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.hotels.view'), HotelController.list);
router.get('/:id', requirePermission('tour.hotels.view'), HotelController.get);
router.post('/', requirePermission('tour.hotels.manage'), validateRequest(hotelSchema), HotelController.create);
router.patch('/:id', requirePermission('tour.hotels.manage'), validateRequest(hotelSchema.partial()), HotelController.update);
router.delete('/:id', requirePermission('tour.hotels.manage'), HotelController.delete);

// Extensions
router.post('/:id/room-types', requirePermission('tour.hotels.manage'), validateRequest(hotelRoomTypeSchema), HotelController.addRoomType);

export const hotelRoutes = router;
