import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const AIInsightsSidebar = ({ type = 'maintenance', entityId, entityName }) => {
    const [insights, setInsights] = useState(null);
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
            const interval = setInterval(fetchInsights, 45000);
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
                return <CheckCircle className="text-green-500" size={20} />;
        }
    };

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'CRITICAL':
                return 'text-red-500 bg-red-500/10';
            case 'HIGH':
                return 'text-orange-500 bg-orange-500/10';
            case 'MEDIUM':
                return 'text-yellow-500 bg-yellow-500/10';
            default:
                return 'text-green-500 bg-green-500/10';
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900 rounded-lg p-4 min-h-60 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-slate-400 text-sm">No insights available</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Brain className="text-blue-400" size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-sm">AI Insights</h3>
                    <p className="text-slate-400 text-xs">{entityName}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Vehicle/Driver Information */}
                {(insights.vehicle || insights.lastVehicle) && (
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        {insights.vehicle && (
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Vehicle</p>
                                <p className="text-sm font-bold text-white">
                                    {insights.vehicle.make} {insights.vehicle.model}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {insights.vehicle.licensePlate}
                                </p>
                            </div>
                        )}
                        {insights.lastDriver && (
                            <div className={insights.vehicle ? 'mt-2 pt-2 border-t border-slate-700' : ''}>
                                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Last Driver</p>
                                <p className="text-sm font-bold text-white">
                                    {insights.lastDriver.fullName}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {insights.lastDriver.licenseNumber}
                                </p>
                            </div>
                        )}
                        {insights.lastVehicle && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Last Vehicle</p>
                                <p className="text-sm font-bold text-white">
                                    {insights.lastVehicle.make} {insights.lastVehicle.model}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {insights.lastVehicle.licensePlate}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Risk Level Badge */}
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(insights.riskLevel)}
                        <div>
                            <p className="text-xs text-slate-400">Status</p>
                            <p className={`text-sm font-bold ${getRiskLevelColor(insights.riskLevel)}`}>
                                {insights.riskLevel}
                            </p>
                        </div>
                    </div>
                    {type === 'maintenance' && (
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Probability</p>
                            <p className="text-lg font-bold text-white">
                                {insights.maintenanceProbability?.toFixed(0)}%
                            </p>
                        </div>
                    )}
                    {type === 'fatigue' && (
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Fatigue</p>
                            <p className="text-lg font-bold text-white">
                                {insights.fatigueScore?.toFixed(0)}%
                            </p>
                        </div>
                    )}
                </div>

                {/* Key Metrics */}
                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-300 uppercase">Metrics</p>
                    {type === 'maintenance' && (
                        <>
                            {insights.avgEngineTemp && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Avg Engine Temp</span>
                                    <span className="text-white font-semibold">
                                        {insights.avgEngineTemp.toFixed(1)}°C
                                    </span>
                                </div>
                            )}
                            {insights.avgVibration !== undefined && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Vibration Level</span>
                                    <span className="text-white font-semibold">
                                        {insights.avgVibration.toFixed(1)}/10
                                    </span>
                                </div>
                            )}
                            {insights.harshBrakingEvents !== undefined && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Harsh Braking</span>
                                    <span className="text-white font-semibold">
                                        {insights.harshBrakingEvents} events
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {type === 'fatigue' && (
                        <>
                            {insights.totalIncidents !== undefined && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Total Incidents</span>
                                    <span className="text-white font-semibold">
                                        {insights.totalIncidents}
                                    </span>
                                </div>
                            )}
                            {insights.harshBrakingCount !== undefined && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Harsh Braking</span>
                                    <span className="text-white font-semibold">
                                        {insights.harshBrakingCount}
                                    </span>
                                </div>
                            )}
                            {insights.latestDashcamAnalysis && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Attention Level</span>
                                    <span className={`font-semibold ${
                                        insights.latestDashcamAnalysis.attentionLevel >= 80 ? 'text-green-400' :
                                        insights.latestDashcamAnalysis.attentionLevel >= 60 ? 'text-yellow-400' :
                                        'text-red-400'
                                    }`}>
                                        {insights.latestDashcamAnalysis.attentionLevel.toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Recommendations */}
                {insights.recommendations && insights.recommendations.length > 0 && (
                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-xs font-bold text-slate-300 uppercase mb-2">Recommendations</p>
                        <ul className="space-y-2">
                            {insights.recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx} className="flex gap-2 text-xs">
                                    <span className="text-blue-400 font-bold flex-shrink-0">→</span>
                                    <span className="text-slate-300 leading-tight">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Latest Dashcam Alert */}
                {type === 'fatigue' && insights.latestDashcamAnalysis?.alert && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3 mt-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-orange-400 uppercase">
                                    {insights.latestDashcamAnalysis.alert.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-slate-300 mt-1">
                                    {insights.latestDashcamAnalysis.recommendation}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsightsSidebar;
