import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { SimulationResult } from '../../../server/domain/SimulatorEngine';

interface SavedSimulation {
    id: number;
    units: number;
    buildingAge: string;
    retrofitType: string;
    results: SimulationResult;
    createdAt: string;
}

export default function SavedScenarios({ onSelect }: { onSelect: (b: any) => void }) {
    const [scenarios, setScenarios] = useState<SavedSimulation[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading && scenarios.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={24} color="var(--accent-green)" />
            </div>
        );
    }

    if (scenarios.length === 0) return null;

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
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
        </div>
    );
}
