import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.example' });

const pool: mysql.Pool = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!)!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    waitForConnections: true,
    connectionLimit: 10,
    // timezone: '+05:30',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

export default pool;