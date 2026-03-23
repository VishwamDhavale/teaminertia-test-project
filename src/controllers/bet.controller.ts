import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

export const placeBet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const roundId = parseInt(req.params.roundId as string, 10);
        const { player_id, amount } = req.body;
        
        if (isNaN(roundId)) {
            return res.status(404).json({ error: 'Invalid round ID' });
        }
        
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid bet amount' });
        }
        
        // Check if round exists
        const [rounds]: any = await pool.query('SELECT id FROM rounds WHERE id = ?', [roundId]);
        if (rounds.length === 0) {
            return res.status(404).json({ error: 'Round not found' });
        }
        
        // Check if player exists
        const [players]: any = await pool.query('SELECT id FROM players WHERE id = ?', [player_id]);
        if (players.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // Check if bet already exists
        const [existingBet]: any = await pool.query(
            'SELECT id FROM bets WHERE round_id = ? AND player_id = ?',
            [roundId, player_id]
        );
        if (existingBet.length > 0) {
            return res.status(409).json({ error: 'Player already has a bet in this round' });
        }
        
        const [result]: any = await pool.query(
            'INSERT INTO bets (round_id, player_id, amount) VALUES (?, ?, ?)',
            [roundId, player_id, amount]
        );
        
        const [rows]: any = await pool.query('SELECT * FROM bets WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
};

export const getBets = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const roundId = parseInt(req.params.roundId as string, 10);
        if (isNaN(roundId)) {
            return res.status(404).json({ error: 'Invalid round ID' });
        }
        
        const [rounds]: any = await pool.query('SELECT id FROM rounds WHERE id = ?', [roundId]);
        if (rounds.length === 0) {
            return res.status(404).json({ error: 'Round not found' });
        }
        
        const query = `
            SELECT b.player_id, p.name as player_name, b.amount
            FROM bets b
            JOIN players p ON b.player_id = p.id
            WHERE b.round_id = ?
            ORDER BY b.id ASC
        `;
        const [rows]: any = await pool.query(query, [roundId]);
        
        res.json(rows);
    } catch (err) {
        next(err);
    }
};