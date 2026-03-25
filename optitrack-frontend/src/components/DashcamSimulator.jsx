import React, { useState, useEffect } from 'react';
import { Camera, Eye, AlertCircle, ZapOff } from 'lucide-react';
import api from '../api/axios';

const DashcamSimulator = ({ driverId, driverName }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchDashcamData = async () => {
            try {
                setLoading(true);
                const [analysisRes, alertsRes] = await Promise.all([
                    api.get(`/telemetry/ai/fatigue/dashcam/${driverId}`),
                    api.get(`/telemetry/ai/fatigue/alerts/${driverId}`)
                ]);
                setAnalysis(analysisRes.data);
                setAlerts(alertsRes.data || []);
            } catch (err) {
                console.error('Failed to fetch dashcam data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (driverId) {
            fetchDashcamData();
            const interval = setInterval(fetchDashcamData, 5000);
            return () => clearInterval(interval);
        }
    }, [driverId]);

    const getAttentionColor = (level) => {
        if (level >= 80) return 'text-green-400';
        if (level >= 60) return 'text-yellow-400';
        if (level >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getAlertBgColor = (alertType) => {
        switch (alertType) {
            case 'EYES_OFF_ROAD':
                return 'bg-red-900/40 border-red-500';
            case 'YAWNING':
                return 'bg-orange-900/40 border-orange-500';
            case 'DISTRACTED':
                return 'bg-yellow-900/40 border-yellow-500';
            default:
                return 'bg-slate-900/40 border-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="ot-card p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="ot-card p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-slate-900 rounded flex items-center justify-center">
                        <Camera className="text-blue-400" size={20} />
                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Dashcam AI</h3>
                        <p className="text-slate-400 text-xs">{driverName}</p>
                    </div>
                </div>
                <span className="text-xs text-slate-500">{analysis?.timestamp}</span>
            </div>

            {/* Simulated Camera Feed */}
            <div className="bg-black rounded-lg mb-4 overflow-hidden border border-slate-700">
                <div className="relative h-40 bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
                    {/* Simulated video frame with visual indicators */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-4 w-full h-full p-4 opacity-10">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-slate-600 rounded"></div>
                            ))}
                        </div>
                    </div>

                    {/* Eyes Detection Indicator */}
                    {analysis?.eyesDetected && (
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                            <Eye size={16} className={analysis.eyesOnRoad ? 'text-green-400' : 'text-red-400'} />
                            <span className="text-xs font-semibold text-white">
                                {analysis.eyesOnRoad ? 'Eyes On Road' : 'Eyes Off Road!'}
                            </span>
                        </div>
                    )}

                    {/* Yawning Detected */}
                    {analysis?.yawning && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-orange-400">
                            <AlertCircle size={16} />
                            <span className="text-xs font-semibold">Yawning Detected</span>
                        </div>
                    )}

                    {/* Attention Level Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-300">Attention Level</span>
                            <span className={`text-sm font-bold ${getAttentionColor(analysis?.attentionLevel || 50)}`}>
                                {analysis?.attentionLevel?.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    analysis?.attentionLevel >= 80
                                        ? 'bg-green-500'
                                        : analysis?.attentionLevel >= 60
                                        ? 'bg-yellow-500'
                                        : analysis?.attentionLevel >= 40
                                        ? 'bg-orange-500'
                                        : 'bg-red-500'
                                }`}
                                style={{ width: `${analysis?.attentionLevel || 50}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Detection Annotation */}
                    {!analysis?.eyesOnRoad && !analysis?.yawning && analysis?.attentionLevel < 60 && (
                        <div className="absolute inset-0 border-2 border-yellow-400/30 rounded-lg animate-pulse"></div>
                    )}
                </div>
            </div>

            {/* Alert Status */}
            {analysis?.alert && (
                <div className={`rounded-lg border p-3 mb-4 ${getAlertBgColor(analysis.alert)}`}>
                    <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white uppercase">
                                {analysis.alert.replace(/_/g, ' ')}
                            </p>
                            {analysis.recommendation && (
                                <p className="text-xs text-slate-300 mt-1">{analysis.recommendation}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-900 rounded p-2 text-center">
                    <Eye size={16} className={`mx-auto mb-1 ${analysis?.eyesDetected ? 'text-green-400' : 'text-slate-600'}`} />
                    <p className="text-xs text-slate-400">Eyes</p>
                    <p className="text-xs font-bold text-white">{analysis?.eyesDetected ? 'Detected' : 'None'}</p>
                </div>
                <div className="bg-slate-900 rounded p-2 text-center">
                    <Camera size={16} className={`mx-auto mb-1 ${!analysis?.eyesOnRoad && analysis?.eyesDetected ? 'text-red-400' : 'text-green-400'}`} />
                    <p className="text-xs text-slate-400">Focus</p>
                    <p className="text-xs font-bold text-white">{analysis?.eyesOnRoad ? 'On Road' : 'Off'}</p>
                </div>
                <div className="bg-slate-900 rounded p-2 text-center">
                    <ZapOff size={16} className={`mx-auto mb-1 ${analysis?.yawning ? 'text-orange-400' : 'text-slate-600'}`} />
                    <p className="text-xs text-slate-400">Fatigue</p>
                    <p className="text-xs font-bold text-white">{analysis?.yawning ? 'Alert' : 'Normal'}</p>
                </div>
            </div>

            {/* Recent Alerts List */}
            {alerts.length > 0 && (
                <div className="border-t border-slate-800 pt-4">
                    <p className="text-xs font-bold text-slate-300 mb-2 uppercase">Recent Events</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {alerts.slice(0, 5).map((alert, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-900/50 rounded px-2 py-1">
                                <span className="text-xs text-slate-300">
                                    {alert.alertType.replace(/_/g, ' ')}
                                </span>
                                <span className={`text-xs font-bold ${
                                    alert.severity === 'HIGH' ? 'text-red-400' :
                                    alert.severity === 'MEDIUM' ? 'text-yellow-400' :
                                    'text-slate-400'
                                }`}>
                                    {alert.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashcamSimulator;
