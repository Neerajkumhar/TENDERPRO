import React from 'react';
import { X, FileText } from 'lucide-react';

const PdfPreviewModal = ({ url, onClose, fileName }) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shadow-sm">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">PDF Preview</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 transition-all border border-slate-100 shadow-sm cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-0 flex-1 w-full h-full bg-slate-100">
          <iframe 
            src={`${url}#toolbar=0`} 
            title={fileName}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
