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

    it('should calculate basic retrofit math correctly', () => {
        const engine = new SimulatorEngine();
        const params: SimulationParams = {
            units: 10,
            buildingAge: '1970',
            retrofitType: 'basic',
            baseRentPerUnit: 10000,
            heatingPerUnit: 2000
        };

        const result = engine.simulate(params);

        // Cost: 10 units * 15,000 = 150,000. Subsidy 15% = 22,500.
        expect(result.totalCost).toBe(150000);
        expect(result.totalSubsidy).toBe(22500);

        // Rent new = 10000 * 1.02 = 10200. Increase = 200/yr.
        // Heating new = 2000 * 0.8 = 1600.
        // Old Warm Rent = 12000. New Warm Rent = 11800. Savings = 200.
        expect(result.tenantNetSavings).toBe(200);
        expect(result.co2Saved).toBeCloseTo(40 * 0.2, 1); // 4 * 10 = 40. 20% reduction = 8t
    });

    it('should calculate standard retrofit math correctly', () => {
        const engine = new SimulatorEngine();
        const params: SimulationParams = {
            units: 5,
            buildingAge: '1970',
            retrofitType: 'standard',
            baseRentPerUnit: 12000,
            heatingPerUnit: 2500
        };

        const result = engine.simulate(params);

        // Cost: 5 units * 30,000 = 150,000. Subsidy 25% = 37,500.
        expect(result.totalCost).toBe(150000);
        expect(result.totalSubsidy).toBe(37500);

        // Rent new = 12000 * 1.05 = 12600.
        // Heating new = 2500 * 0.55 = 1375.
        // Old Warm Rent = 14500. New Warm Rent = 13975. Savings = 525.
        expect(result.tenantNetSavings).toBe(525);
    });
});
