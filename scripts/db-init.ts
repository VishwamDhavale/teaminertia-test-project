import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function init() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'your_password',
            multipleStatements: true,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
        });

        const dbName = process.env.DB_NAME || 'casino_bets';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        const schema = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf-8');
        await connection.query(schema);

        console.log('Database initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
}
init();
