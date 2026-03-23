import { Router, Request, Response } from 'express';
import { getHistory, getHistorySummary, clearHistory } from '../controllers/history.controller';

const router = Router();

router.get('/', getHistory);
router.get('/summary', getHistorySummary);
router.delete('/', clearHistory);

export default router;
