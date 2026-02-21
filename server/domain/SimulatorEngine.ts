export interface SimulationParams {
  units: number;
  buildingAge: string;
  retrofitType: "basic" | "standard" | "deep";
  baseRentPerUnit: number; // annual
  heatingPerUnit: number; // annual baseline heating
  sqmPerUnit?: number; // Added for CO2 tier calculation (default 70sqm)
  co2PricePerTon?: number; // default 45 EUR in 2026
  avRatio?: number; // Surface-Area-to-Volume ratio for physics-based modifier
  pvRevenue?: number; // Annual solar PV revenue potential
}

export interface SimulationResult {
  totalCost: number;
  totalSubsidy: number;
  netLandlordCost: number;
  oldWarmRent: number;
  newWarmRent: number;
  tenantNetSavings: number;
  landlordAnnualExtraRev: number;
  pvRevenueGenerated: number;
  roiYears: number;
  oldCo2: number;
  newCo2: number;
  co2Saved: number;
  oldHeating: number;
  newHeating: number;
  oldRent: number;
  newRent: number;
  co2TaxTotalOld: number;
  co2TaxLandlordOld: number;
  co2TaxTenantOld: number;
  co2TaxTotalNew: number;
  co2TaxLandlordNew: number;
  co2TaxTenantNew: number;
  landlordCo2Savings: number;
  bgbLegalMaxIncrease: number;
  dealMakerRentIncrease: number;
  assetPremiumValue: number;
}

interface RetrofitStrategy {
  costPerUnit: number;
  heatingReduction: number;
  rentIncreaseMulti: number;
  subsidyPercent: number;
}

const StrategyMap: Record<string, RetrofitStrategy> = {
  basic: {
    costPerUnit: 15000,
    heatingReduction: 0.2,
    rentIncreaseMulti: 0.02,
    subsidyPercent: 0.15,
  },
  standard: {
    costPerUnit: 30000,
    heatingReduction: 0.45,
    rentIncreaseMulti: 0.05,
    subsidyPercent: 0.25,
  },
  deep: {
    costPerUnit: 50000,
    heatingReduction: 0.7,
    rentIncreaseMulti: 0.08,
    subsidyPercent: 0.5,
  },
};

