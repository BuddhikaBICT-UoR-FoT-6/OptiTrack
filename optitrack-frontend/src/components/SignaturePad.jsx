import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle, RotateCcw, PenTool } from 'lucide-react';

const SignaturePad = ({ onSave, onClear }) => {
  const sigCanvas = useRef(null);

  const clear = () => {
    sigCanvas.current.clear();
    if (onClear) onClear();
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first! ✍️");
      return;
    }
    const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataURL);
  };

  return (
    <div className="bg-[#111114] border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400">
            <PenTool size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Customer Endorsement</h3>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Digital E-Waybill Signature</p>
          </div>
        </div>
        <button 
          onClick={clear}
          className="p-3 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-xl transition-all border border-white/5"
          title="Clear Canvas"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-crosshair group relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity">
          <p className="text-white text-xs font-bold tracking-[0.4em] uppercase">Sign Here</p>
        </div>
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#3b82f6"
          canvasProps={{
            className: "w-full h-48",
            style: { width: '100%', height: '192px' }
          }}
        />
      </div>

      <div className="flex gap-4">
        <button 
          onClick={save}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
        >
          <CheckCircle size={18} />
          Finalize & Sync Waybill
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
