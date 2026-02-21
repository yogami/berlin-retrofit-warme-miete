import { describe, it, expect } from 'vitest';
import { SimulatorEngine, SimulationParams } from '../../server/domain/SimulatorEngine';

describe('SimulatorEngine', () => {
    it('should calculate deep retrofit math correctly per ATDD specs', () => {
        const engine = new SimulatorEngine();
        const params: SimulationParams = {
            units: 20,
            buildingAge: '1970',
            retrofitType: 'deep',
            baseRentPerUnit: 12000,
            heatingPerUnit: 2400
        };

        const result = engine.simulate(params);

        // Based on previous UI logic, 20 units * 50000 = 1,000,000 cost. 50% subsidy = 500k.
        expect(result.totalCost).toBe(1000000);
        expect(result.totalSubsidy).toBe(500000);
        expect(result.netLandlordCost).toBe(500000);

        // Rent new = 12000 * 1.08 = 12960. Rent Increase = 960/yr.
        // Heating new = 2400 * 0.3 = 720. Heating savings = 1680.
        // Old Warm Rent = 14400. New Warm Rent = 13680. Savings = 720
        expect(result.tenantNetSavings).toBe(720);

        // ROI: 960 * 20 = 19200
        // Years = 500k / 19.2k = 26.04
        expect(result.roiYears).toBeCloseTo(26.04, 2);

        // CO2 saved: Old = 80t. New = 24t. Saved = 56t.
        expect(result.co2Saved).toBe(56);
    });
});
