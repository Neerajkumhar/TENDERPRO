import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const TenderCompletionModal = ({ tender, onClose, onSubmit }) => {
  const [files, setFiles] = useState({
    deliveryChallan: null,
    ewayBill: null,
    invoice: null,
    installationChallan: null,
    noc: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const documentLabels = {
    deliveryChallan: 'Delivery Challan',
    ewayBill: 'E-way Bill',
    invoice: 'Invoice',
    installationChallan: 'Installation Challan',
    noc: 'NOC (No Objection Certificate)'
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    const missing = Object.keys(documentLabels).filter(key => !files[key]);
    if (missing.length > 0) {
      setError(`Please upload all required documents: ${missing.map(m => documentLabels[m]).join(', ')}`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const urls = {};
      for (const key of Object.keys(files)) {
        urls[key] = await uploadFile(files[key]);
      }

      const response = await fetch(`/api/tenders/${tender.id}/submit-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: urls })
      });

      if (!response.ok) throw new Error('Failed to submit completion documents');
      
      onSubmit();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tender Completion</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Upload required documents for admin review</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-rose-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {Object.keys(documentLabels).map((key) => (
              <div key={key} className="relative group">
                <div className={`p-5 rounded-3xl border-2 border-dashed transition-all flex items-center justify-between ${
                  files[key] ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:border-blue-300'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-sm ${
                      files[key] ? 'bg-white text-emerald-500' : 'bg-white text-slate-400'
                    }`}>
                      {files[key] ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{documentLabels[key]}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                        {files[key] ? files[key].name : 'Required PDF/Image'}
                      </p>
                    </div>
                  </div>

                  <label className={`cursor-pointer px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    files[key] 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'
                  }`}>
                    {files[key] ? 'Change File' : 'Upload File'}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, key)}
                      accept=".pdf,image/*"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
            Cancel
          </button>
          <button 
            disabled={uploading}
            onClick={handleSubmit}
            className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading Documents...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Submit for Completion</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenderCompletionModal;
