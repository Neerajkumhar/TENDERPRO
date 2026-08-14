import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Calendar,
  Briefcase,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  XCircle,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';

const TenderManagement = ({ onView, onEdit, onCreate, tenders = [], setTenders, clients = [], user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const getClientName = (id) => {
    const client = clients?.find(c => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  // Filtering logic
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(tender.clientId)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || tender.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || tender.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statsData = [
    { label: 'Total Tenders', value: tenders.length, color: 'text-slate-800' },
    { label: 'Active Bids', value: tenders.filter(t => t.status === 'Active').length, color: 'text-blue-600' },
    { label: 'Submitted', value: tenders.filter(t => t.status === 'Submitted' || t.status === 'Registered').length, color: 'text-blue-500' },
    { label: 'Won Tenders', value: tenders.filter(t => t.status === 'Won').length, color: 'text-blue-600' },
    { label: 'Lost Bids', value: tenders.filter(t => t.status === 'Lost').length, color: 'text-rose-500' },
    { label: 'Under Review', value: tenders.filter(t => t.status === 'Under Review' || t.status === 'Pending').length, color: 'text-amber-500' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won': return 'bg-blue-600 text-white';
      case 'Active': return 'bg-blue-500 text-white';
      case 'Registered': return 'bg-indigo-500 text-white';
      case 'Under Review': return 'bg-amber-500 text-white';
      case 'Lost': return 'bg-rose-500 text-white';
      case 'Draft': return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Government': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Private': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PSU': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" size={18} />
            <span>Tenders Management</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Track, manage, and review all tender applications and contracts.</p>
        </div>
        {user?.role !== 'Tender Manager' && (
          <button 
            onClick={onCreate}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
          >
            <Plus size={13} />
            <span>Register Tender</span>
          </button>
        )}
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters & Tenders Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 bg-slate-50/40">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Active Tender Portfolio</h2>
            <p className="text-[8.5px] text-slate-500 font-medium">Search and filter registered contracts</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input 
                type="text" 
                placeholder="Search title, client, ref..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-2.5 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-2xs"
              >
                <option value="All">All Status</option>
                <option value="Registered">Registered</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-2.5 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-2xs"
              >
                <option value="All">All Categories</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="PSU">PSU</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-3.5 py-2">Tender Details</th>
                <th className="px-3.5 py-2">Client</th>
                <th className="px-3.5 py-2">Category</th>
                <th className="px-3.5 py-2">Submission Date</th>
                <th className="px-3.5 py-2 text-right">Budget (₹)</th>
                <th className="px-3.5 py-2 text-center">Status</th>
                <th className="px-3.5 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTenders.length > 0 ? (
                filteredTenders.map((tender) => (
                  <tr 
                    key={tender.id} 
                    className="hover:bg-slate-50/70 transition-all cursor-pointer group"
                    onClick={() => onView(tender.id)}
                  >
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {tender.title?.charAt(0) || 'T'}
                        </div>
                        <div className="min-w-0">
                          <p 
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(tender.id);
                            }}
                            className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight cursor-pointer hover:underline truncate max-w-[220px]"
                          >
                            {tender.title}
                          </p>
                          <p className="text-[8px] font-medium text-slate-400 uppercase mt-0.5">
                            REF: #{tender.reference || tender.id?.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-2 text-[10.5px] font-semibold text-slate-600">
                      {tender.client?.name || getClientName(tender.clientId)}
                    </td>
                    <td className="px-3.5 py-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getCategoryColor(tender.category)}`}>
                        {tender.category || 'General'}
                      </span>
                    </td>
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                        <Calendar size={11} className="text-slate-400 shrink-0" />
                        <span>
                          {tender.submissionDate 
                            ? new Date(tender.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Not Set'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2 text-[11px] font-extrabold text-slate-900 text-right">
                      ₹{parseFloat(tender.budget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3.5 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs ${getStatusColor(tender.status)}`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onView(tender.id)}
                          title="View Details"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                        >
                          <Eye size={13} />
                        </button>
                        <button 
                          onClick={() => onEdit(tender)}
                          title="Edit Tender"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Delete this tender?')) {
                              fetch(`/api/tenders/${tender.id}`, { method: 'DELETE' })
                                .then(res => {
                                  if (res.ok) {
                                    setTenders(prev => prev.filter(t => t.id !== tender.id));
                                  } else {
                                    alert('Failed to delete tender. It may be linked to other records.');
                                  }
                                });
                            }
                          }}
                          title="Delete Tender"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400 italic text-xs font-medium">
                    No tenders found matching your search.
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
