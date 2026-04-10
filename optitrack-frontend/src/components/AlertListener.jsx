import React, { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

const AlertListener = () => {
    const lastAlertId = useRef(new Set());

    const fetchIncidents = async () => {
        try {
            const res = await api.get('/telemetry/incidents/recent');
            const incidents = res.data;

            // Only process the top 3 most recent incidents to prevent HUD overload
            incidents.slice(0, 3).forEach(incident => {
                if (!lastAlertId.current.has(incident.id)) {
                    // Trigger a toast for the new incident
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-4'} max-w-md w-full bg-[#0f172a]/95 backdrop-blur-xl border border-rose-500/30 shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <AlertTriangle size={20} />
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Immediate Alert</p>
                                        <p className="mt-1 text-sm font-bold text-white">
                                            Harsh Braking: {incident.vehicle.licensePlate}
                                        </p>
                                        <p className="mt-1 text-[11px] text-slate-500">
                                            Location: {incident.gpsLatitude.toFixed(4)}, {incident.gpsLongitude.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-slate-800/50">
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="w-full border border-transparent rounded-none rounded-r-3xl p-4 flex items-center justify-center text-xs font-bold text-slate-500 hover:text-white transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ), { duration: 6000 });

                    lastAlertId.current.add(incident.id);
                }
            });

            // Keep only the last 50 IDs to prevent memory leaks
            if (lastAlertId.current.size > 50) {
                const ids = Array.from(lastAlertId.current);
                lastAlertId.current = new Set(ids.slice(-50));
            }
        } catch (error) {
            console.error('Alert Engine Error:', error);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchIncidents, 3000); // Check every 3 seconds
        return () => clearInterval(interval);
    }, []);

    return <Toaster position="top-right" />;
};

export default AlertListener;
