import express from 'express';
import cors from 'cors';
import { createApiRouter } from '../ports/api';
import { createSimulationsRouter } from '../ports/simulations';
import { createReportingRouter } from '../ports/reporting';
import { createMarketplaceRouter } from '../ports/marketplace';
import { createDbClient } from '../infrastructure/database';
import * as path from 'path';

export const createApp = (databaseUrl?: string) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const db = databaseUrl ? createDbClient(databaseUrl) : null;
    const apiRouter = createApiRouter(db);
    const simulationsRouter = createSimulationsRouter(db);
    const reportingRouter = createReportingRouter(db);
    const marketplaceRouter = createMarketplaceRouter();

    app.use('/api', apiRouter);
    app.use('/api/simulations', simulationsRouter);
    app.use('/api/reports', reportingRouter);
    app.use('/api/marketplace', marketplaceRouter);

    // Serve static frontend files in production
    app.use(express.static(path.join(process.cwd(), 'dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });

    return app;
};
