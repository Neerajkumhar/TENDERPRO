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

  const fetchData = async () => {
    try {
      const [tasksRes, tendersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/tenders')
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
  }, []);

  useEffect(() => {
    if (showLeaveModal) {
      fetchLeaveRequests();
    }
  }, [showLeaveModal]);

  function renderLeaveModal() {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)}></div>
        <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
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

  // RENDER TENDER MANAGER DASHBOARD
  if (user.role === 'Tender Manager') {
    const statsData = [
      { label: 'TOTAL TENDERS', value: tenders.length, color: 'slate' },
      { label: 'ACTIVE BIDS', value: tenders.filter(t => t.status === 'Active').length, color: 'blue' },
      { label: 'SUBMITTED', value: tenders.filter(t => t.status === 'Submitted').length, color: 'indigo' },
      { label: 'WON', value: tenders.filter(t => t.status === 'Won').length, color: 'emerald' },
      { label: 'LOST', value: tenders.filter(t => t.status === 'Lost').length, color: 'rose' },
      { label: 'APPROVAL PENDING', value: '23', color: 'amber' },
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

    const recentTenders = [...tenders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[#fbfcfd]">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tender Overview</h1>
            <p className="text-slate-500 mt-1 font-medium italic text-sm">Welcome back, {user.name}. Here is your global tender analytics.</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95"
            >
              <Coffee size={18} />
              <span>Leave Requests</span>
            </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
                <Calendar size={18} className="text-indigo-600" />
                <span>Select Period</span>
                <ChevronDown size={16} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statsData.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{stat.value}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
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
                      {tender.id?.substring(0, 8).toUpperCase() || '310700' + (i+1)}
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-slate-800">
                      Client or Department
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
                        ${tender.status === 'Won' ? 'bg-emerald-50 text-emerald-600' : 
                          tender.status === 'Active' ? 'bg-blue-50 text-blue-600' : 
                          'bg-indigo-50 text-indigo-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${tender.status === 'Won' ? 'bg-emerald-500' : tender.status === 'Active' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                        {tender.status === 'Won' ? 'WON' : tender.status === 'Active' ? 'STATUS' : 'PRIMARY'}
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
                    <td colSpan="7" className="px-8 py-20 text-center text-slate-400 italic font-medium">No recent tenders found.</td>
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
  const departmentProjects = assignments.filter(
    item => String(item.departmentId) === String(user.departmentId)
  );

  const stats = [
    { label: 'Total Projects', value: departmentProjects.length, subtext: 'Assigned', color: 'slate' },
    { label: 'Active Tasks', value: tasks.filter(t => t.status !== 'Completed').length, subtext: 'In Progress', color: 'blue' },
    { label: 'Done Tasks', value: tasks.filter(t => t.status === 'Completed').length, subtext: 'Completed', color: 'emerald' },
    { label: 'Team Size', value: members.filter(m => m.departmentId === user.departmentId).length, subtext: 'Members', color: 'slate' },
    { label: 'High Priority', value: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length, subtext: 'Critical', color: 'rose', hasAlert: true },
  ];

  const workloadData = members.filter(m => m.departmentId === user.departmentId).slice(0, 6).map(m => ({
    name: m.name.split(' ')[0],
    active: tasks.filter(t => t.assigneeId === m.id && t.status !== 'Completed').length,
    done: tasks.filter(t => t.assigneeId === m.id && t.status === 'Completed').length
  }));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[#f8fafc] min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Welcome back, {user.name}. Here is your department overview.</p>
        </div>
        <div className="flex gap-3">
           {(user.role === 'Project Manager' || user.role === 'Tender Manager') && (
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95"
            >
              <Coffee size={18} />
              <span>Leave Requests</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative group hover:shadow-xl transition-all duration-500">
            {stat.hasAlert && stat.value > 0 && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 animate-pulse">
                <AlertTriangle size={12} />
              </div>
            )}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
          <h3 className="font-black text-slate-900 text-lg tracking-tight">Active Projects Overview</h3>
          <MoreHorizontal className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-8 py-5">Project Name</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Progress %</th>
                <th className="px-8 py-5">Deadline</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departmentProjects.length > 0 ? departmentProjects.map((item, i) => {
                const projectTasks = tasks.filter(t => t.tenderId === item.tenderId);
                const completedCount = projectTasks.filter(t => t.status === 'Completed').length;
                const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

                return (
                  <tr key={i} onClick={() => onProjectClick(item.tenderId)} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-black text-slate-700">{item.title || item.tender?.title || 'Unknown Project'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                        ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                          item.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                          'bg-amber-100 text-amber-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-slate-900 w-10">{progress}%</span>
                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${progress}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No Deadline'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ExternalLink className="text-slate-300 hover:text-blue-600 inline-block" size={18} />
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic font-medium">No projects assigned to your department.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Team Workload</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Capacity Overview</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-xl">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Done</span>
                 </div>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                          <p className="text-xs font-black text-slate-900 mb-2 uppercase tracking-widest">{payload[0].payload.name}'s Tasks</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                              <span className="text-[10px] font-bold text-slate-500">Active Tasks:</span>
                              <span className="text-[10px] font-black text-blue-600">{payload[0].value}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[10px] font-bold text-slate-500">Completed:</span>
                              <span className="text-[10px] font-black text-emerald-600">{payload[1].value}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="active" name="Active Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="done" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Project Status</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Portfolio Distribution</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Average Progress</span>
              <span className="text-lg font-black text-blue-600">
                {departmentProjects.length > 0 ? Math.round(departmentProjects.reduce((acc, p) => {
                  const pTasks = tasks.filter(t => t.tenderId === p.tenderId);
                  return acc + (pTasks.length > 0 ? (pTasks.filter(t => t.status === 'Completed').length / pTasks.length) * 100 : 0);
                }, 0) / departmentProjects.length) : 0}%
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="h-[250px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Progress', value: departmentProjects.filter(p => p.status === 'In Progress').length || 1, color: '#3b82f6' },
                      { name: 'Completed', value: departmentProjects.filter(p => p.status === 'Completed').length, color: '#10b981' },
                      { name: 'Pending', value: departmentProjects.filter(p => p.status === 'Pending').length, color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" stroke="none" />
                    <Cell fill="#10b981" stroke="none" />
                    <Cell fill="#f59e0b" stroke="none" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
               {[
                 { label: 'In Progress', count: departmentProjects.filter(p => p.status === 'In Progress').length, color: 'blue' },
                 { label: 'Completed', count: departmentProjects.filter(p => p.status === 'Completed').length, color: 'emerald' },
                 { label: 'Pending', count: departmentProjects.filter(p => p.status === 'Pending').length, color: 'amber' }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full bg-${item.color}-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]`}></div>
                       <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.count} <span className="text-[9px] text-slate-400 ml-1">Projects</span></span>
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
