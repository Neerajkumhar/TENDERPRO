import React, { useState } from 'react';
import { X, FileText, Download, Calendar } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onExport, title = "Export Report" }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('csv');

  if (!isOpen) return null;

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be after end date.');
      return;
    }
    onExport({ format, startDate, endDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">{title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Select time period and format</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all border border-slate-100 shadow-sm cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'csv', label: 'CSV', desc: 'Raw Data' },
                { id: 'xlsx', label: 'Excel', desc: 'Spreadsheet' },
                { id: 'pdf', label: 'PDF', desc: 'Printable' }
              ].map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setFormat(item.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center
                    ${format === item.id 
                      ? 'border-blue-500 bg-blue-50/20 text-blue-600' 
                      : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200'
                    }`}
                >
                  <FileText size={20} className={format === item.id ? 'text-blue-500' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Download size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
