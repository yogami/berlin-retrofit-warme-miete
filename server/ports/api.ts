import { Router } from 'express';
import { SimulatorEngine, SimulationParams } from '../domain/SimulatorEngine';
import { simulations } from '../infrastructure/schema';

export const createApiRouter = (db: any) => {
    const router = Router();
    const engine = new SimulatorEngine();

    router.post('/simulate', async (req, res) => {
        try {
            const params: SimulationParams = req.body;

            // 1. Run Domain Logic
            const result = engine.simulate(params);

            // 2. Persist to Infrastructure (if DB connected)
            let savedId = null;
            if (db) {
                const inserted = await db.insert(simulations).values({
                    units: params.units,
                    buildingAge: params.buildingAge,
                    retrofitType: params.retrofitType,
                    results: result,
                }).returning({ id: simulations.id });
                savedId = inserted[0].id;
            }

            res.status(200).json({
                success: true,
                data: result,
                id: savedId
            });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
