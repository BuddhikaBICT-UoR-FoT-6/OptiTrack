import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Users, Search, Plus, UserCheck, Star, Award, MoreVertical, ShieldCheck } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await axios.get('/drivers');
                setDrivers(response.data);
            } catch (error) {
                console.error('Failed to fetch drivers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDrivers();
    }, []);

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
                    <button className="ot-btn-primary flex items-center gap-2">
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
                                <button className="p-2 text-slate-600 hover:text-white transition-colors">
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
            </main>
        </div>
    );
};

export default Drivers;
