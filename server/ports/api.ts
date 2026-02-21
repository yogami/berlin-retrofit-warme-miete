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

            res.status(200).json({
                success: true,
                data: result,
                id: null
            });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
