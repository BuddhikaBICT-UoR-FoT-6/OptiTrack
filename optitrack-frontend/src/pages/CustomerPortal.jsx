import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { 
    Package, 
    MapPin, 
    CheckCircle2, 
    QrCode, 
    Star, 
    FileText, 
    Download,
    X,
    PenTool,
    Shield,
    Loader2,
    Check
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import toast from 'react-hot-toast';

const CustomerPortal = () => {
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isValidatingQr, setIsValidatingQr] = useState(false);
    const [qrValidated, setQrValidated] = useState(false);
    
    // Mock Customer ID for Demo (In production, this comes from useAuthStore)
    const customerId = 1;

    useEffect(() => {
        fetchShipment();
    }, []);

    const fetchShipment = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/deliveries/customer/${customerId}`);
            // Take the first active or latest delivery for demo
            const activeShipment = response.data.find(d => d.status !== 'DELIVERED') || response.data[0];
            setShipment(activeShipment);
            if (activeShipment?.status === 'DELIVERED') {
                setQrValidated(true);
            }
        } catch (error) {
            console.error("Failed to fetch shipment:", error);
            toast.error("Telemetry Error: Failed to sync shipment data.");
        } finally {
            setLoading(false);
        }
    };

    const handleValidateQr = async () => {
        setIsValidatingQr(true);
        // Simulate QR Scan & Geo-Proximity Validation
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Validating carrier QR & GPS proximity...',
                success: () => {
                    setQrValidated(true);
                    return 'Validation Successful: Secure connection established.';
                },
                error: 'Validation Failed: Unit outside of geo-fence.',
            }
        ).finally(() => setIsValidatingQr(false));
    };

    const handleRate = async () => {
        try {
            await api.post(`/deliveries/${shipment.id}/rate?rating=${rating}&feedback=${feedback}`);
            fetchShipment();
            toast.success("Thank you for your feedback! ⭐", { icon: '👏' });
        } catch (error) {
            toast.error("Sync Error: Failed to submit rating.");
        }
    };

    const handleSaveSignature = async (signatureBase64) => {
        try {
            await api.post(`/deliveries/${shipment.id}/signature`, {
                signature: signatureBase64
            });
            setIsSignatureModalOpen(false);
            // After signature, mark as delivered for demo purposes
            await api.patch(`/deliveries/${shipment.id}/status?status=DELIVERED`);
            fetchShipment();
            toast.success("E-Signature Verified. Digital Waybill Generated!", { icon: '✍️' });
        } catch (error) {
            toast.error("Provisioning Error: Failed to secure signature.");
        }
    };

    const handleDownloadWaybill = async () => {
        try {
            const response = await api.get(`/deliveries/${shipment.id}/waybill`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `waybill_OPT-${shipment.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success("E-Waybill Download Initiated", { icon: '📄' });
        } catch (error) {
            toast.error("Download Error: Failed to retrieve document.");
        }
    };

    if (loading) return (
        <div className="flex h-screen bg-[#0a0a0c] items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        </div>
    );

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="ot-page-container">
                <div className="max-w-6xl mx-auto space-y-10">
                    <header className="flex justify-between items-end">
                        <div>
                            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase">
                                Logistics Portal
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Autonomous Chain of Custody Hub</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                            <Shield className="text-emerald-500" size={18} />
                            <span className="text-xs font-black tracking-widest uppercase text-emerald-400">Vault Secure</span>
                        </div>
                    </header>

                    {shipment ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Operational Tracking */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="ot-card !bg-white/[0.02] border-white/5 !p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full" />
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-blue-600/10 rounded-[24px] border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-600/5 group-hover:scale-105 transition-transform duration-500">
                                                <Package size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                                                    {shipment.packageName}
                                                </h3>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Ref: #OPT-SYC-{shipment.id}</p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            shipment.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {shipment.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {/* High-Fidelity Tracking Timeline */}
                                    <div className="relative pl-10 space-y-12 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-white/5">
                                        <div className="relative animate-in slide-in-from-left-4">
                                            <div className="absolute -left-[36px] p-2 rounded-xl bg-blue-600 shadow-xl shadow-blue-600/30 z-10 border border-white/20">
                                                <Check size={14} className="text-white" />
                                            </div>
                                            <h4 className="font-black text-white text-sm tracking-tight uppercase">Operational Confirmation</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Authenticated at Colombo Hub</p>
                                        </div>
                                        <div className="relative animate-in slide-in-from-left-4 delay-150">
                                            <div className={`absolute -left-[36px] p-2 rounded-xl z-10 border ${shipment.status !== 'PENDING' ? 'bg-blue-600 border-white/20 shadow-xl shadow-blue-600/30' : 'bg-slate-900 border-white/5'}`}>
                                                <MapPin size={14} className="text-white" />
                                            </div>
                                            <h4 className={`font-black text-sm tracking-tight uppercase ${shipment.status !== 'PENDING' ? 'text-white' : 'text-slate-600'}`}>Autonomous Transit</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Carrier en route to destination</p>
                                        </div>
                                        <div className="relative animate-in slide-in-from-left-4 delay-300">
                                            <div className={`absolute -left-[36px] p-2 rounded-xl z-10 border ${shipment.status === 'DELIVERED' ? 'bg-emerald-600 border-white/20 shadow-xl shadow-emerald-600/30' : 'bg-slate-900 border-white/5'}`}>
                                                <CheckCircle2 size={14} className="text-white" />
                                            </div>
                                            <h4 className={`font-black text-sm tracking-tight uppercase ${shipment.status === 'DELIVERED' ? 'text-emerald-400' : 'text-slate-600'}`}>Final Custody Transfer</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Verified & Digitally Endorsed</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Document Vault: Download HUD */}
                                <div className="ot-card !bg-white/[0.02] border-white/5 !p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black flex items-center gap-4 tracking-tighter uppercase">
                                            <FileText className="text-emerald-400" size={24} />
                                            Document Vault
                                        </h3>
                                        <div className="h-px flex-1 bg-white/5 mx-6" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Encrypted AES-256</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-black/40 p-6 rounded-[24px] border border-white/5 group hover:border-blue-500/30 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <FileText size={24} className="text-blue-500 group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">e-Waybill</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{shipment.waybillNumber || 'PENDING SIGNATURE'}</p>
                                                </div>
                                            </div>
                                            {shipment.status === 'DELIVERED' ? (
                                                <button 
                                                    onClick={handleDownloadWaybill}
                                                    className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all border border-blue-500/20"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            ) : (
                                                <div className="p-3 bg-slate-800 text-slate-600 rounded-xl opacity-50 cursor-not-allowed">
                                                    <Download size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-black/40 p-6 rounded-[24px] border border-white/5 group hover:border-indigo-500/30 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <FileText size={24} className="text-indigo-500 group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">Tax Invoice</p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{shipment.invoiceNumber || 'PENDING'}</p>
                                                </div>
                                            </div>
                                            <button className="p-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20">
                                                <Download size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Custody Handover Actions */}
                            <div className="space-y-8">
                                <div className="ot-card !p-8 !bg-white/[0.02] border-white/5">
                                    <h3 className="text-xl font-black mb-8 tracking-tighter uppercase">Transfer Protocol</h3>
                                    <div className="space-y-6">
                                        {!qrValidated ? (
                                            <button 
                                                onClick={handleValidateQr}
                                                disabled={isValidatingQr}
                                                className="w-full py-5 rounded-[24px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-3 font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-indigo-600/20"
                                            >
                                                {isValidatingQr ? <Loader2 className="animate-spin h-5 w-5" /> : <QrCode size={20} />}
                                                Validate Proximity QR
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setIsSignatureModalOpen(true)}
                                                disabled={shipment.status === 'DELIVERED'}
                                                className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-3 font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl ${
                                                    shipment.status === 'DELIVERED' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-none' 
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                                }`}
                                            >
                                                {shipment.status === 'DELIVERED' ? <CheckCircle2 size={20} /> : <PenTool size={20} />}
                                                {shipment.status === 'DELIVERED' ? 'Endorsement Verified' : 'Sign Digital Waybill'}
                                            </button>
                                        )}
                                        
                                        <div className="p-6 bg-black/40 rounded-[24px] border border-white/5 group">
                                            <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black mb-3 ml-1">Manual Unlock Key</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-3xl font-mono font-black tracking-[0.4em] text-blue-400 group-hover:text-blue-300 transition-colors">{shipment.otp}</span>
                                                <ShieldCheck size={28} className="text-slate-800 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Merit Analysis (Rating) */}
                                <div className={`ot-card !p-8 transition-all duration-700 ${shipment.status === 'DELIVERED' ? 'opacity-100 scale-100' : 'opacity-30 pointer-events-none grayscale'}`}>
                                    <h3 className="text-xl font-black mb-6 tracking-tighter uppercase">Service Merit</h3>
                                    <div className="flex gap-3 mb-8">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="transition-all hover:scale-125 active:scale-90"
                                            >
                                                <Star 
                                                    size={32} 
                                                    className={star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "text-slate-800"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold focus:border-blue-500/50 transition-all outline-none h-32 mb-6 placeholder:text-slate-700"
                                        placeholder="Intelligence Report (Optional: Add feedback on unit safety or weather handling)"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleRate}
                                        className="w-full py-4 bg-white/5 hover:bg-blue-600 border border-white/10 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all"
                                    >
                                        Sync Intelligence
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="ot-card text-center py-40 border-dashed border-white/10 bg-transparent">
                            <Package size={64} className="mx-auto text-slate-800 mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter">No Active Shipments Detected</h3>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Operational queue is currently empty</p>
                        </div>
                    )}
                </div>
            </main>

            {/* High-Fidelity Endorsement Modal */}
            {isSignatureModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsSignatureModalOpen(false)} />
                    <div className="relative z-10 w-full max-w-lg">
                        <SignaturePad 
                            onSave={handleSaveSignature}
                            onClear={() => toast('Signature Canvas Purged', { icon: '🧹' })}
                        />
                        <button 
                            onClick={() => setIsSignatureModalOpen(false)}
                            className="absolute -top-4 -right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-slate-500 hover:text-white transition-all shadow-2xl"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPortal;
