import { Router } from 'express';
import { simulations } from '../infrastructure/schema';
import { eq } from 'drizzle-orm';

export const createSimulationsRouter = (db: any) => {
    const router = Router();

    // READ: Get all saved simulations
    router.get('/', async (req, res) => {
        try {
            if (!db) {
                return res.status(200).json({ success: true, data: [] });
            }

            const data = await db.select().from(simulations).orderBy(simulations.createdAt).limit(20);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // CREATE: Save a new simulation
    router.post('/', async (req, res) => {
        try {
            if (!db) {
                return res.status(500).json({ success: false, message: 'Database not connected.' });
            }

            const { name, params, results } = req.body;

            const inserted = await db.insert(simulations).values({
                units: params.units,
                buildingAge: params.buildingAge,
                retrofitType: params.retrofitType,
                results: results,
            }).returning();

            res.status(200).json({ success: true, data: { name, ...inserted[0] } });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // DELETE: Remove a saved simulation
    router.delete('/:id', async (req, res) => {
        try {
            if (!db) {
                return res.status(500).json({ success: false, message: 'Database not connected.' });
            }

            const id = parseInt(req.params.id);
            await db.delete(simulations).where(eq(simulations.id, id));

            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
