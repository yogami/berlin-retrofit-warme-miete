import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/application/index';

describe('API Endpoints (ATDD)', () => {
    it('POST /api/simulate returns successful simulation calculations', async () => {
        const app = createApp(); // No DB URL for mocked run
        const response = await request(app)
            .post('/api/simulate')
            .send({
                units: 20,
                buildingAge: '1970',
                retrofitType: 'deep',
                baseRentPerUnit: 12000,
                heatingPerUnit: 2400
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.netLandlordCost).toBe(500000);
        expect(response.body.data.tenantNetSavings).toBe(720);
    });
});
