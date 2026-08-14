import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye,
  Calendar,
  Plus,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  MoreVertical,
  CheckCircle,
  Flag,
  X,
  FileText,
  User,
  Type,
  ClipboardList
} from 'lucide-react';

const TaskManagement = ({ user, members = [], onView, assignments = [], tenders = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');

  // Modal State for Project Manager Task Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          if (user.role === 'Core Team') {
            const memberTasks = data.filter(t => t.assigneeId === user.id || t.assignee?.email === user.email || t.assignee?.id === user.id);
            setTasks(memberTasks);
          } else {
            setTasks(data);
          }
        } else {
          setTasks([]);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Filter assignments / active projects for the Project Manager (or fallback to all)
  const pmProjects = assignments.filter(a => 
    a.assigneeId && (
      String(a.assigneeId) === String(user.id) || 
      a.assignee?.email === user.email
    )
  );
  const activeProjectsList = user.role === 'Project Manager' ? (pmProjects.length > 0 ? pmProjects : assignments) : assignments;

  // Filter department members for the PM's dropdown list, strictly including only 'Core Team'
  const assigneeList = members.filter(m => m.departmentId === user.departmentId && m.role === 'Core Team');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Task Title is required');
      return;
    }
    if (!selectedAssignmentId) {
      alert('Please select an active project');
      return;
    }

    const matchedAssignment = assignments.find(a => a.id === selectedAssignmentId);
    if (!matchedAssignment) {
      alert('Selected project is invalid');
      return;
    }

    const payload = {
      title: newTitle.toUpperCase(),
      description: newDesc,
      priority: newPriority,
      deadline: newDeadline || null,
      assignmentId: selectedAssignmentId,
      tenderId: matchedAssignment.tenderId,
      assigneeId: selectedAssigneeId || null,
      creatorId: user.id
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewPriority('Medium');
        setNewDeadline('');
        setSelectedAssignmentId('');
        setSelectedAssigneeId('');
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Failed to save task: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Network error occurred while saving the task.");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = () => {
    const el = document.getElementById(`task-${draggedTaskId}`);
    if (el) el.classList.remove('opacity-40');
    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    if (user.role === 'Core Team' && targetStatus === 'Completed') {
      alert("Access Denied: Core Team members can submit tasks for 'Review', but only Project Managers can transition them to 'Completed'.");
      return;
    }

    const currentTask = tasks.find(t => String(t.id) === String(taskId));
    if (currentTask && user.role === 'Core Team') {
      const normalizeStatus = (s) => {
        if (s === 'Pending') return 'To Do';
        if (s === 'Done') return 'Completed';
        if (s === 'In Review') return 'Review';
        return s;
      };
      const statusOrder = { 'To Do': 1, 'In Progress': 2, 'Review': 3, 'Completed': 4 };
      const currentNorm = normalizeStatus(currentTask.status);
      const targetNorm = normalizeStatus(targetStatus);
      
      if (statusOrder[targetNorm] < statusOrder[currentNorm]) {
        alert("Access Denied: Core Team members cannot move tasks backwards. Only Project Managers can.");
        return;
      }
    }

    setTasks(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, status: targetStatus } : t
    ));

    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
      try {
        const dbStatus = targetStatus === 'To Do' ? 'Pending' : targetStatus;
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: dbStatus })
        });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const columns = [
    { id: 'To Do', label: 'TO DO', color: 'bg-blue-600' },
    { id: 'In Progress', label: 'IN PROGRESS', color: 'bg-amber-500' },
    { id: 'Review', label: 'REVIEW', color: 'bg-indigo-600' },
    { id: 'Completed', label: 'DONE', color: 'bg-blue-600' },
  ];

  const getFilteredTasks = () => {
    let filtered = tasks;
    if (selectedProjectFilter !== 'ALL') {
      filtered = filtered.filter(t => String(t.assignmentId) === String(selectedProjectFilter));
    }
    return filtered;
  };

  const getTasksByStatus = (status) => {
    const filteredTasks = getFilteredTasks();
    return filteredTasks.filter(t => t.status === status || (status === 'To Do' && t.status === 'Pending') || (status === 'Completed' && t.status === 'Done') || (status === 'Review' && t.status === 'In Review'));
  };

  const getTasksDueToday = () => {
    const today = new Date().toDateString();
    return getFilteredTasks().filter(t => t.deadline && new Date(t.deadline).toDateString() === today).length;
  };

  const totalTasks = getFilteredTasks().length || 1;
  const stats = [
    { label: 'TO DO', value: getTasksByStatus('To Do').length, percent: `${Math.round((getTasksByStatus('To Do').length / totalTasks) * 100)}%`, icon: ClipboardList, color: 'text-blue-600', light: 'bg-blue-50' },
    { label: 'IN PROGRESS', value: getTasksByStatus('In Progress').length, percent: `${Math.round((getTasksByStatus('In Progress').length / totalTasks) * 100)}%`, icon: Clock, color: 'text-amber-500', light: 'bg-amber-50' },
    { label: 'REVIEW', value: getTasksByStatus('Review').length, percent: `${Math.round((getTasksByStatus('Review').length / totalTasks) * 100)}%`, icon: Eye, color: 'text-indigo-600', light: 'bg-indigo-50' },
    { label: 'DUE TODAY', value: getTasksDueToday(), percent: `${Math.round((getTasksDueToday() / totalTasks) * 100)}%`, icon: Calendar, color: 'text-orange-500', light: 'bg-orange-50' },
    { label: 'COMPLETED', value: getTasksByStatus('Completed').length, percent: `${Math.round((getTasksByStatus('Completed').length / totalTasks) * 100)}%`, icon: CheckCircle2, color: 'text-blue-600', light: 'bg-blue-50' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      
      {/* Top 5 KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">{stat.label}</span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase">{stat.percent}</span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
                <div className={`p-1 rounded ${stat.light} ${stat.color}`}>
                  <IconComp size={11} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Board Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-600" />
            <span>{user.role === 'Core Team' ? 'My Tasks Board' : 'Project Tasks Hub'}</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Manage deliverables and workflow pipelines</p>
        </div>
        
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {user.role === 'Project Manager' && (
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 uppercase tracking-wider outline-none focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Projects</option>
              {activeProjectsList.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.title || 'Untitled Project'}</option>
              ))}
            </select>
          )}

          {/* CREATE TASK BUTTON */}
          {user.role === 'Project Manager' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Kanban Board - Main Area */}
        <div className="lg:col-span-9 overflow-x-auto">
          <div className="grid grid-cols-4 gap-2.5 min-w-[760px] xl:min-w-0">
            {columns.map((col) => (
              <div 
                key={col.id} 
                className="space-y-2 flex flex-col h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-3.5 rounded-full ${col.color}`}></div>
                    <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">{col.label}</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[8px] font-bold">{getTasksByStatus(col.id).length}</span>
                  </div>
                  {user.role === 'Project Manager' && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="text-slate-300 hover:text-blue-600 transition-all p-0.5"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                <div className="space-y-2 flex-1 min-h-[350px] p-2 rounded-xl bg-slate-100/50 border border-dashed border-slate-200/80">
                  {getTasksByStatus(col.id).map((task) => (
                    <div 
                      key={task.id} 
                      id={`task-${task.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 cursor-grab active:cursor-grabbing group relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                        task.priority === 'High' || task.priority === 'HIGH' ? 'bg-rose-500' : 
                        task.priority === 'Medium' || task.priority === 'MEDIUM' ? 'bg-amber-500' : 
                        'bg-blue-500'
                      }`}></div>

                      <div className="flex justify-between items-start mb-1.5 pt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider
                          ${task.priority === 'High' || task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' : 
                            task.priority === 'Medium' || task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 
                            'bg-blue-50 text-blue-600'}`}>
                          {task.priority}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No Due'}
                        </span>
                      </div>
                      
                      <h4 
                        onClick={() => onView && onView(task.id)}
                        className="text-[11px] font-bold text-slate-800 leading-snug uppercase mb-1 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {task.title}
                      </h4>
                      <p className="text-[8.5px] text-slate-400 uppercase line-clamp-1 mb-2">
                        {task.desc || task.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                        <span className="text-[8px] font-bold text-slate-500 uppercase truncate max-w-[100px]">
                          {task.project || (task.tender?.title ? task.tender.title.substring(0, 14) : 'General')}
                        </span>
                        <span className="text-[7.5px] text-slate-400 font-semibold truncate max-w-[70px]">
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Activity Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col">
            <div className="flex items-center gap-2 mb-2.5">
              <LayoutGrid size={13} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Task Activity</h3>
            </div>
            
            <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
              {['ALL', 'TODAY', 'OVERDUE'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActivityFilter(tab)}
                  className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all
                    ${activityFilter === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-2.5 space-y-2">
              {(() => {
                let filtered = getFilteredTasks();
                if (activityFilter === 'TODAY') {
                  const today = new Date().toDateString();
                  filtered = filtered.filter(t => t.deadline && new Date(t.deadline).toDateString() === today);
                } else if (activityFilter === 'OVERDUE') {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  filtered = filtered.filter(t => t.deadline && new Date(t.deadline) < today && t.status !== 'Completed' && t.status !== 'Done');
                }
                return filtered.slice(0, 4).map((task) => (
                  <div 
                    key={`sidebar-${task.id}`} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 hover:bg-white transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle size={11} className="text-blue-500 shrink-0" />
                      <h4 
                        onClick={() => onView && onView(task.id)}
                        className="text-[10px] font-bold text-slate-800 truncate uppercase cursor-pointer hover:text-blue-600"
                      >
                        {task.title}
                      </h4>
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-semibold uppercase">
                      <span className="truncate max-w-[100px]">{task.project || 'General'}</span>
                      <span className={task.status === 'Completed' ? 'text-blue-600' : 'text-rose-500'}>
                        {task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Due Soon'}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-100 w-full max-w-sm shadow-xl p-3.5 space-y-3 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Create Task</h3>
                <p className="text-[8px] text-slate-400 font-medium">Assign work to department core team</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="space-y-2 text-xs">
              
              {/* Project Select */}
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project *</label>
                <select 
                  required
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Project --</option>
                  {activeProjectsList.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title ? proj.title.toUpperCase() : 'UNTITLED ASSIGNMENT'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Task Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Design Wireframes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  rows="2"
                  placeholder="Details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Teammate & Priority */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Teammate</label>
                  <select 
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {assigneeList.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deadline</label>
                <input 
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider shadow-2xs active:scale-95"
                >
                  Save Task
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskManagement;
