import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = `
            SELECT
                r.id        AS round_id,
                DATE_FORMAT(r.created_at, '%H:%i') AS time,
                p.name      AS player_name,
                b.amount    AS amount
            FROM rounds r
            CROSS JOIN players p
            LEFT JOIN bets b ON b.round_id = r.id AND b.player_id = p.id
            ORDER BY r.id ASC, p.id ASC
        `;
        
        const [rows]: any = await pool.query(query);
        
        // Pivot the data
        const playersSet = new Set<string>();
        const validRows = rows as any[];
        validRows.forEach(row => playersSet.add(row.player_name));
        
        const players = Array.from(playersSet);
        
        const rowsMap = new Map<number, any>();
        
        validRows.forEach(row => {
            if (!rowsMap.has(row.round_id)) {
                rowsMap.set(row.round_id, {
                    round_id: row.round_id,
                    time: row.time,
                    bets: {}
                });
            }
            const mappedRow = rowsMap.get(row.round_id);
            mappedRow.bets[row.player_name] = row.amount !== null ? row.amount : null;
        });
        
        res.json({
            players,
            rows: Array.from(rowsMap.values())
        });
        
    } catch (err) {
        next(err);
    }
};

export const getHistorySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rounds]: any = await pool.query('SELECT COUNT(*) as count FROM rounds');
        const roundCount = rounds[0].count;
        
        const query = `
            SELECT p.name, SUM(b.amount) AS total
            FROM bets b
            JOIN players p ON p.id = b.player_id
            GROUP BY p.id, p.name
        `;
        const [rows]: any = await pool.query(query);
        
        const totals: Record<string, number> = {};
        (rows as any[]).forEach(row => {
            totals[row.name] = parseInt(row.total, 10);
        });
        
        res.json({
            round_count: roundCount,
            totals
        });
        
    } catch (err) {
        next(err);
    }
};

export const clearHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.query('DELETE FROM bets');
        await pool.query('DELETE FROM rounds');
        await pool.query('ALTER TABLE rounds AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE bets AUTO_INCREMENT = 1');
        await pool.query('UPDATE seats SET player_id = NULL');
        res.status(200).json({ message: 'Game state cleared successfully' });
    } catch (err) {
        next(err);
    }
};
