import React from 'react';
import Sidebar from '../components/Sidebar';
import { Truck, Activity, Users, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                {React.cloneElement(icon, { className: color.replace('bg-', 'text-') })}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live</span>
        </div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{label}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const Dashboard = () => {
    const [vehicleCount, setVehicleCount] = useState(0);

    useEffect(() => {
        api.get('/vehicles').then(res => setVehicleCount(res.data.length));
    }, []);

    return (
        <div className="min-h-screen bg-[#0F172A] flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Fleet Overview</h1>
                    <p className="text-slate-400">Real-time monitoring of your connected assets</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        icon={<Truck />}
                        label="Total Vehicles"
                        value={vehicleCount.toString()}
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={<Activity />}
                        label="Active Now"
                        value="18"
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={<Users />}
                        label="Available Drivers"
                        value="12"
                        color="bg-indigo-500"
                    />
                    <StatCard
                        icon={<AlertCircle />}
                        label="Issues Found"
                        value="2"
                        color="bg-red-500"
                    />
                </div>

                <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <Activity className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Telemetry Chart Area</p>
                        <p className="text-slate-600 text-sm">Real-time data stream will appear here</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
