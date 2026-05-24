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
  Type
} from 'lucide-react';

const TaskManagement = ({ user, members = [], onView, assignments = [], tenders = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activityFilter, setActivityFilter] = useState('ALL');

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
  const pmProjects = assignments.filter(a => a.assigneeId === user.id || a.assignee?.email === user.email);
  const activeProjectsList = pmProjects.length > 0 ? pmProjects : assignments;

  // Filter department members for the PM's dropdown list
  const pmDeptMembers = members.filter(m => m.departmentId === user.departmentId);
  const assigneeList = pmDeptMembers.length > 0 ? pmDeptMembers : members;

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
        // Refresh
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

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = (e) => {
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

    // Core Team members can place a task in Review, but cannot place it in Completed (Done)
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

    // 1. Update UI Optimistically
    setTasks(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, status: targetStatus } : t
    ));

    // 2. Persist to Backend (only for non-mock tasks)
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
    { id: 'To Do', label: 'TO DO', color: 'blue' },
    { id: 'In Progress', label: 'IN PROGRESS', color: 'blue' },
    { id: 'Review', label: 'REVIEW', color: 'purple' },
    { id: 'Completed', label: 'DONE', color: 'emerald' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status || (status === 'To Do' && t.status === 'Pending') || (status === 'Completed' && t.status === 'Done') || (status === 'Review' && t.status === 'In Review'));
  };

  const totalTasks = tasks.length || 1;
  const stats = [
    { label: 'TO DO', value: getTasksByStatus('To Do').length, percent: `${Math.round((getTasksByStatus('To Do').length / totalTasks) * 100)}% OF TOTAL`, icon: ClipboardList, color: 'bg-blue-600', light: 'bg-blue-50' },
    { label: 'IN PROGRESS', value: getTasksByStatus('In Progress').length, percent: `${Math.round((getTasksByStatus('In Progress').length / totalTasks) * 100)}% OF TOTAL`, icon: Clock, color: 'bg-emerald-500', light: 'bg-emerald-50' },
    { label: 'REVIEW', value: getTasksByStatus('Review').length, percent: `${Math.round((getTasksByStatus('Review').length / totalTasks) * 100)}% OF TOTAL`, icon: Eye, color: 'bg-purple-600', light: 'bg-purple-50' },
    { label: 'DUE TODAY', value: 3, percent: '12% OF TOTAL', icon: Calendar, color: 'bg-orange-500', light: 'bg-orange-50' },
    { label: 'COMPLETED', value: getTasksByStatus('Completed').length, percent: `${Math.round((getTasksByStatus('Completed').length / totalTasks) * 100)}% OF TOTAL`, icon: CheckCircle2, color: 'bg-emerald-500', light: 'bg-emerald-50' },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-[#f8fafc] min-h-full overflow-x-hidden relative">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
               <div className={`p-3 rounded-2xl ${stat.light} ${stat.color.replace('bg-', 'text-')} shadow-sm`}>
                  {stat.label === 'TO DO' ? <ClipboardList size={22} /> : <stat.icon size={22} />}
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.percent}</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${stat.color} opacity-80`}></div>
          </div>
        ))}
      </div>

      {/* Board Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
          {user.role === 'Core Team' ? 'MY TASKS BOARD' : 'PROJECT TASKS HUB'}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">

          {/* CREATE TASK BUTTON FOR PROJECT MANAGERS */}
          {user.role === 'Project Manager' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>CREATE TASK</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
        
        {/* Kanban Board - Main Area */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div 
              key={col.id} 
              className="space-y-6 flex flex-col h-full group/column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                     <div className={`w-1 h-5 rounded-full ${
                       col.id === 'To Do' ? 'bg-blue-600' : 
                       col.id === 'In Progress' ? 'bg-orange-500' : 
                       col.id === 'Review' ? 'bg-purple-600' : 
                       'bg-emerald-500'
                     }`}></div>
                     <span className="text-[11px] font-black text-slate-800 tracking-[0.2em] uppercase">{col.label}</span>
                     <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-black">{getTasksByStatus(col.id).length}</span>
                  </div>
                  {user.role === 'Project Manager' && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="text-slate-200 hover:text-blue-600 opacity-0 group-hover/column:opacity-100 transition-all"
                    >
                       <Plus size={16} />
                    </button>
                  )}
              </div>

              <div className="space-y-4 flex-1 min-h-[600px] p-2 rounded-[2.5rem] bg-slate-50/20 border-2 border-transparent hover:border-blue-100/50 transition-all duration-300 border-dashed">
                {getTasksByStatus(col.id).map((task) => (
                  <div 
                    key={task.id} 
                    id={`task-${task.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-grab active:cursor-grabbing group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                       task.priority === 'High' || task.priority === 'HIGH' ? 'bg-rose-500' : 
                       task.priority === 'Medium' || task.priority === 'MEDIUM' ? 'bg-orange-500' : 
                       'bg-emerald-500'
                    }`}></div>

                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-50
                         ${task.priority === 'High' || task.priority === 'HIGH' ? 'text-rose-500' : 
                           task.priority === 'Medium' || task.priority === 'MEDIUM' ? 'text-orange-500' : 
                           'text-emerald-500'}`}>
                         {task.priority}
                       </span>
                       <button className="text-slate-200 hover:text-slate-400 transition-colors">
                          <MoreVertical size={14} />
                       </button>
                    </div>
                    
                    <h4 
                       onClick={() => onView && onView(task.id)}
                       className="text-[13px] font-black text-slate-900 tracking-tight leading-snug uppercase mb-1 cursor-pointer hover:text-blue-600 hover:underline transition-all"
                     >
                       {task.title}
                     </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 line-clamp-1">{task.desc || task.description || 'NO DESCRIPTION'}</p>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            col.id === 'In Progress' ? 'bg-orange-500' : 
                            col.id === 'Review' ? 'bg-purple-600' : 
                            col.id === 'Completed' ? 'bg-emerald-500' : 
                            'bg-blue-600'
                          }`}></div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {task.project || (task.tender?.title ? task.tender.title.substring(0, 15) : 'GENERAL')}
                          </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                          <Clock size={12} />
                          <span className="text-[9px] font-black uppercase tracking-tight">
                            {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'NO DEADLINE'}
                          </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Task Activity Sidebar - Secondary Board */}
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full sticky top-6">
               <div className="flex items-center gap-3 mb-6 px-1">
                  <LayoutGrid size={18} className="text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">TASK ACTIVITY</h3>
               </div>
               
               <div className="flex items-center gap-2 border-b border-slate-50 pb-3 overflow-x-auto scrollbar-hide">
                 {['ALL', 'TODAY', 'OVERDUE'].map((tab) => (
                   <button 
                     key={tab}
                     onClick={() => setActivityFilter(tab)}
                     className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all whitespace-nowrap
                       ${activityFilter === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>

               <div className="mt-6 space-y-4 flex-1">
                 {(() => {
                   let filtered = tasks;
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
                     className="p-5 bg-slate-50/50 border border-slate-50 rounded-3xl hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing group"
                   >
                     <div className="flex items-center gap-3 mb-3">
                       <div className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-300 shadow-sm group-hover:text-blue-500 transition-colors">
                         <AlertCircle size={14} />
                       </div>
                       <h4 
                         onClick={() => onView && onView(task.id)}
                         className="text-[11px] font-black text-slate-800 tracking-tight leading-tight line-clamp-2 uppercase cursor-pointer hover:text-blue-600 hover:underline transition-all"
                       >
                         {task.title}
                       </h4>
                     </div>
                     <div className="flex justify-between items-end">
                       <div className="space-y-1">
                         <p className="text-[9px] font-bold text-slate-400 tracking-tight italic">
                           {task.project || (task.tender?.title ? task.tender.title.substring(0, 15) : 'General Project')}
                         </p>
                         <p className={`text-[8px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'DUE SOON'}
                         </p>
                       </div>
                       <div className="flex -space-x-2">
                          {[1, 2].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                              {i === 1 ? 'JD' : '+1'}
                            </div>
                          ))}
                       </div>
                     </div>
                   </div>
                 ));
                 })()}
               </div>

               <button className="mt-8 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:border-blue-100 transition-all">
                  View Activity Log
               </button>
            </div>
        </div>
      </div>

      {/* CREATE TASK POPUP MODAL FOR PROJECT MANAGER */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-lg shadow-2xl p-10 space-y-8 relative my-8 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Create Department Task</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign task to a teammate under your department</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="space-y-6">
              
              {/* Project Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  <span>Associated Project / Assignment *</span>
                </label>
                <select 
                  required
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
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
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Type size={14} className="text-blue-500" />
                  <span>Task Title *</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="E.G. DEVELOP API ENDPOINTS"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block">Task Description</label>
                <textarea 
                  rows="3"
                  placeholder="Provide precise execution details for the task..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300 resize-none"
                />
              </div>

              {/* Team Assignee & Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                    <User size={14} className="text-blue-500" />
                    <span>Teammate Assignee</span>
                  </label>
                  <select 
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                  >
                    <option value="">-- Unassigned (Core Team) --</option>
                    {assigneeList.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role || 'Teammate'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block">Priority Label</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span>Task Deadline</span>
                </label>
                <input 
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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

const ClipboardList = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
    <path d="M9 8h6" />
  </svg>
);

export default TaskManagement;
