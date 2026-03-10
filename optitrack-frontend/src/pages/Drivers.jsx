import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import {
    Users,
    Search,
    Plus,
    UserCheck,
    Star,
    Award,
    Trash2,
    ShieldCheck,
    Activity,
    Brain,
    DollarSign,
    Save,
    X,
    UserCircle,
    Fingerprint,
    Briefcase
} from 'lucide-react';
import DashcamSimulator from '../components/DashcamSimulator';
import AIInsightsSidebar from '../components/AIInsightsSidebar';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedDriverForAI, setSelectedDriverForAI] = useState(null);
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
        licenseNumber: '',
        experienceYears: 0,
        baseSalary: 0
    });

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/drivers');
            setDrivers(response.data);
            // Set first driver as default selection for AI insights
            if (response.data.length > 0 && !selectedDriverForAI) {
                setSelectedDriverForAI(response.data[0]);
            }
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
            licenseNumber: driver.licenseNumber,
            experienceYears: driver.experienceYears,
            baseSalary: driver.baseSalary || 50000
        });
        setAiInsight('');
        setEvalReport(null);
        setIsEditModalOpen(true);
    };

    const handleUpdateDriver = async (e) => {
        e.preventDefault();
        try {
            // Update Base Salary first if changed
            await axios.post(`/drivers/${editForm.id}/base-salary?amount=${editForm.baseSalary}`);

            // Update other profile details
            await axios.put(`/drivers/${editForm.id}`, {
                fullName: editForm.fullName,
                licenseNumber: editForm.licenseNumber,
                experienceYears: editForm.experienceYears
            });

            setIsEditModalOpen(false);
            fetchDrivers();
            alert("Driver Profile Synchronized Successfully ✅");
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
            setAiInsight('Intelligence Engine Offline: Ensure GOOGLE_API_KEY is configured in application.properties for real-time career analysis.');
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
        if (!window.confirm('CRITICAL: Are you sure you want to permanently decommission this driver profile? This action cannot be undone.')) return;
        try {
            await axios.delete(`/drivers/${id}`);
            setIsEditModalOpen(false);
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

            <main className="ot-page-container">
                <header className="ot-header flex justify-between items-center">
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
                                        <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{driver.fullName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{driver.licenseNumber}</span>
                                            {driver.assignedVehicle && (
                                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                                                    {driver.assignedVehicle.licensePlate}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                                        {driver.averageScore.toFixed(2)} / 10
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
                                Manage Profile & Insights
                            </button>
                        </div>
                    ))}
                </div>

                {/* AI-Powered Driver Safety & Fatigue Analysis */}
                {selectedDriverForAI && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                        <div className="lg:col-span-2">
                            <DashcamSimulator 
                                driverId={selectedDriverForAI.id}
                                driverName={selectedDriverForAI.fullName}
                            />
                        </div>
                        <div className="">
                            <AIInsightsSidebar 
                                type="fatigue"
                                entityId={selectedDriverForAI.id}
                                entityName={selectedDriverForAI.fullName}
                            />
                        </div>
                    </div>
                )}

                {/* Edit / Full Profile Modal */}
                {isEditModalOpen && selectedDriver && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#111114] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-white/10 shadow-2xl p-10 scale-in-center custom-scrollbar">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-600/10">
                                        <UserCircle size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Workforce Dossier</h2>
                                        <p className="text-slate-500">Operational profile for {selectedDriver.fullName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateDriver} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                                        <div className="relative">
                                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="text"
                                                value={editForm.fullName}
                                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">License Identifier</label>
                                        <div className="relative">
                                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="text"
                                                value={editForm.licenseNumber}
                                                onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value.toUpperCase() })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Base Monthly Salary (LKR)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                            <input
                                                type="number"
                                                value={editForm.baseSalary}
                                                onChange={(e) => setEditForm({ ...editForm, baseSalary: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Field Experience (Years)</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                            <input
                                                type="number"
                                                value={editForm.experienceYears}
                                                onChange={(e) => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <Brain className="text-blue-400" size={24} />
                                            AI Performance Intelligence
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => generateAiInsights(selectedDriver.id)}
                                            disabled={isGeneratingAi}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                        >
                                            {isGeneratingAi ? 'Syncing Context...' : 'Sync AI Insight'}
                                        </button>
                                    </div>

                                    {aiInsight && (
                                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-500">
                                            <p className="text-sm text-blue-100 leading-relaxed italic">
                                                "{aiInsight}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <Activity className="text-indigo-400" size={24} />
                                            Merit Evaluation Report
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => triggerEvaluation(selectedDriver.id)}
                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            Execute Salary Review
                                        </button>
                                    </div>

                                    {evalReport && (
                                        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Aggregate Safety Score</p>
                                                    <p className="text-2xl font-bold">{evalReport.score.toFixed(1)} <span className="text-xs text-slate-600">/ 10</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Avg. Customer Rating</p>
                                                    <p className="text-2xl font-bold text-amber-400">{evalReport.avgUserRating.toFixed(1)} <span className="text-xs text-slate-600">⭐</span></p>
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-indigo-500/20 flex justify-between items-center">
                                                <span className="text-sm font-bold text-slate-400">System Recommendation:</span>
                                                <span className={`text-xs font-black px-4 py-1.5 rounded-lg border ${evalReport.action === 'INCREASE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : evalReport.action === 'DECREASE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                    {evalReport.action} COMPENSATION
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDriver(selectedDriver.id)}
                                        className="py-4 px-8 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Decommission Profile
                                    </button>
                                    <div className="flex-1 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 text-sm flex items-center justify-center gap-2"
                                        >
                                            <Save size={18} />
                                            Synchronize Profile
                                        </button>
                                    </div>
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
                                    <X size={32} />
                                </button>
                            </div>

                            <form onSubmit={handleAddDriver} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDriver.fullName}
                                        onChange={(e) => setNewDriver({ ...newDriver, fullName: e.target.value })}
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
                                            onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value.toUpperCase() })}
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
                                            onChange={(e) => setNewDriver({ ...newDriver, experienceYears: parseInt(e.target.value) })}
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
