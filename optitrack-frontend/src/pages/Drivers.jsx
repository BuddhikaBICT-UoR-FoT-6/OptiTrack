import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Users, Search, Plus, UserCheck, Star, Award, MoreVertical, ShieldCheck, Activity, Brain, DollarSign } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [aiInsight, setAiInsight] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [evalReport, setEvalReport] = useState(null);

    const [newDriver, setNewDriver] = useState({
        fullName: '',
        licenseNumber: '',
        experienceYears: 0,
        averageScore: 10.0,
        totalHoursDriven: 0.0
    });

    const [editForm, setEditForm] = useState({
        id: null,
        fullName: '',
        baseSalary: 0,
        experienceYears: 0
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

    const openEditModal = (driver) => {
        setSelectedDriver(driver);
        setEditForm({
            id: driver.id,
            fullName: driver.fullName,
            baseSalary: driver.baseSalary || 50000,
            experienceYears: driver.experienceYears
        });
        setAiInsight('');
        setEvalReport(null);
        setIsEditModalOpen(true);
    };

    const handleUpdateDriver = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/drivers/${editForm.id}/base-salary?amount=${editForm.baseSalary}`);
            setIsEditModalOpen(false);
            fetchDrivers();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const generateAiInsights = async (id) => {
        setIsGeneratingAi(true);
        setAiInsight('');
        try {
            const res = await axios.get(`/drivers/${id}/insights`);
            setAiInsight(res.data);
        } catch (error) {
            console.error('AI Insights failed:', error);
            setAiInsight('Intelligence engine currently offline. Performance data remains cached.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const triggerEvaluation = async (id) => {
        try {
            const res = await axios.get(`/drivers/${id}/evaluate`);
            setEvalReport(res.data);
            fetchDrivers();
        } catch (error) {
            console.error('Evaluation failed:', error);
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
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                            Workforce Management
                        </h1>
                        <p className="text-slate-400 mt-2">Monitor performance and safety metrics for your crew</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Driver
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-500">
                             <div className="flex justify-center items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Syncing driver profiles...
                            </div>
                        </div>
                    ) : drivers.map((driver) => (
                        <div key={driver.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500">
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
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/30">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Experience</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Award size={14} className="text-blue-400" />
                                        {driver.experienceYears} Years
                                    </div>
                                </div>
                                <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/30">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Safety Score</p>
                                    <div className={`flex items-center gap-2 font-bold ${getScoreColor(driver.averageScore)}`}>
                                        <Star size={14} fill="currentColor" />
                                        {driver.averageScore} / 10
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Monthly Salary</span>
                                    <span className="text-white font-bold">Rs. {driver.currentSalary?.toLocaleString() || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Status</span>
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20 text-[10px]">
                                        <ShieldCheck size={12} /> ACTIVE
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => openEditModal(driver)}
                                className="w-full mt-6 py-4 bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 rounded-2xl font-bold transition-all text-sm group-hover:shadow-lg group-hover:shadow-blue-600/10"
                            >
                                View Full Profile & AI Insights
                            </button>
                        </div>
                    ))}
                </div>

                {/* Edit / Full Profile Modal */}
                {isEditModalOpen && selectedDriver && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#111114] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 shadow-2xl p-8 scale-in-center">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Driver Profile & Performance</h2>
                                        <p className="text-slate-500 text-sm">Reviewing {selectedDriver.fullName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <Plus size={32} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateDriver} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Base Salary (LKR)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input 
                                                type="number"
                                                value={editForm.baseSalary}
                                                onChange={(e) => setEditForm({...editForm, baseSalary: parseInt(e.target.value)})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Experience Years</label>
                                        <div className="relative">
                                            <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input 
                                                type="number"
                                                value={editForm.experienceYears}
                                                onChange={(e) => setEditForm({...editForm, experienceYears: parseInt(e.target.value)})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Brain className="text-blue-400" size={20} />
                                            AI Performance Intelligence
                                        </h3>
                                        <button 
                                            type="button"
                                            onClick={() => generateAiInsights(selectedDriver.id)}
                                            disabled={isGeneratingAi}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                                        >
                                            {isGeneratingAi ? 'Analyzing Metrics...' : 'Generate Insights'}
                                        </button>
                                    </div>

                                    {aiInsight && (
                                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-500">
                                            <p className="text-sm text-blue-100 leading-relaxed italic">
                                                "{aiInsight}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Activity className="text-indigo-400" size={20} />
                                            Merit-Based Evaluation
                                        </h3>
                                        <button 
                                            type="button"
                                            onClick={() => triggerEvaluation(selectedDriver.id)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
                                        >
                                            Run Salary Review
                                        </button>
                                    </div>

                                    {evalReport && (
                                        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Combined Score</p>
                                                    <p className="text-xl font-bold">{evalReport.score.toFixed(1)} / 10</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">User Rating</p>
                                                    <p className="text-xl font-bold text-emerald-400">{evalReport.avgUserRating.toFixed(1)} ⭐</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-indigo-500/20 flex justify-between items-center">
                                                <span className="text-sm font-bold text-slate-400">Merit Recommendation:</span>
                                                <span className={`text-sm font-black px-3 py-1 rounded-lg ${evalReport.action === 'INCREASE' ? 'bg-emerald-500/20 text-emerald-400' : evalReport.action === 'DECREASE' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {evalReport.action} SALARY
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30"
                                    >
                                        Update Base Salary
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Driver Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-[#111114] w-full max-w-lg rounded-[32px] border border-white/10 shadow-2xl p-8 scale-in-center">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Onboard New Operator</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <Plus size={32} className="rotate-45" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddDriver} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                                    <input 
                                        required
                                        type="text"
                                        value={newDriver.fullName}
                                        onChange={(e) => setNewDriver({...newDriver, fullName: e.target.value})}
                                        placeholder="e.g. Mike Johnson"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">License Number</label>
                                        <input 
                                            required
                                            type="text"
                                            value={newDriver.licenseNumber}
                                            onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value.toUpperCase()})}
                                            placeholder="DL-XXXXX"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Exp. Years</label>
                                        <input 
                                            required
                                            type="number"
                                            value={newDriver.experienceYears}
                                            onChange={(e) => setNewDriver({...newDriver, experienceYears: parseInt(e.target.value)})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all"
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
