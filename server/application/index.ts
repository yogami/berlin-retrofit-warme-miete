import express from 'express';
import cors from 'cors';
import { createApiRouter } from '../ports/api';
import { createMockRouter } from '../ports/mockData';
import { createDbClient } from '../infrastructure/database';
import * as path from 'path';

export const createApp = (databaseUrl?: string) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const db = databaseUrl ? createDbClient(databaseUrl) : null;
    const apiRouter = createApiRouter(db);
    const mockRouter = createMockRouter(db);

    app.use('/api', apiRouter);
    app.use('/api/demo', mockRouter);

    // Serve static frontend files in production
    app.use(express.static(path.join(process.cwd(), 'dist')));

    app.use((req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });

    return app;
};
