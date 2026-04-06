import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { 
    Truck, 
    Search, 
    Plus, 
    Trash2, 
    Package, 
    Star, 
    Clock, 
    User, 
    Filter,
    ChevronLeft,
    ChevronRight,
    Lock,
    Settings,
    ShieldAlert
} from 'lucide-react';
import MaintenanceGauge from '../components/MaintenanceGauge';
import AIInsightsSidebar from '../components/AIInsightsSidebar';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Fleet = () => {
    const { hasRole } = useAuthStore();
    const isAdmin = hasRole('ROLE_ADMIN');

    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyVehicle, setHistoryVehicle] = useState(null);
    const [selectedVehicleForAI, setSelectedVehicleForAI] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [newVehicle, setNewVehicle] = useState({
        licensePlate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'ACTIVE'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [vRes, dRes] = await Promise.all([
                axios.get('/vehicles'),
                axios.get('/drivers')
            ]);
            setVehicles(vRes.data);
            setDrivers(dRes.data);
            if (vRes.data.length > 0) {
                const activeVehicle = vRes.data.find(v => v.status === 'ACTIVE') || vRes.data[0];
                setSelectedVehicleForAI(activeVehicle);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Sync Error: Failed to synchronize fleet registry.');
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
            toast.error('Manifest Error: Failed to retrieve cargo history.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error('Access Denied: Administrative clearance required.');
            return;
        }
        try {
            await axios.post('/vehicles', newVehicle);
            setShowAddModal(false);
            setNewVehicle({ licensePlate: '', make: '', model: '', year: new Date().getFullYear(), status: 'ACTIVE' });
            fetchData();
            toast.success('Asset Commissioned Successfully ✅');
        } catch (error) {
            console.error('Failed to add vehicle:', error);
            toast.error('Deployment Error: Failed to register new asset.');
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!isAdmin) {
            toast.error('Access Denied: Administrative clearance required.');
            return;
        }
        if (!window.confirm('CRITICAL: Permanently decommission this asset?')) return;
        try {
            await axios.delete(`/vehicles/${id}`);
            fetchData();
            toast.success('Asset Decommissioned Successfully');
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            toast.error('Command Error: Asset decommission lock active.');
        }
    };

    // --- Search & Pagination Logic ---
    const filteredVehicles = vehicles.filter(v => 
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVehicles = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="ot-page-container">
                <header className="ot-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase">
                            Fleet Operations
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px] mt-1">Real-time Asset Monitoring & Deployment Hub</p>
                    </div>
                    <button 
                        onClick={() => isAdmin ? setShowAddModal(true) : toast.error('Clearance Required')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 text-sm ${
                            isAdmin ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <Plus size={18} /> Add Vehicle
                    </button>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl mb-6">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between bg-white/[0.02]">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by Plate, Make, or Model..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600 font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 py-2 bg-black/20 rounded-xl border border-white/5">
                                Registry: {filteredVehicles.length} Assets
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-10 py-8">Asset Profile</th>
                                    <th className="px-10 py-8">Plate ID</th>
                                    <th className="px-10 py-8">Operator</th>
                                    <th className="px-10 py-8">Operational State</th>
                                    <th className="px-10 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                Syncing Registry...
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentVehicles.length > 0 ? currentVehicles.map((vehicle) => {
                                    const assignedDriver = drivers.find(d => d.assignedVehicle?.id === vehicle.id);
                                    return (
                                        <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-[20px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-blue-600/0 group-hover:shadow-blue-600/20">
                                                        <Truck size={28} />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-black text-lg tracking-tight">{vehicle.make}</div>
                                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{vehicle.model}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-slate-400 font-mono text-sm tracking-widest">{vehicle.licensePlate}</td>
                                            <td className="px-10 py-8">
                                                {assignedDriver ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                                                            <User size={14} className="text-blue-400" />
                                                        </div>
                                                        <span className="text-sm font-black text-slate-300">{assignedDriver.fullName}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 opacity-50">
                                                        <Settings size={14} className="text-slate-600 animate-spin-slow" />
                                                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">IoT Automated Unit</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${
                                                    vehicle.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => fetchVehicleHistory(vehicle)}
                                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/10"
                                                    >
                                                        Manifest
                                                    </button>
                                                    {isAdmin ? (
                                                        <button 
                                                            onClick={() => handleDeleteVehicle(vehicle.id)}
                                                            className="p-3 bg-white/5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 border border-white/5 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    ) : (
                                                        <div className="p-3 bg-slate-800 text-slate-700 border border-white/5 rounded-xl opacity-30 cursor-not-allowed">
                                                            <Lock size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
                                            No Assets Matching Search Protocol
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination HUD */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mb-10">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600/20 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600/20 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* AI & Maintenance Insights */}
                {selectedVehicleForAI && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                        <div className="lg:col-span-2">
                            <MaintenanceGauge 
                                vehicleId={selectedVehicleForAI.id} 
                                vehicleName={`${selectedVehicleForAI.make} ${selectedVehicleForAI.model} - ${selectedVehicleForAI.licensePlate}`}
                            />
                        </div>
                        <div className="">
                            <AIInsightsSidebar 
                                type="maintenance"
                                entityId={selectedVehicleForAI.id}
                                entityName={selectedVehicleForAI.licensePlate}
                            />
                        </div>
                    </div>
                )}

                {/* Cargo History Modal */}
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="bg-[#0a0a0c] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-[40px] border border-white/10 shadow-2xl scale-in-center">
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-600/20 rounded-[20px] flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-600/10">
                                        <Package size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Cargo Manifest</h2>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Operational logs for unit {historyVehicle?.licensePlate}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <X size={32} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                                {selectedHistory.length === 0 ? (
                                    <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No synchronization records for this asset.</div>
                                ) : selectedHistory.map((d) => (
                                    <div key={d.id} className="bg-white/5 border border-white/5 rounded-[32px] p-8 hover:border-blue-500/30 transition-all duration-500 group">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white text-xl tracking-tight">{d.packageName}</h4>
                                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{d.deliveryType} Operational Stream</p>
                                                </div>
                                            </div>
                                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-xl border border-emerald-500/20 uppercase tracking-widest">
                                                {d.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">User Merit</p>
                                                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                                                    <Star size={16} fill={d.userRating ? "currentColor" : "none"} />
                                                    {d.userRating ? `${d.userRating.toFixed(1)} / 5.0` : 'PENDING'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Transit Logic</p>
                                                <p className="text-white font-black text-sm flex items-center gap-2 tracking-tight">
                                                    <Clock size={16} className="text-blue-400" />
                                                    {d.assignmentToDeliveryMinutes || '??'} MINS
                                                </p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Tactical Conditions</p>
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    {d.isNightDelivery && <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg border border-indigo-500/20 font-black uppercase tracking-widest">Night</span>}
                                                    {d.isWeatherChallenged && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg border border-amber-500/20 font-black uppercase tracking-widest">Weather</span>}
                                                    {!d.isNightDelivery && !d.isWeatherChallenged && <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic opacity-50">Standard Theater</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="p-10 border-t border-white/5 bg-white/[0.01]">
                                <button 
                                    onClick={() => setIsHistoryOpen(false)}
                                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-[20px] transition-all"
                                >
                                    Terminate Manifest Access
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Vehicle Modal with RBAC */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="bg-[#0a0a0c] w-full max-w-lg rounded-[40px] border border-white/10 shadow-2xl p-10 scale-in-center">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Asset Commissioning</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={32} />
                                </button>
                            </div>

                            <form onSubmit={handleAddVehicle} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">License Plate Identifier</label>
                                    <input
                                        required
                                        type="text"
                                        value={newVehicle.licensePlate}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value.toUpperCase() })}
                                        placeholder="WP-XXX-XXXX"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm tracking-widest"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Manufacturer</label>
                                        <input
                                            required
                                            type="text"
                                            value={newVehicle.make}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                                            placeholder="Toyota"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Model Variant</label>
                                        <input
                                            required
                                            type="text"
                                            value={newVehicle.model}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                            placeholder="Hilux"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-blue-600/30"
                                    >
                                        Commission Asset
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Fleet;
