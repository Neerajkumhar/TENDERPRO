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
  Users,
  X,
  UserPlus,
  ChevronLeft,
  Info
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

const statsData = [
  { label: 'Total Projects', value: '512', trend: '', isUp: true, color: 'slate', icon: Briefcase },
  { label: 'Active Projects', value: '345', trend: '', isUp: true, color: 'blue', icon: TrendingUp },
  { label: 'Completed Projects', value: '112', trend: '', isUp: true, color: 'emerald', icon: CheckCircle2 },
  { label: 'Delayed Projects', value: '15', trend: '', isUp: false, color: 'rose', icon: Clock },
  { label: 'Tasks In Progress', value: '1,230', trend: '', isUp: true, color: 'indigo', icon: ListTodo },
  { label: 'Milestones Completed', value: '890', trend: '', isUp: true, color: 'amber', icon: Flag },
  { label: 'Budget Used', value: '$1.2M', trend: '', isUp: true, color: 'blue', icon: DollarSign },
  { label: 'Risks Open', value: '23', trend: '', isUp: false, color: 'orange', icon: ShieldAlert },
];

const projectStatusData = [
  { name: 'Corp', value: 400, color: '#3b82f6' },
  { name: 'Greck', value: 300, color: '#8b5cf6' },
  { name: 'Mnen', value: 300, color: '#10b981' },
  { name: 'Low', value: 200, color: '#ef4444' },
];

const recentProjects = [
  { name: 'Project Phoenix', client: 'Corporate', budget: '$1200.00', status: 'On Track', color: 'emerald' },
  { name: 'Project Alpha', client: 'Asset SaaS', budget: '$2000.00', status: 'Delayed', color: 'rose' },
  { name: 'Project Phoenix', client: 'Corporate', budget: '$2500.00', status: 'On Track', color: 'emerald' },
  { name: 'Project Cona', client: 'Corporate', budget: '$1200.00', status: 'On Track', color: 'emerald' },
  { name: 'Project Wilpon', client: 'Corporate', budget: '$2500.00', status: 'On Track', color: 'emerald' },
];

const teamAllocation = [
  { name: 'John Doe', team: 'Design', current: 33, total: 33, progress: 100, status: 'On Track' },
  { name: 'Team Member', team: 'Frontend', current: 21, total: 22, progress: 95, status: 'Delayed' },
  { name: 'John Smith', team: 'Backend', current: 21, total: 16, progress: 75, status: 'On Track' },
  { name: 'John Doe', team: 'QA', current: 3, total: 11, progress: 27, status: 'Delayed' },
  { name: 'John Doe', team: 'Management', current: 7, total: 9, progress: 77, status: 'Delayed' },
  { name: 'John Doe', team: 'Support', current: 3, total: 7, progress: 42, status: 'On Track' },
];

