import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Activity, TrendingUp } from 'lucide-react';

const Safety = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSafetyData = async () => {
            try {
                const res = await api.get('/drivers');
                const driverList = res.data;
                
                const scorecardPromises = driverList.map(d => 
                    api.get(`/scorecards/latest/${d.id}`).catch(() => null)
                );
                
                const results = await Promise.all(scorecardPromises);
                const safetyData = results.map((r, index) => ({
                    ...driverList[index],
                    scorecard: r?.data || null
                }));
                
                setDrivers(safetyData);
            } catch (err) {
                console.error('Safety Data Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSafetyData();
    }, []);

    const getRiskLevel = (score) => {
        if (score >= 9.0) return { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        if (score >= 7.5) return { label: 'Moderate', color: 'text-blue-400', bg: 'bg-blue-400/10' };
        return { label: 'High Risk', color: 'text-rose-400', bg: 'bg-rose-400/10' };
    };

    return (
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container">
                <header className="ot-header flex justify-between items-center">
                    <div>
                        <h1 className="ot-title">Safety & Compliance</h1>
                        <p className="ot-subtitle">Monitor driver behavior and system safety scorecards</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <ShieldCheck className="text-emerald-500" size={18} />
                        <span className="text-emerald-500 font-bold text-xs">Fleet Status: Secure</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="ot-card py-20 text-center text-slate-500">
                             <div className="flex justify-center items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Running safety audit...
                            </div>
                        </div>
                    ) : drivers.map((driver) => {
                        const risk = getRiskLevel(driver.averageScore);
                        return (
                            <div key={driver.id} className="ot-card group hover:scale-[1.01] transition-transform">
                                <div className="flex flex-col lg:flex-row justify-between gap-8">
                                    <div className="flex items-center gap-6 lg:w-1/3">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-white relative">
                                            <Activity size={32} className="text-blue-500" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#1e293b]"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{driver.fullName}</h3>
                                            <p className="text-slate-500 text-sm">{driver.licenseNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Safety Score</p>
                                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                                <span className={`text-2xl font-black ${risk.color}`}>{driver.averageScore}</span>
                                                <span className="text-slate-600 font-bold">/ 10</span>
                                            </div>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Risk Profile</p>
                                            <span className={`px-3 py-1 rounded-lg font-bold text-[11px] border border-current ${risk.bg} ${risk.color}`}>
                                                {risk.label}
                                            </span>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Incident Ratio</p>
                                            <p className="text-white font-bold">{driver.scorecard ? (driver.scorecard.speedingCount + driver.scorecard.harshBrakingCount) : 0} <span className="text-xs text-slate-600 font-normal">Events/Mo</span></p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Compliance</p>
                                            <div className="flex items-center gap-1.5 justify-center md:justify-start text-emerald-400">
                                                <CheckCircle2 size={14} />
                                                <span className="font-bold">Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:w-auto flex items-center justify-end">
                                        <button className="p-4 bg-slate-800/50 hover:bg-blue-600 text-slate-400 hover:text-white rounded-2xl transition-all group-hover:shadow-lg group-hover:shadow-blue-600/20">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>

                                {driver.scorecard && (
                                    <div className="mt-8 pt-8 border-t border-slate-800/50">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Harsh Braking</p>
                                                    <p className="text-white font-bold">{driver.scorecard.harshBrakingCount || 0} Alerts</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                                    <ShieldAlert size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Speeding</p>
                                                    <p className="text-white font-bold">{driver.scorecard.speedingCount || 0} Violations</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Efficiency</p>
                                                    <p className="text-white font-bold">{driver.scorecard.efficiencyRating} <span className="text-slate-500 font-normal">/ 10</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Insights Section */}
                                        <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl relative overflow-hidden group/ai">
                                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover/ai:bg-blue-500/20 transition-all duration-700"></div>
                                            
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                    <Activity size={16} className="text-white" />
                                                </div>
                                                <h4 className="text-white font-bold tracking-tight">AI Performance Analyst</h4>
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Gemini 1.5 Flash</span>
                                            </div>
                                            
                                            <div className="relative z-10">
                                                <p className="text-slate-300 text-sm leading-relaxed italic mb-4">
                                                    "{driver.scorecard.aiRecommendations || "Analysis pending. Trigger a new safety audit to generate AI insights."}"
                                                </p>
                                                <div className="flex justify-end">
                                                    <button 
                                                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                                                        onClick={async () => {
                                                            try {
                                                                await api.post(`/scorecards/generate/${driver.id}`);
                                                                window.location.reload(); // Refresh to show new analysis
                                                            } catch (err) {
                                                                console.error("Analysis generation failed", err);
                                                            }
                                                        }}
                                                    >
                                                        Run AI Audit <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default Safety;
