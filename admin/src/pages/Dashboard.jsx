import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MoreHorizontal, 
  ExternalLink,
  Clock,
  FileText,
  IndianRupee,
  Briefcase,
  Users,
  ChevronDown,
  ChevronRight,
  Coffee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  X,
  Target
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = ({ user, members = [], assignments = [], onProjectClick }) => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [sentUnreadCounts, setSentUnreadCounts] = useState({});
  const [tenders, setTenders] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashFlow: 0,
    outstandingDues: 0,
    pendingCount: 0,
    paidCount: 0,
    overdueCount: 0
  });
  const [revenueVsExpenseData, setRevenueVsExpenseData] = useState([]);
  const [tenderOverviewData, setTenderOverviewData] = useState([]);
  
  const datePickerRef = useRef(null);

  const fetchData = async () => {
    try {
      const [tendersRes, statsRes, chartRes] = await Promise.all([
        fetch('/api/tenders'),
        fetch('/api/invoices/stats'),
        fetch('/api/invoices/chart-data')
      ]);
      
      if (tendersRes.ok) {
        const data = await tendersRes.json();
        setTenders(data);
        
        // Process tender overview data (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6 = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthIdx = d.getMonth();
          const year = d.getFullYear();
          const count = data.filter(t => {
            const td = new Date(t.createdAt);
            return td.getMonth() === monthIdx && td.getFullYear() === year;
          }).length;
          const wonCount = data.filter(t => {
            const td = new Date(t.createdAt);
            return td.getMonth() === monthIdx && td.getFullYear() === year && (t.status === 'Won' || t.status === 'Completed');
          }).length;
          last6.push({ name: months[monthIdx], created: count, won: wonCount });
        }
        setTenderOverviewData(last6);
      }
      
      if (statsRes.ok) {
        setFinancialStats(await statsRes.json());
      }

      if (chartRes.ok) {
        setRevenueVsExpenseData(await chartRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;
    try {
      const resReceived = await fetch(`/api/messages/${user.id}/unread`);
      if (resReceived.ok) setUnreadCounts(await resReceived.json());
      const resSent = await fetch(`/api/messages/${user.id}/sent-unread`);
      if (resSent.ok) setSentUnreadCounts(await resSent.json());
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

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
    setLoadingLeaves(true);
    try {
      const url = user?.role === 'Admin' ? '/api/leave-requests' : `/api/leave-requests/department/${user?.departmentId}`;
      const response = await fetch(url);
      if (response.ok) setLeaveRequests(await response.json());
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
      if (response.ok) fetchLeaveRequests();
    } catch (err) {
      console.error('Failed to update leave status:', err);
    }
  };

  useEffect(() => {
    if (showLeaveModal) fetchLeaveRequests();
  }, [showLeaveModal]);

  const statsData = [
    { label: 'Total Tenders', value: String(tenders.length), trend: '+ 12%', isUp: true, color: 'blue' },
    { label: 'Active Tenders', value: String(tenders.filter(t => t.status === 'Active' || t.status === 'Registered').length), trend: '+ 8%', isUp: true, color: 'green' },
    { label: 'Pending Apps', value: String(tenders.filter(t => t.status === 'Draft' || t.status === 'Pending').length), trend: '+ 5%', isUp: true, color: 'amber' },
    { label: 'Due Today', value: String(tenders.filter(t => t.submissionDate && new Date(t.submissionDate).toDateString() === new Date().toDateString()).length), trend: 'Real', isUp: false, color: 'red' },
    { label: 'Total Revenue', value: `₹${financialStats.totalRevenue.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'emerald' },
    { label: 'Outstanding', value: `₹${financialStats.outstandingDues.toLocaleString('en-IN')}`, trend: 'Active', isUp: false, color: 'orange' },
  ];

  const financialSnapshotData = [
    { name: 'Received', value: financialStats.totalRevenue, color: '#3b82f6' },
    { name: 'Outstanding', value: financialStats.outstandingDues, color: '#fbbf24' },
    { name: 'Expenses', value: financialStats.totalExpenses, color: '#ef4444' },
    { name: 'Net Profit', value: Math.max(0, financialStats.netProfit), color: '#10b981' },
  ];

  const teamWorkloadData = members.slice(0, 5).map(member => {
    const memberTasks = assignments.filter(a => a.assigneeId === member.id).length;
    const workload = Math.min(Math.floor((memberTasks / 10) * 100), 100);
    return { id: member.id, name: member.name, tasks: memberTasks, workload, image: member.image, status: member.status };
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto overflow-x-hidden text-left">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name || 'Admin'}!</h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm sm:text-base uppercase tracking-widest">Enterprise Tender Operations Dashboard</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <button onClick={() => setShowLeaveModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95 whitespace-nowrap"><Coffee size={18} /><span>Leave Requests</span></button>
          <div className="relative flex-1 sm:flex-none" ref={datePickerRef}>
            <button onClick={() => setShowDatePicker(!showDatePicker)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95 whitespace-nowrap"><Calendar size={18} className="text-blue-500" /><span>{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><ChevronDown size={16} className={`transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} /></button>
            {showDatePicker && (<div className="absolute right-0 sm:right-auto sm:left-0 xl:right-0 xl:left-auto mt-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 w-64 animate-in fade-in slide-in-from-top-2"><input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setShowDatePicker(false); }} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400" /></div>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-5 sm:p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden bg-white border-none shadow-lg shadow-slate-200/50">
            <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color === 'blue' ? 'blue' : stat.color === 'green' ? 'emerald' : stat.color === 'amber' ? 'amber' : stat.color === 'red' ? 'rose' : stat.color === 'emerald' ? 'emerald' : 'orange'}-500`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner"><FileText size={20} /></div>
              <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-black ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{stat.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}<span>{stat.trend}</span></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight truncate">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <TrendingUp size={120} />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 text-left">
            <div><h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase tracking-wider">Financial Performance</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Monthly billing vs collection vs spending</p></div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue (Billed)</span></div>
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment (Cash)</span></div>
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-lg shadow-rose-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expense</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueVsExpenseData}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient><linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} /><Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" /><Area type="monotone" dataKey="payment" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPay)" /><Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 text-left">
            <div><h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase tracking-wider">Tender Trends</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Win/Loss ratio overview</p></div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg shadow-blue-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Created</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Won</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={tenderOverviewData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} /><Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} /><Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="card col-span-1 xl:col-span-2 overflow-hidden bg-white border-none shadow-xl shadow-slate-200/40">
          <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/20 text-left">
            <div><h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase tracking-wider italic">Recent Tenders</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Application monitoring log</p></div>
            <button className="w-full sm:w-auto bg-white text-blue-600 px-6 py-2.5 rounded-xl text-[10px] font-black shadow-sm border border-slate-100 hover:border-blue-200 transition-all uppercase tracking-widest active:scale-95">View all</button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead><tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><th className="px-8 py-5">ID</th><th className="px-8 py-5">Tender Name</th><th className="px-8 py-5">Client</th><th className="px-8 py-5 text-right">Value</th><th className="px-8 py-5 text-center">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {tenders.slice(0, 6).map((t, i) => (
                  <tr key={i} className="hover:bg-blue-50/20 transition-all cursor-pointer group" onClick={() => onProjectClick && onProjectClick(t.id)}>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400">#{t.id.slice(0,6).toUpperCase()}</td>
                    <td className="px-8 py-6"><p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate max-w-[250px]">{t.title}</p><p className="text-[9px] text-slate-400 font-black mt-1 uppercase tracking-widest">Due: {t.submissionDate ? new Date(t.submissionDate).toLocaleDateString() : 'N/A'}</p></td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-600 uppercase">{t.client?.name || 'GENERIC CLIENT'}</td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900 text-right italic">₹{parseFloat(t.budget || 0).toLocaleString()}</td>
                    <td className="px-8 py-6"><div className={`mx-auto w-fit px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${t.status === 'Won' || t.status === 'Completed' ? 'bg-emerald-500 text-white' : t.status === 'Active' || t.status === 'Registered' ? 'bg-blue-600 text-white' : 'bg-rose-50 text-white'}`}>{t.status}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card bg-white border-none shadow-xl shadow-slate-200/40 p-6 sm:p-8 flex flex-col h-full lg:max-h-[520px] text-left">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50"><div><h3 className="font-black text-slate-900 text-lg tracking-tight uppercase tracking-wider">Team Capacity</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Live workload tracking</p></div><MoreHorizontal className="text-slate-400 cursor-pointer" size={18} /></div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {teamWorkloadData.map((member, i) => (
              <div key={i} className="group cursor-pointer p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative shrink-0">{member.image ? <img src={member.image} className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform object-cover" alt="" /> : <div className="w-11 h-11 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform"><User size={20} /></div>}<div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <div className="absolute -top-2 -right-2 flex flex-col gap-0.5 z-10">{unreadCounts[member.id] > 0 && <div className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce">{unreadCounts[member.id]}</div>}</div></div>
                  <div className="flex-1 min-w-0"><h4 className="font-black text-slate-800 text-sm tracking-tight truncate uppercase">{member.name}</h4><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{member.tasks} Active Items</p></div>
                  <span className={`text-xs font-black italic ${member.workload > 75 ? 'text-rose-500' : 'text-slate-900'}`}>{member.workload}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className={`h-full rounded-full transition-all duration-1000 ease-out ${member.workload > 75 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : member.workload > 50 ? 'bg-blue-600' : 'bg-emerald-500'}`} style={{width: `${member.workload}%`}}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLeaveModal(false)}></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><div className="flex items-center gap-4"><div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200 shrink-0"><Coffee size={24} className="w-5 h-5 sm:w-6 sm:h-6" /></div><div className="min-w-0"><h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">Team Leave Requests</h2><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70 truncate">Manage department time-off apps</p></div></div><button onClick={() => setShowLeaveModal(false)} className="p-2 sm:p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shadow-sm shrink-0"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar">
              {loadingLeaves ? (<div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="font-black text-[10px] uppercase tracking-widest">Fetching applications...</p></div>) : leaveRequests.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 opacity-50"><Coffee size={64} strokeWidth={1} /><p className="font-black text-[10px] uppercase tracking-widest">No pending leave requests found</p></div>) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-200 transition-all group relative overflow-hidden">
                      <div className="absolute top-5 right-5 sm:top-6 sm:right-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${request.status === 'Pending' ? 'bg-amber-500 text-white shadow-amber-100' : request.status === 'Approved' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-rose-50 text-white shadow-rose-100'}`}>{request.status}</span></div>
                      <div className="flex items-start gap-4 mb-6 text-left"><div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border-2 border-white shadow-sm overflow-hidden shrink-0">{request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0].toUpperCase()}</div><div className="min-w-0 pr-16"><h4 className="font-black text-slate-900 uppercase tracking-tight truncate">{request.User?.name}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{request.User?.role}</p></div></div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-left"><div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm shrink-0"><Calendar size={16} /></div><div className="flex-1 min-w-0"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p><p className="text-[11px] font-black text-slate-700 truncate">{new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div></div>
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 h-24 sm:h-28 text-left"><div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm shrink-0"><AlertCircle size={16} /></div><div className="flex-1 min-w-0 overflow-y-auto pr-1 custom-scrollbar text-left"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Type & Reason</p><p className="text-[11px] font-bold text-slate-600 italic"><span className="text-slate-900 font-black not-italic uppercase tracking-tighter mr-1">{request.leaveType}:</span>"{request.reason || 'No reason provided'}"</p></div></div>
                      </div>
                      {request.status === 'Pending' && (<div className="flex gap-3 mt-6"><button onClick={() => handleLeaveStatusUpdate(request.id, 'Approved')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"><CheckCircle2 size={14} />Approve</button><button onClick={() => handleLeaveStatusUpdate(request.id, 'Rejected')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95"><XCircle size={14} />Reject</button></div>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 sm:px-10 shrink-0"><div className="flex items-center gap-4"><div className="flex -space-x-3">{[1,2,3].map(i => (<div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm overflow-hidden shrink-0"><User size={14} /></div>))}</div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{leaveRequests.filter(r => r.status === 'Pending').length} Pending Reviews</p></div><button onClick={() => setShowLeaveModal(false)} className="w-full sm:w-auto px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">Close Panel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
