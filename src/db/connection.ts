import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool: mysql.Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'casino_bets',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+05:30',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

export default pool;