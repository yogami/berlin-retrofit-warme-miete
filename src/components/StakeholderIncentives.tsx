import React from 'react';
import { motion } from 'framer-motion';
import { User, Building, Briefcase, Landmark, Shield, Lightbulb, HardHat, Zap, Target } from 'lucide-react';

const stakeholders = [
    {
        id: 'tenant',
        entity: 'Tenant',
        icon: User,
        benefits: '€1,200-1,500/yr lower heating bills; warmer home.',
        pays: 'Higher base rent (+8% max via Modernisierungsumlage), but net savings.',
        incentives: 'Cheaper total living costs; less energy poverty.',
        color: 'var(--accent-green)'
    },
    {
        id: 'landlord',
        entity: 'Landlord',
        icon: Building,
        benefits: 'Higher yield; avoids 95% CO2 tax on bad buildings; asset value up.',
        pays: 'Retrofit capex (after subsidies); SaaS fee via mgrs.',
        incentives: 'Legal rent pass-through (BGB §559); CO2 penalty avoidance.',
        color: 'var(--text-primary)'
    },
    {
        id: 'property-manager',
        entity: 'Property Manager',
        icon: Briefcase,
        benefits: 'Compliance tool; easier WEG approvals; client retention.',
        pays: '€50-200/mo SaaS sub per building.',
        incentives: 'Scale portfolios; regulatory edge (Mietpreisbremse).',
        color: 'var(--accent-blue)'
    },
    {
        id: 'bank-lender',
        entity: 'Bank/Lender',
        icon: Landmark,
        benefits: 'De-risked loans (savings as collateral via CRREM).',
        pays: '1-2% origination fee on loans.',
        incentives: 'New green loan volume; lower defaults.',
        color: '#f59e0b'
    },
    {
        id: 'government',
        entity: 'Govt (KfW/BAFA)',
        icon: Shield,
        benefits: 'Faster retrofits (climate targets); less CO2.',
        pays: 'Subsidies/grants (up to €37k/unit +5% iSFP bonus).',
        incentives: 'EPBD/GEG compliance; €41bn market stimulus.',
        color: '#ef4444'
    },
    {
        id: 'energy-consultant',
        entity: 'Energy Consultant',
        icon: Lightbulb,
        benefits: 'Faster iSFP (90% auto); more clients.',
        pays: 'Per-lead fee.',
        incentives: 'Triple throughput; subsidy unlocks.',
        color: '#10b981'
    },
    {
        id: 'contractor',
        entity: 'Contractor',
        icon: HardHat,
        benefits: 'More jobs (demand aggregation).',
        pays: 'N/A (paid by landlord).',
        incentives: 'Bulk work; less shortages.',
        color: '#8b5cf6'
    },
    {
        id: 'utility',
        entity: 'Utility (e.g., BEW)',
        icon: Zap,
        benefits: 'Grid stability; less peak demand.',
        pays: 'Potential partner fees.',
        incentives: 'Heat pump rollout; €2.3bn Berlin pact.',
        color: '#14b8a6'
    },
    {
        id: 'warme-miete',
        entity: 'Warme Miete (Platform)',
        icon: Target,
        benefits: 'Revenue stream from SaaS and lead generation.',
        pays: 'N/A',
        incentives: 'SaaS scale in €41bn TAM.',
        color: '#ec4899'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

function StakeholderIncentives() {
    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Ecosystem Alignment</h2>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}
            >
                {stakeholders.map((s) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={s.id} variants={itemVariants} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    background: `rgba(255,255,255,0.05)`,
                                    border: `1px solid ${s.color}40`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={24} color={s.color} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', color: s.color }}>{s.entity}</h3>
                            </div>

                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Gets:</strong> {s.benefits}
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Pays:</strong> {s.pays}
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--text-primary)' }}>Incentive:</strong> {s.incentives}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

export default StakeholderIncentives;
