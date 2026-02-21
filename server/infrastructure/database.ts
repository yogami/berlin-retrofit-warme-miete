import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema';
const { Pool } = pkg;

export const createDbClient = (connectionString: string) => {
    const pool = new Pool({
        connectionString,
    });
    return drizzle(pool, { schema });
};
