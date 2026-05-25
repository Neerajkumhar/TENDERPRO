import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  Flag, 
  DollarSign, 
  ShieldAlert,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  Info,
  IndianRupee,
  Trash2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';





const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ProjectManagement = ({ onProjectClick, onAssignmentClick, tenders, departments, members, assignments, fetchAssignments }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [timeView, setTimeView] = useState('Month');
  const [assignmentData, setAssignmentData] = useState({
    tenderId: '',
    departmentId: '',
    assigneeId: '',
    description: '',
    priority: 'Medium',
    deadline: ''
  });

  const statsData = [
    { label: 'Total Tenders', value: tenders.length, trend: '100%', isUp: true, color: 'slate', icon: Briefcase },
    { label: 'Active Tenders', value: tenders.filter(t => t.status === 'Active' || t.status === 'Registered').length, trend: 'Active', isUp: true, color: 'blue', icon: TrendingUp },
    { label: 'Won Tenders', value: tenders.filter(t => t.status === 'Won').length, trend: 'Won', isUp: true, color: 'emerald', icon: CheckCircle2 },
    { label: 'Total Budget', value: `₹${(tenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0) / 10000000).toFixed(2)}Cr`, trend: 'Valuation', isUp: true, color: 'blue', icon: IndianRupee },
  ];

  const projectStatusData = [
    { name: 'Active', value: tenders.filter(t => t.status === 'Active').length, color: '#3b82f6' },
    { name: 'Won', value: tenders.filter(t => t.status === 'Won').length, color: '#10b981' },
    { name: 'Registered', value: tenders.filter(t => t.status === 'Registered').length, color: '#8b5cf6' },
    { name: 'Other', value: tenders.filter(t => !['Active', 'Won', 'Registered'].includes(t.status)).length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const detailedTimelineData = tenders.slice(0, 5).map((t, i) => ({
    name: t.title,
    start: (new Date(t.createdAt).getMonth() + (new Date(t.createdAt).getDate() / 30)),
    duration: 2 + Math.random() * 4,
    progress: t.status === 'Won' ? 100 : t.status === 'Active' ? 40 : 10,
    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][i % 5],
    milestones: [1, 2], // Dummy milestones for visualization
    status: t.status
  }));

  const teamAllocation = departments.map(dept => ({
    name: `${dept.name} Team`,
    team: dept.name,
    progress: Math.floor(Math.random() * 40) + 60,
    status: 'On Track'
  }));

  const handleAssignmentDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Assignment deleted successfully');
        fetchAssignments();
      } else {
        alert('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('An error occurred');
    }
  };

  const handleAssignmentSubmit = async () => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        alert('Work assigned successfully!');
        setShowProjectModal(false);
        fetchAssignments(); // Refresh the list
        setAssignmentData({
          tenderId: '',
          departmentId: '',
          assigneeId: '',
          description: '',
          priority: 'Medium',
          deadline: ''
        });
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to assign work.');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track progress, timelines, and team allocation across all active projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              id="project-search"
              type="text" 
              placeholder="Search projects..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <Briefcase size={18} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-6 bg-white border-none shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {stat.trend || '12%'}
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Section - Detailed Graph */}
      <div className="card bg-white border-none shadow-xl shadow-slate-200/40 p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Project Timeline Portfolio</h3>
              <p className="text-xs text-slate-400 font-medium italic">Master schedule for all active projects and upcoming milestones.</p>
            </div>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-[1.25rem] gap-1 border border-slate-100">
            {['Day', 'Week', 'Month', 'Quarter'].map(v => (
              <button 
                key={v}
                onClick={() => setTimeView(v)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeView === v ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[1000px]">
          {/* Grid Header */}
          <div className="flex border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
            <div className="w-[200px] flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</span>
            </div>
            <div className="flex-1 grid grid-cols-12 gap-0">
              {months.map(m => (
                <div key={m} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-l border-slate-50">
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid Content */}
          <div className="relative pt-4 space-y-3">
            {/* Current Day Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/30 z-[5] pointer-events-none before:content-['TODAY'] before:absolute before:-top-6 before:-left-4 before:text-[8px] before:font-black before:text-rose-500 before:bg-rose-50 before:px-1.5 before:py-0.5 before:rounded"
              style={{ left: `calc(200px + ${(5.2 / 12) * 100}% )` }}
            >
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full absolute -top-0.5 -left-0.5 shadow-sm"></div>
            </div>

            {detailedTimelineData.map((project, i) => (
              <div key={i} className="flex items-center group relative py-1.5">
                <div className="w-[200px] pr-6">
                  <h4 className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors truncate">{project.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === 'On Track' ? 'bg-emerald-500' : 
                      project.status === 'Critical' ? 'bg-rose-500' : 
                      'bg-blue-500'
                    }`}></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{project.status}</span>
                  </div>
                </div>
                
                <div className="flex-1 relative h-10 bg-slate-50/50 rounded-2xl flex items-center border border-slate-100/50">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="border-l border-slate-100/30 h-full"></div>
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div 
                    className="absolute h-6 rounded-lg shadow-sm hover:scale-y-110 transition-all cursor-pointer relative group/bar"
                    style={{ 
                      left: `${(project.start / 12) * 100}%`, 
                      width: `${(project.duration / 12) * 100}%`,
                      backgroundColor: project.color + '20', // Light bg
                      borderLeft: `3px solid ${project.color}`
                    }}
                  >
                    {/* Progress Bar Inside */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-r-lg opacity-40"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: project.color
                      }}
                    ></div>

                    {/* Milestones */}
                    {project.milestones.map((m, mIdx) => (
                      <div 
                        key={mIdx}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 rounded-full shadow-sm z-10 hover:scale-150 transition-transform"
                        style={{ 
                          left: `${((m - project.start) / project.duration) * 100}%`,
                          borderColor: project.color
                        }}
                      >
                        <div className="hidden group-hover/bar:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded whitespace-nowrap shadow-xl">
                          Milestone {mIdx + 1}
                        </div>
                      </div>
                    ))}

                    {/* Tooltip on Hover */}
                    <div className="absolute opacity-0 group-hover/bar:opacity-100 -top-12 left-1/2 -translate-x-1/2 bg-white border border-slate-100 shadow-2xl p-3 rounded-xl z-20 pointer-events-none transition-all duration-300 w-48 scale-90 group-hover/bar:scale-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-900">{project.name}</span>
                        <span className="text-[9px] font-black text-blue-600">{project.progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Ends in {Math.round(project.duration * 30)} days</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Active Tenders Portfolio */}
        <div className="col-span-12 lg:col-span-6 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Active Tenders Portfolio</h3>
            <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All Projects</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenders.map((tender, i) => (
                  <tr key={tender.id || i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {tender.title.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{tender.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">{tender.client?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">₹{parseFloat(tender.budget || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        tender.status === 'Won' || tender.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onProjectClick(tender.id)}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Tender Work List */}
        <div className="col-span-12 lg:col-span-6 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Assigned Project Work</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{assignments.length} Tasks</span>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.length > 0 ? (
                  assignments.slice(0, 8).map((task, i) => (
                    <tr 
                      key={task.id || i} 
                      onClick={() => onProjectClick(task.tenderId || task.tender?.id)}
                      className="group hover:bg-blue-50/30 transition-all cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-[150px]">
                          <p className="text-xs font-black text-slate-900 truncate">{task.tender?.title || 'Unknown'}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5 line-clamp-1 italic">"{task.description}"</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                          {task.department?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          task.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                          task.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => handleAssignmentDelete(e, task.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-xs italic">No assignments</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Project / Assign Work Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowProjectModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Assigned Project Work</h2>
                  <p className="text-xs text-slate-500 font-medium">Distribute tender preparation tasks to specific teams.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Tender <span className="text-rose-500">*</span></label>
                  <select 
                    value={assignmentData.tenderId}
                    onChange={(e) => setAssignmentData({...assignmentData, tenderId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select active tender</option>
                    {tenders.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Team <span className="text-rose-500">*</span></label>
                  <select 
                    value={assignmentData.departmentId}
                    onChange={(e) => setAssignmentData({...assignmentData, departmentId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {/* Member selection hidden as per new logic: Assign to Dept, then Dept PM handles sub-tasks */}
                {/* 
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Member</label>
                  <select 
                    value={assignmentData.assigneeId}
                    onChange={(e) => setAssignmentData({...assignmentData, assigneeId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select team member</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div> 
                */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Description <span className="text-rose-500">*</span></label>
                  <textarea 
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})}
                    placeholder="Outline the specific tasks for this assignment..." 
                    rows={4} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level <span className="text-rose-500">*</span></label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setAssignmentData({...assignmentData, priority: p})}
                        className={`flex-1 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          assignmentData.priority === p 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Deadline <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={assignmentData.deadline}
                    onChange={(e) => setAssignmentData({...assignmentData, deadline: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/80 flex justify-end gap-4 border-t border-slate-100">
              <button 
                onClick={() => setShowProjectModal(false)}
                className="px-8 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignmentSubmit}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 uppercase tracking-widest"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
