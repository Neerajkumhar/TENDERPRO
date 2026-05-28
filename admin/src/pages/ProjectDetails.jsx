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
  Users,
  ShieldCheck,
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

const ProjectDetails = ({ projectId, onBack }) => {
  const [project, setProject] = useState(null);
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenderDetails = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const [tenderRes, assignmentsRes] = await Promise.all([
          fetch(`/api/tenders/${projectId}`),
          fetch('/api/assignments')
        ]);

        if (!tenderRes.ok) throw new Error('Failed to fetch tender details');
        const tenderData = await tenderRes.json();
        setProject(tenderData);

        if (assignmentsRes.ok) {
          const allAssignments = await assignmentsRes.json();
          setProjectAssignments(allAssignments.filter(a => String(a.tenderId) === String(projectId)));
        }
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

  const coreTeam = [
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd]">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4 w-full">
            <button 
              onClick={onBack}
              className="p-2.5 sm:p-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 rounded-xl sm:rounded-2xl transition-all text-slate-400 hover:text-blue-600 group shrink-0"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight truncate">{project.title}</h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest
                    ${project.status === 'Active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 
                      project.status === 'Won' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Reference No.</p>
                  <p className="text-xs font-black text-slate-900 mt-1 truncate">{project.reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Client</p>
                  <p className="text-xs font-black text-slate-900 mt-1 truncate">{project.client?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Tender Manager</p>
                  <div className="flex items-center gap-2 mt-1 min-w-0">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white overflow-hidden shrink-0">
                      {project.teamMembers?.manager?.image ? <img src={project.teamMembers.manager.image} className="w-full h-full object-cover" alt="" /> : <User size={10} />}
                    </div>
                    <span className="text-xs font-black text-slate-900 truncate">{project.teamMembers?.manager?.name || 'Not Assigned'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Submission Date</p>
                  <p className="text-xs font-black text-slate-900 mt-1 truncate">{project.submissionDate ? new Date(project.submissionDate).toLocaleDateString() : 'No Date'}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Budget</p>
                  <p className="text-xs font-black text-slate-900 mt-1 truncate">₹{parseFloat(project.budget || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 transition-all shadow-sm">
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <MoreHorizontal size={16} />
              <span>Actions</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-slate-100/50 rounded-2xl w-full sm:w-fit backdrop-blur-sm overflow-x-auto no-scrollbar">
          {['Overview', 'Tasks', 'Team', 'Financials', 'Documents', 'Timeline', 'Reports'].map((tab, i) => (
            <button 
              key={tab}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                i === 0 ? 'bg-slate-900 text-white shadow-xl shadow-slate-400/20' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        {/* Left Side: Summary & Financials */}
        <div className="col-span-12 lg:col-span-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Project Summary */}
            <div className="md:col-span-7 card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full rounded-2xl sm:rounded-3xl">
              <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight mb-4 uppercase italic">Tender Scope</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed italic mb-6 sm:mb-8">
                {project.scope || 'No scope description provided for this tender.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                  <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{project.category}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Budget</p>
                  <p className="text-xs sm:text-sm font-black text-slate-800">₹{parseFloat(project.budget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Deadline</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs sm:text-sm font-black text-slate-800">{project.submissionDate ? new Date(project.submissionDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax (GST)</p>
                  <p className="text-xs sm:text-sm font-black text-slate-800">{project.tax}%</p>
                </div>
              </div>
            </div>

            {/* Progress Overview Card */}
            <div className="md:col-span-5 card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full flex flex-col items-center rounded-2xl sm:rounded-3xl">
              <h3 className="w-full text-left font-black text-slate-900 text-lg sm:text-xl tracking-tight mb-6 sm:mb-8 uppercase italic">Progress</h3>
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6 sm:mb-8">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie data={progressData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {progressData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">100%</span>
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registered</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">Readiness</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-blue-600 uppercase">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-2xl sm:rounded-3xl">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight mb-6 sm:mb-8 uppercase italic">Financial Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Contract Value', value: `₹${parseFloat(project.budget || 0).toLocaleString()}`, color: 'blue' },
                { label: 'Tax (GST)', value: `${project.tax || 18}%`, color: 'indigo' },
                { label: 'Payment Terms', value: project.paymentTerms || 'Milestone', color: 'emerald' },
                { label: 'Tender Category', value: project.category || 'N/A', color: 'rose' },
              ].map((item, i) => (
                <div key={i} className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">{item.label}</p>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">{item.value}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/30 gap-4">
              <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight uppercase italic">Documents</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Type</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {documents.length > 0 ? documents.map((doc, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-all group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600`}>
                            <FileText size={14} className="sm:w-4 sm:h-4" />
                          </div>
                          <span className="text-xs font-black text-blue-600 hover:underline truncate max-w-[120px] sm:max-w-none">{doc.name || `Document ${i+1}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 hidden sm:table-cell uppercase tracking-tight">{doc.type || 'PDF'}</td>
                      <td className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-400 truncate">{doc.date || 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-xs font-bold text-slate-400 italic">No documents uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Key Dates & Consolidated Team Card */}
        <div className="col-span-12 lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Key Dates */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-2xl sm:rounded-3xl">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight mb-6 sm:mb-8 uppercase italic">Key Dates</h3>
            <div className="space-y-4 sm:space-y-6">
              {[
                { label: 'Submission', date: project.submissionDate ? new Date(project.submissionDate).toLocaleDateString() : 'N/A', icon: Calendar },
                { label: 'Registered', date: new Date(project.createdAt).toLocaleDateString(), icon: Calendar },
                { label: 'Last Modified', date: new Date(project.updatedAt).toLocaleDateString(), icon: Clock },
                { label: 'Status', date: project.status, icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-all rounded-lg">
                      <item.icon size={14} className="sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consolidated Project Team Card */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-2xl sm:rounded-3xl">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users size={18} />
                </div>
                <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase italic">Project Team</h3>
              </div>
              <button className="text-blue-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:underline">Manage</button>
            </div>
            
            <div className="space-y-8">
              {/* Core Ownership */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Core Ownership</p>
                {coreTeam.map((member, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-black border border-slate-100 overflow-hidden shadow-sm shrink-0">
                        {member.image ? <img src={member.image} className="w-full h-full object-cover" alt="" /> : member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-all truncate">{member.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold italic truncate uppercase tracking-tighter">{member.role}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Mail size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Assigned Departments & Personnel */}
              {projectAssignments.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Assigned Teams</p>
                  {projectAssignments.map((assignment, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 group hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-indigo-500" />
                          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{assignment.department?.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          assignment.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                        }`}>{assignment.priority}</span>
                      </div>
                      {assignment.assignee && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                            {assignment.assignee.image ? <img src={assignment.assignee.image} className="w-full h-full object-cover" alt="" /> : <User size={12} className="text-slate-400" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">{assignment.assignee.name}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 font-medium italic line-clamp-2 leading-relaxed">"{assignment.description}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button className="mt-8 w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              Manage Work Assignments
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-2xl sm:rounded-3xl">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase italic">Timeline</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Full Log</button>
            </div>
            <div className="space-y-6 sm:space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
              {activities.map((activity, i) => (
                <div key={i} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg bg-${activity.color}-100 border-4 border-white shadow-sm flex items-center justify-center z-10`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-${activity.color}-500`}></div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 leading-tight">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">by {activity.user}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium italic mt-1 flex items-center gap-1">
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
