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
  Coffee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User as UserIcon
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

const TenderDashboard = ({ onView, onEdit, onCreate, tenders = [], assignments = [], setTenders, clients, user }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
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

  const fetchLeaveRequests = async () => {
    if (!user?.departmentId) return;
    setLoadingLeaves(true);
    try {
      const response = await fetch(`/api/leave-requests/department/${user.departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleLeaveStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approverId: user?.id })
      });
      if (response.ok) {
        fetchLeaveRequests();
      }
    } catch (err) {
      console.error('Failed to update leave status:', err);
    }
  };

  useEffect(() => {
    if (showLeaveModal) {
      fetchLeaveRequests();
    }
  }, [showLeaveModal]);

  const getClientName = (id) => {
    const client = clients?.find(c => c.id === id);
    return client ? client.name : 'Unknown Client';
  };

  const filteredTenders = tenders.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getClientName(t.clientId)?.toLowerCase().includes(searchQuery.toLowerCase())
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

  function renderLeaveModal() {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)}></div>
        <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col text-left">
          {/* Modal Header */}
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                <Coffee size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Team Leave Requests</h2>
                <p className="text-xs text-slate-500 font-medium italic">Review and manage your department's time-off applications</p>
              </div>
            </div>
            <button 
              onClick={() => setShowLeaveModal(false)}
              className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shadow-sm"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {loadingLeaves ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-[10px] uppercase tracking-widest">Fetching applications...</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 opacity-50">
                <Coffee size={64} strokeWidth={1} />
                <p className="font-black text-[10px] uppercase tracking-widest">No pending leave requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm
                        ${request.status === 'Pending' ? 'bg-amber-500 text-white shadow-amber-100' : 
                          request.status === 'Approved' ? 'bg-emerald-500 text-white shadow-emerald-100' : 
                          'bg-rose-500 text-white shadow-rose-100'}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border-2 border-white shadow-sm overflow-hidden shrink-0">
                        {request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-16">
                        <h4 className="font-black text-slate-900 uppercase tracking-tight truncate">{request.User?.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{request.User?.role}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                          <Calendar size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                          <p className="text-xs font-black text-slate-700">
                            {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                          <AlertCircle size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Type & Reason</p>
                          <p className="text-xs font-bold text-slate-600 italic">
                            <span className="text-slate-900 font-black not-italic">{request.leaveType}: </span>
                            "{request.reason || 'No reason provided'}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {request.status === 'Pending' && (
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => handleLeaveStatusUpdate(request.id, 'Approved')}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLeaveStatusUpdate(request.id, 'Rejected')}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center px-10">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm overflow-hidden">
                         <UserIcon size={14} />
                      </div>
                   ))}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{leaveRequests.filter(r => r.status === 'Pending').length} Pending Reviews</p>
             </div>
             <button 
              onClick={() => setShowLeaveModal(false)}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
             >
               Close Panel
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="flex gap-3 relative" ref={datePickerRef}>
           <button 
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95"
          >
            <Coffee size={18} />
            <span>Leave Requests</span>
          </button>
           <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
           >
              <Calendar size={14} className="text-indigo-600" />
              <span>{new Date(selectedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} />
           </button>

           {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 w-64 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
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

            <div className="lg:col-span-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-wider">Financial Pipeline</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total budget distribution by status</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="flex items-center h-[300px] gap-8">
                 <div className="flex-1 space-y-4">
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
                 <div className="w-1/2 h-full relative flex items-center justify-center">
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
                       <td colSpan="5" className="px-8 py-20 text-center">
                         <p className="text-slate-400 italic font-medium">
                           {user?.role === 'Tender Manager'
                             ? 'No tenders assigned to you yet. Ask your administrator to assign you as a manager on a tender.'
                             : 'No recent tenders found.'}
                         </p>
                       </td>
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
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search title or client..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all w-64 shadow-sm" 
                />
              </div>
              {user?.role !== 'Tender Manager' && (
                <button 
                  onClick={onCreate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Add New Tender
                </button>
              )}
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
                  <tr key={tender.id || i} className="hover:bg-indigo-50/30 transition-all group" onClick={() => onView(tender.id)}>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">#{tender.id?.substring(0, 8)}</td>
                    <td className="px-8 py-5">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(tender.id);
                        }}
                        className="text-sm font-black text-slate-800 hover:text-indigo-600 cursor-pointer hover:underline transition-colors"
                      >
                        {tender.title}
                      </span>
                    </td>
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
                    <td colSpan="7" className="px-8 py-20 text-center">
                      <p className="text-slate-400 italic font-medium">
                        {user?.role === 'Tender Manager'
                          ? 'No tenders are assigned to you. Contact your admin to be assigned as a tender manager.'
                          : 'No tenders found matching your search.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {renderLeaveModal()}
    </div>
  );
};

export default TenderDashboard;
