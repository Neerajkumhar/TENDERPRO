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
  ShieldAlert,
  Target,
  Flag
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';

const progressData = [
  { name: 'Completed', value: 65, color: '#2563eb' },
  { name: 'In Progress', value: 20, color: '#3b82f6' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
  { name: 'Not Started', value: 5, color: '#94a3b8' },
];

const ProjectDetails = ({ projectId, onBack, assignments = [], fetchAssignments, user, members = [] }) => {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const assignment = assignments.find(a => String(a.tenderId) === String(projectId));
  const departmentMembers = members.filter(m => m.departmentId === user?.departmentId);

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
  }, [projectId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold text-xs">Loading Project Details...</p>
    </div>
  );

  if (error || !project) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 p-4 text-center">
      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-2">
        <ArrowLeft size={24} />
      </div>
      <h2 className="text-sm font-bold text-slate-900">Project Not Found</h2>
      <p className="text-slate-500 text-xs">{error || 'Unable to retrieve project details.'}</p>
      <button onClick={onBack} className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">Go Back</button>
    </div>
  );

  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const completionPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 overflow-x-hidden">
      {/* Header Area */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-2.5">
          <div className="flex items-start gap-2.5 w-full">
            <button 
              onClick={onBack}
              className="w-8 h-8 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-all text-slate-600 flex items-center justify-center shrink-0"
              title="Go Back"
            >
              <ArrowLeft size={14} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  {assignment?.department?.name ? (
                    <span className="text-blue-600 block text-[8.5px] uppercase tracking-wider mb-0.5">{assignment.department.name} Project</span>
                  ) : ''}
                  {assignment?.title || project.title}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${
                    project.status === 'Active' ? 'bg-blue-600 text-white shadow-2xs' : 
                    project.status === 'Won' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-800 text-white shadow-2xs'
                  }`}>
                    {project.status}
                  </span>
                  {assignment && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      Priority: {assignment.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Stat KPI Metric Boxes */}
              <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2 sm:gap-2.5">
                {[
                  { label: 'Project Budget', value: `₹${parseFloat(project.budget || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Tasks Finished', value: `${completedTasksCount}/${tasks.length}`, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { 
                    label: 'Days Left', 
                    value: (project?.submissionDate || assignment?.deadline) 
                      ? Math.max(0, Math.ceil((new Date(project?.submissionDate || assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24))) 
                      : '--', 
                    icon: Calendar, 
                    color: 'text-amber-600', 
                    bg: 'bg-amber-50' 
                  },
                  { label: 'Team Size', value: departmentMembers.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${stat.bg} ${stat.color} shrink-0`}>
                      <stat.icon size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 truncate leading-none">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Overview & Task Progress */}
      <div className="grid grid-cols-12 gap-3 sm:gap-3.5">
        {/* Main Content: Scope & Directives */}
        <div className="col-span-12 lg:col-span-8 space-y-3 sm:space-y-3.5">
          <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase flex items-center gap-1.5">
              <Target size={14} className="text-blue-600" />
              <span>Project Scope &amp; Directives</span>
            </h3>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {project.scope || 'No detailed scope provided for this project.'}
            </p>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <h4 className="text-[8px] font-bold text-blue-600 uppercase tracking-wider mb-1">Assignment Directives</h4>
              <p className="text-[10px] font-medium text-slate-700 leading-relaxed italic">
                "{assignment?.description || 'Standard department project directives applied.'}"
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <div className="col-span-2">
                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Tender Name</p>
                <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-tight truncate">{project.title}</p>
              </div>
              <div>
                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-tight truncate">{project.category}</p>
              </div>
              <div>
                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Technical Criteria</p>
                <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-tight truncate">{project.techCriteria || 'Standard'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Progress Donut Card */}
        <div className="col-span-12 lg:col-span-4 space-y-3 sm:space-y-3.5">
          <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col items-center justify-between">
            <h3 className="w-full text-left font-bold text-slate-900 text-xs sm:text-sm tracking-tight mb-2 uppercase">Task Progress</h3>
            <div className="relative w-28 h-28 my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Completed', value: tasks.length === 0 ? 0 : completedTasksCount, color: '#2563eb' },
                      { name: 'Remaining', value: tasks.length === 0 ? 1 : tasks.length - completedTasksCount, color: '#f1f5f9' }
                    ]} 
                    innerRadius={42} 
                    outerRadius={54}
                    paddingAngle={0} 
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900">
                  {completionPercent}%
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Done</span>
              </div>
            </div>
            <div className="w-full p-2 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-700 uppercase">Active Team Tasks</span>
              <span className="text-[9px] font-extrabold text-blue-600">{tasks.filter(t => t.status !== 'Completed').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
