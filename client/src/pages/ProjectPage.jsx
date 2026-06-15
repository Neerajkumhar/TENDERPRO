import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronRight, 
  Briefcase,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ProjectPage = ({ onProjectClick, assignments = [], user = {}, members = [], onCreateProject, fetchAssignments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);

  // Date Filter States
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Edit Modal Form States
  const [editTitle, setEditTitle] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Filtering logic: Admins see all projects; Tender Managers see projects connected with tenders assigned to them; Project Managers see only their department's assigned projects; others see assigned ones
  const myProjects = assignments.filter(item => {
    if (user.role === 'Admin') return true;
    if (user.role === 'Tender Manager') {
      let ta = item.tender?.teamAssignments || {};
      if (typeof ta === 'string') {
        try { ta = JSON.parse(ta); } catch(e) { ta = {}; }
      }
      return String(ta.managerId) === String(user.id);
    }
    if (user.role === 'Project Manager') {
      return String(item.departmentId) === String(user.departmentId);
    }
    return String(item.assigneeId) === String(user.id);
  }).filter(item => {
    // 1. Text Search Filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.title && item.title.toLowerCase().includes(query)) ||
      item.tender?.title?.toLowerCase().includes(query) ||
      item.tender?.client?.name?.toLowerCase().includes(query);

    // 2. Date Range Filter
    let matchesDate = true;
    if (filterStartDate || filterEndDate) {
      const projectDate = new Date(item.createdAt);
      projectDate.setHours(0, 0, 0, 0);

      if (filterStartDate) {
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        if (projectDate < start) matchesDate = false;
      }

      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(0, 0, 0, 0);
        if (projectDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-600';
      case 'In Progress': return 'bg-amber-100 text-amber-600';
      case 'At Risk': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDescription) {
      alert('Description is required.');
      return;
    }
    try {
      const payload = {
        title: editTitle || null,
        tenderId: editingProject.tenderId,
        departmentId: editingProject.departmentId,
        assigneeId: editManager || null,
        description: editDescription,
        priority: editPriority,
        deadline: editDeadline || null,
        status: editStatus
      };
      
      const response = await fetch(`/api/assignments/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        await fetchAssignments();
        setEditingProject(null);
        alert('Project updated successfully!');
      } else {
        const err = await response.json();
        alert(`Failed to update project: ${err.message}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Network error occurred while updating the project.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/assignments/${deletingProjectId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchAssignments();
        setDeletingProjectId(null);
        alert('Project deleted successfully!');
      } else {
        const err = await response.json();
        alert(`Failed to delete project: ${err.message}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Network error occurred while deleting the project.');
    }
  };

  const handleDownloadExcel = () => {
    if (myProjects.length === 0) {
      alert("No projects available to export.");
      return;
    }

    const data = myProjects.map(item => {
      const budget = item.tender?.budget ? parseFloat(item.tender.budget) : 0;
      const startDate = new Date(item.createdAt).toLocaleDateString('en-US');
      const endDate = item.deadline ? new Date(item.deadline).toLocaleDateString('en-US') : 'N/A';
      
      return {
        "Project Name": item.title || 'Untitled Project',
        "Tender Name": item.tender?.title || 'N/A',
        "Client": item.tender?.client?.name || 'N/A',
        "Start Date": startDate,
        "End Date": endDate,
        "Budget (INR)": budget,
        "Status": item.status,
        "Department": item.department?.name || 'Unassigned'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    XLSX.writeFile(workbook, `Projects_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen">
      {/* Header - Matching Image */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1e293b] tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base font-semibold">Manage and track all your active projects</p>
        </div>
        {user?.role !== 'Project Manager' && (
          <button 
            onClick={onCreateProject}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-xl text-sm font-black transition-all hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95"
          >
            <Plus size={20} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Tabs & Search Bar - Matching Image */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-slate-200">
        <div className="flex w-full md:w-auto">
           <button className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-[#1e293b] border-b-2 border-[#1e293b] -mb-[2px] whitespace-nowrap">
             All Projects
           </button>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto pb-4 md:pb-0">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-400 transition-all shadow-sm"
              />
           </div>
           <button 
             onClick={() => setShowDateFilter(!showDateFilter)}
             className={`p-2.5 border rounded-xl transition-all shadow-sm relative shrink-0 ${
               (filterStartDate || filterEndDate)
                 ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                 : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
             }`}
           >
              <Filter size={20} />
              {(filterStartDate || filterEndDate) && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white animate-pulse" />
              )}
           </button>
           <button 
             onClick={handleDownloadExcel}
             className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm active:scale-95 shrink-0"
             title="Download Excel Report"
           >
              <Download size={20} />
           </button>
        </div>
      </div>

      {/* Date Range Filter Panel */}
      {showDateFilter && (
        <div className="mb-6 p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 flex flex-col items-stretch gap-5 animate-in slide-in-from-top-4 duration-300">
           <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Projects Created From</label>
                 <input 
                   type="date"
                   value={filterStartDate}
                   onChange={(e) => setFilterStartDate(e.target.value)}
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Projects Created To</label>
                 <input 
                   type="date"
                   value={filterEndDate}
                   onChange={(e) => setFilterEndDate(e.target.value)}
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                 />
              </div>
           </div>
           <div className="flex gap-2 w-full sm:justify-end">
              <button 
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
              >
                 Reset
              </button>
              <button 
                onClick={() => setShowDateFilter(false)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1e293b] text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200"
              >
                 Close
              </button>
           </div>
        </div>
      )}

      {/* Mobile/Tablet Card View - Visible on screens smaller than lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {myProjects.length > 0 ? myProjects.map((item) => (
          <div 
            key={item.id}
            onClick={() => onProjectClick(item.tenderId)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 hover:shadow-md transition-all relative cursor-pointer active:scale-[0.99] flex flex-col justify-between"
          >
            {/* Top Row: Icon + Title + Status */}
            <div className="flex justify-between items-start gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title || 'Untitled Project'}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                    Client: {item.tender?.client?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            {/* Mid Row: Tender Details */}
            <div className="border-t border-b border-slate-50 py-3 my-1 space-y-2">
              <div className="flex justify-between text-xs font-bold gap-2">
                <span className="text-slate-400 shrink-0">Tender:</span>
                <span className="text-slate-600 truncate max-w-[200px] text-right">{item.tender?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs font-bold gap-2">
                <span className="text-slate-400 shrink-0">Start Date:</span>
                <span className="text-slate-600">
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold gap-2">
                <span className="text-slate-400 shrink-0">End Date:</span>
                <span className="text-slate-600">
                  {item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Bottom Row: Budget & Action menu */}
            <div className="flex justify-between items-center mt-3 pt-1">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">BUDGET</p>
                <p className="text-sm font-black text-slate-900">₹{parseFloat(item.tender?.budget || 0).toLocaleString()}</p>
              </div>
              
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => {
                    setEditingProject(item);
                    setEditTitle(item.title || '');
                    setEditManager(item.assigneeId || '');
                    setEditStatus(item.status || 'Pending');
                    setEditPriority(item.priority || 'Medium');
                    setEditDeadline(item.deadline ? item.deadline.split('T')[0] : '');
                    setEditDescription(item.description || '');
                  }}
                  title="Edit Project"
                  className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all active:scale-95 shadow-sm"
                >
                   <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => setDeletingProjectId(item.id)}
                  title="Delete Project"
                  className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 shadow-sm"
                >
                   <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center col-span-1 md:col-span-2">
            <div className="flex flex-col items-center gap-3">
              <Briefcase size={40} className="text-slate-200" />
              <p className="text-slate-400 font-bold">No projects matching your view.</p>
            </div>
          </div>
        )}
      </div>

      {/* Table Section - Matching Image Layout */}
      <div className="hidden lg:block bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 sm:px-8 py-6">Project Name</th>
                <th className="px-6 sm:px-8 py-6">Tender</th>
                <th className="px-6 sm:px-8 py-6">Client</th>
                <th className="px-6 sm:px-8 py-6">Start Date</th>
                <th className="px-6 sm:px-8 py-6">End Date</th>
                <th className="px-6 sm:px-8 py-6">Budget</th>
                <th className="px-6 sm:px-8 py-6">Status</th>
                <th className="px-6 sm:px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myProjects.length > 0 ? myProjects.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onProjectClick(item.tenderId)}
                  className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                >
                  <td className="px-6 sm:px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                         <ChevronRight size={16} />
                      </div>
                      <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">
                        {item.title || 'Untitled Project'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-6 text-sm font-bold text-slate-500">{item.tender?.title || 'N/A'}</td>
                  <td className="px-6 sm:px-8 py-6 text-sm font-bold text-slate-500">{item.tender?.client?.name || 'N/A'}</td>
                  <td className="px-6 sm:px-8 py-6 text-sm font-bold text-slate-500">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                  <td className="px-6 sm:px-8 py-6 text-sm font-bold text-slate-500">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</td>
                  <td className="px-6 sm:px-8 py-6 text-sm font-black text-slate-900">₹{parseFloat(item.tender?.budget || 0).toLocaleString()}</td>
                  <td className="px-6 sm:px-8 py-6">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                       {item.status}
                     </span>
                  </td>
                  <td className="px-6 sm:px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingProject(item);
                            setEditTitle(item.title || '');
                            setEditManager(item.assigneeId || '');
                            setEditStatus(item.status || 'Pending');
                            setEditPriority(item.priority || 'Medium');
                            setEditDeadline(item.deadline ? item.deadline.split('T')[0] : '');
                            setEditDescription(item.description || '');
                          }}
                          title="Edit Project"
                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all active:scale-95 shadow-sm"
                        >
                           <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingProjectId(item.id)}
                          title="Delete Project"
                          className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 shadow-sm"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center gap-3 text-center">
                        <Briefcase size={48} className="text-slate-200" />
                        <p className="text-slate-400 font-bold">No projects matching your view.</p>
                        <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest">User: {user.name}</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Project</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Modify project parameters</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Smart Transit System Upgrade"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Linked Tender</label>
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 shadow-sm">
                  {editingProject.tender?.title || 'N/A'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Project Manager</label>
                  <select 
                    value={editManager}
                    onChange={(e) => setEditManager(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="">Select Manager</option>
                    {members.filter(m => m.role === 'Project Manager').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role} - {m.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Deadline</label>
                  <input 
                    type="date" 
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
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
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea 
                  rows="3"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe project details, scope, or requirements..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-5">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#1e293b] text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProjectId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3.5 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Delete Project</h3>
                <p className="text-xs font-semibold text-rose-500 mt-0.5">Confirm permanent removal</p>
              </div>
            </div>

            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Are you sure you want to permanently delete this project? This will remove all associated scopes and resource team settings. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button 
                type="button"
                onClick={() => setDeletingProjectId(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black hover:bg-rose-700 transition-all active:scale-95 shadow-md shadow-rose-100"
              >
                Delete Permanent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
