import { describe, it, expect } from 'vitest';
import { CryptoAuditTrail } from '../../server/domain/CryptoAuditTrail';
import { SimulationParams, SimulationResult } from '../../server/domain/SimulatorEngine';

describe('CryptoAuditTrail', () => {
    it('should generate a deterministic hash for a given mock simulation', () => {
        const crypt = new CryptoAuditTrail();
        const mockParams: SimulationParams = {
            units: 20,
            buildingAge: '1970',
            retrofitType: 'deep',
            baseRentPerUnit: 14000,
            heatingPerUnit: 3000
        };

        const mockResults: SimulationResult = {
            totalCost: 1000000,
            totalSubsidy: 500000,
            netLandlordCost: 500000,
            oldWarmRent: 17000,
            newWarmRent: 16500,
            tenantNetSavings: 500,
            landlordAnnualExtraRev: 1400,
            roiYears: 16.6,
            oldCo2: 80,
            newCo2: 24,
            co2Saved: 56,
            oldHeating: 3000,
            newHeating: 900,
            oldRent: 14000,
            newRent: 15400
        };

        const { hash, payload } = crypt.generateHash(mockParams, mockResults);

        expect(hash).toBeDefined();
        expect(hash.length).toBe(64); // SHA-256 is 64 hex characters
        expect(payload.engineVersion).toBeDefined();

        // Verify it
        const isValid = crypt.verifyHash(hash, payload);
        expect(isValid).toBe(true);
    });

    it('should fail verification if the payload is tampered with', () => {
        const crypt = new CryptoAuditTrail();
        const mockParams: SimulationParams = {
            units: 10,
            buildingAge: 'pre-1977',
            retrofitType: 'basic',
            baseRentPerUnit: 10000,
            heatingPerUnit: 2000
        };

        const mockResults: SimulationResult = {
            totalCost: 150000,
            totalSubsidy: 22500,
            netLandlordCost: 127500,
            oldWarmRent: 12000,
            newWarmRent: 11800,
            tenantNetSavings: 200,
            landlordAnnualExtraRev: 200,
            roiYears: 25.0,
            oldCo2: 40,
            newCo2: 32,
            co2Saved: 8,
            oldHeating: 2000,
            newHeating: 1600,
            oldRent: 10000,
            newRent: 10200
        };

        const { hash, payload } = crypt.generateHash(mockParams, mockResults);

        // Tamper with the result
        payload.results.totalCost = 90000;

        const isValid = crypt.verifyHash(hash, payload);
        expect(isValid).toBe(false);
    });
});
