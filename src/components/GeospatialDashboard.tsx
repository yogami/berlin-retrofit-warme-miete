import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Leaf, MapPin, Database, Zap, Activity, Briefcase, Mail, Filter, Building2 } from 'lucide-react';
import mockData from '../data/berlin_mock_geospatial.json';

// Fix for default Leaflet icon paths in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

interface GeospatialDashboardProps {
    onBuildingSelect: (buildingData: any) => void;
}

export function GeospatialDashboard({ onBuildingSelect }: GeospatialDashboardProps) {
    const [mode, setMode] = useState<'sim' | 'live'>('sim');
    const [isSimulatingLive, setIsSimulatingLive] = useState(false);

    // Consultant Mode (Story #1)
    const [persona, setPersona] = useState<'landlord' | 'consultant'>('landlord');
    const [liabilityFilter, setLiabilityFilter] = useState<'all' | 'high_tax'>('all');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [proposalSent, setProposalSent] = useState(false);

    // DeepResearch Pivot: Zero-fail toggle simulation
    const handleToggle = (newMode: 'sim' | 'live') => {
        if (newMode === 'live') {
            setIsSimulatingLive(true);
            setTimeout(() => {
                setMode('live');
                setIsSimulatingLive(false);
            }, 1200); // Simulate network latency resolving to the same robust dataset
        } else {
            setMode('sim');
        }
    };

    return (
        <div className="bg-card w-full rounded-2xl border shadow-sm overflow-hidden mb-6 flex flex-col md:flex-row">
            {/* Map Area */}
            <div className="relative w-full md:w-2/3 bg-slate-100 z-0" style={{ minHeight: '400px' }}>
                <MapContainer center={[52.476, 13.438]} zoom={14} style={{ height: '100%', width: '100%', minHeight: '400px' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {mockData.filter(bldg => {
                        if (liabilityFilter === 'all') return true;
                        return bldg.mock_av_ratio > 1.0; // Proxy for >€8k/yr tax
                    }).map((bldg) => {
                        // Calculate a mock liability proxy for coloring
                        const isHighRisk = bldg.mock_av_ratio > 1.0;
                        const fillColor = isHighRisk ? '#ef4444' : '#f59e0b'; // Red / Orange

                        return (
                            <CircleMarker
                                key={bldg.id}
                                center={[bldg.lat, bldg.lon]}
                                pathOptions={{ fillColor, color: fillColor, weight: 1, fillOpacity: 0.7 }}
                                radius={isHighRisk ? 12 : 8}
                                className={isHighRisk ? 'high-liability-marker cursor-pointer' : 'cursor-pointer'}
                                eventHandlers={{
                                    click: () => {
                                        if (persona === 'consultant') {
                                            setSelectedLead(bldg);
                                            setProposalSent(false);
                                        } else {
                                            onBuildingSelect(bldg);
                                        }
                                    },
                                }}
                            >
                                <Popup>
                                    <div className="font-sans">
                                        <p className="font-bold text-sm mb-1">{bldg.address}</p>
                                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                                            <span>Est. Era:</span> <strong>{bldg.era_proxy}s</strong>
                                            <span>A/V Ratio:</span> <strong>{bldg.mock_av_ratio}</strong>
                                            <span>Est. PV:</span> <strong>{bldg.pv_kwp_mock} kWp</strong>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Sidebar Controls */}
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between border-l bg-slate-50">
                <div>
                    <h2 className="text-lg font-bold flex items-center mb-2">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        Predictive CO2 Risk Mapper
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Click a high-liability building (red) to instantly generate a mathematical proof and Green Lease PDF.
                    </p>

                    {/* Persona Toggle */}
                    <div className="flex bg-slate-200 p-1 rounded-lg mb-6">
                        <button
                            onClick={() => setPersona('landlord')}
                            className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${persona === 'landlord' ? 'bg-white shadow-sm text-slate-900 border' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Building2 className="w-4 h-4 inline-block mr-1.5" />
                            Landlord Mode
                        </button>
                        <button
                            onClick={() => { setPersona('consultant'); setSelectedLead(null); }}
                            className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${persona === 'consultant' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Briefcase className="w-4 h-4 inline-block mr-1.5" />
                            Consultant Mode
                        </button>
                    </div>

                    {/* Consultant Story #1 Tools */}
                    {persona === 'consultant' && (
                        <div className="mb-6 space-y-4">
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                                    <Filter className="w-3 h-3 mr-1" /> Lead Filter
                                </label>
                                <select
                                    name="filter-liability"
                                    className="w-full text-sm p-2 border rounded-md bg-slate-50"
                                    value={liabilityFilter}
                                    onChange={(e) => setLiabilityFilter(e.target.value as any)}
                                >
                                    <option value="all">Show All Buildings</option>
                                    <option value="high_tax">High Liability (&gt;€8,000/yr Tax)</option>
                                </select>
                            </div>

                            {selectedLead ? (
                                <div className="consultant-lead-panel bg-primary/10 border border-primary/20 p-4 rounded-xl">
                                    <h3 className="font-bold text-sm text-primary mb-2">Target Acquired: {selectedLead.address}</h3>
                                    <ul className="text-xs space-y-1 mb-3 text-slate-700">
                                        <li>• Units: {selectedLead.units}</li>
                                        <li>• Est. A/V Ratio: {selectedLead.mock_av_ratio}</li>
                                        <li className="font-semibold text-red-600 mt-2">Estimated Tax: &gt;€8,000/yr</li>
                                    </ul>
                                    <button
                                        className="w-full bg-primary hover:bg-primary/90 text-white text-sm py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                                        onClick={() => {
                                            setProposalSent(true);
                                            // Simulate opening a generated PDF/Email
                                            const win = window.open('', '_blank', 'titlebar=yes,width=800,height=600');
                                            if (win) {
                                                win.document.write('<html><head><title>iSFP_Proposal</title></head><body style="font-family:sans-serif;padding:2rem;"><h1>Energy Audit Proposal for ' + selectedLead.address + '</h1><p>Dear Owner,</p><p>We estimate your building is exposed to over €8,000/yr in CO2 taxes. Contact us for a free initial consultation and iSFP audit.</p></body></html>');
                                                win.document.close();
                                            }
                                        }}
                                        disabled={proposalSent}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        {proposalSent ? 'Proposal Sent' : 'Send Proposal'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-xs text-center p-4 border border-dashed rounded-xl text-slate-500">
                                    Click a high-liability marker on the map to generate a lead profile.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-xl border p-4 shadow-sm mb-4">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Data Ingestion Mode</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => handleToggle('sim')}
                                className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${mode === 'sim' ? 'bg-white shadow-sm text-slate-900 border' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Database className="w-4 h-4 inline-block mr-1.5" />
                                Sim (10k Cache)
                            </button>
                            <button
                                onClick={() => handleToggle('live')}
                                className={`flex-1 text-sm py-2 rounded-md font-medium transition-all flex items-center justify-center ${mode === 'live' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {isSimulatingLive ? (
                                    <Activity className="w-4 h-4 inline-block mr-1.5 animate-pulse" />
                                ) : (
                                    <Zap className="w-4 h-4 inline-block mr-1.5" />
                                )}
                                {isSimulatingLive ? 'Fetching...' : 'Live ALKIS'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className={`p-3 rounded-lg text-sm border flex items-start ${mode === 'live' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        {mode === 'live' ? (
                            <>
                                <Zap className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                <span><strong>WFS Active:</strong> Simulating live metadata pull from Berlin Open Data (ALKIS/LoD2/Solaratlas).</span>
                            </>
                        ) : (
                            <>
                                <Database className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                <span><strong>Sim Mode:</strong> Rendering pre-computed spatial index for ultra-low latency demonstration.</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
