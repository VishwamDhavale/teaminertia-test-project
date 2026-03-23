import { Router } from 'express';
import { createPlayer, getPlayers } from '../controllers/player.controller';

const router = Router();

router.post('/', createPlayer);
router.get('/', getPlayers);

export default router;