const detailedTimelineData = [
  { 
    name: 'Project Phoenix', 
    start: 0.5, 
    duration: 3, 
    progress: 65, 
    color: '#3b82f6', 
    milestones: [1, 2.5],
    status: 'In Progress'
  },
  { 
    name: 'Project Alpha', 
    start: 2, 
    duration: 4.5, 
    progress: 40, 
    color: '#8b5cf6', 
    milestones: [3, 5],
    status: 'Critical'
  },
  { 
    name: 'Infra Dev 2024', 
    start: 1, 
    duration: 8, 
    progress: 90, 
    color: '#10b981', 
    milestones: [2, 4, 7],
    status: 'On Track'
  },
  { 
    name: 'Smart City Phase II', 
    start: 4, 
    duration: 5, 
    progress: 25, 
    color: '#f59e0b', 
    milestones: [6, 8],
    status: 'Delayed'
  },
  { 
    name: 'Project Wilpon', 
    start: 7, 
    duration: 3, 
    progress: 10, 
    color: '#ef4444', 
    milestones: [9],
    status: 'Starting'
  },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ProjectManagement = ({ onProjectClick }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [timeView, setTimeView] = useState('Month');

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track progress, timelines, and team allocation across all active projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              id="project-search"
              type="text" 
              placeholder="Search projects..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <Briefcase size={18} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-6 bg-white border-none shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {stat.trend || '12%'}
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Section - Detailed Graph */}
      <div className="card bg-white border-none shadow-xl shadow-slate-200/40 p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Project Timeline Portfolio</h3>
              <p className="text-xs text-slate-400 font-medium italic">Master schedule for all active projects and upcoming milestones.</p>
            </div>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-[1.25rem] gap-1 border border-slate-100">
            {['Day', 'Week', 'Month', 'Quarter'].map(v => (
              <button 
                key={v}
                onClick={() => setTimeView(v)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeView === v ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[1000px]">
          {/* Grid Header */}
          <div className="flex border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
            <div className="w-[200px] flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</span>
            </div>
            <div className="flex-1 grid grid-cols-12 gap-0">
              {months.map(m => (
                <div key={m} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-l border-slate-50">
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid Content */}
          <div className="relative pt-4 space-y-3">
            {/* Current Day Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/30 z-[5] pointer-events-none before:content-['TODAY'] before:absolute before:-top-6 before:-left-4 before:text-[8px] before:font-black before:text-rose-500 before:bg-rose-50 before:px-1.5 before:py-0.5 before:rounded"
              style={{ left: `calc(200px + ${(5.2 / 12) * 100}% )` }}
            >
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full absolute -top-0.5 -left-0.5 shadow-sm"></div>
            </div>

            {detailedTimelineData.map((project, i) => (
              <div key={i} className="flex items-center group relative py-1.5">
                <div className="w-[200px] pr-6">
                  <h4 className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition-colors truncate">{project.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === 'On Track' ? 'bg-emerald-500' : 
                      project.status === 'Critical' ? 'bg-rose-500' : 
                      'bg-blue-500'
                    }`}></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{project.status}</span>
                  </div>
                </div>
                
                <div className="flex-1 relative h-10 bg-slate-50/50 rounded-2xl flex items-center border border-slate-100/50">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div key={idx} className="border-l border-slate-100/30 h-full"></div>
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div 
                    className="absolute h-6 rounded-lg shadow-sm hover:scale-y-110 transition-all cursor-pointer relative group/bar"
                    style={{ 
                      left: `${(project.start / 12) * 100}%`, 
                      width: `${(project.duration / 12) * 100}%`,
                      backgroundColor: project.color + '20', // Light bg
                      borderLeft: `3px solid ${project.color}`
                    }}
                  >
                    {/* Progress Bar Inside */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-r-lg opacity-40"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: project.color
                      }}
                    ></div>

                    {/* Milestones */}
                    {project.milestones.map((m, mIdx) => (
                      <div 
                        key={mIdx}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 rounded-full shadow-sm z-10 hover:scale-150 transition-transform"
                        style={{ 
                          left: `${((m - project.start) / project.duration) * 100}%`,
                          borderColor: project.color
                        }}
                      >
                        <div className="hidden group-hover/bar:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded whitespace-nowrap shadow-xl">
                          Milestone {mIdx + 1}
                        </div>
                      </div>
                    ))}

                    {/* Tooltip on Hover */}
                    <div className="absolute opacity-0 group-hover/bar:opacity-100 -top-12 left-1/2 -translate-x-1/2 bg-white border border-slate-100 shadow-2xl p-3 rounded-xl z-20 pointer-events-none transition-all duration-300 w-48 scale-90 group-hover/bar:scale-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-900">{project.name}</span>
                        <span className="text-[9px] font-black text-blue-600">{project.progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Ends in {Math.round(project.duration * 30)} days</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Projects Table */}
        <div className="col-span-12 lg:col-span-8 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Active Projects Portfolio</h3>
            <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All Projects</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentProjects.map((project, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {project.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">{project.client}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">{project.budget}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        project.status === 'On Track' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onProjectClick(i)}
                        className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-blue-600 shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="col-span-12 lg:col-span-4 card bg-white border-none shadow-xl shadow-slate-200/40 p-6">
          <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Status Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {projectStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{entry.name}</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{entry.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Team Allocation */}
        <div className="col-span-12 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Resource & Team Allocation</h3>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Filter size={16} /></button>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={16} /></button>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamAllocation.map((member, i) => (
              <div key={i} className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-black text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.team}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    member.status === 'On Track' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {member.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload</span>
                    <span className="text-[10px] font-black text-slate-900">{member.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        member.progress > 90 ? 'bg-rose-500' : member.progress > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${member.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(a => (
                        <div key={a} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-[8px] flex items-center justify-center font-black">P</div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-blue-50 border-2 border-white text-[8px] flex items-center justify-center font-black text-blue-600">+1</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 italic">4 Active Tasks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Project / Assign Work Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowProjectModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assign Tender Work</h2>
                  <p className="text-xs text-slate-500 font-medium">Distribute tender preparation tasks to specific teams.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Tender <span className="text-rose-500">*</span></label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer">
                    <option>Select active tender</option>
                    <option>Annual Infra Dev 2024</option>
                    <option>Smart City Phase II</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Team <span className="text-rose-500">*</span></label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer">
                    <option>Select department</option>
                    <option>Technical Team</option>
                    <option>Financial Reviewers</option>
                    <option>Legal & Compliance</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Description <span className="text-rose-500">*</span></label>
                  <textarea placeholder="Outline the specific tasks for this assignment..." rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level <span className="text-rose-500">*</span></label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button key={p} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Deadline <span className="text-rose-500">*</span></label>
                  <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/80 flex justify-end gap-4 border-t border-slate-100">
              <button 
                onClick={() => setShowProjectModal(false)}
                className="px-8 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 uppercase tracking-widest">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
