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
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Lock
} from 'lucide-react';
import DashcamSimulator from '../components/DashcamSimulator';
import AIInsightsSidebar from '../components/AIInsightsSidebar';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Drivers = () => {
    const { hasRole } = useAuthStore();
    const isAdmin = hasRole('ROLE_ADMIN');

    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedDriverForAI, setSelectedDriverForAI] = useState(null);
    const [aiInsight, setAiInsight] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [evalReport, setEvalReport] = useState(null);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

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
            const driversList = Array.isArray(response?.data) ? response.data : [];
            setDrivers(driversList);
            if (driversList.length > 0 && !selectedDriverForAI) {
                setSelectedDriverForAI(driversList[0]);
            }
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
            toast.error('Tactical Error: Failed to synchronize workforce dossier.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    // Filtered Drivers
    const filteredDrivers = drivers.filter(d => 
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDrivers = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

    const handleAddDriver = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error('Access Denied: Administrative clearance required for onboarding.');
            return;
        }
        try {
            await axios.post('/drivers', newDriver);
            setShowAddModal(false);
            setNewDriver({ fullName: '', licenseNumber: '', experienceYears: 0, averageScore: 10.0, totalHoursDriven: 0.0 });
            fetchDrivers();
            toast.success('Operator Onboarded Successfully ✅');
        } catch (error) {
            console.error('Failed to add driver:', error);
            toast.error('Provisioning Error: Failed to register new operator.');
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
            await axios.post(`/drivers/${editForm.id}/base-salary?amount=${editForm.baseSalary}`);
            await axios.put(`/drivers/${editForm.id}`, {
                fullName: editForm.fullName,
                licenseNumber: editForm.licenseNumber,
                experienceYears: editForm.experienceYears
            });
            setIsEditModalOpen(false);
            fetchDrivers();
            toast.success("Driver Profile Synchronized Successfully ✅");
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Synchronization Error: Profile update rejected.');
        }
    };

    const generateAiInsights = async (id) => {
        setIsGeneratingAi(true);
        setAiInsight('');
        try {
            const res = await axios.get(`/drivers/${id}/insights`);
            setAiInsight(res.data);
            toast.success('AI Insight Contextualized');
        } catch (error) {
            setAiInsight('Intelligence Engine Offline: Check API configuration.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const triggerEvaluation = async (id) => {
        try {
            const res = await axios.get(`/drivers/${id}/evaluate`);
            setEvalReport(res.data);
            fetchDrivers();
            toast.success('Salary Review Report Generated');
        } catch (error) {
            toast.error('Evaluation Failed: Internal intelligence error.');
        }
    };

    const handleDeleteDriver = async (id) => {
        if (!isAdmin) {
            toast.error('Access Denied: Administrative clearance required for decommissioning.');
            return;
        }
        if (!window.confirm('CRITICAL: Permanently decommission this profile?')) return;
        try {
            await axios.delete(`/drivers/${id}`);
            setIsEditModalOpen(false);
            fetchDrivers();
            toast.success('Operator Decommissioned Successfully');
        } catch (error) {
            toast.error('Decommission Error: Profile lock active.');
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
                <header className="ot-header flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
                            WORKFORCE DOSSIER
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px] mt-1">Crew Performance & Merit Intelligence Hub</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="text"
                                placeholder="Search Crew..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <button
                            onClick={() => isAdmin ? setShowAddModal(true) : toast.error('Clearance Required')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 text-sm ${
                                isAdmin ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <Plus size={18} /> Onboard
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 min-h-[600px] content-start">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-500">
                            <div className="flex justify-center items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Syncing Dossier...
                            </div>
                        </div>
                    ) : currentDrivers.length > 0 ? (
                        currentDrivers.map((driver) => (
                            <div key={driver.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500 animate-in fade-in zoom-in-95">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                                            <Users size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{driver.fullName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{driver.licenseNumber}</span>
                                                {driver.assignedVehicle && (
                                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-black">
                                                        {driver.assignedVehicle.licensePlate}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-[0.2em]">Exp.</p>
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <Award size={14} className="text-blue-400" />
                                            {driver.experienceYears}Y
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-[0.2em]">Safety</p>
                                        <div className={`flex items-center gap-2 font-bold text-sm ${getScoreColor(driver.averageScore)}`}>
                                            <Star size={14} fill="currentColor" />
                                            {driver.averageScore.toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openEditModal(driver)}
                                    className="w-full py-4 bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 rounded-[20px] font-bold transition-all text-[11px] uppercase tracking-widest"
                                >
                                    Manage Dossier
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-40 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                            No Operator Profiles Match Search Protocol
                        </div>
                    )}
                </div>

                {/* High-Fidelity Pagination HUD */}
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
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
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

                {/* AI & Telemetry Insights */}
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

                {/* Dossier Modal with RBAC Protected Actions */}
                {isEditModalOpen && selectedDriver && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="bg-[#0a0a0c] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-white/10 shadow-2xl p-10 scale-in-center custom-scrollbar">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-600/10">
                                        <UserCircle size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Operator Dossier</h2>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Profile synchronization for {selectedDriver.fullName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateDriver} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Legal Designation</label>
                                        <div className="relative group">
                                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={editForm.fullName}
                                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">License Fingerprint</label>
                                        <div className="relative group">
                                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={editForm.licenseNumber}
                                                onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value.toUpperCase() })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Base Remuneration (LKR)</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                            <input
                                                type="number"
                                                value={editForm.baseSalary}
                                                onChange={(e) => setEditForm({ ...editForm, baseSalary: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Operational Tenure (Years)</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                            <input
                                                type="number"
                                                value={editForm.experienceYears}
                                                onChange={(e) => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold flex items-center gap-3 tracking-tighter">
                                            <Brain className="text-blue-400" size={24} />
                                            AI PERFORMANCE INTEL
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => generateAiInsights(selectedDriver.id)}
                                            disabled={isGeneratingAi}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                        >
                                            {isGeneratingAi ? 'Syncing...' : 'Sync Insight'}
                                        </button>
                                    </div>

                                    {aiInsight && (
                                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-500">
                                            <p className="text-[11px] font-medium text-blue-100 leading-relaxed italic uppercase tracking-wider">
                                                "{aiInsight}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        <h3 className="text-xl font-bold flex items-center gap-3 tracking-tighter text-indigo-400">
                                            <Activity className="text-indigo-400" size={24} />
                                            MERIT EVALUATION
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => triggerEvaluation(selectedDriver.id)}
                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            Execute Review
                                        </button>
                                    </div>

                                    {evalReport && (
                                        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Aggregate Safety</p>
                                                    <p className="text-2xl font-black">{evalReport.score.toFixed(1)} <span className="text-[10px] text-slate-600">/ 10.0</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Customer Trust</p>
                                                    <p className="text-2xl font-black text-amber-400">{evalReport.avgUserRating.toFixed(1)} <span className="text-[10px] text-slate-600 uppercase tracking-widest ml-1">Gold Rank</span></p>
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-indigo-500/20 flex justify-between items-center">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Merit-Based Recommendation:</span>
                                                <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg border uppercase tracking-widest ${evalReport.action === 'INCREASE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : evalReport.action === 'DECREASE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                    {evalReport.action} Operational Pay
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-4">
                                    {isAdmin ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDriver(selectedDriver.id)}
                                            className="py-4 px-8 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-[20px] font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} /> Decommission Profile
                                        </button>
                                    ) : (
                                        <div className="py-4 px-8 bg-slate-800 text-slate-500 border border-white/5 rounded-[20px] font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                                            <Lock size={16} /> Admin Clearance Required
                                        </div>
                                    )}
                                    <div className="flex-1 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-[20px] font-black text-[10px] tracking-widest uppercase transition-all"
                                        >
                                            Close Dossier
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] font-black text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} /> Sync Profile
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Driver Modal with RBAC */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="bg-[#0a0a0c] w-full max-w-lg rounded-[40px] border border-white/10 shadow-2xl p-10 scale-in-center">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black tracking-tighter text-white uppercase">New Crew Enrollment</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={32} />
                                </button>
                            </div>

                            <form onSubmit={handleAddDriver} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Designated Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDriver.fullName}
                                        onChange={(e) => setNewDriver({ ...newDriver, fullName: e.target.value })}
                                        placeholder="Enter Legal Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">License ID</label>
                                        <input
                                            required
                                            type="text"
                                            value={newDriver.licenseNumber}
                                            onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value.toUpperCase() })}
                                            placeholder="DL-XXXXX"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Exp. Years</label>
                                        <input
                                            required
                                            type="number"
                                            value={newDriver.experienceYears}
                                            onChange={(e) => setNewDriver({ ...newDriver, experienceYears: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-mono"
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
                                        Enroll Profile
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
