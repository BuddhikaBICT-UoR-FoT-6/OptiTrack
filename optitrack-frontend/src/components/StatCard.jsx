import React from 'react';

const StatCard = ({ icon, label, value, loading, pulseColor = 'bg-tactical-cyan' }) => (
    <div className="ot-stat-card group">
        <div className="flex items-center justify-between mb-4">
            <div className="ot-stat-icon-container group-hover:bg-slate-800/80">
                {icon}
            </div>
            {loading ? (
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${pulseColor} rounded-full animate-pulse shadow-[0_0_8px_currentColor]`} style={{ color: pulseColor.replace('bg-', '') }}></span>
                    <span className="ot-badge-live">Live</span>
                </div>
            )}
        </div>
        <div>
            <h3 className="ot-stat-label">{label}</h3>
            <p className="ot-stat-value">
                {loading ? "---" : value}
            </p>
        </div>
    </div>
);

export default StatCard;
