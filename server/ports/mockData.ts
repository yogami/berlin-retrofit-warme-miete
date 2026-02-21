import { Router } from 'express';
import { simulations } from '../infrastructure/schema';
import { SimulatorEngine, SimulationParams } from '../domain/SimulatorEngine';

export const createMockRouter = (db: any) => {
    const router = Router();
    const engine = new SimulatorEngine();

    const mockBuildings = [
        { name: 'Kreuzberg Altbau', units: 12, buildingAge: '1900', retrofitType: 'deep', baseRentPerUnit: 14000, heatingPerUnit: 3000 },
        { name: 'Mitte Plattenbau', units: 40, buildingAge: '1970', retrofitType: 'standard', baseRentPerUnit: 11000, heatingPerUnit: 2200 },
        { name: 'Neukölln Neubau', units: 8, buildingAge: '1950', retrofitType: 'basic', baseRentPerUnit: 16000, heatingPerUnit: 1800 },
        { name: 'Prenzlauer Berg Block', units: 25, buildingAge: '1920', retrofitType: 'deep', baseRentPerUnit: 15500, heatingPerUnit: 2800 },
    ];

    router.get('/seed', async (req, res) => {
        try {
            if (!db) {
                return res.status(500).json({ success: false, message: 'Database not connected. Cannot seed.' });
            }

            // Clear existing for clean demo state
            await db.delete(simulations);

            const inserted = [];
            for (const building of mockBuildings) {
                const params: SimulationParams = {
                    units: building.units,
                    buildingAge: building.buildingAge,
                    retrofitType: building.retrofitType as any,
                    baseRentPerUnit: building.baseRentPerUnit,
                    heatingPerUnit: building.heatingPerUnit
                };

                const result = engine.simulate(params);

                const record = await db.insert(simulations).values({
                    units: params.units,
                    buildingAge: params.buildingAge,
                    retrofitType: params.retrofitType,
                    results: result,
                }).returning();

                inserted.push({ name: building.name, ...record[0] });
            }

            res.status(200).json({ success: true, seeded: inserted });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    router.get('/buildings', async (req, res) => {
        try {
            if (!db) {
                // Return static mocks if no DB connection for instant UI feedback
                const staticMocks = mockBuildings.map(b => ({
                    ...b,
                    results: engine.simulate(b as any)
                }));
                return res.status(200).json({ success: true, data: staticMocks, source: 'static' });
            }

            const data = await db.select().from(simulations).limit(10);
            res.status(200).json({ success: true, data, source: 'database' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
