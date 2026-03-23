import { Router } from 'express';
import { getSeats, assignSeat, removeSeat } from '../controllers/seat.controller';

const router = Router();

router.get('/', getSeats);
router.patch('/:seatNumber/assign', assignSeat);
router.patch('/:seatNumber/remove', removeSeat);

export default router;