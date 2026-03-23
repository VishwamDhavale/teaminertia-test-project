import { Router } from 'express';
import { placeBet, getBets } from '../controllers/bet.controller';

const router = Router({ mergeParams: true });

router.post('/:roundId/bets', placeBet);
router.get('/:roundId/bets', getBets);

export default router;