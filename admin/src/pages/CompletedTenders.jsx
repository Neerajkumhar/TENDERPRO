import React, { useState } from 'react';
import {
  FileText,
  Search,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const CompletedTenders = ({ onView, tenders = [], clients = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getClientName = (id) => {
    const client = clients?.find(c => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  // Filter for completed or submitted tenders
  const completedTenders = tenders.filter(t => 
    (t.status === 'Completed' || t.completionStatus === 'Submitted' || t.completionStatus === 'Approved') &&
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     getClientName(t.clientId).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={32} />
            Completed Tenders
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Review and verify finalized tender completion documents.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search finalized tenders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all w-64 shadow-sm focus:ring-4 focus:ring-emerald-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {completedTenders.length > 0 ? completedTenders.map((tender, i) => (
                <tr key={tender.id || i} className="hover:bg-emerald-50/30 transition-all cursor-pointer group">
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">#{tender.id?.substring(0, 8)}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">{tender.title}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{getClientName(tender.clientId)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                      tender.completionStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      tender.completionStatus === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {tender.completionStatus === 'Approved' ? 'Completed' : 'Review Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-500">
                    {tender.submissionDate ? new Date(tender.submissionDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onView(tender.id); }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all inline-flex items-center gap-2"
                      title="Review Completion Docs"
                    >
                      <Eye size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Review</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <CheckCircle2 size={32} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-500">No completed tenders found.</p>
                      <p className="text-xs font-medium text-slate-400">Tenders pending review will appear here once submitted.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompletedTenders;
