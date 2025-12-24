import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Legend 
} from 'recharts';
import { TrendingUp, Fuel, Zap, Clock, Calendar } from 'lucide-react';

const Analytics = () => {
    // Silence Recharts defaultProps warnings
    useEffect(() => {
        const error = console.error;
        console.error = (...args) => {
            if (/defaultProps/.test(args[0])) return;
            error(...args);
        };
        return () => { console.error = error; };
    }, []);

    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [telemetry, setTelemetry] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await api.get('/vehicles');
                setVehicles(res.data);
                if (res.data.length > 0) {
                    setSelectedVehicle(res.data[0]);
                }
            } catch (err) {
                console.error('Failed to fetch analytics data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedVehicle) return;

        const fetchHistory = async () => {
            try {
                const res = await api.get(`/telemetry/vehicle/${selectedVehicle.id}`);
                // Format data for Recharts (show last 20 points)
                const formattedData = res.data.slice(-20).map(event => ({
                    time: new Date(event.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    speed: parseFloat(event.speedKph.toFixed(1)),
                    fuel: parseFloat(event.fuelLevel.toFixed(1))
                }));
                setTelemetry(formattedData);
            } catch (err) {
                console.error('Failed to fetch telemetry history:', err);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, [selectedVehicle]);

    return (
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container">
                <header className="ot-header flex justify-between items-end">
                    <div>
                        <h1 className="ot-title">Performance Analytics</h1>
                        <p className="ot-subtitle">Deep dive into fleet efficiency and driver behavior</p>
                    </div>
                    <div className="flex gap-3 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                        {vehicles.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVehicle(v)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    selectedVehicle?.id === v.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {v.licensePlate}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="ot-card flex items-center gap-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="ot-stat-label">Efficiency Rating</p>
                            <p className="text-2xl font-bold text-white">94.2%</p>
                        </div>
                    </div>
                    <div className="ot-card flex items-center gap-6">
                        <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Fuel size={24} />
                        </div>
                        <div>
                            <p className="ot-stat-label">Avg Fuel Consumption</p>
                            <p className="text-2xl font-bold text-white">8.4 <span className="text-xs text-slate-500 italic">MPG</span></p>
                        </div>
                    </div>
                    <div className="ot-card flex items-center gap-6">
                        <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="ot-stat-label">Asset Utilization</p>
                            <p className="text-2xl font-bold text-white">18.5 <span className="text-xs text-slate-500 italic">Hrs/Day</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Speed Trend Chart */}
                    <div className="ot-card">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="text-blue-500" size={20} />
                                Speed Velocity Trend
                            </h3>
                            <span className="ot-badge-live">Real-time</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry}>
                                    <defs>
                                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="mph" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Fuel Consumption Chart */}
                    <div className="ot-card">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Fuel className="text-emerald-500" size={20} />
                                Fuel Level monitoring
                            </h3>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Historical Data</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={telemetry}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    />
                                    <Line type="stepAfter" dataKey="fuel" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
