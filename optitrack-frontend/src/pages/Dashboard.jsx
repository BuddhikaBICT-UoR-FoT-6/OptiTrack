import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Truck, Activity, Users, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ icon, label, value, color }) => (
    <div className="ot-stat-card group">
        <div className="flex items-center justify-between mb-4">
            <div className={`ot-stat-icon-container ${color} bg-opacity-10 group-hover:scale-110`}>
                {React.cloneElement(icon, { className: color.replace('bg-', 'text-') })}
            </div>
            <span className="ot-badge-live">Live</span>
        </div>
        <h3 className="ot-stat-label">{label}</h3>
        <p className="ot-stat-value">{value}</p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        vehicles: 0,
        active: 0,
        drivers: 0,
        issues: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [vRes, dRes] = await Promise.all([
                    api.get('/vehicles'),
                    api.get('/drivers')
                ]);

                const vehicles = vRes.data;
                const activeCount = vehicles.filter(v => v.status === 'ACTIVE').length;
                const issuesCount = vehicles.filter(v => v.status === 'MAINTENANCE').length;

                setStats({
                    vehicles: vehicles.length,
                    active: activeCount,
                    drivers: dRes.data.length,
                    issues: issuesCount
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container">
                <header className="ot-header">
                    <h1 className="ot-title">Fleet Overview</h1>
                    <p className="ot-subtitle">Real-time monitoring of your connected assets</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        icon={<Truck />}
                        label="Total Vehicles"
                        value={loading ? "..." : stats.vehicles.toString()}
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={<Activity />}
                        label="Active Now"
                        value={loading ? "..." : stats.active.toString()}
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={<Users />}
                        label="Registered Drivers"
                        value={loading ? "..." : stats.drivers.toString()}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        icon={<AlertCircle />}
                        label="Maintenance Alert"
                        value={loading ? "..." : stats.issues.toString()}
                        color="bg-red-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2 ot-card min-h-[400px] flex flex-col justify-between group">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-white font-bold text-lg">Telemetry Activity</h3>
                                <p className="text-slate-500 text-sm">Real-time data stream from IoT devices</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">System Online</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Activity className="h-12 w-12 text-slate-700 mx-auto mb-4 group-hover:text-blue-500 transition-colors duration-500" />
                                <p className="text-slate-500 font-medium">Simulation Engine Active</p>
                                <p className="text-slate-600 text-sm">Data packets will begin streaming shortly</p>
                            </div>
                        </div>
                    </div>

                    <div className="ot-card flex flex-col">
                        <h3 className="text-white font-bold text-lg mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="ot-btn-primary w-full">
                                Register New Asset
                            </button>
                            <button className="ot-btn-secondary w-full">
                                Generate Safety Report
                            </button>
                            <button className="ot-btn-secondary w-full">
                                View Fleet Map
                            </button>
                        </div>
                        <div className="mt-auto pt-6 border-t border-slate-800/50 text-center">
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Foundation v1.0</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
