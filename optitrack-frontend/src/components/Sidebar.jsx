import React from 'react';
import { LayoutDashboard, Truck, Users, Activity, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {
    const { logout, user } = useAuthStore();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', active: true },
        { icon: <Truck size={20} />, label: 'Fleet Status' },
        { icon: <Users size={20} />, label: 'Drivers' },
        { icon: <Activity size={20} />, label: 'Telemetry' },
        { icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="w-64 h-screen bg-[#0F172A] border-r border-slate-800 flex flex-col p-4 fixed left-0 top-0">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">O</div>
                <span className="text-white font-bold text-xl tracking-tight">OptiTrack</span>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active
                                ? 'bg-blue-600/10 text-blue-500 font-medium'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="pt-4 border-t border-slate-800">
                <div className="px-4 py-4 mb-4 bg-slate-800/30 rounded-2xl">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Current User</p>
                    <p className="text-white font-medium truncate">{user?.username || 'Admin'}</p>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
