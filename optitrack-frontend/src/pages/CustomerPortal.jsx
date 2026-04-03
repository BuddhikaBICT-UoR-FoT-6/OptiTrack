import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
    Package, 
    MapPin, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    ShieldCheck, 
    QrCode, 
    Star, 
    FileText, 
    Download,
    X,
    PenTool,
    Shield
} from 'lucide-react';

const CustomerPortal = () => {
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isVaultOpen, setIsVaultOpen] = useState(false);
    
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Mock Customer ID for Demo
    const customerId = 1;

    useEffect(() => {
        fetchShipment();
    }, []);

    const fetchShipment = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/deliveries/customer/${customerId}`);
            // For demo, we take the first active delivery
            const activeShipment = response.data.find(d => d.status !== 'DELIVERED') || response.data[0];
            setShipment(activeShipment);
        } catch (error) {
            console.error("Failed to fetch shipment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async () => {
        try {
            await axios.post(`http://localhost:8080/api/deliveries/${shipment.id}/rate?rating=${rating}&feedback=${feedback}`);
            fetchShipment();
            alert("Thank you for your feedback! ⭐");
        } catch (error) {
            console.error("Rating failed:", error);
        }
    };

    // --- Signature Logic ---
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const submitSignature = async () => {
        const canvas = canvasRef.current;
        const signatureBase64 = canvas.toDataURL('image/png');
        try {
            await axios.post(`http://localhost:8080/api/deliveries/${shipment.id}/signature`, {
                signature: signatureBase64
            });
            setIsSignatureModalOpen(false);
            fetchShipment();
            alert("E-Signature Verified. e-Waybill generated! ✍️");
        } catch (error) {
            console.error("Signature failed:", error);
        }
    };

    if (loading) return (
        <div className="flex h-screen bg-[#0a0a0c] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen text-white">
            <Sidebar />

            <main className="ot-page-container">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            Shipment Portal
                        </h1>
                        <p className="text-slate-400">Track and manage your autonomous deliveries</p>
                    </header>

                    {shipment ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Tracking & Status */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="ot-card">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Package className="text-blue-500" />
                                                {shipment.packageName}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">ID: #OPT-{shipment.id}</p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            shipment.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {shipment.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {/* Tracking Timeline (Simplified) */}
                                    <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                                        <div className="relative">
                                            <div className="absolute -left-[31px] p-1.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10">
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                            <h4 className="font-semibold text-white">Order Confirmed</h4>
                                            <p className="text-xs text-slate-500">Processing at Sri Lanka Logistics Hub</p>
                                        </div>
                                        <div className="relative">
                                            <div className={`absolute -left-[31px] p-1.5 rounded-full z-10 ${shipment.status !== 'PENDING' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}>
                                                <MapPin size={12} className="text-white" />
                                            </div>
                                            <h4 className={`font-semibold ${shipment.status !== 'PENDING' ? 'text-white' : 'text-slate-600'}`}>Dispatched</h4>
                                            <p className="text-xs text-slate-500">Autonomous Carrier assigned</p>
                                        </div>
                                        <div className="relative">
                                            <div className={`absolute -left-[31px] p-1.5 rounded-full z-10 ${shipment.status === 'DELIVERED' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}>
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                            <h4 className={`font-semibold ${shipment.status === 'DELIVERED' ? 'text-white' : 'text-slate-600'}`}>Delivered</h4>
                                            <p className="text-xs text-slate-500">Destination reached & signed</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Document Vault Section */}
                                <div className="ot-card">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Shield className="text-emerald-500" />
                                            Digital Document Vault
                                        </h3>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-widest">Secure</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#13131a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <FileText className="text-blue-500" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">e-Waybill</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{shipment.waybillNumber || 'PENDING'}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-500">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                        <div className="bg-[#13131a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                                    <FileText className="text-purple-500" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Digital Invoice</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{shipment.invoiceNumber || 'PENDING'}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-purple-500">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions & Signature */}
                            <div className="space-y-6">
                                <div className="ot-card">
                                    <h3 className="text-lg font-bold mb-4">Finalize Reception</h3>
                                    <div className="space-y-4">
                                        <button 
                                            onClick={() => setIsSignatureModalOpen(true)}
                                            disabled={shipment.status === 'DELIVERED'}
                                            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            <PenTool size={18} />
                                            {shipment.status === 'DELIVERED' ? 'Signed & Verified' : 'Sign Digital Waybill'}
                                        </button>
                                        
                                        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-3">Validation Code</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-mono font-bold tracking-[0.3em] text-blue-400">{shipment.otp}</span>
                                                <QrCode size={24} className="text-slate-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Card */}
                                <div className={`ot-card transition-all duration-500 ${shipment.status === 'DELIVERED' ? 'opacity-100 scale-100' : 'opacity-50 pointer-events-none'}`}>
                                    <h3 className="text-lg font-bold mb-4">Rate Service</h3>
                                    <div className="flex gap-2 mb-6">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <Star 
                                                    size={28} 
                                                    className={star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-slate-700"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 transition-colors outline-none h-24 mb-4"
                                        placeholder="Add a comment (weather handling, driver safety, etc.)"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleRate}
                                        className="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="ot-card text-center py-20">
                            <Package size={48} className="mx-auto text-slate-800 mb-4" />
                            <h3 className="text-xl font-bold">No Active Shipments</h3>
                            <p className="text-slate-500">Orders assigned to you will appear here.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Signature Modal */}
            {isSignatureModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSignatureModalOpen(false)} />
                    <div className="ot-card w-full max-w-md relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <PenTool className="text-blue-500" />
                                Digital E-Signature
                            </h3>
                            <button onClick={() => setIsSignatureModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-2 mb-6">
                            <canvas 
                                ref={canvasRef}
                                width={400}
                                height={200}
                                className="w-full h-48 touch-none cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={clearCanvas}
                                className="py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={submitSignature}
                                className="py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                Verify & Sign
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 text-center">
                            By signing, you agree to the paperless digital terms and conditions of OptiTrack Sri Lanka.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPortal;
