import React, { useState } from 'react';
import SimulatorControls from './SimulatorControls';
import MetricsDisplay from './MetricsDisplay';
import ImpactCharts from './ImpactCharts';
import { Building2, Leaf, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSimulation } from '../hooks/useSimulation';

function Dashboard() {
    const [params, setParams] = useState({
        units: 20,
        buildingAge: '1970',
        retrofitType: 'deep', // basic, standard, deep
        baseRentPerUnit: 12000, // annual
        heatingPerUnit: 2400, // annual baseline heating
    });

    const { data, loading, error } = useSimulation(params);

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
                    <div className="flex-row gap-2"><Building2 size={20} color="var(--accent-blue)" /> <span style={{ fontWeight: 600 }}>10k</span></div>
                    <div style={{ width: '1px', background: 'var(--border-light)', height: '24px' }}></div>
                    <div className="flex-row gap-2"><Leaf size={20} color="var(--accent-green)" /> <span style={{ fontWeight: 600 }}>CO2 Neutral 2045</span></div>
                </div>
            </motion.header>

            {/* Main Grid */}
            <div className="dashboard-grid" style={{ padding: 0 }}>
                {/* Left Column: Charts & Metrics */}
                <div className="flex-col gap-6">
                    {loading || !data ? (
                        <div className="glass-panel p-6 flex-row" style={{ justifyContent: 'center', minHeight: '300px' }}>
                            <Loader2 className="animate-spin" size={48} color="var(--accent-green)" />
                        </div>
                    ) : (
                        <>
                            <MetricsDisplay data={data} units={params.units} />

                            <div className="glass-panel p-6">
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Warm Rent Impact (Per Unit / Year)</h2>
                                <ImpactCharts data={data} />
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Controls */}
                <div className="glass-panel p-6 flex-col gap-6" style={{ height: 'fit-content' }}>
                    <div className="flex-row gap-2" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                        <Zap color="var(--accent-blue)" />
                        <h2>Scenario Controls</h2>
                    </div>
                    <SimulatorControls params={params} setParams={setParams} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
