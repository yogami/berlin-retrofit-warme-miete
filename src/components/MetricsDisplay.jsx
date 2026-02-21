import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, PiggyBank, Euro } from 'lucide-react';

const MetricCard = ({ title, value, subtext, icon, highlightColor }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel p-6 flex-col gap-2"
        style={{ borderTop: `to var(--${highlightColor})` }}
    >
        <div className="flex-row justify-between">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{title}</span>
            {icon}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: `var(--${highlightColor})` }}>
            {value}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtext}</div>
    </motion.div>
);

function MetricsDisplay({ data, units }) {
    const formatCur = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <MetricCard
                title="Total Subsidy Stack"
                value={formatCur(data.totalSubsidy)}
                subtext={`KfW/BAFA reduces CAPEX by ${Math.round((data.totalSubsidy / data.totalCost) * 100)}%`}
                icon={<Euro size={20} color="var(--accent-blue)" />}
                highlightColor="accent-blue"
            />
            <MetricCard
                title="Landlord ROI Yield"
                value={`${data.roiYears.toFixed(1)} yrs`}
                subtext={`Via ${formatCur(data.landlordAnnualExtraRev)}/yr Modernisierungsumlage`}
                icon={<TrendingUp size={20} color="var(--text-primary)" />}
                highlightColor="text-primary"
            />
            <MetricCard
                title="Tenant Net Savings"
                value={formatCur(data.tenantNetSavings)}
                subtext={`Per unit/year (Warm Rent drop)`}
                icon={<PiggyBank size={20} color="var(--accent-green)" />}
                highlightColor="accent-green"
            />
            <MetricCard
                title="CO2 Emitted"
                value={`${data.newCo2.toFixed(1)} t`}
                subtext={`Avoids Tier 10 CO2 Cost-Sharing Penalty`}
                icon={<Leaf size={20} color="var(--accent-green)" />}
                highlightColor="accent-green"
            />
        </div>
    );
}

export default MetricsDisplay;
