import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

export const getSeats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = `
            SELECT s.seat_number, p.id as player_id, p.name as player_name
            FROM seats s
            LEFT JOIN players p ON s.player_id = p.id
            ORDER BY s.seat_number ASC
        `;
        const [rows]: any = await pool.query(query);
        
        const seats = rows.map((row: any) => ({
            seat_number: row.seat_number,
            player: row.player_id ? {
                id: row.player_id,
                name: row.player_name
            } : null
        }));
        
        res.json(seats);
    } catch (err) {
        next(err);
    }
};

export const assignSeat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const seatNumber = parseInt(req.params.seatNumber as string, 10);
        const { player_id } = req.body;
        
        if (isNaN(seatNumber) || seatNumber < 1 || seatNumber > 6) {
            return res.status(404).json({ error: 'Invalid seat number. Must be between 1 and 6.' });
        }
        if (!player_id) {
            return res.status(400).json({ error: 'player_id is required' });
        }
        
        // Check if player exists
        const [players]: any = await pool.query('SELECT * FROM players WHERE id = ?', [player_id]);
        if (players.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        const player = players[0];
        
        // Check if player is already seated
        const [seated]: any = await pool.query('SELECT * FROM seats WHERE player_id = ?', [player_id]);
        if (seated.length > 0) {
            return res.status(409).json({ error: 'Player is already assigned to a seat' });
        }
        
        await pool.query('UPDATE seats SET player_id = ? WHERE seat_number = ?', [player_id, seatNumber]);
        
        res.json({
            seat_number: seatNumber,
            player: { id: player.id, name: player.name }
        });
    } catch (err) {
        next(err);
    }
};

export const removeSeat = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const seatNumber = parseInt(req.params.seatNumber as string, 10);
        
        if (isNaN(seatNumber) || seatNumber < 1 || seatNumber > 6) {
            return res.status(404).json({ error: 'Invalid seat number. Must be between 1 and 6.' });
        }
        
        const [seats]: any = await pool.query('SELECT player_id FROM seats WHERE seat_number = ?', [seatNumber]);
        if (seats.length === 0) {
             return res.status(404).json({ error: 'Seat not found' });
        }
        
        if (seats[0].player_id === null) {
            return res.status(404).json({ error: 'Seat is already empty' });
        }
        
        await pool.query('UPDATE seats SET player_id = NULL WHERE seat_number = ?', [seatNumber]);
        
        res.json({
            seat_number: seatNumber,
            player: null
        });
    } catch (err) {
        next(err);
    }
};