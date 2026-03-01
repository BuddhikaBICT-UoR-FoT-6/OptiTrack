import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { Package, MapPin, Clock, Star, CheckCircle, Send } from 'lucide-react';

const CustomerPortal = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingId, setRatingId] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [feedback, setFeedback] = useState('');

    const customerId = 1; // Mock customer ID for demonstration

    const fetchMyDeliveries = async () => {
        try {
            const res = await axios.get(`/customer/deliveries/${customerId}`);
            setDeliveries(res.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyDeliveries();
    }, []);

    const handleRateDelivery = async (id) => {
        try {
            await axios.post(`/deliveries/${id}/rating`, {
                rating: ratingValue,
                feedback: feedback
            });
            setRatingId(null);
            setRatingValue(5);
            setFeedback('');
            fetchMyDeliveries();
        } catch (error) {
            console.error('Rating failed:', error);
        }
    };

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            My Shipments
                        </h1>
                        <p className="text-slate-400 mt-2">Track and manage your active deliveries across the island</p>
                    </header>

                    <div className="grid gap-6">
                        {loading ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl py-20 text-center text-slate-500">Syncing with logistics core...</div>
                        ) : deliveries.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-3xl py-20 text-center text-slate-500">No active shipments found.</div>
                        ) : deliveries.map((d) => (
                            <div key={d.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl group hover:border-blue-500/30 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                                            <Package size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{d.packageName}</h3>
                                            <p className="text-slate-500 font-mono text-sm">ID: {d.id} • {d.deliveryType}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            d.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            d.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                        }`}>
                                            {d.status}
                                        </span>
                                        {d.priority === 'CRITICAL' && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-slate-500" size={18} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Destination</p>
                                            <p className="text-sm font-medium">{d.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-slate-500" size={18} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Arrival</p>
                                            <p className="text-sm font-medium">{d.estimatedArrivalTime || 'Awaiting Sync'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-slate-500" size={18} />
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Assigned</p>
                                            <p className="text-sm font-medium">{d.vehicle?.licensePlate || 'Processing...'}</p>
                                        </div>
                                    </div>
                                </div>

                                {d.status === 'DELIVERED' && !d.userRating && (
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <button 
                                            onClick={() => setRatingId(d.id)}
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-blue-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Star size={16} /> Rate this Delivery
                                        </button>
                                    </div>
                                )}

                                {d.userRating && (
                                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
                                        <Star className="text-amber-400" size={16} fill="currentColor" />
                                        <span className="text-slate-400 text-sm font-bold">You rated this {d.userRating}/5</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rating Modal */}
                {ratingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#111114] w-full max-w-md p-8 rounded-[32px] border border-blue-500/30 shadow-2xl scale-in-center">
                            <h2 className="text-2xl font-bold mb-2">Share your experience</h2>
                            <p className="text-slate-500 text-sm mb-8">Your feedback helps us maintain high-fidelity service quality.</p>
                            
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star}
                                        onClick={() => setRatingValue(star)}
                                        className={`transition-all ${ratingValue >= star ? 'text-amber-400 scale-125' : 'text-slate-700 hover:text-slate-500'}`}
                                    >
                                        <Star size={32} fill={ratingValue >= star ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>

                            <textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Any additional comments on the driver or delivery speed?"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-6 h-32 resize-none"
                            />

                            <div className="flex gap-4">
                                <button onClick={() => setRatingId(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all">Cancel</button>
                                <button onClick={() => handleRateDelivery(ratingId)} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                                    <Send size={18} /> Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerPortal;
