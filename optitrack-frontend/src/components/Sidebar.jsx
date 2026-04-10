import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Activity, Settings, LogOut, Map, ShieldAlert, Brain } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {
    const { logout, user } = useAuthStore();
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/dashboard' },
        { icon: <Truck size={18} />, label: 'Fleet', path: '/fleet' },
        { icon: <Map size={18} />, label: 'Live Tracking', path: '/tracking' },
        { icon: <Users size={18} />, label: 'Drivers', path: '/drivers' },
        { icon: <Brain size={18} />, label: 'AI Insights', path: '/ai-insights' },
        { icon: <Activity size={18} />, label: 'Analytics', path: '/analytics' },
        { icon: <ShieldAlert size={18} />, label: 'Safety', path: '/safety' },
    ];

    return (
        <aside className="ot-sidebar">
            <div className="p-4">
                <div className="flex items-center gap-3 px-2 mb-6 group cursor-default">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                        <Truck size={20} />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">OptiTrack</span>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`ot-nav-link text-sm py-2.5 ${
                                location.pathname === item.path ? 'ot-nav-link-active' : 'ot-nav-link-inactive'
                            }`}
                        >
                            <span className={location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-4 pb-20 border-t border-slate-800/50">
                <div className="px-3 py-3 mb-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5 tracking-widest">Active Session</p>
                    <p className="text-white text-xs font-medium truncate">{user?.username || 'Administrator'}</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group text-sm"
                >
                    <LogOut size={18} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
