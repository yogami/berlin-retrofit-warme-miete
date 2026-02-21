import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { SimulationResult } from '../../../server/domain/SimulatorEngine';

interface MockBuilding {
    name: string;
    units: number;
    buildingAge: string;
    retrofitType: string;
    baseRentPerUnit: number;
    heatingPerUnit: number;
    results: SimulationResult;
}

export default function DemoBuildings({ onSelect }: { onSelect: (b: any) => void }) {
    const [buildings, setBuildings] = useState<MockBuilding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/demo/buildings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBuildings(data.data);
                }
            })
            .catch(err => console.error("Error fetching demo buildings", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={24} color="var(--accent-green)" />
            </div>
        );
    }

    if (buildings.length === 0) return null;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 color="var(--accent-blue)" />
                <h2 style={{ fontSize: '1.25rem' }}>Hackathon Demo Profiles</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Select a pre-calculated Berlin building profile to instantly load the simulation data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {buildings.map((b, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onSelect({
                            units: b.units,
                            buildingAge: b.buildingAge,
                            retrofitType: b.retrofitType,
                            baseRentPerUnit: b.baseRentPerUnit,
                            heatingPerUnit: b.heatingPerUnit
                        })}
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
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-green)' }}>{b.name || `${b.units}-Unit Altbau`}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {b.retrofitType.toUpperCase()} Retrofit • {b.units} Units
                            </span>
                        </div>
                        <ArrowRight size={20} color="var(--text-secondary)" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
