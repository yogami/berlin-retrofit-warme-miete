import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ArrowRight, Loader2, Trash2, ShieldCheck, Download, Send, PenTool } from 'lucide-react';
import { SimulationResult } from '../../server/domain/SimulatorEngine';
import { DealCloserModal } from './DealCloserModal';
import { createPortal } from 'react-dom';

interface SavedSimulation {
    id: number;
    units: number;
    buildingAge: string;
    retrofitType: string;
    results: SimulationResult;
    createdAt: string;
    hash?: string;
    _mockAddress?: string;
}

export default function SavedScenarios({ onSelect }: { onSelect: (b: any) => void }) {
    const [scenarios, setScenarios] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatchStatus, setDispatchStatus] = useState<Record<number, string>>({});
    const [activeContractSimulation, setActiveContractSimulation] = useState<SavedSimulation | null>(null);

    // Listen for Map / AI auto-selection events to jump straight to the Deal Closer Funnel
    useEffect(() => {
        const handleMapSelection = (e: any) => {
            const bldg = e.detail;
            // Create a pseudo-simulation state to trick the modal into opening immediately
            // without requiring standard save/broadcast flows
            setActiveContractSimulation({
                id: Math.floor(Math.random() * 900) + 100, // Ephemeral mapping ID
                units: bldg.units,
                buildingAge: bldg.era_proxy,
                retrofitType: 'deep',
                createdAt: new Date().toISOString(),
                hash: 'ephemeral-geo-hash',
                _mockAddress: bldg.address, // Pre-fill injection
                results: {
                    totalCost: 100000,
                    totalSubsidy: 50000,
                    netLandlordCost: 50000,
                    oldWarmRent: 15000,
                    newWarmRent: 14000,
                    tenantNetSavings: 1000,
                    landlordAnnualExtraRev: 8000,
                    pvRevenueGenerated: bldg.pv_kwp_mock * 1200,
                    roiYears: 5,
                    oldCo2: 80,
                    newCo2: 20,
                    co2Saved: 60,
                    oldHeating: 2400,
                    newHeating: 600,
                    oldRent: 12000,
                    newRent: 13000,
                    co2TaxTotalOld: 500,
                    co2TaxLandlordOld: 300,
                    co2TaxTenantOld: 200,
                    co2TaxTotalNew: 100,
                    co2TaxLandlordNew: 10,
                    co2TaxTenantNew: 90,
                    landlordCo2Savings: 290,
                    bgbLegalMaxIncrease: 8000,
                    dealMakerRentIncrease: 6000,
                    assetPremiumValue: 150000
                }
            });
        };

        window.addEventListener('map-building-selected', handleMapSelection);
        return () => window.removeEventListener('map-building-selected', handleMapSelection);
    }, []);

    const fetchScenarios = () => {
        setLoading(true);
        fetch('/api/simulations')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setScenarios(data.data);
                }
            })
            .catch(err => console.error("Error fetching saved scenarios", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchScenarios();

        const handleSaveEvent = () => fetchScenarios();
        window.addEventListener('scenario-saved', handleSaveEvent);

        // Setup an interval to auto-refresh occasionally as backup
        const interval = setInterval(fetchScenarios, 15000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('scenario-saved', handleSaveEvent);
        };
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/simulations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setScenarios(scenarios.filter(s => s.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleExport = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        window.open(`/api/reports/compliance/${id}`, '_blank');
    };

    const handleDispatch = async (e: React.MouseEvent, s: SavedSimulation, type: 'finance' | 'execute') => {
        e.stopPropagation();
        setDispatchStatus(prev => ({ ...prev, [s.id]: 'routing...' }));

        try {
            const res = await fetch(`/api/marketplace/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ simulationId: s.id, hash: s.hash })
            });
            const data = await res.json();

            if (data.success) {
                setDispatchStatus(prev => ({ ...prev, [s.id]: `Sent to ${data.partner}` }));
                setTimeout(() => setDispatchStatus(prev => ({ ...prev, [s.id]: '' })), 3000);
            } else {
                setDispatchStatus(prev => ({ ...prev, [s.id]: 'Failed' }));
            }
        } catch (err) {
            setDispatchStatus(prev => ({ ...prev, [s.id]: 'Error' }));
        }
    };

    if (loading && scenarios.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={24} color="var(--accent-green)" />
            </div>
        );
    }

    // If there are no scenarios and not loading, or if there's an active contract simulation,
    // we might still want to render the modal.
    // The original condition `if (scenarios.length === 0) return null;` would hide the modal
    // if it was triggered by a map event and no scenarios were saved.
    // Let's adjust this to allow the modal to show even if scenarios are empty.
    if (scenarios.length === 0 && !activeContractSimulation && !loading) return null;


    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Database color="var(--accent-blue)" />
                <h2 style={{ fontSize: '1.25rem' }}>Saved Scenarios</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Load previously saved simulations from the PostgreSQL database.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {scenarios.map((s) => (
                    <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.01 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                        onClick={() => onSelect({
                            units: s.units,
                            buildingAge: s.buildingAge,
                            retrofitType: s.retrofitType,
                            // Providing defaults if original inputs weren't saved cleanly in DB schema
                            baseRentPerUnit: s.units * 1200,
                            heatingPerUnit: s.units * 200
                        })}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-green)' }}>
                                {s.units}-Unit {s.buildingAge} Altbau
                            </strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {s.retrofitType.toUpperCase()} Retrofit • Saved {new Date(s.createdAt).toLocaleDateString()}
                            </span>
                            {s.hash && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-blue)', fontSize: '0.75rem' }}>
                                        <ShieldCheck size={14} />
                                        <span>Verified Proof-of-Execution</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={(e) => handleDispatch(e, s, 'finance')}
                                            disabled={!!dispatchStatus[s.id]}
                                            className="btn-primary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            <Send size={12} /> DKB Loan
                                        </button>
                                        <button
                                            onClick={(e) => handleDispatch(e, s, 'execute')}
                                            disabled={!!dispatchStatus[s.id]}
                                            className="btn-secondary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            <Send size={12} /> Ecoworks Bid
                                        </button>
                                        {dispatchStatus[s.id] && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', alignSelf: 'center' }}>{dispatchStatus[s.id]}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                onClick={(e) => handleExport(e, s.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: 'var(--accent-blue)'
                                }}
                                title="Export Compliance Audit"
                            >
                                <Download size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveContractSimulation(s);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: 'var(--accent-green)'
                                }}
                                title="Draft Green Lease"
                            >
                                <PenTool size={18} />
                            </button>
                            <button
                                onClick={(e) => handleDelete(e, s.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: 'var(--text-secondary)'
                                }}
                                title="Delete Record"
                            >
                                <Trash2 size={18} />
                            </button>
                            <ArrowRight size={20} color="var(--text-secondary)" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Deal Closer Green Lease Contract Modal rendered at the top level */}
            {activeContractSimulation && typeof document !== 'undefined' ? createPortal(
                <DealCloserModal
                    simulation={activeContractSimulation}
                    onClose={() => setActiveContractSimulation(null)}
                    prefillAddress={(activeContractSimulation as any)._mockAddress}
                />,
                document.body
            ) : null}
        </div>
    );
}
