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
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenderDetails = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/tenders/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch tender details');
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTenderDetails();
  }, [projectId]);

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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest
                  ${project.status === 'Active' ? 'bg-blue-100 text-blue-600' : 
                    project.status === 'Won' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-8 mt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference No.</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.client?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender Manager</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white overflow-hidden">
                      {project.teamMembers?.manager?.image ? <img src={project.teamMembers.manager.image} alt="" /> : <User size={10} />}
                    </div>
                    <span className="text-xs font-black text-slate-900">{project.teamMembers?.manager?.name || 'Not Assigned'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</p>
                  <p className="text-xs font-black text-slate-900 mt-1">{project.submissionDate ? new Date(project.submissionDate).toLocaleDateString() : 'No Date'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                  <p className="text-xs font-black text-slate-900 mt-1">₹{parseFloat(project.budget || 0).toLocaleString()}</p>
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
              <h3 className="font-black text-slate-900 text-xl tracking-tight mb-4">Tender Scope & Summary</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed italic mb-8">
                {project.scope || 'No scope description provided for this tender.'}
              </p>
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                  <p className="text-sm font-black text-slate-800">{project.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Budget</p>
                  <p className="text-sm font-black text-slate-800">₹{parseFloat(project.budget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Deadline</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-800">{project.submissionDate ? new Date(project.submissionDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax (GST)</p>
                  <p className="text-sm font-black text-slate-800">{project.tax}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Terms</p>
                  <p className="text-sm font-black text-slate-800">{project.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Technical Criteria</p>
                  <p className="text-xs font-bold text-slate-600 line-clamp-1">{project.techCriteria || 'Standard'}</p>
                </div>
              </div>
            </div>

            {/* Progress Overview Card */}
            <div className="col-span-12 lg:col-span-5 card p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full flex flex-col items-center">
              <h3 className="w-full text-left font-black text-slate-900 text-xl tracking-tight mb-8">Progress Overview</h3>
              <div className="relative w-48 h-48 mb-8">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie data={progressData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                      {progressData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900">100%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Tender Readiness</span>
                  </div>
                  <span className="text-xs font-black text-blue-600">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Contract Value', value: `₹${parseFloat(project.budget || 0).toLocaleString()}`, color: 'blue' },
                { label: 'Tax Percentage', value: `${project.tax || 18}%`, color: 'indigo' },
                { label: 'Payment Terms', value: project.paymentTerms || 'Milestone Based', color: 'emerald' },
                { label: 'Tender Category', value: project.category || 'N/A', color: 'rose' },
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
                { label: 'Submission Deadline', date: project.submissionDate ? new Date(project.submissionDate).toLocaleDateString() : 'N/A', icon: Calendar },
                { label: 'Registration Date', date: new Date(project.createdAt).toLocaleDateString(), icon: Calendar },
                { label: 'Last Modified', date: new Date(project.updatedAt).toLocaleDateString(), icon: Clock },
                { label: 'Tender Category', date: project.category, icon: FileText },
                { label: 'Tender Status', date: project.status, icon: CheckCircle2 },
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

          {/* Project Milestones */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Tender Milestones</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {project.milestones ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{project.milestones}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <FileText size={32} className="mb-2 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No milestones defined</p>
                </div>
              )}
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
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-black border border-slate-100 overflow-hidden shadow-sm">
                      {member.image ? <img src={member.image} className="w-full h-full object-cover" alt="" /> : member.name.charAt(0)}
                    </div>
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
