import React, { useState } from 'react';
import {
  FileText,
  HelpCircle,
  Clock,
  Trophy,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  X,
  LayoutDashboard,
  Target,
  BarChart3,
  TrendingUp,
  Briefcase,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const TenderDashboard = ({ onView, onEdit, onCreate, tenders = [], setTenders, clients }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'list'

  const getClientName = (id) => {
    const client = clients?.find(c => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  // Stats for Overview (Matching Image 2)
  const statsData = [
    { label: 'Total Tenders', value: tenders.length || '1,245', color: 'slate' },
    { label: 'Active Bids', value: tenders.filter(t => t.status === 'Active').length || '312', color: 'blue' },
    { label: 'Submitted', value: tenders.filter(t => t.status === 'Submitted').length || '458', color: 'indigo' },
    { label: 'Won', value: tenders.filter(t => t.status === 'Won').length || '289', color: 'emerald' },
    { label: 'Lost', value: tenders.filter(t => t.status === 'Lost').length || '163', color: 'rose' },
    { label: 'Approval Pending', value: '23', color: 'amber' },
  ];

  const pipelineData = [
    { name: 'Stage', value: 1000 },
    { name: 'Submit', value: tenders.filter(t => t.status === 'Submitted').length || 312 },
    { name: 'Won', value: tenders.filter(t => t.status === 'Won').length || 450 },
    { name: 'Lost', value: tenders.filter(t => t.status === 'Lost').length || 50 },
  ];

  const categoryData = [
    { name: 'IT services', value: 45, color: '#a855f7' },
    { name: 'Construction', value: 35, color: '#8b5cf6' },
    { name: 'Cleaning', value: 25, color: '#6366f1' },
    { name: 'Infrastructure', value: 15, color: '#3b82f6' },
  ];

  const recentTenders = [...tenders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tab Navigation Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeView === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={16} />
            Overview Dashboard
          </button>
          <button 
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeView === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <FileText size={16} />
            Tenders Master List
          </button>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Calendar size={14} className="text-indigo-600" />
              May 2024
           </button>
        </div>
      </div>

      {activeView === 'overview' ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Stats Grid - Matching Image 2 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statsData.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{stat.value}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row - Matching Image 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">Tender Pipeline</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distribution across stages</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Target size={20} />
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a78bfa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">Value by Category</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Categorical breakdown</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="flex items-center h-[300px] gap-8">
                 <div className="flex-1 space-y-4">
                    {categoryData.map((cat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>{cat.name}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 rounded-full" style={{width: `${cat.value * 2}%`}}></div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="w-1/2 h-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">1.2k</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Recent Tenders Section - ADDED AS REQUESTED */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Recent Tenders</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest bid activities and updates</p>
               </div>
               <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
                >
                  View All
                  <ArrowRight size={14} />
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Tender Details</th>
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Value</th>
                    <th className="px-8 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTenders.length > 0 ? recentTenders.map((tender, i) => (
                    <tr key={tender.id || i} className="hover:bg-indigo-50/20 transition-all cursor-pointer group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {tender.title?.charAt(0) || 'T'}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{tender.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Ref: #{tender.id?.substring(0,8)}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600">{getClientName(tender.clientId)}</td>
                      <td className="px-8 py-6">
                        <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest w-fit shadow-sm
                          ${tender.status === 'Won' ? 'bg-emerald-500 text-white' : 
                            tender.status === 'Active' ? 'bg-indigo-600 text-white' : 
                            'bg-amber-500 text-white'}`}>
                          {tender.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900">₹{parseFloat(tender.budget || 0).toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                           <button onClick={() => onView(tender.id)} className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all">
                              <Eye size={18} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic font-medium">No recent tenders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Active Tenders Master List */
        <div className="card bg-white shadow-xl shadow-slate-200/40 border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase tracking-[0.1em]">Tenders Master List</h3>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400" />
              </div>
              <button 
                onClick={onCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
              >
                Add New Tender
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Tender Title</th>
                  <th className="px-8 py-4">Client</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Due Date</th>
                  <th className="px-8 py-4">Value (₹)</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenders.map((tender, i) => (
                  <tr key={tender.id || i} className="hover:bg-indigo-50/30 transition-all cursor-pointer group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">#{tender.id?.substring(0, 8)}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-800">{tender.title}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-600">{getClientName(tender.clientId)}</td>
                    <td className="px-8 py-5">
                      <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit
                        ${tender.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                          tender.status === 'Active' ? 'bg-blue-100 text-blue-600' :
                            tender.status === 'Won' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-amber-100 text-amber-600'}`}>
                        {tender.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{tender.submissionDate ? new Date(tender.submissionDate).toLocaleDateString() : 'No Date'}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">₹{parseFloat(tender.budget || 0).toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onView(tender.id)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"><Eye size={16} /></button>
                        <button onClick={() => onEdit(tender)} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => {
                          if(window.confirm('Delete this tender?')) {
                            fetch(`/api/tenders/${tender.id}`, { method: 'DELETE' })
                              .then(() => setTenders(prev => prev.filter(t => t.id !== tender.id)));
                          }
                        }} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderDashboard;
