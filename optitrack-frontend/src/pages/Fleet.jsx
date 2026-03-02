import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Truck, Search, Plus, Filter, Trash2, CheckCircle2, Clock, Package, Star } from 'lucide-react';

const Fleet = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyVehicle, setHistoryVehicle] = useState(null);

    const [newVehicle, setNewVehicle] = useState({
        licensePlate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'ACTIVE'
    });

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleHistory = async (vehicle) => {
        setHistoryVehicle(vehicle);
        setIsHistoryOpen(true);
        setSelectedHistory([]);
        try {
            const res = await axios.get(`/deliveries/vehicle/${vehicle.id}`);
            setSelectedHistory(res.data);
        } catch (error) {
            console.error('History fetch failed:', error);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/vehicles', newVehicle);
            setShowAddModal(false);
            setNewVehicle({ licensePlate: '', make: '', model: '', year: new Date().getFullYear(), status: 'ACTIVE' });
            fetchVehicles();
        } catch (error) {
            console.error('Failed to add vehicle:', error);
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this vehicle?')) return;
        try {
            await axios.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'ot-status-active';
            case 'MAINTENANCE': return 'ot-status-maintenance';
            default: return 'ot-status-inactive';
        }
    };

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                            Fleet Operations
                        </h1>
                        <p className="text-slate-400 mt-2">Manage and monitor your connected assets across the island</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Vehicle
                    </button>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/[0.02]">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by license plate, make, or model..." 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-8 py-6">Asset Detail</th>
                                    <th className="px-8 py-6">License Plate</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6 text-right">Operational History</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                Syncing fleet data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : vehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                    <Truck size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{vehicle.make}</div>
                                                    <div className="text-slate-500 text-sm">{vehicle.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-300 font-mono text-sm tracking-wider">{vehicle.licensePlate}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                                vehicle.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => fetchVehicleHistory(vehicle)}
                                                    className="px-4 py-2 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    Cargo Manifest
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cargo History Modal */}
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#111114] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-[40px] border border-white/10 shadow-2xl scale-in-center">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Cargo Manifest</h2>
                                    <p className="text-slate-500 text-sm mt-1">Delivery records for unit {historyVehicle?.licensePlate}</p>
                                </div>
                                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                                    <Plus className="rotate-45" size={32} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {selectedHistory.length === 0 ? (
                                    <div className="py-20 text-center text-slate-500 italic">No delivery records synced for this asset.</div>
                                ) : selectedHistory.map((d) => (
                                    <div key={d.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{d.packageName}</h4>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{d.deliveryType}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">
                                                {d.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">User Rating</p>
                                                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                                    <Star size={14} fill={d.userRating ? "currentColor" : "none"} />
                                                    {d.userRating ? `${d.userRating.toFixed(1)} / 5` : 'N/A'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Duration</p>
                                                <p className="text-white font-bold text-sm flex items-center gap-2">
                                                    <Clock size={14} className="text-blue-400" />
                                                    {d.assignmentToDeliveryMinutes || '??'} mins
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Environment</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {d.isNightDelivery && <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20">NIGHT</span>}
                                                    {d.isWeatherChallenged && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">WEATHER</span>}
                                                    {!d.isNightDelivery && !d.isWeatherChallenged && <span className="text-[9px] text-slate-500 italic">STANDARD</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                                <button 
                                    onClick={() => setIsHistoryOpen(false)}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                                >
                                    Close Manifest
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Fleet;
