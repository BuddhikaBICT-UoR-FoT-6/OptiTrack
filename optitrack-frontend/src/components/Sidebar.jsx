import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Activity, LogOut, Map, ShieldAlert, Brain } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {
    const { logout, user } = useAuthStore();
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <Truck size={20} />, label: 'Assets', path: '/fleet' },
        { icon: <Map size={20} />, label: 'Telemetry', path: '/tracking' },
        { icon: <Users size={20} />, label: 'Operators', path: '/drivers' },
        { icon: <Brain size={20} />, label: 'Intelligence', path: '/ai-insights' },
        { icon: <Activity size={20} />, label: 'Metrics', path: '/analytics' },
        { icon: <ShieldAlert size={20} />, label: 'Risk', path: '/safety' },
    ];

    return (
        <aside className="ot-sidebar">
            {/* Logo area */}
            <div className="mb-8 mt-2 group cursor-default relative flex justify-center">
                <div className="w-10 h-10 border border-tactical-cyan/50 rounded-sm flex items-center justify-center text-tactical-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                    <Truck size={22} />
                </div>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-4 w-full px-2">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`ot-nav-link group ${isActive ? 'ot-nav-link-active' : 'ot-nav-link-inactive'}`}
                        >
                            {React.cloneElement(item.icon, {
                                className: isActive ? 'text-tactical-cyan' : 'text-slate-500 group-hover:text-slate-300 transition-colors'
                            })}
                            <span className="ot-nav-tooltip">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Session */}
            <div className="mt-auto w-full px-2 mb-4 flex flex-col items-center gap-4 border-t border-tactical-border pt-4">
                <div className="group relative flex justify-center w-full">
                    <div className="w-10 h-10 rounded-sm bg-slate-800/50 border border-tactical-border flex items-center justify-center text-slate-400 text-xs font-mono font-bold uppercase cursor-help">
                        {(user?.username || 'ADM').substring(0, 2)}
                    </div>
                    <div className="ot-nav-tooltip flex flex-col gap-1 items-start">
                        <span className="text-[10px] text-slate-400">ACTIVE SESSION</span>
                        <span>{user?.username || 'Administrator'}</span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="ot-nav-link group text-tactical-amber border-transparent hover:bg-tactical-amber/10 hover:border-tactical-amber/30"
                >
                    <LogOut size={20} className="text-tactical-amber" />
                    <span className="ot-nav-tooltip !text-tactical-amber !border-tactical-amber/50">TERMINATE</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
