import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

function ImpactCharts({ data }) {
    const chartData = [
        {
            name: 'Pre-Retrofit',
            Rent: data.oldRent,
            Heating: data.oldHeating,
        },
        {
            name: 'Post-Retrofit',
            Rent: data.newRent,
            Heating: data.newHeating,
        }
    ];

    const formatCur = (num) => `€${num.toLocaleString()}`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum, entry) => sum + entry.value, 0);
            return (
                <div className="glass-panel p-4" style={{ minWidth: '200px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex-row justify-between" style={{ color: entry.color, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                            <span>{entry.name}:</span>
                            <span style={{ fontWeight: 600 }}>{formatCur(entry.value)}</span>
                        </div>
                    ))}
                    <div className="flex-row justify-between" style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 600 }}>
                        <span>Warm Rent:</span>
                        <span>{formatCur(total)}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ height: '350px', minHeight: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={80}
                >
                    <XAxis
                        dataKey="name"
                        scale="point"
                        padding={{ left: 100, right: 100 }}
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-primary)', fontSize: 14 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatCur}
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip active={false} payload={[]} label={''} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Rent" stackId="a" fill="var(--bg-panel)" stroke="var(--border-light)" strokeWidth={1} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Heating" stackId="a" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ImpactCharts;
