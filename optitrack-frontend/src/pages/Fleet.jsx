import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Truck, Search, Plus, Filter, MoreVertical, CheckCircle2, Clock } from 'lucide-react';

const Fleet = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('/vehicles');
                setVehicles(response.data);
            } catch (error) {
                console.error('Failed to fetch vehicles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

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
                    <button className="ot-btn-primary flex items-center gap-2">
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
                                            <span className={`ot-status-badge ${getStatusClass(vehicle.status)}`}>
                                                {vehicle.status === 'ACTIVE' && <CheckCircle2 size={12} />}
                                                {vehicle.status === 'MAINTENANCE' && <Clock size={12} />}
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Fleet;
