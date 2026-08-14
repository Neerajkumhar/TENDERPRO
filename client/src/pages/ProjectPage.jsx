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
  X,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ProjectPage = ({ onProjectClick, assignments = [], user = {}, members = [], onCreateProject, fetchAssignments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

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
      return item.assigneeId && String(item.assigneeId) === String(user.id);
    }
    return String(item.assigneeId) === String(user.id);
  }).filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.title && item.title.toLowerCase().includes(query)) ||
      item.tender?.title?.toLowerCase().includes(query) ||
      item.tender?.client?.name?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

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

    return matchesSearch && matchesStatus && matchesDate;
  });

  const statsData = [
    { label: 'Total Projects', value: assignments.length, color: 'text-slate-800' },
    { label: 'In Progress', value: assignments.filter(a => a.status === 'In Progress').length, color: 'text-blue-600' },
    { label: 'Completed', value: assignments.filter(a => a.status === 'Completed').length, color: 'text-teal-600' },
    { label: 'Pending', value: assignments.filter(a => a.status === 'Pending').length, color: 'text-amber-500' },
    { label: 'At Risk', value: assignments.filter(a => a.status === 'At Risk').length, color: 'text-rose-500' },
    { 
      label: 'Total Value', 
      value: (() => {
        const sum = assignments.reduce((acc, a) => acc + parseFloat(a.tender?.budget || 0), 0);
        if (sum >= 10000000) return `₹${(sum / 10000000).toFixed(1)}Cr`;
        if (sum >= 100000) return `₹${(sum / 100000).toFixed(1)}L`;
        return `₹${sum.toLocaleString('en-IN')}`;
      })(), 
      color: 'text-slate-900' 
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-blue-600 text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'At Risk': return 'bg-rose-500 text-white';
      default: return 'bg-amber-500 text-white';
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
      } else {
        const err = await response.json();
        alert(`Failed to update project: ${err.message}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Network error occurred while updating the project.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchAssignments();
        setDeletingProjectId(null);
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
      const startDate = new Date(item.createdAt).toLocaleDateString('en-IN');
      const endDate = item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN') : 'N/A';
      
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
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-blue-600" size={18} />
            <span>Project Management</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Track timelines, budgets, and deliverables across all active projects.</p>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button 
            onClick={handleDownloadExcel}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9.5px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs"
            title="Download Excel Report"
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          {user?.role !== 'Project Manager' && (
            <button 
              onClick={onCreateProject}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
            >
              <Plus size={13} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-2.5 sm:p-3 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 bg-slate-50/40">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Active Projects Ledger</h2>
            <p className="text-[8.5px] text-slate-500 font-medium">Search and monitor assignment status</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input 
                type="text" 
                placeholder="Search projects, clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-2.5 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-2xs"
              >
                <option value="All">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>

            {/* Date Filter Button */}
            <button 
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`p-1.5 border rounded-lg transition-all shadow-2xs relative shrink-0 ${
                (filterStartDate || filterEndDate)
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Date Range Filter"
            >
              <Filter size={13} />
              {(filterStartDate || filterEndDate) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white" />
              )}
            </button>
          </div>
        </div>

        {/* Date Filter Collapsible Popover */}
        {showDateFilter && (
          <div className="p-3 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center gap-2 text-left animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">From:</span>
              <input 
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10.5px] font-semibold text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase">To:</span>
              <input 
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10.5px] font-semibold text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="px-2.5 py-1 text-[9.5px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-all"
            >
              Reset
            </button>
            <button 
              onClick={() => setShowDateFilter(false)}
              className="px-2.5 py-1 text-[9.5px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-md transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-3.5 py-2">Project Name</th>
                <th className="px-3.5 py-2">Tender Details</th>
                <th className="px-3.5 py-2">Manager / Lead</th>
                <th className="px-3.5 py-2">Client</th>
                <th className="px-3.5 py-2">Timeline</th>
                <th className="px-3.5 py-2 text-right">Budget (₹)</th>
                <th className="px-3.5 py-2 text-center">Status</th>
                <th className="px-3.5 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myProjects.length > 0 ? myProjects.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onProjectClick(item.tenderId, item.id)}
                  className="hover:bg-slate-50/70 transition-all cursor-pointer group"
                >
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.title?.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block max-w-[180px]">
                          {item.title || 'Untitled Project'}
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase truncate block">
                          ID: #{item.id?.substring(0, 6)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-2 text-[10.5px] font-medium text-slate-600 truncate max-w-[150px]">
                    {item.tender?.title || 'N/A'}
                  </td>
                  <td className="px-3.5 py-2 text-[10.5px] font-medium text-slate-600 truncate max-w-[140px]">
                    {item.assignee?.name || 'Unassigned'}
                  </td>
                  <td className="px-3.5 py-2 text-[10.5px] font-semibold text-slate-600 truncate max-w-[130px]">
                    {item.tender?.client?.name || 'N/A'}
                  </td>
                  <td className="px-3.5 py-2 text-[10px] font-medium text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                  </td>
                  <td className="px-3.5 py-2 text-[11px] font-extrabold text-slate-900 text-right">
                    ₹{parseFloat(item.tender?.budget || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-3.5 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
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
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this project?')) {
                            handleDelete(item.id);
                          }
                        }}
                        title="Delete Project"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400 italic text-xs font-medium">
                    No projects found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100">
            <div className="p-3 sm:p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-3 sm:p-3.5 space-y-2.5 text-left text-xs">
              <div>
                <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                  <select 
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</label>
                <input 
                  type="date" 
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
