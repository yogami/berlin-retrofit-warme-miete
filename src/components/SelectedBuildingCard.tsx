import React from 'react';
import { MapPin, Building, Activity } from 'lucide-react';

export function SelectedBuildingCard({ params }: { params: any }) {
    // If it's the exact default, we can show a placeholder state
    const isDefault = params.units === 20 && params.buildingAge === '1970' && params.avRatio === 0.8;

    return (
        <div className="glass-panel p-6" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin color="var(--accent-blue)" /> 
                {isDefault ? 'Standard Test Scenario' : 'Selected Building Profile'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Address</div>
                    <div style={{ fontWeight: 600 }}>{isDefault ? 'Generic Altbau, Berlin' : params._mockAddress || 'Mapped Building'}</div>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Physical Properties</div>
                    <div style={{ fontWeight: 600 }}>{params.units} Units • {params.buildingAge}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Heat Loss Ratio (A/V)</div>
                    <div style={{ fontWeight: 600, color: params.avRatio > 0.8 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                        {params.avRatio.toFixed(2)} {params.avRatio > 0.8 ? '(High Risk)' : '(Efficient)'}
                    </div>
                </div>
            </div>
            
            {isDefault && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--accent-green)' }}>
                    <strong>Tip:</strong> Switch to the <strong>CO2 Risk Map</strong> tab to select a real specific building and auto-calculate its exact retrofit deal.
                </div>
            )}
        </div>
    );
}
