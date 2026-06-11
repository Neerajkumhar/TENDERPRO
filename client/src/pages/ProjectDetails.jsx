import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  MoreHorizontal, 
  User, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Mail, 
  Download, 
  ChevronRight,
  Plus,
  FileCode,
  FileImage,
  MessageSquare,
  Trash2,
  Users,
  Briefcase,
  ListTodo,
  X,
  ShieldAlert
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';

const progressData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 20, color: '#3b82f6' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
  { name: 'Not Started', value: 5, color: '#94a3b8' },
];

const ProjectDetails = ({ projectId, onBack, assignments = [], fetchAssignments, user, members = [] }) => {
  const [project, setProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [handoverDocs, setHandoverDocs] = useState({
    deliveryChallan: '',
    ewayBill: '',
    invoice: '',
    installationChallan: '',
    noc: ''
  });
  const [submittingDocs, setSubmittingDocs] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'Medium',
    deadline: ''
  });

  const assignment = assignments.find(a => String(a.tenderId) === String(projectId));
  
  // Filter members of the same department as the current user
  const departmentMembers = members.filter(m => m.departmentId === user?.departmentId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

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

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Optimistic update
    setTasks(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, status: targetStatus } : t
    ));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      if (response.ok && fetchAssignments) {
         fetchAssignments();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/tenders/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project details');
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      try {
        const response = await fetch(`/api/tasks?tenderId=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, [projectId, showTaskModal]);

  const handleSubmitHandover = async () => {
    try {
      setSubmittingDocs(true);
      const res = await fetch(`/api/tenders/${projectId}/submit-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: handoverDocs })
      });
      if (!res.ok) throw new Error('Failed to submit handover documents');
      const projectRes = await fetch(`/api/tenders/${projectId}`);
      if (projectRes.ok) {
        setProject(await projectRes.json());
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting handover documents');
    } finally {
      setSubmittingDocs(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.title || !taskData.assigneeId) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setTaskLoading(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          tenderId: projectId,
          assignmentId: assignment?.id,
          creatorId: user.id
        })
      });

      if (response.ok) {
        setShowTaskModal(false);
        setTaskData({
          title: '',
          description: '',
          assigneeId: '',
          priority: 'Medium',
          deadline: ''
        });
      } else {
        alert('Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      alert('An error occurred');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleAssignmentDelete = async () => {
    if (!assignment) return;
    
    if (!window.confirm('Are you sure you want to delete this project assignment? This will remove it from the "Assigned Project Work" list.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (fetchAssignments) await fetchAssignments();
        onBack();
      } else {
        alert('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Loading Tender Details...</p>
    </div>
  );

  if (error || !project) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
        <ArrowLeft size={32} />
      </div>
      <h2 className="text-xl font-black text-slate-900">Oops! Something went wrong</h2>
      <p className="text-slate-500 font-medium italic">{error || 'Project not found'}</p>
      <button onClick={onBack} className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all">Go Back</button>
    </div>
  );

  const team = [
    project.teamMembers?.manager && { ...project.teamMembers.manager, role: 'Tender Manager' },
    project.teamMembers?.reviewer && { ...project.teamMembers.reviewer, role: 'Reviewer' },
    project.teamMembers?.approver && { ...project.teamMembers.approver, role: 'Approval Owner' },
  ].filter(Boolean);

  const documents = Array.isArray(project.documents) ? project.documents : [];

  const activities = [
    { text: `Tender "${project.title}" was registered`, user: 'System', date: new Date(project.createdAt).toLocaleString(), color: 'emerald' },
    { text: `Last modified`, user: 'Admin User', date: new Date(project.updatedAt).toLocaleString(), color: 'blue' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 w-full">
            <button 
              onClick={onBack}
              className="p-2 sm:p-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 rounded-xl sm:rounded-2xl transition-all text-slate-400 hover:text-blue-600 group shrink-0"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight truncate">
                  {assignment?.department?.name ? (
                    <span className="text-blue-600 block text-[9px] sm:text-xs uppercase tracking-[0.3em] mb-1 sm:mb-2">{assignment.department.name} Project</span>
                  ) : ''}
                  {assignment?.title || project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest
                    ${project.status === 'Active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                      project.status === 'Won' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}>
                    {project.status}
                  </span>
                  {assignment && (
                    <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 shadow-sm">
                      Priority: {assignment.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 w-full xl:w-auto">
            <div className="flex-1 xl:flex-none text-left xl:text-right">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Deadline</p>
              <p className="text-base sm:text-lg font-black text-rose-600 leading-none mt-1">
                {assignment?.deadline 
                  ? new Date(assignment.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) 
                  : (project?.submissionDate ? new Date(project.submissionDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'N/A')}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Project Budget', value: `₹${parseFloat(project.budget || 0).toLocaleString()}`, icon: IndianRupee, color: 'blue' },
            { label: 'Tasks Finished', value: `${tasks.filter(t => t.status === 'Completed').length}/${tasks.length}`, icon: CheckCircle2, color: 'emerald' },
            { 
              label: 'Days Left', 
              value: (project?.submissionDate || assignment?.deadline) 
                ? Math.max(0, Math.ceil((new Date(project?.submissionDate || assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24))) 
                : '--', 
              icon: Calendar, 
              color: 'amber' 
            },
            { label: 'Team Size', value: departmentMembers.length, icon: Users, color: 'indigo' },
          ].map((stat, i) => (
            <div key={i} className="card p-4 sm:p-6 bg-white border-none shadow-xl shadow-slate-200/30 hover:scale-[1.02] transition-all group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all shrink-0`}>
                  <stat.icon size={18} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                  <p className="text-sm sm:text-xl font-black text-slate-900 mt-0.5 sm:mt-1 truncate">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-16 sm:space-y-24">
        {/* Section 1: Overview */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-6 sm:space-y-8">
          <div className="card p-6 sm:p-10 bg-white border-none shadow-2xl shadow-slate-200/40 relative overflow-hidden group rounded-[2rem] sm:rounded-[3rem]">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Briefcase size={80} className="sm:w-[120px] sm:h-[120px]" />
            </div>
            
            <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight mb-4 sm:mb-6 uppercase italic">Detailed Project Scope</h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed italic mb-8 sm:mb-10 max-w-3xl">
              {project.scope || 'No detailed scope provided for this project.'}
            </p>

            <div className="bg-slate-50/50 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-100">
              <h4 className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest mb-4 sm:mb-6">Assignment Directives</h4>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed italic">
                "{assignment?.description || 'Standard department project directives applied.'}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 mt-8 sm:mt-12">
              <div className="sm:col-span-3">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Tender Name</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{project.title}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Category</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{project.category}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Estimated Budget</p>
                <p className="text-xs sm:text-sm font-black text-slate-800">₹{parseFloat(project.budget || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">Technical Criteria</p>
                <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{project.techCriteria || 'Standard'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Quick Info */}
        <div className="col-span-12 lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="card p-6 sm:p-8 bg-white border-none shadow-2xl shadow-slate-200/40 flex flex-col items-center justify-center rounded-[2rem] sm:rounded-[3rem]">
            <h3 className="w-full text-left font-black text-slate-900 text-lg sm:text-xl tracking-tight mb-6 sm:mb-10 uppercase italic">Task Progress</h3>
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 mb-6 sm:mb-10">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Completed', value: tasks.length === 0 ? 0 : tasks.filter(t => t.status === 'Completed').length, color: '#10b981' },
                      { name: 'Remaining', value: tasks.length === 0 ? 1 : tasks.length - tasks.filter(t => t.status === 'Completed').length, color: '#f1f5f9' }
                    ]} 
                    innerRadius={60} 
                    outerRadius={80}
                    paddingAngle={0} 
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-5xl font-black text-slate-900">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%
                </span>
                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Completion</span>
              </div>
            </div>
            <div className="w-full space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-4 sm:p-5 bg-emerald-50 rounded-xl sm:rounded-[1.5rem] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-tight">Active Team Tasks</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-emerald-600">{tasks.filter(t => t.status !== 'Completed').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Kanban Board */}
      <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase italic">PROJECT KANBAN</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Drag and drop tasks to update progress</p>
            </div>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scroll-smooth custom-scrollbar">
              {[
                { id: 'To Do', label: 'TO DO', color: 'bg-blue-600' },
                { id: 'In Progress', label: 'IN PROGRESS', color: 'bg-orange-500' },
                { id: 'Review', label: 'REVIEW', color: 'bg-purple-600' },
                { id: 'Completed', label: 'COMPLETED', color: 'bg-emerald-500' },
              ].map((col) => (
                <div 
                  key={col.id} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="flex flex-col h-full group/column min-w-[85vw] sm:min-w-[320px] lg:min-w-0 snap-center"
                >
                  <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-5 rounded-full ${col.color}`}></div>
                      <span className="text-[11px] font-black text-slate-800 tracking-[0.2em] uppercase">{col.label}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-black">
                        {tasks.filter(t => t.status === col.id || (col.id === 'To Do' && t.status === 'Pending') || (col.id === 'Completed' && t.status === 'Done')).length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 min-h-[400px] sm:min-h-[500px] p-2 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-50/20 border-2 border-transparent hover:border-blue-100/50 transition-all duration-300 border-dashed">
                    {tasks.filter(t => t.status === col.id || (col.id === 'To Do' && t.status === 'Pending') || (col.id === 'Completed' && t.status === 'Done')).map((task) => (
                      <div 
                        key={task.id} 
                        id={`task-${task.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-grab active:cursor-grabbing group relative overflow-hidden"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${
                          task.priority === 'High' ? 'bg-rose-500' : 
                          task.priority === 'Medium' ? 'bg-orange-500' : 
                          'bg-emerald-500'
                        }`}></div>

                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-50
                            ${task.priority === 'High' ? 'text-rose-500' : 
                              task.priority === 'Medium' ? 'text-orange-500' : 
                              'text-emerald-500'}`}>
                            {task.priority}
                          </span>
                          <button className="text-slate-200 hover:text-slate-400 transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>

                        <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-tight leading-snug uppercase mb-1 line-clamp-1">{task.title}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 line-clamp-2 italic">"{task.description}"</p>
                        
                        <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                          <div className="flex items-center gap-2">
                             <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-white">
                                {task.assignee?.image ? <img src={task.assignee.image} className="w-full h-full object-cover" alt="" /> : <User size={10} className="text-slate-400" />}
                             </div>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[80px]">{task.assignee?.name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Clock size={12} />
                            <span className="text-[9px] font-black uppercase tracking-tight">
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Date'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button onClick={() => setShowTaskModal(true)} className="w-full h-20 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-slate-100 flex items-center justify-center gap-3 text-slate-200 hover:border-blue-200 hover:text-blue-500 hover:bg-white transition-all">
                      <Plus size={18} />
                      <span className="text-[9px] font-black uppercase tracking-widest">ADD TASK</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex lg:hidden items-center justify-center gap-2 text-slate-300 font-black text-[8px] uppercase tracking-[0.2em] animate-pulse">
               <span>Scroll horizontally for more columns</span>
               <ChevronRight size={10} />
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTaskModal(false)}></div>
          <div className="relative w-full max-w-xl bg-white h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 sm:p-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-lg">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase italic">Create New Task</h2>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Assign work to department members</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleTaskSubmit} className="p-6 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={taskData.title}
                    onChange={e => setTaskData({...taskData, title: e.target.value})}
                    placeholder="e.g., Prepare Technical Specification"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignee <span className="text-rose-500">*</span></label>
                  <select 
                    value={taskData.assigneeId}
                    onChange={e => setTaskData({...taskData, assigneeId: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select team member</option>
                    {departmentMembers.filter(m => m.role === 'Core Team').map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-bold italic ml-1 uppercase tracking-tight">* Only Core Team members listed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={taskData.description}
                    onChange={e => setTaskData({...taskData, description: e.target.value})}
                    placeholder="Details about what needs to be done..."
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                      value={taskData.priority}
                      onChange={e => setTaskData({...taskData, priority: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                    <input 
                      type="date" 
                      value={taskData.deadline}
                      onChange={e => setTaskData({...taskData, deadline: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-3 sm:gap-4 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="flex-1 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700 transition-colors bg-white sm:bg-transparent rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleTaskSubmit}
                disabled={taskLoading}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-[10px] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
              >
                {taskLoading ? 'Processing...' : 'Activate Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
