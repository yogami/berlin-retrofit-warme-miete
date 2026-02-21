import React from 'react';

function SimulatorControls({ params, setParams }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams(prev => ({
            ...prev,
            [name]: name === 'units' || name === 'baseRentPerUnit' || name === 'heatingPerUnit' ? Number(value) : value
        }));
    };

    return (
        <div className="flex-col gap-6">

            <div className="flex-col gap-2">
                <div className="flex-row justify-between">
                    <label style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Number of Units</label>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>{params.units}</span>
                </div>
                <input
                    type="range"
                    name="units"
                    min="1"
                    max="100"
                    value={params.units}
                    onChange={handleChange}
                />
            </div>

            <div className="flex-col gap-2">
                <label style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Building Age</label>
                <select
                    name="buildingAge"
                    value={params.buildingAge}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-deep)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="1950">Pre-1950 (High Consumption)</option>
                    <option value="1970">1950-1970 (Average)</option>
                    <option value="1990">1970-1990 (Moderate)</option>
                </select>
            </div>

            <div className="flex-col gap-2">
                <label style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Retrofit Depth</label>
                <div className="flex-col gap-3" style={{ marginTop: '0.5rem' }}>
                    {[
                        { id: 'basic', label: 'Basic (Windows/Doors)', desc: '15% Subsidy (BAFA)' },
                        { id: 'standard', label: 'Standard (Insulation)', desc: '25% Subsidy' },
                        { id: 'deep', label: 'Deep (Heat Pump + Full Env)', desc: '50% Subsidy (KfW 261)' }
                    ].map(opt => (
                        <label
                            key={opt.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1rem',
                                border: params.retrofitType === opt.id ? '1px solid var(--accent-green)' : '1px solid var(--border-light)',
                                borderRadius: '8px',
                                background: params.retrofitType === opt.id ? 'rgba(0,255,136,0.05)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <input
                                type="radio"
                                name="retrofitType"
                                value={opt.id}
                                checked={params.retrofitType === opt.id}
                                onChange={handleChange}
                                style={{ accentColor: 'var(--accent-green)', transform: 'scale(1.2)' }}
                            />
                            <div className="flex-col">
                                <span style={{ fontWeight: 600, color: params.retrofitType === opt.id ? 'var(--accent-green)' : 'var(--text-primary)' }}>{opt.label}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{opt.desc}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default SimulatorControls;
