import React, { useState, useEffect, useRef } from 'react';
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
  AreaChart,
  Area,
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

const TenderManagement = ({ onView, onEdit, onCreate, tenders = [], assignments = [], setTenders, clients }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'list'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getClientName = (id) => {
    const client = clients?.find(c => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  const filteredTenders = tenders.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(t.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsData = [
    { label: 'Total Tenders', value: tenders.length, color: 'slate' },
    { label: 'Active Bids', value: tenders.filter(t => t.status === 'Active').length, color: 'blue' },
    { label: 'Registered', value: tenders.filter(t => t.status === 'Registered').length, color: 'indigo' },
    { label: 'Total Projects', value: assignments?.length || 0, color: 'emerald' },
    { label: 'Completed Projects', value: assignments?.filter(a => a.status === 'Completed').length || 0, color: 'teal' },
    { label: 'Completed Tenders', value: tenders.filter(t => t.status === 'Completed').length, color: 'amber' },
  ];

  // 1. Tender Outcomes Over Time (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const outcomesData = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const monthTenders = tenders.filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    outcomesData.push({
      name: `${monthNames[month]}`,
      Won: monthTenders.filter(t => t.status === 'Won').length,
      Lost: monthTenders.filter(t => t.status === 'Lost').length,
      Active: monthTenders.filter(t => ['Active', 'Registered', 'Under Review'].includes(t.status)).length,
    });
  }

  // 2. Budget Distribution by Status
  const budgetByStatus = [
    { name: 'Secured (Won)', value: tenders.filter(t => t.status === 'Won').reduce((acc, t) => acc + parseFloat(t.budget || 0), 0), color: '#10b981' }, // emerald-500
    { name: 'In Pipeline (Active)', value: tenders.filter(t => ['Active', 'Registered', 'Under Review'].includes(t.status)).reduce((acc, t) => acc + parseFloat(t.budget || 0), 0), color: '#6366f1' }, // indigo-500
    { name: 'Lost', value: tenders.filter(t => t.status === 'Lost').reduce((acc, t) => acc + parseFloat(t.budget || 0), 0), color: '#f43f5e' }, // rose-500
    { name: 'Drafts', value: tenders.filter(t => t.status === 'Draft').reduce((acc, t) => acc + parseFloat(t.budget || 0), 0), color: '#94a3b8' } // slate-400
  ].filter(item => item.value > 0);

  if (budgetByStatus.length === 0) {
    budgetByStatus.push({ name: 'No Data', value: 1, color: '#f1f5f9' });
  }

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const totalBudgetValue = budgetByStatus.reduce((acc, item) => item.name !== 'No Data' ? acc + item.value : acc, 0);

  const recentTenders = [...tenders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeView === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={16} />
            Overview
          </button>
          <button 
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeView === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <FileText size={16} />
            Master List
          </button>
        </div>
        <div className="flex gap-3 relative self-end sm:self-auto" ref={datePickerRef}>
           <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
           >
              <Calendar size={14} className="text-indigo-600" />
              <span>{new Date(selectedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} />
           </button>

           {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setShowDatePicker(false);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      {activeView === 'overview' ? (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Stats Grid - Matching Image 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {statsData.map((stat, i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">{stat.value}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row - Matching Image 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">Tender Activity Timeline</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bid outcomes over last 6 months</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={outcomesData}>
                    <defs>
                      <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dx={-10} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                      labelStyle={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                    <Area type="monotone" dataKey="Won" stackId="1" stroke="#10b981" fill="url(#colorWon)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Active" stackId="1" stroke="#6366f1" fill="url(#colorActive)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Lost" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">Financial Pipeline</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total budget distribution by status</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center h-auto sm:h-[300px] gap-6 sm:gap-8">
                 <div className="w-full sm:flex-1 space-y-4">
                    {budgetByStatus.map((cat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest" style={{ color: cat.color }}>
                          <span>{cat.name}</span>
                          <span className="text-slate-800">{cat.name === 'No Data' ? '-' : formatCurrency(cat.value)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full rounded-full transition-all duration-1000" style={{width: `${totalBudgetValue > 0 ? (cat.value / totalBudgetValue) * 100 : 0}%`, backgroundColor: cat.color}}></div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="w-full sm:w-1/2 h-[200px] sm:h-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={budgetByStatus}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {budgetByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">{totalBudgetValue > 0 ? formatCurrency(totalBudgetValue) : '₹0'}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Value</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Recent Tenders Section - ADDED AS REQUESTED */}
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
            <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/20">
               <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Recent Tenders</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest bid activities and updates</p>
               </div>
               <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm active:scale-95 self-end sm:self-auto"
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
        <div className="card bg-white shadow-xl shadow-slate-200/40 border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl">
          <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase tracking-[0.1em]">Active Tenders Master List</h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search title or client..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all w-full shadow-sm" 
                />
              </div>
              <button 
                onClick={onCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
              >
                Add New
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
                {filteredTenders.length > 0 ? filteredTenders.map((tender, i) => (
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
                              .then(res => {
                                if (res.ok) {
                                  setTenders(prev => prev.filter(t => t.id !== tender.id));
                                } else {
                                  alert('Failed to delete tender. It may be linked to other records.');
                                }
                              });
                          }
                        }} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center text-slate-400 italic font-medium">No tenders found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderManagement;
