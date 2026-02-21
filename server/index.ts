import { createApp } from './application/index';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

const app = createApp(databaseUrl);

import { Client } from 'pg';
async function ensureTables() {
    if (!databaseUrl) return;
    const client = new Client({ connectionString: databaseUrl });
    try {
        await client.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS "simulations" (
                "id" serial PRIMARY KEY NOT NULL,
                "units" integer NOT NULL,
                "building_age" text NOT NULL,
                "retrofit_type" text NOT NULL,
                "results" json,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS "audit_logs" (
                "id" serial PRIMARY KEY NOT NULL,
                "simulation_id" integer NOT NULL,
                "version_hash" text NOT NULL,
                "hash" text NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log('Database tables verified/created successfully.');
    } catch (e) {
        console.error('Failed to create tables:', e);
    } finally {
        await client.end();
    }
}

ensureTables().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        if (databaseUrl) {
            console.log('Database connected.');
        } else {
            console.log('Running without database connection.');
        }
    });
});

