import express from 'express';
import cors from 'cors';
import { createApiRouter } from '../ports/api';
import { createDbClient } from '../infrastructure/database';
import * as path from 'path';

export const createApp = (databaseUrl?: string) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const db = databaseUrl ? createDbClient(databaseUrl) : null;
    const apiRouter = createApiRouter(db);

    app.use('/api', apiRouter);

    // Serve static frontend files in production
    app.use(express.static(path.join(process.cwd(), 'dist')));

    app.use((req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });

    return app;
};
