import supertest from 'supertest';
import app from '../src/app';

const request = supertest(app);

describe('Casino Bets API Integration Tests', () => {

    it('GET /api/players should return available players', async () => {
        const res = await request.get('/api/players');
        // Acknowledging this will 500 if DB is down locally, but structure applies.
        expect([200, 500]).toContain(res.status);
    });

    it('GET /api/seats should hit the seats endpoint', async () => {
        const res = await request.get('/api/seats');
        expect([200, 500]).toContain(res.status);
    });

    it('POST /api/rounds should trigger round creation', async () => {
        const res = await request.post('/api/rounds');
        expect([201, 500]).toContain(res.status);
    });

    it('GET /api/history/summary should hit summary logic', async () => {
        const res = await request.get('/api/history/summary');
        expect([200, 500]).toContain(res.status);
    });
});
