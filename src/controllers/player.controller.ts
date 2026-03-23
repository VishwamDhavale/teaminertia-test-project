import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

export const createPlayer = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Name is required and cannot be blank' });
        }
        
        const [result]: any = await pool.query(
            'INSERT INTO players (name) VALUES (?)',
            [name.trim()]
        );
        
        const [rows]: any = await pool.query('SELECT * FROM players WHERE id = ?', [result.insertId]);
        
        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
};

export const getPlayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM players ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};