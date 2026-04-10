import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, CheckCircle, AlertCircle, Fuel, Navigation, Clock, Zap } from 'lucide-react';
import api from '../api/axios';

const AIInsightsSidebar = ({ type = 'maintenance', entityId, entityName }) => {
    const [insights, setInsights] = useState(null);
    const [predictiveData, setPredictiveData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                let response;

                if (type === 'maintenance') {
                    response = await api.get(`/telemetry/ai/maintenance/probability/${entityId}`);
                } else if (type === 'fatigue') {
                    response = await api.get(`/telemetry/ai/fatigue/insights/${entityId}`);
                } else if (type === 'predictive') {
                    // Combine base telemetry AI with new predictive intelligence
                    const [aiRes, predRes] = await Promise.all([
                        api.get(`/telemetry/ai/maintenance/probability/${entityId}`),
                        api.get(`/predictive/insights/${entityId}`)
                    ]);
                    response = aiRes;
                    setPredictiveData(predRes.data);
                }

                setInsights(response.data);
            } catch (err) {
                console.error('Failed to fetch AI insights:', err);
            } finally {
                setLoading(false);
            }
        };

        if (entityId) {
            fetchInsights();
            const interval = setInterval(fetchInsights, 30000); // 30s for predictive
            return () => clearInterval(interval);
        }
    }, [entityId, type]);

    const getStatusIcon = (riskLevel) => {
        switch (riskLevel) {
            case 'CRITICAL':
                return <AlertTriangle className="text-red-500" size={20} />;
            case 'HIGH':
                return <AlertCircle className="text-orange-500" size={20} />;
            case 'MEDIUM':
                return <TrendingUp className="text-yellow-500" size={20} />;
            default:
                return <CheckCircle className="text-emerald-500" size={20} />;
        }
    };

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/10';
            case 'HIGH': return 'text-orange-500 bg-orange-500/10';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
            default: return 'text-emerald-500 bg-emerald-500/10';
        }
    };

    if (loading) {
        return (
            <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-8">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center">Telemetry Stream Offline</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a]/50 backdrop-blur-2xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-8 flex items-center gap-5 border-b border-white/5">
                <div className="p-4 bg-blue-600/20 rounded-[20px] text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-600/10">
                    <Brain size={28} />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-black text-xl tracking-tighter uppercase">AI INTELLIGENCE</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{entityName}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
                
                {/* PREDICTIVE HUB OVERLAY */}
                {type === 'predictive' && predictiveData && (
                    <div className="space-y-6 animate-in slide-in-from-top-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-5 group hover:bg-blue-600/20 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <Fuel size={18} className="text-blue-400" />
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Endurance</p>
                                </div>
                                <p className="text-2xl font-black text-white">{predictiveData.fuelRunoutMinutes} <span className="text-[10px] text-slate-600 uppercase">Min</span></p>
                            </div>
                            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-5 group hover:bg-indigo-600/20 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <Navigation size={18} className="text-indigo-400" />
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Est. Range</p>
                                </div>
                                <p className="text-2xl font-black text-white">{predictiveData.estimatedRangeKm} <span className="text-[10px] text-slate-600 uppercase">KM</span></p>
                            </div>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap size={18} className="text-emerald-400 fill-emerald-400" />
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">AI Route Optimization</h4>
                            </div>
                            <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic">
                                "{predictiveData.aiRouteRecommendation}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Status HUD */}
                <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-[24px] border border-white/5">
                    <div className="flex items-center gap-4">
                        {getStatusIcon(insights.riskLevel)}
                        <div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Operational Risk</p>
                            <p className={`text-sm font-black tracking-widest uppercase ${getRiskLevelColor(insights.riskLevel).split(' ')[0]}`}>
                                {insights.riskLevel}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Confidence</p>
                        <p className="text-2xl font-black text-white">
                            {type === 'fatigue' ? insights.fatigueScore?.toFixed(0) : insights.maintenanceProbability?.toFixed(0)}%
                        </p>
                    </div>
                </div>

                {/* Recommendations Stream */}
                {insights.recommendations && insights.recommendations.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Strategic Directives</h4>
                        <div className="space-y-3">
                            {insights.recommendations.slice(0, 3).map((rec, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 group-hover:scale-150 transition-transform" />
                                    <p className="text-[11px] font-medium text-slate-300 leading-tight">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsightsSidebar;
