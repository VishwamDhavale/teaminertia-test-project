import app from './app';
import dotenv from 'dotenv';
import pool from './db/connection';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}

startServer();
