import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import playerRoutes from './routes/player.routes';
import seatRoutes from './routes/seat.routes';
import roundRoutes from './routes/round.routes';
import betRoutes from './routes/bet.routes';
import historyRoutes from './routes/history.routes';

const app = express();

app.use(cors());
app.use(express.json());

import path from 'path';

// Serve static UI frontend
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/players', playerRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/rounds', roundRoutes);


app.use('/api/rounds', betRoutes);
app.use('/api/history', historyRoutes);


//health check
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Casino Bets API' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