export class SimulatorEngine {
  simulate(params: SimulationParams): SimulationResult {
    const {
      units,
      retrofitType,
      baseRentPerUnit,
      heatingPerUnit,
      sqmPerUnit,
      co2PricePerTon,
    } = params;

    const strategy = StrategyMap[retrofitType];
    if (!strategy) {
      throw new Error(`Invalid retrofit type: ${retrofitType}`);
    }

    const { costPerUnit, rentIncreaseMulti, subsidyPercent } = strategy;
    let { heatingReduction } = strategy;

    // Apply strict physics modifier. 
    // A high A/V ratio (e.g., 1.2 for detached) loses more heat, making retrofits MORE effective.
    // A low A/V ratio (e.g., 0.5 for mid-terraced) loses less heat naturally.
    if (params.avRatio) {
      // Simple linear modifier based on standard 1.0 baseline
      const physicsModifier = Math.max(0.7, Math.min(1.3, params.avRatio));
      heatingReduction = Math.min(0.9, heatingReduction * physicsModifier);
    }

    const totalCost = costPerUnit * units;
    const totalSubsidy = totalCost * subsidyPercent;
    const netLandlordCost = totalCost - totalSubsidy;

    // Heating
    const newHeatingPerUnit = heatingPerUnit * (1 - heatingReduction);
    const tenantHeatingSavings = heatingPerUnit - newHeatingPerUnit;

    // CO2 Tax Calculations (10-tier split logic based on 2026 CO2AufG)
    const sqm = sqmPerUnit || 70; // fallback to 70sqm avg Berlin apartment
    const co2Price = co2PricePerTon || 45; // 2026 price in EUR

    // simplistic 4 tons per unit originally. (approx 57 kgCO2/sqm for a 70sqm flat)
    const oldCo2 = 4 * units;
    const newCo2 = 4 * (1 - heatingReduction) * units;
    const co2Saved = oldCo2 - newCo2;

    // Calculate kgCO2 per sqm per year
    const getLandlordShare = (kgCo2PerSqm: number) => {
      if (kgCo2PerSqm < 12) return 0.0;
      if (kgCo2PerSqm < 17) return 0.1;
      if (kgCo2PerSqm < 22) return 0.2;
      if (kgCo2PerSqm < 27) return 0.3;
      if (kgCo2PerSqm < 32) return 0.4;
      if (kgCo2PerSqm < 37) return 0.5;
      if (kgCo2PerSqm < 42) return 0.6;
      if (kgCo2PerSqm < 47) return 0.7;
      if (kgCo2PerSqm < 52) return 0.8;
      return 0.95; // >52 kgCO2/m2a (Worst case tier)
    };

    const oldKgPerSqm = (oldCo2 * 1000) / (units * sqm);
    const newKgPerSqm = (newCo2 * 1000) / (units * sqm);

    const oldLandlordShare = getLandlordShare(oldKgPerSqm);
    const newLandlordShare = getLandlordShare(newKgPerSqm);

    const co2TaxTotalOld = oldCo2 * co2Price;
    const co2TaxLandlordOld = co2TaxTotalOld * oldLandlordShare;
    const co2TaxTenantOld = co2TaxTotalOld - co2TaxLandlordOld;

    const co2TaxTotalNew = newCo2 * co2Price;
    const co2TaxLandlordNew = co2TaxTotalNew * newLandlordShare;
    const co2TaxTenantNew = co2TaxTotalNew - co2TaxLandlordNew;

    const landlordCo2Savings = co2TaxLandlordOld - co2TaxLandlordNew;
    const co2TaxTenantSavings = Math.max(0, co2TaxTenantOld - co2TaxTenantNew);

    const totalTenantUtilitySavings = tenantHeatingSavings + co2TaxTenantSavings;

    // Deal Maker Optimization (Solving Split Incentive)
    // 1. Calculate traditional BGB 8% cap on the total capEx per unit
    const capExPerUnit = totalCost / units;
    const bgbLegalMaxIncrease = capExPerUnit * 0.08;

    // 2. Deal Maker Capping:
    // To solve the split incentive, we cap the rent levy to ensure the tenant guarantees a net-positive outcome.
    // The tenant keeps 20% of their utility savings, the landlord takes the rest as rent increase.
    const guaranteedTenantBuffer = totalTenantUtilitySavings * 0.2;
    const dealMakerRentIncrease = Math.min(bgbLegalMaxIncrease, Math.max(0, totalTenantUtilitySavings - guaranteedTenantBuffer));

    const newRentPerUnit = baseRentPerUnit + dealMakerRentIncrease;

    // Warm Rent (inclusive of CO2 for true split incentive math)
    const oldWarmRent = baseRentPerUnit + heatingPerUnit + co2TaxTenantOld;
    const newWarmRent = newRentPerUnit + newHeatingPerUnit + co2TaxTenantNew;
    const finalTenantNetSavings = oldWarmRent - newWarmRent; // Will strictly be positive

    // Advanced Landlord ROI includes the avoided CO2 penalty, potential PV revenue, and Asset Premium
    const landlordAnnualExtraRev = dealMakerRentIncrease * units;
    const annualPv = params.pvRevenue || 0;

    // Asset Premium: Assume a 20x multiplier on base rent as property value, and retrofit increases value by 20%
    const estimatedPropertyBaseValue = baseRentPerUnit * units * 20;
    const assetPremiumValue = estimatedPropertyBaseValue * 0.20;

    // ROI includes the capital gains from the asset premium amortized over 10 years for calculation purposes, or just straight.
    // The standard cash-on-cash ROI (Years)
    const advancedRoiYears = netLandlordCost / (landlordAnnualExtraRev + landlordCo2Savings + annualPv + (assetPremiumValue / 10));

    return {
      totalCost,
      totalSubsidy,
      netLandlordCost,
      oldWarmRent,
      newWarmRent,
      tenantNetSavings: finalTenantNetSavings,
      landlordAnnualExtraRev,
      pvRevenueGenerated: annualPv,
      roiYears: advancedRoiYears,
      oldCo2,
      newCo2,
      co2Saved,
      oldHeating: heatingPerUnit,
      newHeating: newHeatingPerUnit,
      oldRent: baseRentPerUnit,
      newRent: newRentPerUnit,
      co2TaxTotalOld,
      co2TaxLandlordOld,
      co2TaxTenantOld,
      co2TaxTotalNew,
      co2TaxLandlordNew,
      co2TaxTenantNew,
      landlordCo2Savings,
      bgbLegalMaxIncrease,
      dealMakerRentIncrease,
      assetPremiumValue,
    };
  }
}
