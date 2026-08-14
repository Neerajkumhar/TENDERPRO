import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  CheckCircle2,
  X,
  User as UserIcon,
  Target,
  BarChart3,
  Trophy,
  Hourglass,
  ArrowRight,
  Eye,
  Edit2,
  MoreVertical,
  Coffee,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

const Dashboard = ({ user, assignments = [], members = [], onProjectClick }) => {
  const [tasks, setTasks] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [sentUnreadCounts, setSentUnreadCounts] = useState({});
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

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;
    try {
      // Received
      const resReceived = await fetch(`/api/messages/${user.id}/unread`);
      if (resReceived.ok) {
        const data = await resReceived.json();
        setUnreadCounts(data);
      }
      // Sent
      const resSent = await fetch(`/api/messages/${user.id}/sent-unread`);
      if (resSent.ok) {
        const data = await resSent.json();
        setSentUnreadCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  const fetchData = async () => {
    try {
      const assignedToParam = user?.role === 'Tender Manager' && user?.id ? `?assignedTo=${user.id}` : '';
      const [tasksRes, tendersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch(`/api/tenders${assignedToParam}`)
      ]);
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
      if (tendersRes.ok) {
        const tendersData = await tendersRes.json();
        setTenders(tendersData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchData();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (showLeaveModal) {
      fetchLeaveRequests();
    }
  }, [showLeaveModal]);

  function renderLeaveModal() {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowLeaveModal(false)}></div>
        <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-xl shadow-xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
          {/* Modal Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Coffee size={14} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Team Leave Requests</h2>
                <p className="text-[8.5px] text-slate-500 font-medium">Review and manage department time-off applications</p>
              </div>
            </div>
            <button 
              onClick={() => setShowLeaveModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {loadingLeaves ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-[9px] uppercase tracking-wider">Fetching applications...</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2 opacity-60">
                <Coffee size={32} strokeWidth={1.5} />
                <p className="font-bold text-[9px] uppercase tracking-wider">No pending leave requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs hover:border-slate-300 transition-all relative overflow-hidden flex flex-col justify-between">
                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider
                        ${request.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                          request.status === 'Approved' ? 'bg-blue-50 text-blue-600' : 
                          'bg-rose-50 text-rose-600'}`}>
                        {request.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 overflow-hidden shrink-0">
                          {request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 pr-14">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight truncate">{request.User?.name}</h4>
                          <p className="text-[8px] text-slate-400 uppercase">{request.User?.role}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-md border border-slate-100">
                          <Calendar size={11} className="text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Duration</span>
                            <span className="text-[10px] font-semibold text-slate-700 block truncate">
                              {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 p-1.5 bg-slate-50 rounded-md border border-slate-100">
                          <AlertCircle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Reason</span>
                            <p className="text-[10px] text-slate-600 line-clamp-2">
                              <span className="font-bold text-slate-800">{request.leaveType}: </span>
                              "{request.reason || 'No reason provided'}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.status === 'Pending' && (
                      <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => handleLeaveStatusUpdate(request.id, 'Approved')}
                          className="flex-1 flex items-center justify-center gap-1 py-1 bg-blue-600 text-white rounded text-[8.5px] font-bold uppercase hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <CheckCircle2 size={11} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLeaveStatusUpdate(request.id, 'Rejected')}
                          className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-rose-200 text-rose-600 rounded text-[8.5px] font-bold uppercase hover:bg-rose-50 active:scale-95 transition-all"
                        >
                          <XCircle size={11} />
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
          <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/40 flex justify-between items-center">
             <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
               {leaveRequests.filter(r => r.status === 'Pending').length} Pending Reviews
             </span>
             <button 
              onClick={() => setShowLeaveModal(false)}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-2xs active:scale-95"
             >
               Close
             </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER TENDER MANAGER DASHBOARD
  if (user.role === 'Tender Manager') {
    const statsData = [
      { label: 'TOTAL TENDERS', value: tenders.length, color: 'slate' },
      { label: 'ACTIVE BIDS', value: tenders.filter(t => t.status === 'Active').length, color: 'blue' },
      { label: 'SUBMITTED', value: tenders.filter(t => t.status === 'Submitted').length, color: 'indigo' },
      { label: 'WON', value: tenders.filter(t => t.status === 'Won' || t.status === 'Completed').length, color: 'blue' },
      { label: 'LOST', value: tenders.filter(t => t.status === 'Lost' || t.status === 'Due').length, color: 'rose' },
      { label: 'APPROVAL PENDING', value: tenders.filter(t => t.status === 'Review' || t.status === 'Draft' || !t.status).length, color: 'amber' },
    ];

    const pipelineData = [
      { name: 'Stage', value: tenders.length },
      { name: 'Submit', value: tenders.filter(t => t.status === 'Submitted').length },
      { name: 'Won', value: tenders.filter(t => t.status === 'Won' || t.status === 'Completed').length },
      { name: 'Lost', value: tenders.filter(t => t.status === 'Lost' || t.status === 'Due').length },
    ];

    const categoryCounts = {};
    tenders.forEach(t => {
      const cat = t.sector || t.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const colors = ['#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#14b8a6', '#f59e0b'];
    const categoryData = Object.keys(categoryCounts).map((cat, idx) => ({
      name: cat.length > 15 ? cat.substring(0, 15) + '...' : cat,
      value: categoryCounts[cat],
      color: colors[idx % colors.length]
    })).sort((a,b) => b.value - a.value).slice(0, 4);

    const recentTenders = [...tenders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

    return (
      <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 animate-in fade-in duration-700 bg-[#fbfcfd]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Tender Overview</h1>
            <p className="text-slate-500 mt-1 font-medium italic text-xs sm:text-sm">Welcome back, {user.name}. Here is your global tender analytics.</p>
          </div>
          <div className="flex gap-2 sm:gap-3 shrink-0">
             <button 
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-amber-500 text-white rounded-xl text-[10px] sm:text-xs font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95"
            >
              <Coffee size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Leave Requests</span>
              <span className="sm:hidden">Leaves</span>
            </button>
             <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
                <Calendar size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Select Period</span>
                <ChevronDown size={14} className="sm:w-4 sm:h-4" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat, i) => (
            <div key={i} className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-[1.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-1">{stat.value}</h3>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase tracking-widest">TENDER PIPELINE</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">DISTRIBUTION ACROSS STAGES</p>
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

          <div className="lg:col-span-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase tracking-widest">VALUE BY CATEGORY</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">CATEGORICAL BREAKDOWN</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center h-auto sm:h-[300px] gap-6 sm:gap-8">
               <div className="w-full sm:flex-1 space-y-4">
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
               <div className="w-full sm:w-1/2 h-[220px] sm:h-full relative flex items-center justify-center">
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
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{tenders.length}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
          <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50">
             <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase">RECENT TENDERS</h3>
             <button className="text-[10px] font-black text-blue-600 tracking-widest uppercase hover:underline">VIEW ALL</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                  <th className="px-8 py-5">TENDER ID</th>
                  <th className="px-8 py-5">CLIENT</th>
                  <th className="px-8 py-5">TITLE</th>
                  <th className="px-8 py-5">VALUE</th>
                  <th className="px-8 py-5">DEADLINE</th>
                  <th className="px-8 py-5">STATUS</th>
                  <th className="px-8 py-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTenders.length > 0 ? recentTenders.map((tender, i) => (
                  <tr key={tender.id || i} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                    <td className="px-8 py-6 text-[11px] font-bold text-slate-500">
                      {tender.tenderNumber || tender.id?.substring(0, 8).toUpperCase() || '310700' + (i+1)}
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-slate-800">
                      {tender.client?.name || tender.issuingAuthority || tender.organization || 'Internal'}
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-slate-800 max-w-[200px] truncate">
                      {tender.title}
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-slate-900 font-black">
                      ₹{parseFloat(tender.budget || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold text-slate-500">
                      {tender.submissionDate ? new Date(tender.submissionDate).toLocaleDateString() : '06/13/2024'}
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit
                        ${tender.status === 'Won' || tender.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 
                          tender.status === 'Lost' || tender.status === 'Due' ? 'bg-rose-50 text-rose-600' :
                          tender.status === 'Active' ? 'bg-blue-50 text-blue-600' : 
                          'bg-indigo-50 text-indigo-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${tender.status === 'Won' || tender.status === 'Completed' ? 'bg-blue-500' : tender.status === 'Lost' || tender.status === 'Due' ? 'bg-rose-500' : tender.status === 'Active' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                        {tender.status || 'DRAFT'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                         <Edit2 size={14} className="text-slate-300 hover:text-blue-600 transition-colors" />
                         <MoreHorizontal size={14} className="text-slate-200 hover:text-slate-400 transition-colors" />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-8 py-10 text-center text-slate-400 italic font-medium">No recent tenders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {renderLeaveModal()}
      </div>
    );
  }

  // DEFAULT PROJECT MANAGER DASHBOARD
  const departmentProjects = user.role === 'Project Manager'
    ? assignments.filter(item => item.assigneeId && String(item.assigneeId) === String(user.id))
    : assignments.filter(item => String(item.departmentId) === String(user.departmentId));

  const projectIds = new Set(departmentProjects.map(p => String(p.id)));
  const departmentTasks = tasks.filter(t => t.assignmentId && projectIds.has(String(t.assignmentId)));

  const stats = [
    { label: 'Total Projects', value: departmentProjects.length, subtext: 'Assigned', color: 'text-slate-900' },
    { label: 'Active Tasks', value: departmentTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done').length, subtext: 'In Progress', color: 'text-blue-600' },
    { label: 'Done Tasks', value: departmentTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length, subtext: 'Completed', color: 'text-blue-600' },
    { label: 'Team Size', value: members.filter(m => m.departmentId === user.departmentId).length, subtext: 'Members', color: 'text-slate-900' },
    { label: 'High Priority', value: departmentTasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length, subtext: 'Critical', color: 'text-rose-600', hasAlert: true },
  ];

  const departmentMembers = members.filter(m => m.departmentId === user.departmentId);

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
          <p className="text-[9px] text-slate-500 font-medium">Welcome back, {user.name}. Department projects and milestone overview.</p>
        </div>
        <div className="flex gap-2">
           {(user.role === 'Project Manager' || user.role === 'Tender Manager' || user.role === 'Finance Manager') && (
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-600 transition-all shadow-2xs active:scale-95"
            >
              <Coffee size={13} />
              <span>Leave Requests</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 5 KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between relative hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            {stat.hasAlert && stat.value > 0 && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 animate-pulse">
                <AlertTriangle size={9} />
              </div>
            )}
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight block leading-none ${stat.color}`}>{stat.value}</span>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-Side Grid: Assigned Projects Overview & Project Status */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Assigned Projects Overview Card */}
        <div className="xl:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-3 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Assigned Projects Overview</h3>
              <MoreHorizontal className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" size={15} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                    <th className="px-3.5 py-2">Project Name</th>
                    <th className="px-3.5 py-2">Status</th>
                    <th className="px-3.5 py-2">Progress %</th>
                    <th className="px-3.5 py-2">Deadline</th>
                    <th className="px-3.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {departmentProjects.length > 0 ? departmentProjects.map((item, i) => {
                    const projectTasks = tasks.filter(t => String(t.assignmentId) === String(item.id));
                    const completedCount = projectTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
                    const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

                    return (
                      <tr key={i} onClick={() => onProjectClick(item.tenderId)} className="group hover:bg-slate-50/70 transition-colors cursor-pointer">
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-1.5">
                            <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                            <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors truncate max-w-[180px]">{item.title || item.tender?.title || 'Unknown Project'}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            item.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 
                              item.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 
                              'bg-amber-50 text-amber-600'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-900 w-6">{progress}%</span>
                            <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-2 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                          {item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No Deadline'}
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <ExternalLink className="text-slate-400 hover:text-blue-600 inline-block" size={13} />
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-400 italic text-xs">No projects assigned to your department.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Project Status Card */}
        <div className="xl:col-span-4 bg-white p-3.5 sm:p-4 rounded-xl shadow-2xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Project Status</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Distribution</p>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Avg Progress</span>
              <span className="text-xs sm:text-sm font-extrabold text-blue-600">
                {departmentProjects.length > 0 ? Math.round(departmentProjects.reduce((acc, p) => {
                  const pTasks = tasks.filter(t => String(t.assignmentId) === String(p.id));
                  return acc + (pTasks.length > 0 ? (pTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length / pTasks.length) * 100 : 0);
                }, 0) / departmentProjects.length) : 0}%
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-between gap-3">
            <div className="h-[140px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Progress', value: departmentProjects.filter(p => p.status === 'In Progress').length, color: '#2563eb' },
                      { name: 'Completed', value: departmentProjects.filter(p => p.status === 'Completed').length, color: '#3b82f6' },
                      { name: 'Pending', value: departmentProjects.filter(p => p.status === 'Pending').length, color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={56}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#2563eb" stroke="none" />
                    <Cell fill="#3b82f6" stroke="none" />
                    <Cell fill="#f59e0b" stroke="none" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">{departmentProjects.length}</span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">{departmentProjects.length === 1 ? 'Project' : 'Projects'}</span>
              </div>
            </div>
            <div className="w-full space-y-1.5">
               {[
                 { label: 'In Progress', count: departmentProjects.filter(p => p.status === 'In Progress').length, color: 'bg-blue-600' },
                 { label: 'Completed', count: departmentProjects.filter(p => p.status === 'Completed').length, color: 'bg-blue-400' },
                 { label: 'Pending', count: departmentProjects.filter(p => p.status === 'Pending').length, color: 'bg-amber-500' }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                       <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                       <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-900">{item.count} <span className="text-[8px] text-slate-400 font-semibold">Projects</span></span>
                 </div>
               ))}
            </div>
          </div>
        </div>

      </div>
      {renderLeaveModal()}
    </div>
  );
};

export default Dashboard;
