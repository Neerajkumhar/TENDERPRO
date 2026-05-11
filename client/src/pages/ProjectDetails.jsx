import React from 'react';
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
  MessageSquare
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

const ProjectDetails = ({ projectId, onBack }) => {
  // Mock data for the specific project
  const project = {
    id: projectId || 'PRJ-2024-001',
    name: 'Jama Mall Construction',
    status: 'In Progress',
    client: 'Jama Project Pvt. Ltd.',
    manager: 'Rakesh Sharma',
    startDate: '01 Jan 2024',
    endDate: '31 Dec 2024',
    progress: 65,
    description: 'Construction of a modern shopping mall with retail spaces, food court, parking, and all associated infrastructure and amenities.',
    type: 'Construction',
    value: '₹ 12,50,00,000',
    location: 'Jaipur, Rajasthan',
    currency: 'INR',
    contractType: 'Lump Sum',
    tax: 'Yes (18% GST)',
    invoiced: '₹ 8,12,00,000',
    received: '₹ 6,75,00,000',
    balance: '₹ 1,37,00,000'
  };

  const tasks = [
    { name: 'Planning & Design', status: 'Completed', progress: 100, color: 'emerald' },
    { name: 'Site Preparation', status: 'In Progress', progress: 75, color: 'blue' },
    { name: 'Foundation Work', status: 'In Progress', progress: 60, color: 'blue' },
    { name: 'Structural Work', status: 'In Progress', progress: 40, color: 'blue' },
    { name: 'Finishing Work', status: 'Pending', progress: 0, color: 'amber' },
    { name: 'MEP Work', status: 'Not Started', progress: 0, color: 'slate' },
  ];

  const team = [
    { name: 'Rakesh Sharma', role: 'Project Manager', img: 'https://i.pravatar.cc/150?u=rakesh' },
    { name: 'Amit Singh', role: 'Site Engineer', img: 'https://i.pravatar.cc/150?u=amit' },
    { name: 'Neha Verma', role: 'Planning Engineer', img: 'https://i.pravatar.cc/150?u=neha' },
    { name: 'Suresh Yadav', role: 'MEP Engineer', img: 'https://i.pravatar.cc/150?u=suresh' },
    { name: 'Pooja Mehta', role: 'Finance Manager', img: 'https://i.pravatar.cc/150?u=pooja' },
  ];

  const documents = [
    { name: 'Project Agreement.pdf', type: 'Contract', user: 'Admin User', date: '15 May 2024', icon: FileText, color: 'rose' },
    { name: 'BOQ_Revision_02.xlsx', type: 'BOQ', user: 'Amit Singh', date: '10 May 2024', icon: FileCode, color: 'emerald' },
    { name: 'Site_Photos_May2024.zip', type: 'Photos', user: 'Neha Verma', date: '08 May 2024', icon: FileImage, color: 'amber' },
    { name: 'Work_Order_01.pdf', type: 'Work Order', user: 'Admin User', date: '05 May 2024', icon: FileText, color: 'rose' },
  ];

  const activities = [
    { text: 'Task "Foundation Work" updated', user: 'Amit Singh', date: '20 May 2024, 11:30 AM', color: 'blue' },
    { text: 'Invoice INV-2024-015 paid', user: 'Jama Project Pvt. Ltd.', date: '18 May 2024, 04:15 PM', color: 'emerald' },
    { text: 'Document "Site_Photos_May2024.zip" uploaded', user: 'Neha Verma', date: '18 May 2024, 10:20 AM', color: 'amber' },
    { text: 'Team member Suresh Yadav added', user: 'Admin User', date: '16 May 2024, 05:40 PM', color: 'indigo' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest">
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-8 mt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Code</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.client}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Manager</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white">
                      <User size={10} />
                    </div>
                    <span className="text-xs font-black text-slate-900">{project.manager}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.endDate}</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</p>
                    <span className="text-xs font-black text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-blue-400 transition-all shadow-sm">
              <Edit2 size={18} />
              <span>Edit Project</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <MoreHorizontal size={18} />
              <span>More Actions</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
          {['Overview', 'Tasks', 'Team', 'Financials', 'Documents', 'Timeline', 'Reports'].map((tab, i) => (
            <button 
              key={tab}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Side: Summary & Financials */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Project Summary */}
            <div className="col-span-12 lg:col-span-7 card p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full">
              <h3 className="font-black text-slate-900 text-xl tracking-tight mb-4">Project Summary</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed italic mb-8">
                {project.description}
              </p>
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Type</p>
                  <p className="text-sm font-black text-slate-800">{project.type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Value</p>
                  <p className="text-sm font-black text-slate-800">{project.value}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-800">{project.location}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Currency</p>
                  <p className="text-sm font-black text-slate-800">{project.currency}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Type</p>
                  <p className="text-sm font-black text-slate-800">{project.contractType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Applicable</p>
                  <p className="text-sm font-black text-slate-800">{project.tax}</p>
                </div>
              </div>
            </div>

            {/* Progress Overview Card */}
            <div className="col-span-12 lg:col-span-5 card p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full flex flex-col items-center">
              <h3 className="w-full text-left font-black text-slate-900 text-xl tracking-tight mb-8">Progress Overview</h3>
              <div className="relative w-48 h-48 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={progressData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                      {progressData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900">{project.progress}%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                {progressData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: item.color}}></div>
                      <span className="text-xs font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Contract Value', value: project.value, color: 'blue' },
                { label: 'Total Invoiced', value: project.invoiced, color: 'indigo' },
                { label: 'Total Received', value: project.received, color: 'emerald' },
                { label: 'Balance Receivable', value: project.balance, color: 'rose' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                  <h4 className="text-lg font-black text-slate-900">{item.value}</h4>
                </div>
              ))}
            </div>
            <button className="mt-8 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
              View Financial Details <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Side: Key Dates & Tasks */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Key Dates */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8">Key Dates</h3>
            <div className="space-y-6">
              {[
                { label: 'Project Start Date', date: project.startDate, icon: Calendar },
                { label: 'Project End Date', date: project.endDate, icon: Calendar },
                { label: 'Original End Date', date: '31 Dec 2024', icon: Clock },
                { label: 'Extended End Date', date: '-', icon: Clock },
                { label: 'Last Updated', date: '20 May 2024', icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-all rounded-lg">
                      <item.icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Tasks */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Project Tasks</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All Tasks</button>
            </div>
            <div className="space-y-6">
              {tasks.map((task, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800">{task.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-${task.color}-100 text-${task.color}-600`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${task.color}-500 rounded-full`} style={{ width: `${task.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Documents & Timeline & Team */}
        <div className="col-span-12 lg:col-span-8">
           {/* Recent Documents */}
           <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Recent Documents</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All Documents</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Uploaded By</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {documents.map((doc, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-all group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${doc.color}-50 text-${doc.color}-600`}>
                            <doc.icon size={16} />
                          </div>
                          <span className="text-xs font-black text-blue-600 hover:underline">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{doc.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600">
                            <User size={10} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{doc.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{doc.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Team Members */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Team Members</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View Team</button>
            </div>
            <div className="space-y-6">
              {team.map((member, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <img src={member.img} className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" alt="" />
                    <div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-all">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold italic">{member.role}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Mail size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Activity Timeline</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View Full Timeline</button>
            </div>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
              {activities.map((activity, i) => (
                <div key={i} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg bg-${activity.color}-100 border-4 border-white shadow-sm flex items-center justify-center z-10`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-${activity.color}-500`}></div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 leading-tight">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">by {activity.user}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-1 flex items-center gap-1">
                      <Clock size={10} /> {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
