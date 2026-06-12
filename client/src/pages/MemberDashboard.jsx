import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layout,
  Filter,
  Check,
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const MemberDashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          const memberTasks = data.filter(t => t.assigneeId === user.id || t.assignee?.email === user.email);
          setTasks(memberTasks);
        }
      } catch (error) {
        console.error('Error fetching member tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

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
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // 1. Update UI Optimistically
    setTasks(prev => prev.map(t => 
      String(t.id) === String(taskId) ? { ...t, status: targetStatus } : t
    ));

    // 2. Persist to Backend (only for non-mock tasks)
    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('s')) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus })
        });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const productivityData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 65 },
    { name: 'Wed', value: 50 },
    { name: 'Thu', value: 85 },
    { name: 'Fri', value: 70 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 30 },
  ];



  const overviewTasks = tasks;

  return (
    <div className="p-6 bg-[#f8fafc] min-h-full space-y-6 animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Stats Grid */}
        <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'TASKS TODAY', value: tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === new Date().toDateString()).length, trend: 'Daily Tasks', up: true, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'IN PROGRESS', value: tasks.filter(t => t.status === 'In Progress').length, trend: 'Active Work', up: true, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'DUE TASKS', value: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done' && t.deadline && new Date(t.deadline) < new Date()).length, trend: 'Needs Attention', up: false, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'COMPLETED', value: tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length, trend: 'All Time', up: true, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon size={20} />
                </div>
                <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={18} /></button>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-1">{stat.value}</h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {stat.up ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                <span className={`text-[10px] font-bold ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Task Overview - Donut Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase italic">TASK OVERVIEW</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'To Do', value: overviewTasks.filter(t => t.status === 'To Do' || t.status === 'Pending').length, color: '#3b82f6', percent: '29%' },
                      { name: 'In Progress', value: overviewTasks.filter(t => t.status === 'In Progress').length, color: '#10b981', percent: '18%' },
                      { name: 'Review', value: overviewTasks.filter(t => t.status === 'Review' || t.status === 'In Review').length, color: '#f59e0b', percent: '21%' },
                      { name: 'Done', value: overviewTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length, color: '#8b5cf6', percent: '32%' },
                    ]}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { color: '#3b82f6' },
                      { color: '#10b981' },
                      { color: '#f59e0b' },
                      { color: '#8b5cf6' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{overviewTasks.length}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL TASKS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { label: 'To Do', count: overviewTasks.filter(t => t.status === 'To Do' || t.status === 'Pending').length, color: 'bg-blue-500' },
              { label: 'In Progress', count: overviewTasks.filter(t => t.status === 'In Progress').length, color: 'bg-emerald-500' },
              { label: 'Review', count: overviewTasks.filter(t => t.status === 'Review' || t.status === 'In Review').length, color: 'bg-amber-500' },
              { label: 'Completed', count: overviewTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length, color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all">
                 <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`}></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks List */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10 px-2">
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">TODAY'S TASKS</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Manage your daily deliverables</p>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status !== 'Completed').slice(0, 4).map((task) => (
              <div 
                key={`today-${task.id}`}
                id={`task-${task.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className="p-6 bg-slate-50/30 border border-slate-50 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-slate-200 transition-all duration-500 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110
                     ${task.priority === 'HIGH' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                      <ClipboardList size={22} />
                   </div>
                   <div>
                      <h4 className="text-[13px] font-black text-slate-800 tracking-tight leading-tight uppercase mb-1">{task.title}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.project || 'General'}</span>
                         <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${task.priority === 'HIGH' ? 'text-rose-500' : 'text-slate-500'}`}>
                           {task.priority}
                         </span>
                      </div>
                   </div>
                </div>
                <button className="p-2 rounded-xl text-slate-200 group-hover:text-slate-400 group-hover:bg-slate-50 transition-all">
                   <ChevronRight size={18} />
                </button>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};


export default MemberDashboard;
