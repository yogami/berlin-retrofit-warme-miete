export interface SimulationParams {
    units: number;
    buildingAge: string;
    retrofitType: 'basic' | 'standard' | 'deep';
    baseRentPerUnit: number; // annual
    heatingPerUnit: number; // annual baseline heating
}

export interface SimulationResult {
    totalCost: number;
    totalSubsidy: number;
    netLandlordCost: number;
    oldWarmRent: number;
    newWarmRent: number;
    tenantNetSavings: number;
    landlordAnnualExtraRev: number;
    roiYears: number;
    oldCo2: number;
    newCo2: number;
    co2Saved: number;
    oldHeating: number;
    newHeating: number;
    oldRent: number;
    newRent: number;
}

interface RetrofitStrategy {
    costPerUnit: number;
    heatingReduction: number;
    rentIncreaseMulti: number;
    subsidyPercent: number;
}

const StrategyMap: Record<string, RetrofitStrategy> = {
    'basic': { costPerUnit: 15000, heatingReduction: 0.2, rentIncreaseMulti: 0.02, subsidyPercent: 0.15 },
    'standard': { costPerUnit: 30000, heatingReduction: 0.45, rentIncreaseMulti: 0.05, subsidyPercent: 0.25 },
    'deep': { costPerUnit: 50000, heatingReduction: 0.70, rentIncreaseMulti: 0.08, subsidyPercent: 0.50 }
};

export class SimulatorEngine {
    simulate(params: SimulationParams): SimulationResult {
        const { units, retrofitType, baseRentPerUnit, heatingPerUnit } = params;

        const strategy = StrategyMap[retrofitType];
        if (!strategy) {
            throw new Error(`Invalid retrofit type: ${retrofitType}`);
        }

        const { costPerUnit, heatingReduction, rentIncreaseMulti, subsidyPercent } = strategy;

        const totalCost = costPerUnit * units;
        const totalSubsidy = totalCost * subsidyPercent;
        const netLandlordCost = totalCost - totalSubsidy;

        // Heating
        const newHeatingPerUnit = heatingPerUnit * (1 - heatingReduction);
        const tenantHeatingSavings = heatingPerUnit - newHeatingPerUnit;

        // Rent
        const newRentPerUnit = baseRentPerUnit * (1 + rentIncreaseMulti);
        const rentIncrease = newRentPerUnit - baseRentPerUnit;

        // Warm Rent
        const oldWarmRent = baseRentPerUnit + heatingPerUnit;
        const newWarmRent = newRentPerUnit + newHeatingPerUnit;
        const tenantNetSavings = oldWarmRent - newWarmRent;

        // Landlord ROI
        const landlordAnnualExtraRev = rentIncrease * units;
        const roiYears = netLandlordCost / landlordAnnualExtraRev;

        // CO2 (approx 0.2kg per kWh, basic heuristic for display)
        // simplistic 4 tons per unit originally
        const oldCo2 = 4 * units;
        const newCo2 = 4 * (1 - heatingReduction) * units;
        const co2Saved = oldCo2 - newCo2;

        return {
            totalCost,
            totalSubsidy,
            netLandlordCost,
            oldWarmRent,
            newWarmRent,
            tenantNetSavings,
            landlordAnnualExtraRev,
            roiYears,
            oldCo2,
            newCo2,
            co2Saved,
            oldHeating: heatingPerUnit,
            newHeating: newHeatingPerUnit,
            oldRent: baseRentPerUnit,
            newRent: newRentPerUnit
        };
    }
}
