import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ChevronRight, Shield, Globe, Truck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLogin) {
            const success = await login({ username, password });
            if (success) {
                toast.success(`Welcome back, ${username}! Synchronizing command center...`, {
                    icon: '🚀',
                    duration: 3000
                });
                navigate('/dashboard');
            } else {
                toast.error('Authentication Failed: Invalid credentials or system offline.', {
                    icon: '🚫'
                });
            }
        } else {
            // High-Fidelity Mock for Registration
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                    loading: 'Provisioning secure operational account...',
                    success: 'Registration Complete! Please sign in with your new credentials.',
                    error: 'Provisioning Failed: Security protocols rejected the request.',
                }
            );
            setIsLogin(true);
        }
    };

    return (
        <div className="h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden">
            {/* Ultra-Premium Background Intelligence */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[160px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="w-full max-w-[420px] relative z-10 px-6">
                {/* Branding HUD */}
                <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-flex p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[20px] mb-4 shadow-2xl shadow-blue-600/20 ring-1 ring-white/20">
                        <Truck size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase">
                        OptiTrack<span className="text-blue-500">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-[0.3em] uppercase text-[9px]">Autonomous Logistics Intelligence Suite</p>
                </div>

                {/* Glassmorphic Command Module */}
                <div className="bg-white/[0.03] backdrop-blur-[32px] border border-white/10 p-8 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] ring-1 ring-white/5 animate-in zoom-in-95 duration-700">
                    <div className="flex bg-black/20 p-1.5 rounded-2xl mb-6 ring-1 ring-white/5">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            COMMAND SIGN-IN
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            ENROLL CREW
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1 animate-in slide-in-from-left-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Fleet Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600/40 transition-all text-sm"
                                        placeholder="crew@optitrack.io"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600/40 transition-all text-sm font-mono"
                                    placeholder="admin_id"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600/40 transition-all text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center group mt-2 overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <span className="flex items-center gap-2 text-[10px] tracking-[0.2em]">
                                    {isLogin ? 'INITIALIZE AUTHENTICATION' : 'GENERATE OPERATIONAL ACCESS'}
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-6 text-slate-600">
                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <Globe size={14} />
                            <span className="text-[9px] font-bold tracking-widest uppercase">Global Node</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <Shield size={14} />
                            <span className="text-[9px] font-bold tracking-widest uppercase">AES-256</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-4 text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase">
                    Security Version v4.0.6 // OptiTrack Global
                </p>
            </div>
        </div>
    );
};

export default Login;
