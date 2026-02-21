import React from 'react';
import { SimulationResult } from '../../server/domain/SimulatorEngine';

export function ValuePerEntityTable({ data, units }: { data: SimulationResult, units: number }) {
    if (!data) return null;

    const tenantHeatingSavings = data.oldHeating - data.newHeating;
    const tenantCo2Savings = data.co2TaxTenantOld - data.co2TaxTenantNew;
    const totalTenantUtilitySavings = (tenantHeatingSavings + tenantCo2Savings) * units;

    // Per month metrics for readability
    const tenantNetMonthlySavings = data.tenantNetSavings / 12;
    const rentLevyMonthly = data.dealMakerRentIncrease / 12;

    return (
        <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
            <h3 className="text-xl font-bold mb-4" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="text-primary">RETROFIT DEAL SUMMARY</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">Win-Win Verified</span>
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-y text-slate-500 text-sm">
                            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Stakeholder</th>
                            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Gets (Value Creation)</th>
                            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Pays (Cost / Friction)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">Tenant</td>
                            <td className="py-4 px-4 text-green-700 font-medium">
                                €{(totalTenantUtilitySavings / units).toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr utility cut; <br />
                                <strong className="text-lg">€{tenantNetMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo net cheaper</strong>
                            </td>
                            <td className="py-4 px-4 text-amber-600">
                                +€{rentLevyMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo rent (BGB § 559)
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">Landlord</td>
                            <td className="py-4 px-4 text-blue-700 font-medium">
                                €{(data.landlordAnnualExtraRev).toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr recovery; <br />
                                €{data.landlordCo2Savings.toLocaleString(undefined, { maximumFractionDigits: 0 })} CO2 tax avoided; <br />
                                +€{(data.assetPremiumValue).toLocaleString(undefined, { maximumFractionDigits: 0 })} Asset Premium
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                                €{data.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} Capex
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">Property Mgr</td>
                            <td className="py-4 px-4 text-slate-700">2x retrofit throughput; EPC compliance</td>
                            <td className="py-4 px-4 text-slate-600">€50/mo SaaS platform fee</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">Bank</td>
                            <td className="py-4 px-4 text-slate-700">De-risked €{data.netLandlordCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} green loans</td>
                            <td className="py-4 px-4 text-slate-600">1-2% Origination fee</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-800">Consultant</td>
                            <td className="py-4 px-4 text-slate-700">3x iSFP (Energy Audit) speed</td>
                            <td className="py-4 px-4 text-slate-600">Platform Lead fee</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
