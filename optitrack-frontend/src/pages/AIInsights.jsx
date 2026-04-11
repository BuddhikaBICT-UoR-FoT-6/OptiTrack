import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MaintenanceGauge from '../components/MaintenanceGauge';
import DashcamSimulator from '../components/DashcamSimulator';
import AIInsightsSidebar from '../components/AIInsightsSidebar';
import api from '../api/axios';
import { Brain, AlertTriangle, TrendingUp, Zap, Eye, AlertCircle } from 'lucide-react';

const AIInsights = () => {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [criticalAlerts, setCriticalAlerts] = useState([]);
    const [highRiskVehicles, setHighRiskVehicles] = useState([]);
    const [highRiskDrivers, setHighRiskDrivers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [vRes, dRes] = await Promise.all([
                    api.get('/vehicles'),
                    api.get('/drivers')
                ]);

                const vehiclesList = Array.isArray(vRes?.data) ? vRes.data : [];
                const driversList = Array.isArray(dRes?.data) ? dRes.data : [];

                setVehicles(vehiclesList);
                setDrivers(driversList);

                // Set defaults
                if (vehiclesList.length > 0) {
                    const activeVehicle = vehiclesList.find(v => v.status === 'ACTIVE') || vehiclesList[0];
                    setSelectedVehicle(activeVehicle);
                }
                if (driversList.length > 0) {
                    setSelectedDriver(driversList[0]);
                }

                // Fetch AI analysis for critical alerts
                await analyzeCriticalAlerts(vehiclesList, driversList);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const analyzeCriticalAlerts = async (vehList, drvList) => {
        try {
            const safeVehList = Array.isArray(vehList) ? vehList : [];
            const safeDrvList = Array.isArray(drvList) ? drvList : [];

            // Check vehicle maintenance with full insights
            const maintenancePromises = safeVehList.map(v =>
                api.get(`/telemetry/ai/maintenance/probability/${v.id}`).catch(() => null)
            );

            const maintenanceInsights = await Promise.all(maintenancePromises);
            const criticalVehicles = safeVehList
                .map((v, idx) => ({
                    vehicle: v,
                    score: maintenanceInsights[idx]?.data?.maintenanceProbability || 0,
                    lastDriver: maintenanceInsights[idx]?.data?.lastDriver
                }))
                .filter(item => item.score >= 60)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            setHighRiskVehicles(criticalVehicles);

            // Check driver fatigue with full insights
            const fatiguePromises = safeDrvList.map(d =>
                api.get(`/telemetry/ai/fatigue/insights/${d.id}`).catch(() => null)
            );

            const fatigueInsights = await Promise.all(fatiguePromises);
            const criticalDrivers = safeDrvList
                .map((d, idx) => ({
                    driver: d,
                    score: fatigueInsights[idx]?.data?.fatigueScore || 0,
                    lastVehicle: fatigueInsights[idx]?.data?.lastVehicle
                }))
                .filter(item => item.score >= 50)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            setHighRiskDrivers(criticalDrivers);

            // Combine alerts
            const alerts = [
                ...criticalVehicles.map(item => ({
                    type: 'maintenance',
                    severity: item.score >= 80 ? 'CRITICAL' : 'HIGH',
                    title: `${item.vehicle.make} ${item.vehicle.model} (${item.vehicle.licensePlate})`,
                    subtitle: item.lastDriver ? `Driven by: ${item.lastDriver.fullName}` : 'No driver info',
                    message: `Maintenance probability: ${item.score.toFixed(0)}%`,
                    score: item.score
                })),
                ...criticalDrivers.map(item => ({
                    type: 'fatigue',
                    severity: item.score >= 70 ? 'CRITICAL' : 'HIGH',
                    title: item.driver.fullName,
                    subtitle: item.lastVehicle ? `Last vehicle: ${item.lastVehicle.make} ${item.lastVehicle.model}` : 'No vehicle info',
                    message: `Fatigue score: ${item.score.toFixed(0)}%`,
                    score: item.score
                }))
            ].sort((a, b) => b.score - a.score);

            setCriticalAlerts(alerts);
        } catch (error) {
            console.error('Failed to analyze alerts:', error);
        }
    };

    const getRiskIcon = (type) => {
        return type === 'maintenance' ? <Zap size={16} /> : <Eye size={16} />;
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-red-900/40 border-red-500 text-red-400';
            case 'HIGH':
                return 'bg-orange-900/40 border-orange-500 text-orange-400';
            default:
                return 'bg-yellow-900/40 border-yellow-500 text-yellow-400';
        }
    };

    if (loading) {
        return (
            <div className="flex bg-[#0a0a0c] min-h-screen text-white">
                <Sidebar />
                <main className="ot-page-container flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="ot-page-container">
                {/* Header */}
                <header className="ot-header mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Brain className="text-blue-400" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                                AI Insights Hub
                            </h1>
                            <p className="text-slate-400 mt-2">Real-time predictive maintenance & driver safety analysis</p>
                        </div>
                    </div>
                </header>

                {/* Critical Alerts Section */}
                {criticalAlerts.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-red-500" size={20} />
                            <h2 className="text-lg font-bold">Critical Alerts</h2>
                            <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-semibold">
                                {criticalAlerts.length} Alert{criticalAlerts.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {criticalAlerts.map((alert, idx) => (
                                <div key={idx} className={`ot-card p-4 border ${getSeverityColor(alert.severity)}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{getRiskIcon(alert.type)}</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm mb-1">{alert.title}</p>
                                            {alert.subtitle && (
                                                <p className="text-xs text-slate-400 mb-2">{alert.subtitle}</p>
                                            )}
                                            <p className="text-xs text-slate-300 mb-2">{alert.message}</p>
                                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${
                                                        alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, alert.score)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Maintenance Analysis */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="text-yellow-400" size={20} />
                            Predictive Maintenance
                        </h2>
                        {selectedVehicle ? (
                            <MaintenanceGauge
                                vehicleId={selectedVehicle.id}
                                vehicleName={`${selectedVehicle.make} ${selectedVehicle.model}`}
                            />
                        ) : (
                            <div className="ot-card p-6 text-center text-slate-400">
                                No vehicles available
                            </div>
                        )}
                    </div>

                    {/* Maintenance Insights */}
                    <div>
                        {selectedVehicle && (
                            <AIInsightsSidebar
                                type="maintenance"
                                entityId={selectedVehicle.id}
                                entityName={selectedVehicle.licensePlate}
                            />
                        )}
                    </div>
                </div>

                {/* Driver Safety Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Dashcam Analysis */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Eye className="text-blue-400" size={20} />
                            Driver Safety & Fatigue
                        </h2>
                        {selectedDriver ? (
                            <DashcamSimulator
                                driverId={selectedDriver.id}
                                driverName={selectedDriver.fullName}
                            />
                        ) : (
                            <div className="ot-card p-6 text-center text-slate-400">
                                No drivers available
                            </div>
                        )}
                    </div>

                    {/* Fatigue Insights */}
                    <div>
                        {selectedDriver && (
                            <AIInsightsSidebar
                                type="fatigue"
                                entityId={selectedDriver.id}
                                entityName={selectedDriver.fullName}
                            />
                        )}
                    </div>
                </div>

                {/* High Risk Assets Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* High Risk Vehicles */}
                    <div className="ot-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="text-orange-400" size={20} />
                            High Maintenance Risk Vehicles
                        </h3>
                        {highRiskVehicles.length > 0 ? (
                            <div className="space-y-3">
                                {highRiskVehicles.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {item.vehicle.make} {item.vehicle.model}
                                                </p>
                                                <p className="text-xs text-slate-400">{item.vehicle.licensePlate}</p>
                                                {item.lastDriver && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Last driver: <span className="text-slate-300">{item.lastDriver.fullName}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                item.score >= 80 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                                {item.score.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${
                                                    item.score >= 80 ? 'bg-red-500' : 'bg-orange-500'
                                                }`}
                                                style={{ width: `${item.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No high-risk vehicles detected</p>
                        )}
                    </div>

                    {/* High Risk Drivers */}
                    <div className="ot-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertCircle className="text-red-400" size={20} />
                            High Fatigue Risk Drivers
                        </h3>
                        {highRiskDrivers.length > 0 ? (
                            <div className="space-y-3">
                                {highRiskDrivers.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-sm">{item.driver.fullName}</p>
                                                <p className="text-xs text-slate-400">
                                                    License: {item.driver.licenseNumber}
                                                </p>
                                                {item.lastVehicle ? (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Last vehicle: <span className="text-slate-300">{item.lastVehicle.make} {item.lastVehicle.model}</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Last vehicle: <span className="text-slate-400">None</span>
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                item.score >= 70 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                                {item.score.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${
                                                    item.score >= 70 ? 'bg-red-500' : 'bg-orange-500'
                                                }`}
                                                style={{ width: `${item.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No high-risk drivers detected</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIInsights;
