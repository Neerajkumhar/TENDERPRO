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
  ArrowRight,
  Plus,
  Award,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getClientName(t.clientId)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats for Overview
  const statsData = [
    { label: 'Total Tenders', value: tenders.length, color: 'text-slate-800' },
    { label: 'Active Bids', value: tenders.filter(t => t.status === 'Active').length, color: 'text-blue-600' },
    { label: 'Submitted', value: tenders.filter(t => t.status === 'Submitted' || t.status === 'Registered').length, color: 'text-blue-500' },
    { label: 'Won', value: tenders.filter(t => t.status === 'Won').length, color: 'text-blue-600' },
    { label: 'Lost', value: tenders.filter(t => t.status === 'Lost').length, color: 'text-rose-500' },
    { label: 'Pending Approvals', value: tenders.filter(t => t.status === 'Pending').length, color: 'text-amber-500' },
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
      Active: monthTenders.filter(t => ['Active', 'Registered', 'Submitted', 'Under Review'].includes(t.status)).length,
    });
  }

  // 2. Rich Financial Pipeline Data & Stage Calculations
  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const wonTenders = tenders.filter(t => t.status === 'Won');
  const activeTenders = tenders.filter(t => t.status === 'Active');
  const reviewTenders = tenders.filter(t => ['Registered', 'Submitted', 'Under Review'].includes(t.status));
  const pendingTenders = tenders.filter(t => t.status === 'Pending' || t.status === 'Draft');
  const lostTenders = tenders.filter(t => t.status === 'Lost');

  const wonVal = wonTenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0);
  const activeVal = activeTenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0);
  const reviewVal = reviewTenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0);
  const pendingVal = pendingTenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0);
  const lostVal = lostTenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0);

  const totalBudgetValue = wonVal + activeVal + reviewVal + pendingVal + lostVal;
  const avgBidValue = tenders.length > 0 ? (totalBudgetValue / tenders.length) : 0;
  const resolvedCount = wonTenders.length + lostTenders.length;
  const winRate = resolvedCount > 0 
    ? Math.round((wonTenders.length / resolvedCount) * 100) 
    : (tenders.length > 0 ? Math.round((wonTenders.length / tenders.length) * 100) : 0);

  const budgetBreakdown = [
    { name: 'Won', label: 'Secured (Won)', count: wonTenders.length, value: wonVal, color: '#2563eb' },
    { name: 'Active', label: 'In Bidding', count: activeTenders.length, value: activeVal, color: '#3b82f6' },
    { name: 'Review', label: 'Under Review', count: reviewTenders.length, value: reviewVal, color: '#6366f1' },
    { name: 'Pending', label: 'Draft / Pending', count: pendingTenders.length, value: pendingVal, color: '#f59e0b' },
    { name: 'Lost', label: 'Lost / Closed', count: lostTenders.length, value: lostVal, color: '#f43f5e' },
  ].filter(item => item.value > 0 || item.count > 0);

  const chartData = budgetBreakdown.length > 0 ? budgetBreakdown : [{ name: 'No Data', label: 'No Data', value: 1, color: '#f1f5f9' }];

  const recentTenders = [...tenders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* View Switcher & Date Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button 
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeView === 'overview' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={13} />
            <span>Overview Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeView === 'list' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText size={13} />
            <span>Tenders Master List</span>
          </button>
        </div>
        <div className="relative w-full sm:w-auto flex justify-end" ref={datePickerRef}>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-100 transition-all active:scale-95"
          >
            <Calendar size={12} className="text-blue-600" />
            <span>{new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            <ChevronDown size={11} className={`transition-transform duration-200 ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-full mt-1.5 p-3 bg-white border border-slate-100 rounded-xl shadow-xl z-50 w-56 animate-in fade-in slide-in-from-top-1">
              <div className="space-y-1.5 text-left">
                <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Select Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setShowDatePicker(false);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {activeView === 'overview' ? (
        <div className="space-y-3.5 sm:space-y-4 animate-in fade-in duration-300">
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {statsData.map((stat, i) => (
              <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* 3 Cards Placed in the Same Plane (Row) with Minimized Horizontal Pipeline Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
            {/* Card 1: Tender Activity Timeline (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[380px]">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Tender Activity Timeline</h3>
                  <p className="text-[8.5px] font-medium text-slate-400 uppercase tracking-wider">Bid outcomes over last 6 months</p>
                </div>
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={13} />
                </div>
              </div>
              <div className="h-[290px] sm:h-[310px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={outcomesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWonAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActiveAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8.5, fontWeight: 700}} dy={3} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8.5, fontWeight: 700}} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 600 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase' }} />
                    <Area type="monotone" dataKey="Won" stackId="1" stroke="#3b82f6" fill="url(#colorWonAdmin)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Active" stackId="1" stroke="#6366f1" fill="url(#colorActiveAdmin)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Lost" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Financial Pipeline (Slimmer Minimized Width: 3 Cols with Richer Insights) */}
            <div className="lg:col-span-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[380px]">
              {/* Header */}
              <div className="flex justify-between items-center mb-1.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Financial Pipeline</h3>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-wider">Budget &amp; Stage Analytics</p>
                </div>
                <div className="w-5.5 h-5.5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BarChart3 size={12} />
                </div>
              </div>

              {/* Mini Quick Metrics Strip */}
              <div className="grid grid-cols-2 gap-1.5 my-1">
                <div className="p-1.5 rounded-lg bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">Avg Ticket</span>
                  <span className="text-[10.5px] font-extrabold text-slate-800 tracking-tight leading-tight">{formatCurrency(avgBidValue)}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-blue-50/50 border border-blue-100/60 flex flex-col justify-between">
                  <span className="text-[7.5px] font-bold text-blue-500 uppercase tracking-wider block">Win Ratio</span>
                  <span className="text-[10.5px] font-extrabold text-blue-600 tracking-tight leading-tight">{winRate}%</span>
                </div>
              </div>
              
              {/* Donut Chart Centered */}
              <div className="w-full h-[115px] relative flex items-center justify-center my-0.5">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={36}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
                  <span className="text-[11px] font-extrabold text-slate-900 leading-tight truncate max-w-[65px]">{totalBudgetValue > 0 ? formatCurrency(totalBudgetValue) : '₹0'}</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">Total Volume</span>
                </div>
              </div>

              {/* Detailed Stage Ledger */}
              <div className="space-y-1.5 w-full pt-1.5 border-t border-slate-100/80 mt-auto">
                {budgetBreakdown.map((cat, i) => {
                  const pct = totalBudgetValue > 0 ? Math.round((cat.value / totalBudgetValue) * 100) : 0;
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[8.5px] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1 min-w-0 truncate">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                          <span className="truncate text-slate-700">{cat.label}</span>
                          <span className="text-[7px] font-bold bg-slate-100 px-1 py-0.2 rounded text-slate-500 shrink-0">
                            {cat.count}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-slate-900 font-extrabold">{formatCurrency(cat.value)}</span>
                          <span className="text-[7.5px] text-slate-400 font-medium">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.color }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Recent Tenders (4 Cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[380px] overflow-hidden">
              <div className="p-3 sm:p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40 shrink-0">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Recent Tenders</h3>
                  <p className="text-[8.5px] font-medium text-slate-400 uppercase tracking-wider">Latest bid activities</p>
                </div>
                <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[8.5px] font-bold text-blue-600 hover:bg-blue-50 transition-all shadow-2xs"
                >
                  <span>View All</span>
                  <ArrowRight size={10} />
                </button>
              </div>

              <div className="divide-y divide-slate-50 overflow-y-auto h-[290px] sm:h-[310px] max-h-[310px] custom-scrollbar flex-1">
                {recentTenders.length > 0 ? recentTenders.map((tender, i) => (
                  <div key={tender.id || i} className="p-2.5 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-2 cursor-pointer group" onClick={() => onView(tender.id)}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {tender.title?.charAt(0) || 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate leading-tight">{tender.title}</p>
                        <p className="text-[8px] text-slate-400 uppercase truncate mt-0.5">{getClientName(tender.clientId)} • Ref: #{tender.id?.substring(0,6)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-right">
                      <div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase tracking-tight ${
                          tender.status === 'Won' ? 'bg-blue-50 text-blue-600' : 
                          tender.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {tender.status}
                        </span>
                        <p className="text-[10px] font-extrabold text-slate-900 leading-tight mt-0.5">₹{parseFloat(tender.budget || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onView(tender.id); }} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded transition-all">
                        <Eye size={12} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center text-slate-400 italic text-xs font-medium flex items-center justify-center h-full">
                    No recent tenders found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Tenders Master List */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden animate-in fade-in duration-300">
          <div className="p-3 sm:p-3.5 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between bg-slate-50/40">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Tenders Master List</h3>
              <p className="text-[9px] text-slate-500 font-medium">All recorded tenders in the system.</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input 
                  type="text" 
                  placeholder="Search title or client..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all w-52 shadow-2xs" 
                />
              </div>
              <button 
                onClick={onCreate}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
              >
                <Plus size={13} />
                <span>Add Tender</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-3.5 py-2">ID</th>
                  <th className="px-3.5 py-2">Tender Title</th>
                  <th className="px-3.5 py-2">Client</th>
                  <th className="px-3.5 py-2">Status</th>
                  <th className="px-3.5 py-2">Due Date</th>
                  <th className="px-3.5 py-2 text-right">Value (₹)</th>
                  <th className="px-3.5 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTenders.length > 0 ? filteredTenders.map((tender, i) => (
                  <tr key={tender.id || i} className="hover:bg-slate-50/70 transition-all cursor-pointer group">
                    <td className="px-3.5 py-2 text-[10px] font-bold text-blue-600">#{tender.id?.substring(0, 8)}</td>
                    <td className="px-3.5 py-2 text-[11px] font-bold text-slate-800">{tender.title}</td>
                    <td className="px-3.5 py-2 text-[10.5px] font-medium text-slate-600">{getClientName(tender.clientId)}</td>
                    <td className="px-3.5 py-2">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider w-fit shadow-2xs
                        ${tender.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                          tender.status === 'Active' ? 'bg-blue-500 text-white' :
                            tender.status === 'Won' ? 'bg-blue-600 text-white' :
                              'bg-amber-500 text-white'}`}>
                        {tender.status}
                      </div>
                    </td>
                    <td className="px-3.5 py-2 text-[10px] font-medium text-slate-500">{tender.submissionDate ? new Date(tender.submissionDate).toLocaleDateString('en-IN') : 'No Date'}</td>
                    <td className="px-3.5 py-2 text-[11px] font-extrabold text-slate-900 text-right">₹{parseFloat(tender.budget || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onView(tender.id)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-md transition-colors" title="View"><Eye size={13} /></button>
                        <button onClick={() => onEdit(tender)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-md transition-colors" title="Edit"><Edit2 size={13} /></button>
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
                        }} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400 italic text-xs font-medium">No tenders found matching your search.</td>
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

export default TenderDashboard;
