import { pgTable, text, integer, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const simulations = pgTable('simulations', {
    id: serial('id').primaryKey(),
    units: integer('units').notNull(),
    buildingAge: text('building_age').notNull(),
    retrofitType: text('retrofit_type').notNull(),
    results: jsonb('results').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
    id: serial('id').primaryKey(),
    simulationId: integer('simulation_id').notNull().references(() => simulations.id, { onDelete: 'cascade' }),
    hash: text('hash').notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
