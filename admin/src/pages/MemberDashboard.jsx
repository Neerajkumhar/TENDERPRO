import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Layout, 
  Filter, 
  Calendar 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

const MemberDashboard = ({ user = {} }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const tasksToday = tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === new Date().toDateString()).length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done' && t.deadline && new Date(t.deadline) < new Date()).length;
  const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;

  const stats = [
    { label: 'TASKS TODAY', value: tasksToday, subtext: 'Daily Deliverables', icon: ClipboardList, color: 'text-blue-600', light: 'bg-blue-50' },
    { label: 'IN PROGRESS', value: inProgressTasks, subtext: 'Active Tasks', icon: Clock, color: 'text-amber-500', light: 'bg-amber-50' },
    { label: 'DUE / OVERDUE', value: overdueTasks, subtext: 'Requires Attention', icon: AlertCircle, color: 'text-rose-500', light: 'bg-rose-50' },
    { label: 'COMPLETED', value: completedTasks, subtext: 'Done & Verified', icon: CheckCircle2, color: 'text-blue-600', light: 'bg-blue-50' },
  ];

  const pieData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'To Do' || t.status === 'Pending').length, color: '#3b82f6' },
    { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
    { name: 'Review', value: tasks.filter(t => t.status === 'Review' || t.status === 'In Review').length, color: '#6366f1' },
    { name: 'Completed', value: completedTasks, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const displayPieData = pieData.length > 0 ? pieData : [{ name: 'No Tasks', value: 1, color: '#e2e8f0' }];

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layout size={16} className="text-blue-600" />
            <span>Core Team Member Dashboard</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Overview of assigned tasks, progress metrics, and daily deliverables</p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">{stat.label}</span>
                <div className={`p-1 rounded ${stat.light} ${stat.color}`}>
                  <IconComp size={11} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase">{stat.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Task Overview - Donut Chart (Span 4) */}
        <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Task Overview</h3>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Live Pipeline</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-full h-[130px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={56}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">{tasks.length}</span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5">Total Tasks</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
            {[
              { label: 'To Do', count: tasks.filter(t => t.status === 'To Do' || t.status === 'Pending').length, color: 'bg-blue-600' },
              { label: 'In Progress', count: inProgressTasks, color: 'bg-amber-500' },
              { label: 'Review', count: tasks.filter(t => t.status === 'Review' || t.status === 'In Review').length, color: 'bg-indigo-600' },
              { label: 'Completed', count: completedTasks, color: 'bg-blue-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                  <span className="font-semibold text-slate-600">{item.label}</span>
                </div>
                <span className="font-extrabold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks List (Span 8) */}
        <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Assigned Tasks</h3>
              <p className="text-[8.5px] text-slate-500 font-medium">Deliverables pending your action</p>
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-bold uppercase">
              {tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done').length} Active
            </span>
          </div>

          <div className="space-y-1.5">
            {tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done').length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                <p className="text-[9px] font-bold text-slate-400 uppercase">No pending tasks assigned to you</p>
              </div>
            ) : (
              tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done').slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="p-2 bg-slate-50/70 border border-slate-100 rounded-lg flex items-center justify-between hover:bg-slate-50 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded bg-white shadow-2xs shrink-0 ${
                      task.priority === 'HIGH' || task.priority === 'High' ? 'text-rose-500' : 
                      task.priority === 'MEDIUM' || task.priority === 'Medium' ? 'text-amber-500' : 
                      'text-blue-500'
                    }`}>
                      <ClipboardList size={13} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase truncate max-w-[240px]">{task.title}</h4>
                      <div className="flex items-center gap-2 text-[7.5px] font-semibold text-slate-400 uppercase">
                        <span className="truncate max-w-[100px]">{task.project || 'General'}</span>
                        <span>•</span>
                        <span className={task.priority === 'HIGH' || task.priority === 'High' ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {task.priority || 'Normal'}
                        </span>
                        {task.deadline && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase shrink-0 ${
                    task.status === 'In Progress' ? 'bg-amber-50 text-amber-600' : 
                    task.status === 'Review' || task.status === 'In Review' ? 'bg-indigo-50 text-indigo-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;
