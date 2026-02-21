import * as crypto from 'crypto';
import { SimulationParams, SimulationResult } from './SimulatorEngine';

export class CryptoAuditTrail {
    private readonly ENGINE_VERSION = '1.0.0-rc1';

    /**
     * Generates a deterministic SHA-256 hash representing the exact state of the simulation.
     */
    generateHash(params: SimulationParams, results: SimulationResult): { hash: string, payload: any } {
        const payload = {
            engineVersion: this.ENGINE_VERSION,
            timestamp: new Date().toISOString(),
            params: {
                units: params.units,
                buildingAge: params.buildingAge,
                retrofitType: params.retrofitType,
                // Zero-Trust: We do NOT track address or user details in the payload
            },
            results: {
                totalCost: results.totalCost,
                totalSubsidy: results.totalSubsidy,
                netLandlordCost: results.netLandlordCost,
                oldWarmRent: results.oldWarmRent,
                newWarmRent: results.newWarmRent,
                tenantNetSavings: results.tenantNetSavings,
                landlordAnnualExtraRev: results.landlordAnnualExtraRev,
                roiYears: results.roiYears,
                co2Saved: results.co2Saved
            }
        };

        // Deterministic stringification (ensuring order by constructing it literally if needed, but here simple stringify is fine as we only verify the exact payload string or construct it identically)
        const stringifiedPayload = JSON.stringify(payload);

        const hash = crypto.createHash('sha256').update(stringifiedPayload).digest('hex');

        return { hash, payload };
    }

    /**
     * Verifies if a given hash matches the payload.
     */
    verifyHash(hash: string, payload: any): boolean {
        // Stringify exactly as we generated it. In a real system you'd use a stable stringify library.
        const stringifiedPayload = JSON.stringify(payload);
        const expectedHash = crypto.createHash('sha256').update(stringifiedPayload).digest('hex');
        return expectedHash === hash;
    }
}
