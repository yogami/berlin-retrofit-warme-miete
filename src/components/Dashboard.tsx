import React, { useState } from 'react';
import SimulatorControls from './SimulatorControls';
import MetricsDisplay from './MetricsDisplay';
import ImpactCharts from './ImpactCharts';
import StakeholderIncentives from './StakeholderIncentives';
import SavedScenarios from './SavedScenarios';
import { GeospatialDashboard } from './GeospatialDashboard';
import { ValuePerEntityTable } from './ValuePerEntityTable';
import { Building2, Leaf, Zap, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSimulation } from '../hooks/useSimulation';

function Dashboard() {
    const [activeTab, setActiveTab] = useState<'dealMaker' | 'map'>('map');

    const [params, setParams] = useState({
        units: 20,
        buildingAge: '1970',
        retrofitType: 'deep', // basic, standard, deep
        baseRentPerUnit: 12000, // annual
        heatingPerUnit: 2400, // annual baseline heating
        avRatio: 0.8, // Example default value for avRatio
        pvRevenue: 0, // Example default value for pvRevenue
    });

    const { data, loading, error } = useSimulation(params);

    const handleBuildingSelect = (bldg: any) => {
        setParams(prev => ({
            ...prev,
            units: bldg.units,
            buildingAge: bldg.era_proxy,
            avRatio: bldg.mock_av_ratio,
            pvRevenue: bldg.pv_kwp_mock * 1200, // Roughly 1200 EUR per kWp in Berlin
        }));

        // Auto-switch to Deal Maker tab
        setActiveTab('dealMaker');
        // Auto-scroll to results simulating a zero-friction funnel
        window.scrollTo({ top: 50, behavior: 'smooth' });

        // Fire event listener to auto-trigger the "Deal Closer" modal if needed
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('map-building-selected', { detail: bldg }));
        }, 500);
    };

    return (
        <div className="flex-col gap-8" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-row justify-between"
            >
                <div>
                    <h1 className="text-gradient-green" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Warme Miete</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>GreenLease Optimizer: Solving the split-incentive challenge for Berlin's 1.2M unrenovated apartments.</p>
                </div>
                <div className="flex-row gap-4 glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: '50px' }}>
                    <div className="flex-row bg-slate-100 border border-slate-200" style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', borderRadius: '50px' }}>
                        <button
                            onClick={() => setActiveTab('dealMaker')}
                            style={{
                                fontWeight: 600,
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                fontSize: '0.875rem',
                                transition: 'all',
                                backgroundColor: activeTab === 'dealMaker' ? 'var(--accent-green)' : 'transparent',
                                color: activeTab === 'dealMaker' ? '#fff' : 'var(--text-secondary)'
                            }}
                        >
                            Deal Maker
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            style={{
                                fontWeight: 600,
                                padding: '0.5rem 1rem',
                                borderRadius: '50px',
                                fontSize: '0.875rem',
                                transition: 'all',
                                backgroundColor: activeTab === 'map' ? 'var(--accent-green)' : 'transparent',
                                color: activeTab === 'map' ? '#fff' : 'var(--text-secondary)'
                            }}
                        >
                            CO2 Risk Map
                        </button>
                    </div>
                    <div className="flex-row gap-2" style={{ marginLeft: '1rem' }}><Building2 size={20} color="var(--accent-blue)" /> <span style={{ fontWeight: 600 }}>10k</span></div>
                    <div style={{ width: '1px', background: 'var(--border-light)', height: '24px' }}></div>
                    <div className="flex-row gap-2"><Leaf size={20} color="var(--accent-green)" /> <span style={{ fontWeight: 600 }}>CO2 Neutral 2045</span></div>
                </div>
            </motion.header>

            {/* Phase 6 & 7: Deal Maker / Geospatial Tab Switching */}
            {activeTab === 'map' ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <GeospatialDashboard onBuildingSelect={handleBuildingSelect} />
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-8">
                    {/* Main Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Left Column: Visuals & Data */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {loading || !data ? (
                                <div className="glass-panel p-6 flex-row" style={{ justifyContent: 'center', minHeight: '300px' }}>
                                    <Loader2 className="animate-spin" size={48} color="var(--accent-green)" />
                                </div>
                            ) : (
                                <>
                                    <ValuePerEntityTable data={data} units={params.units} />

                                    <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="glass-panel p-6" style={{ flex: 1 }}>
                                            <MetricsDisplay data={data} units={params.units} />
                                        </div>
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: 'fit-content', marginLeft: '1rem' }}
                                            onClick={() => {
                                                fetch('/api/simulations', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ name: 'Hackathon Demo Model', params, results: data })
                                                }).then(res => {
                                                    if (res.ok) {
                                                        alert("Scenario saved to live Database!");
                                                        window.dispatchEvent(new Event('scenario-saved'));
                                                    }
                                                });
                                            }}
                                        >
                                            <Save size={18} /> Save & Broadcast Scenario
                                        </button>
                                    </div>

                                    <div className="glass-panel p-6">
                                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Warm Rent Impact (Per Unit / Year)</h2>
                                        <ImpactCharts data={data} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right Column: Controls */}
                        <div className="flex-col gap-6" style={{ height: 'fit-content' }}>
                            <div className="glass-panel p-6" style={{ marginBottom: '2rem' }}>
                                <div className="flex-row gap-2" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                    <Zap color="var(--accent-blue)" />
                                    <h2 style={{ fontSize: '1.25rem' }}>Scenario Controls</h2>
                                </div>
                                <SimulatorControls params={params} setParams={setParams} />
                            </div>

                            <SavedScenarios onSelect={(p) => setParams(p)} />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Ecosystem Alignment Section */}
            {activeTab === 'dealMaker' && <StakeholderIncentives />}
        </div>
    );
}

export default Dashboard;
