import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Truck, Search, Plus, Filter, Trash2, CheckCircle2, Clock } from 'lucide-react';

const Fleet = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
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
            alert('Failed to add vehicle. Please check if license plate is unique.');
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this vehicle?')) return;
        try {
            await axios.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            alert('Failed to delete vehicle. It may have associated telemetry data.');
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
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container">
                <header className="ot-header flex justify-between items-center">
                    <div>
                        <h1 className="ot-title">Fleet Management</h1>
                        <p className="ot-subtitle">Manage and monitor your connected assets</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="ot-btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Vehicle
                    </button>
                </header>

                <div className="ot-table-container">
                    <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row gap-4 justify-between bg-slate-800/20">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by license plate, make, or model..." 
                                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button className="ot-btn-secondary flex items-center gap-2">
                            <Filter size={18} /> Filters
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="ot-table">
                            <thead>
                                <tr className="ot-table-header">
                                    <th className="px-6 py-4">Vehicle Detail</th>
                                    <th className="px-6 py-4">License Plate</th>
                                    <th className="px-6 py-4">Year</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                Loading fleet data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : vehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="ot-table-row group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                    <Truck size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{vehicle.make}</div>
                                                    <div className="text-slate-500 text-sm">{vehicle.model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-mono text-sm">{vehicle.licensePlate}</td>
                                        <td className="px-6 py-4 text-slate-400">{vehicle.year}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`ot-status-badge ${getStatusClass(vehicle.status)}`}>
                                                    {vehicle.status === 'ACTIVE' && <CheckCircle2 size={12} />}
                                                    {vehicle.status === 'MAINTENANCE' && <Clock size={12} />}
                                                    {vehicle.status}
                                                </span>
                                                {vehicle.maintenanceDue && (
                                                    <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-tighter animate-pulse">
                                                        Service Required
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {vehicle.maintenanceDue && (
                                                    <button className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">
                                                        Schedule
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                                    title="Decommission Vehicle"
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

                {/* Add Vehicle Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="ot-card w-full max-w-lg shadow-2xl shadow-blue-500/10 border-blue-500/20 scale-in-center">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Register New Asset</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">License Plate</label>
                                        <input 
                                            required
                                            type="text"
                                            value={newVehicle.licensePlate}
                                            onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})}
                                            placeholder="e.g. TRK-789"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Manufacture Year</label>
                                        <input 
                                            required
                                            type="number"
                                            value={newVehicle.year}
                                            onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Make / Manufacturer</label>
                                    <input 
                                        required
                                        type="text"
                                        value={newVehicle.make}
                                        onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                                        placeholder="e.g. Volvo"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Model Name</label>
                                    <input 
                                        required
                                        type="text"
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                                        placeholder="e.g. FH16 750"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 ot-btn-secondary py-3"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 ot-btn-primary py-3"
                                    >
                                        Complete Registration
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
