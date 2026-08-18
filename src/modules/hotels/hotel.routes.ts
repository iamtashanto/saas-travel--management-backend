import { Router } from 'express';
import { HotelController, hotelSchema, hotelRoomTypeSchema } from './hotel.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.hotels.view'), HotelController.list);
router.post('/', requirePermission('tour.hotels.manage'), validateRequest(hotelSchema), HotelController.create);
router.patch('/:id', requirePermission('tour.hotels.manage'), validateRequest(hotelSchema.partial()), HotelController.update);
router.delete('/:id', requirePermission('tour.hotels.manage'), HotelController.delete);

router.post('/:hotelId/rooms', requirePermission('tour.hotels.manage'), validateRequest(hotelRoomTypeSchema), HotelController.addRoomType);

export const hotelRoutes = router;
