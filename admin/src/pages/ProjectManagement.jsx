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
  Trash2,
  UserPlus,
  X
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
  const [searchTerm, setSearchTerm] = useState('');
  const [timeView, setTimeView] = useState('Month');
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    tenderId: '',
    departmentId: '',
    assigneeId: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    status: 'Pending'
  });

  const filteredTenders = tenders.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          title: '',
          tenderId: '',
          departmentId: '',
          assigneeId: '',
          description: '',
          priority: 'Medium',
          deadline: '',
          status: 'Pending'
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium italic">Track progress, timelines, and team allocation across all active projects.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              id="project-search"
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95 uppercase tracking-widest whitespace-nowrap"
          >
            <Briefcase size={18} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-4 sm:p-6 bg-white border-none shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all group cursor-pointer flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                <stat.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {stat.trend || '12%'}
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>



      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        {/* Active Project Portfolio */}
        <div className="col-span-12 lg:col-span-6 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Active Project Portfolio</h3>
            <button className="text-[10px] sm:text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All Projects</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender Manager</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssignments.length > 0 ? filteredAssignments.map((assignment, i) => (
                  <tr key={assignment.id || i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => onProjectClick(assignment.tenderId || assignment.tender?.id, assignment.id)}>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                          {(assignment.title || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">{assignment.title || 'Untitled Project'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      {(() => {
                        const manager = tenders.find(t => t.id === (assignment.tenderId || assignment.tender?.id))?.teamMembers?.manager;
                        return manager ? (
                          <div className="flex flex-col min-w-[100px]">
                            <span className="text-xs font-bold text-slate-800 leading-tight">{manager.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{manager.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">Unassigned</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{assignment.tender?.client?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">₹{parseFloat(assignment.tender?.budget || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${assignment.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectClick(assignment.tenderId || assignment.tender?.id, assignment.id);
                        }}
                        className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs italic">No matching projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Tender Work List */}
        <div className="col-span-12 lg:col-span-6 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Assigned Project Work</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{filteredAssignments.length} Tasks</span>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.slice(0, 8).map((task, i) => (
                    <tr
                      key={task.id || i}
                      onClick={() => onProjectClick(task.tenderId || task.tender?.id, task.id)}
                      className="group hover:bg-blue-50/30 transition-all cursor-pointer"
                    >
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="max-w-[150px]">
                          <p className="text-xs font-black text-slate-900 truncate">{task.title || 'Untitled Project'}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5 line-clamp-1 italic">"{task.tender?.title || 'Unknown'}"</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 whitespace-nowrap">
                          {task.department?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'bg-emerald-500 text-white' :
                            task.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onProjectClick(task.tenderId || task.tender?.id, task.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Project Details"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <button
                            onClick={(e) => handleAssignmentDelete(e, task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Assignment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-400 text-xs italic">No matching assignments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Project / Assign Work Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-5 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Project</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Initialize a new project assignment</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                  placeholder="e.g. Smart Transit System Upgrade"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Linked Tender <span className="text-rose-500">*</span></label>
                <select
                  value={assignmentData.tenderId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, tenderId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                >
                  <option value="">Select Tender</option>
                  {tenders.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Department <span className="text-rose-500">*</span></label>
                  <select
                    value={assignmentData.departmentId}
                    onChange={(e) => setAssignmentData({ ...assignmentData, departmentId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select Department</option>
                    {departments?.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Project Manager</label>
                  <select 
                    value={assignmentData.assigneeId}
                    onChange={(e) => setAssignmentData({ ...assignmentData, assigneeId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select Manager</option>
                    {members?.filter(m => m.role === 'Project Manager').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role} - {m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Status</label>
                  <select 
                    value={assignmentData.status}
                    onChange={(e) => setAssignmentData({ ...assignmentData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Priority</label>
                  <select 
                    value={assignmentData.priority}
                    onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Deadline</label>
                  <input 
                    type="date" 
                    value={assignmentData.deadline}
                    onChange={(e) => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  rows="3"
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                  placeholder="Describe project details, scope, or requirements..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-5">
                <button 
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignmentSubmit}
                  className="px-6 py-2.5 bg-[#1e293b] text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
