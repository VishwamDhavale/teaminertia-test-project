import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

export const createRound = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [result]: any = await pool.query('INSERT INTO rounds () VALUES ()');
        const [rows]: any = await pool.query('SELECT * FROM rounds WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        next(err);
    }
};

export const getRounds = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM rounds ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};