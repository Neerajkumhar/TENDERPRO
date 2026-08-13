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
    { label: 'Won Tenders', value: tenders.filter(t => t.status === 'Won').length, trend: 'Won', isUp: true, color: 'blue', icon: CheckCircle2 },
    { label: 'Total Budget', value: `₹${(tenders.reduce((acc, t) => acc + parseFloat(t.budget || 0), 0) / 10000000).toFixed(2)}Cr`, trend: 'Valuation', isUp: true, color: 'blue', icon: IndianRupee },
  ];

  const projectStatusData = [
    { name: 'Active', value: tenders.filter(t => t.status === 'Active').length, color: '#3b82f6' },
    { name: 'Won', value: tenders.filter(t => t.status === 'Won').length, color: '#3b82f6' },
    { name: 'Registered', value: tenders.filter(t => t.status === 'Registered').length, color: '#8b5cf6' },
    { name: 'Other', value: tenders.filter(t => !['Active', 'Won', 'Registered'].includes(t.status)).length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const detailedTimelineData = tenders.slice(0, 5).map((t, i) => ({
    name: t.title,
    start: (new Date(t.createdAt).getMonth() + (new Date(t.createdAt).getDate() / 30)),
    duration: 2 + Math.random() * 4,
    progress: t.status === 'Won' ? 100 : t.status === 'Active' ? 40 : 10,
    color: ['#3b82f6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][i % 5],
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
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-6">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-0.5 text-xs font-medium">Track progress, timelines, and team allocation across all active projects.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={15} />
            <input
              id="project-search"
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-xs focus:ring-2 focus:ring-blue-50"
            />
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-blue-600 transition-all shadow-md active:scale-95 uppercase tracking-wider whitespace-nowrap"
          >
            <Briefcase size={15} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-100/90 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="flex justify-between items-center mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <stat.icon size={16} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.isUp ? 'text-blue-500' : 'text-rose-500'}`}>
                {stat.isUp ? <TrendingUp size={11} /> : <TrendingUp size={11} className="rotate-180" />}
                {stat.trend || '12%'}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>



      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        {/* Active Project Portfolio */}
        <div className="col-span-12 bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Active Project Portfolio</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender Manager</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
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
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 whitespace-nowrap">
                        {assignment.department?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${assignment.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                          assignment.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {assignment.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                      {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                        assignment.status === 'Completed' ? 'bg-blue-50 text-blue-600' :
                        assignment.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectClick(assignment.tenderId || assignment.tender?.id, assignment.id);
                          }}
                          className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100"
                          title="View Project Details"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={(e) => handleAssignmentDelete(e, assignment.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400 text-xs italic">No matching projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Project / Assign Work Modal - Professional & Scroll-Free */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 p-4 sm:p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Create New Project</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initialize a new project assignment</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                  placeholder="e.g. Smart Transit System Upgrade"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Linked Tender <span className="text-rose-500">*</span></label>
                <select
                  value={assignmentData.tenderId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, tenderId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                >
                  <option value="">Select Tender</option>
                  {tenders.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department <span className="text-rose-500">*</span></label>
                <select
                  value={assignmentData.departmentId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                >
                  <option value="">Select Department</option>
                  {departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Manager</label>
                <select 
                  value={assignmentData.assigneeId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, assigneeId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                >
                  <option value="">Select Manager</option>
                  {members?.filter(m => m.role === 'Project Manager').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role} - {m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deadline</label>
                <input 
                  type="date" 
                  value={assignmentData.deadline}
                  onChange={(e) => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
                <select 
                  value={assignmentData.status}
                  onChange={(e) => setAssignmentData({ ...assignmentData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                <select 
                  value={assignmentData.priority}
                  onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  rows="2"
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                  placeholder="Describe project details, scope, or requirements..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-xs resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
              <button 
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignmentSubmit}
                className="px-5 py-2 bg-[#1e293b] text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200 uppercase tracking-wider"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
