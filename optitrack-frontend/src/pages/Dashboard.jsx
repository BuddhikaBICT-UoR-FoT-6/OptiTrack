import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Truck, Activity, Users, AlertCircle, MapPin, FileText } from 'lucide-react';
import api from '../api/axios';
import { cachedFetch } from '../utils/cache';

const Dashboard = () => {
    const navigate = useNavigate();
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
                const [vehiclesData, driversData] = await Promise.all([
                    cachedFetch(api, '/vehicles', 'vehicles', 30_000),
                    cachedFetch(api, '/drivers', 'drivers', 30_000)
                ]);

                const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
                const drivers = Array.isArray(driversData) ? driversData : [];

                const activeCount = vehicles.filter(v => v.status === 'ACTIVE').length;
                const issuesCount = vehicles.filter(v => v.status === 'MAINTENANCE').length;

                setStats({
                    vehicles: vehicles.length,
                    active: activeCount,
                    drivers: drivers.length,
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

            <main className="ot-page-container w-full">
                <header className="ot-header flex justify-between items-end">
                    <div>
                        <h1 className="ot-title">Overview</h1>
                        <p className="ot-subtitle">Real-Time Fleet Status</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-tactical-cyan rounded-full animate-pulse shadow-[0_0_8px_#00F0FF]"></span>
                            <span className="text-xs text-white font-mono uppercase tracking-wider">Online & Syncing</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Truck size={24} />}
                        label="Total Vehicles"
                        value={stats.vehicles}
                        loading={loading}
                        pulseColor="bg-slate-400"
                    />
                    <StatCard
                        icon={<Activity size={24} />}
                        label="Active Now"
                        value={stats.active}
                        loading={loading}
                        pulseColor="bg-tactical-cyan"
                    />
                    <StatCard
                        icon={<Users size={24} />}
                        label="Total Drivers"
                        value={stats.drivers}
                        loading={loading}
                        pulseColor="bg-indigo-400"
                    />
                    <StatCard
                        icon={<AlertCircle size={24} />}
                        label="Needs Maintenance"
                        value={stats.issues}
                        loading={loading}
                        pulseColor="bg-tactical-amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 ot-card min-h-[350px] flex flex-col justify-between relative overflow-hidden group">
                        {/* Radar/Grid Background Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(#00F0FF_1px,transparent_1px),linear-gradient(90deg,#00F0FF_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-white font-display font-bold text-lg">Live Map</h3>
                                <p className="text-slate-500 text-sm">Tracking vehicles on the road</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                            <MapPin className="h-12 w-12 text-tactical-cyan/40 mb-4 animate-bounce" />
                            <p className="text-tactical-cyan font-mono text-sm uppercase tracking-widest mb-1">Connecting to Vehicles...</p>
                            <p className="text-slate-500 text-xs">Map data will appear here during active trips.</p>
                        </div>
                    </div>

                    <div className="ot-card flex flex-col">
                        <h3 className="text-white font-display font-bold text-lg mb-6">Quick Tasks</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/fleet')}
                                className="ot-btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Truck size={16} /> Add Vehicle
                            </button>
                            <button 
                                onClick={() => navigate('/safety')}
                                className="ot-btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                <FileText size={16} /> Driver Safety
                            </button>
                            <button 
                                onClick={() => navigate('/tracking')}
                                className="ot-btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                <MapPin size={16} /> View Map
                            </button>
                        </div>
                        <div className="mt-auto pt-6 text-center">
                            <div className="h-[1px] w-full bg-tactical-border mb-4"></div>
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono font-bold">OptiTrack Hub v2.0</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
