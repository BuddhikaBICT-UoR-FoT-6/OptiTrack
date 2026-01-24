import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Users, Search, Plus, UserCheck, Star, Award, MoreVertical, ShieldCheck } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDriver, setNewDriver] = useState({
        fullName: '',
        licenseNumber: '',
        experienceYears: 0,
        averageScore: 10.0,
        totalHoursDriven: 0.0
    });

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/drivers');
            setDrivers(response.data);
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleAddDriver = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/drivers', newDriver);
            setShowAddModal(false);
            setNewDriver({ fullName: '', licenseNumber: '', experienceYears: 0, averageScore: 10.0, totalHoursDriven: 0.0 });
            fetchDrivers();
        } catch (error) {
            console.error('Failed to add driver:', error);
        }
    };

    const handleDeleteDriver = async (id) => {
        if (!window.confirm('Are you sure you want to remove this driver profile?')) return;
        try {
            await axios.delete(`/drivers/${id}`);
            fetchDrivers();
        } catch (error) {
            console.error('Failed to delete driver:', error);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 9.0) return 'text-emerald-400';
        if (score >= 7.5) return 'text-blue-400';
        return 'text-amber-400';
    };

    return (
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container">
                <header className="ot-header flex justify-between items-center">
                    <div>
                        <h1 className="ot-title">Driver Management</h1>
                        <p className="ot-subtitle">Monitor performance and safety metrics for your crew</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="ot-btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Driver
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {loading ? (
                        <div className="col-span-full ot-card py-20 text-center text-slate-500">
                             <div className="flex justify-center items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Syncing driver profiles...
                            </div>
                        </div>
                    ) : drivers.map((driver) => (
                        <div key={driver.id} className="ot-card group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                                        <Users size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{driver.fullName}</h3>
                                        <p className="text-slate-500 text-sm font-mono">{driver.licenseNumber}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteDriver(driver.id)}
                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                    title="Delete Driver Profile"
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Experience</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Award size={14} className="text-blue-400" />
                                        {driver.experienceYears} Years
                                    </div>
                                </div>
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Safety Score</p>
                                    <div className={`flex items-center gap-2 font-bold ${getScoreColor(driver.averageScore)}`}>
                                        <Star size={14} fill="currentColor" />
                                        {driver.averageScore} / 10
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                                        <ShieldCheck size={12} /> Certified
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Total Hours</span>
                                    <span className="text-white font-medium">{driver.totalHoursDriven.toFixed(1)}h</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 rounded-xl font-bold transition-all text-sm group-hover:shadow-lg group-hover:shadow-blue-600/10">
                                View Full Profile
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Driver Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="ot-card w-full max-w-lg shadow-2xl shadow-blue-500/10 border-blue-500/20 scale-in-center">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Onboard New Operator</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddDriver} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Legal Name</label>
                                    <input 
                                        required
                                        type="text"
                                        value={newDriver.fullName}
                                        onChange={(e) => setNewDriver({...newDriver, fullName: e.target.value})}
                                        placeholder="e.g. Mike Johnson"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">License Number</label>
                                        <input 
                                            required
                                            type="text"
                                            value={newDriver.licenseNumber}
                                            onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value.toUpperCase()})}
                                            placeholder="DL-XXXXX"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Exp. Years</label>
                                        <input 
                                            required
                                            type="number"
                                            value={newDriver.experienceYears}
                                            onChange={(e) => setNewDriver({...newDriver, experienceYears: parseInt(e.target.value)})}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
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
                                        Add to Roster
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

export default Drivers;
