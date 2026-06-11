import React, { useState, useEffect } from 'react';
import { X, Table as TableIcon, ZoomIn, ZoomOut } from 'lucide-react';
import * as XLSX from 'xlsx';

const CsvPreviewModal = ({ url, onClose, fileName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (url) {
      fetchData();
    }
  }, [url]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
              <TableIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">CSV Preview</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-all border border-slate-100 shadow-sm cursor-pointer" title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-black text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-all border border-slate-100 shadow-sm cursor-pointer mr-2" title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 transition-all border border-slate-100 shadow-sm cursor-pointer" title="Close Preview">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-0 overflow-auto flex-1">
          {loading ? (
             <div className="flex justify-center py-32 text-[10px] uppercase tracking-widest text-slate-400 font-black animate-pulse">Loading Document...</div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap" style={{ zoom: zoom }}>
              <thead className="sticky top-0 z-10 shadow-sm">
                {data.length > 0 && (
                  <tr className="bg-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                    {data[0].map((h, i) => <th key={i} className="px-6 py-4 border-b border-slate-200">{h}</th>)}
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.slice(1).map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                    {data[0].map((_, j) => <td key={j} className="px-6 py-3 text-slate-600 font-medium">{row[j]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvPreviewModal;
