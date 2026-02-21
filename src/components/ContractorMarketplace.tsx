import React, { useState } from 'react';
import { Hammer, Search, Filter, MapPin, CheckCircle, Clock } from 'lucide-react';

export function ContractorMarketplace() {
    const [minBudget, setMinBudget] = useState('');
    const [biddingOn, setBiddingOn] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const handleBid = (e: React.FormEvent) => {
        e.preventDefault();
        setBiddingOn(null);
        setToast('Bid successfully submitted to Landlord');
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Hammer className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-bold">Contractor Marketplace</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Filters */}
                <aside className="md:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <h2 className="font-bold flex items-center mb-4"><Filter className="w-4 h-4 mr-2" /> Filters</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Min Budget</label>
                                <input
                                    type="number"
                                    placeholder="Min Budget"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={minBudget}
                                    onChange={(e) => setMinBudget(e.target.value)}
                                />
                            </div>
                            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-md text-sm transition-colors flex justify-center items-center">
                                <Search className="w-4 h-4 mr-2" /> Apply Filters
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Hot Leads */}
                <section className="md:col-span-3 space-y-4">
                    <h2 className="text-lg font-bold mb-4">Urgent Ready-to-Start Projects</h2>

                    {/* Hot Lead Card */}
                    <div className="hot-lead-card bg-white p-5 rounded-xl border-l-4 border-l-red-500 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Status: Signed Green Lease
                                </span>
                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded flex items-center">
                                    <Clock className="w-3 h-3 mr-1" /> Urgency: BAFA Deadline 30.6.26
                                </span>
                            </div>
                            <h3 className="text-lg font-bold">€450k Neukölln Project</h3>
                            <p className="text-sm border-t mt-2 pt-2 text-slate-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" /> 2km away • Scope: Full Retrofit envelope + HVAC
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 md:text-right shrink-0 w-full md:w-auto">
                            <button
                                onClick={() => setBiddingOn('Neukölln')}
                                className="w-full md:w-auto bg-primary text-white font-medium py-2 px-6 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Submit Bid
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bid Modal */}
            {biddingOn && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bid-modal bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Place Bid: {biddingOn}</h2>
                        <form onSubmit={handleBid} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Bid Amount (€)</label>
                                <input required type="number" name="bidAmount" placeholder="e.g. 420000" className="w-full border p-2 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Timeline</label>
                                <input required type="text" name="timeline" placeholder="e.g. 4 Months" className="w-full border p-2 rounded-md" />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setBiddingOn(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md font-medium">Confirm Bid</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="toast-success fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {toast}
                </div>
            )}
        </div>
    );
}
