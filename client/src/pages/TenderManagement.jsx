import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Calendar,
  Briefcase,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const TenderManagement = ({ onView, onEdit, onCreate, tenders = [], setTenders, clients = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');



  // Filtering logic
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || tender.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Lost': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'Active': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Registered': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'Draft': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Government': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Private': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'PSU': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Tenders Management</h1>
          <p className="text-slate-500 mt-1 font-semibold">Register and manage won or upcoming client tenders in real-time</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Register New Tender</span>
        </button>
      </div>



      {/* Filters & Tenders Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/20">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Tender Portfolio</h2>
            <p className="text-xs text-slate-400 font-medium">Search and filter registered contracts</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search title, client, ref..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all shadow-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 outline-none appearance-none cursor-pointer focus:border-blue-400 transition-all shadow-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Active">Active</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-6">Tender Details</th>
                <th className="px-8 py-6">Client</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Submission Date</th>
                <th className="px-8 py-6">Budget</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTenders.length > 0 ? (
                filteredTenders.map((tender) => (
                  <tr 
                    key={tender.id} 
                    className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                    onClick={() => onView(tender.id)}
                  >
                    <td className="px-8 py-6">
                      <div>
                        <p 
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(tender.id);
                          }}
                          className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight cursor-pointer hover:underline"
                        >
                          {tender.title}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          REF: {tender.reference || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500">
                        {tender.client?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getCategoryColor(tender.category)}`}>
                        {tender.category || 'Private'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        <span>
                          {tender.submissionDate 
                            ? new Date(tender.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Not Set'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm font-black text-slate-800">
                        <IndianRupee size={14} className="text-slate-500 mr-0.5" />
                        <span>{parseFloat(tender.budget || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${getStatusColor(tender.status)}`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onView(tender.id)}
                          title="View Details"
                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(tender)}
                          title="Edit Tender"
                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all active:scale-95 shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                        <FileText size={48} />
                      </div>
                      <p className="text-slate-400 font-bold">No tenders found.</p>
                      <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Register a won tender using the button above.</p>
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

export default TenderManagement;
