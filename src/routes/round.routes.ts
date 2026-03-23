import { Router } from 'express';
import { createRound, getRounds } from '../controllers/round.controller';

const router = Router();

router.post('/', createRound);
router.get('/', getRounds);

export default router;