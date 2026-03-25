import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import api from '../api/axios';

const MaintenanceGauge = ({ vehicleId, vehicleName }) => {
    const [probability, setProbability] = useState(0);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaintenanceData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/telemetry/ai/maintenance/probability/${vehicleId}`);
                setInsights(response.data);
                setProbability(response.data.maintenanceProbability || 0);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch maintenance data:', err);
                setError('Unable to load maintenance analysis');
            } finally {
                setLoading(false);
            }
        };

        if (vehicleId) {
            fetchMaintenanceData();
            // Refresh every 30 seconds
            const interval = setInterval(fetchMaintenanceData, 30000);
            return () => clearInterval(interval);
        }
    }, [vehicleId]);

    const getRiskColor = (prob) => {
        if (prob >= 80) return '#ef4444'; // red
        if (prob >= 60) return '#f97316'; // orange
        if (prob >= 40) return '#eab308'; // yellow
        return '#22c55e'; // green
    };

    const getRiskLabel = (prob) => {
        if (prob >= 80) return 'CRITICAL';
        if (prob >= 60) return 'HIGH';
        if (prob >= 40) return 'MEDIUM';
        return 'LOW';
    };

    const GaugeCircle = ({ percentage }) => {
        const circumference = 2 * Math.PI * 45;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke={getRiskColor(percentage)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                        {percentage.toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                        {getRiskLabel(percentage)}
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="ot-card p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ot-card p-6 h-full flex items-center justify-center">
                <p className="text-slate-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="ot-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white font-bold">Maintenance Risk</h3>
                    <p className="text-slate-400 text-xs mt-1">{vehicleName}</p>
                </div>
                <Zap className="text-yellow-400" size={24} />
            </div>

            {/* Gauge */}
            <div className="flex justify-center mb-6">
                <GaugeCircle percentage={probability} />
            </div>

            {/* Key Metrics */}
            {insights && (
                <div className="space-y-3 text-sm">
                    {/* Engine Temperature */}
                    <div className="bg-slate-900 rounded p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Engine Temp</span>
                            <span className="text-white font-semibold">
                                {insights.avgEngineTemp?.toFixed(1)}°C
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-red-500 h-1.5 rounded-full"
                                style={{
                                    width: `${Math.min(100, (insights.avgEngineTemp / 110) * 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Vibration Level */}
                    <div className="bg-slate-900 rounded p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Vibration</span>
                            <span className="text-white font-semibold">
                                {insights.avgVibration?.toFixed(1)}/10
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-red-500 h-1.5 rounded-full"
                                style={{
                                    width: `${Math.min(100, (insights.avgVibration / 10) * 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Harsh Braking Events */}
                    <div className="bg-slate-900 rounded p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Harsh Braking</span>
                            <span className="text-white font-semibold">
                                {insights.harshBrakingEvents || 0} events
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {insights && insights.recommendations && insights.recommendations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-300 font-semibold">Recommendations</span>
                    </div>
                    <ul className="space-y-1">
                        {insights.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="text-xs text-slate-400 leading-tight">
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MaintenanceGauge;
