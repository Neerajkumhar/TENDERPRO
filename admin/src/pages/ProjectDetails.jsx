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
  ShieldAlert, 
  Briefcase, 
  X,
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

const ProjectDetails = ({ projectId, assignmentId, onBack, onEdit, members, fetchAssignments, onMemberClick }) => {
  const [project, setProject] = useState(null);
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingDocs, setProcessingDocs] = useState(false);

  // Edit Assignment States
  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleApproveDocs = async () => {
    try {
      setProcessingDocs(true);
      const res = await fetch(`/api/tenders/${projectId}/approve-completion`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to approve');
      const projectRes = await fetch(`/api/tenders/${projectId}`);
      if (projectRes.ok) setProject(await projectRes.json());
    } catch (err) {
      alert('Error approving documents');
    } finally {
      setProcessingDocs(false);
    }
  };

  const handleRejectDocs = async () => {
    try {
      setProcessingDocs(true);
      const res = await fetch(`/api/tenders/${projectId}/reject-completion`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to reject');
      const projectRes = await fetch(`/api/tenders/${projectId}`);
      if (projectRes.ok) setProject(await projectRes.json());
    } catch (err) {
      alert('Error rejecting documents');
    } finally {
      setProcessingDocs(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDescription) {
      alert('Description is required.');
      return;
    }
    try {
      const payload = {
        title: editTitle || null,
        tenderId: editingProject.tenderId,
        departmentId: editingProject.departmentId,
        assigneeId: editManager || null,
        description: editDescription,
        priority: editPriority,
        deadline: editDeadline || null,
        status: editStatus
      };
      
      const response = await fetch(`/api/assignments/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const assignmentsRes = await fetch('/api/assignments');
        if (assignmentsRes.ok) {
          const allAssignments = await assignmentsRes.json();
          setProjectAssignments(allAssignments.filter(a => String(a.tenderId) === String(projectId)));
        }
        setEditingProject(null);
        alert('Project updated successfully!');
      } else {
        const err = await response.json();
        alert(`Failed to update project: ${err.message}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Network error occurred while updating the project.');
    }
  };

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

  const coreTeam = [
    project.teamMembers?.manager && { ...project.teamMembers.manager, role: 'Tender Manager' },
    project.teamMembers?.reviewer && { ...project.teamMembers.reviewer, role: 'Reviewer' },
    project.teamMembers?.approver && { ...project.teamMembers.approver, role: 'Approval Owner' },
  ].filter(Boolean);

  const activities = [
    { text: `Tender "${project.title}" was registered`, user: 'System', date: new Date(project.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'blue' },
    { text: `Last modified record`, user: 'Admin User', date: new Date(project.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'blue' },
  ];

  const targetAssignment = assignmentId && projectAssignments.length > 0
    ? projectAssignments.find(a => String(a.id) === String(assignmentId))
    : null;

  const getTenderManager = () => {
    if (project.teamMembers?.manager) return project.teamMembers.manager;
    let managerId = null;
    if (project.teamAssignments) {
      if (typeof project.teamAssignments === 'string') {
        try {
          const parsed = JSON.parse(project.teamAssignments);
          managerId = parsed.managerId;
        } catch (e) {}
      } else if (typeof project.teamAssignments === 'object') {
        managerId = project.teamAssignments.managerId;
      }
    }
    if (managerId && members) {
      return members.find(m => m.id === managerId);
    }
    return null;
  };

  const tenderManager = getTenderManager();

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
                  {targetAssignment ? targetAssignment.title || project.title : project.title}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider ${
                    (targetAssignment ? targetAssignment.status : project.status) === 'Active' ? 'bg-blue-600 text-white shadow-2xs' : 
                    (targetAssignment ? targetAssignment.status : project.status) === 'Won' || (targetAssignment ? targetAssignment.status : project.status) === 'Completed' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-800 text-white shadow-2xs'
                  }`}>
                    {targetAssignment ? targetAssignment.status : project.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Reference No.</p>
                  <p className="text-[11px] font-bold text-slate-900 mt-0.5 truncate">{project.reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Client</p>
                  <p className="text-[11px] font-bold text-slate-900 mt-0.5 truncate">{project.client?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Tender Manager</p>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[7px] text-white overflow-hidden shrink-0">
                      {tenderManager?.image ? <img src={tenderManager.image} className="w-full h-full object-cover" alt="" /> : <User size={9} />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 truncate">{tenderManager?.name || 'Not Assigned'}</span>
                  </div>
                </div>
                {targetAssignment && (
                  <>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Assigned To</p>
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[7px] text-white overflow-hidden shrink-0">
                          {targetAssignment.assignee?.image ? <img src={targetAssignment.assignee.image} className="w-full h-full object-cover" alt="" /> : <User size={9} />}
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 truncate">
                          {targetAssignment.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Department</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5 truncate">{targetAssignment.department?.name || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Deadline</p>
                  <p className="text-[11px] font-bold text-slate-900 mt-0.5 truncate">{targetAssignment?.deadline ? new Date(targetAssignment.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : project.submissionDate ? new Date(project.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No Date'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">Budget</p>
                  <p className="text-[11px] font-bold text-slate-900 mt-0.5 truncate">₹{parseFloat(project.budget || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
            <button 
              onClick={() => {
                if (targetAssignment) {
                  setEditingProject(targetAssignment);
                  setEditTitle(targetAssignment.title || '');
                  setEditManager(targetAssignment.assigneeId || '');
                  setEditStatus(targetAssignment.status || 'Pending');
                  setEditPriority(targetAssignment.priority || 'Medium');
                  setEditDeadline(targetAssignment.deadline ? targetAssignment.deadline.split('T')[0] : '');
                  setEditDescription(targetAssignment.description || '');
                } else {
                  onEdit(project);
                }
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-2xs active:scale-95 flex items-center gap-1.5"
            >
              <Edit2 size={12} />
              <span>{assignmentId ? 'Edit Project Details' : 'Edit Details'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Overview, Completion, Timeline, Progress */}
      <div className="grid grid-cols-12 gap-3 sm:gap-3.5">
        {/* Left Side: Summary & Financials */}
        <div className="col-span-12 lg:col-span-8 space-y-3 sm:space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
            {/* Project Summary */}
            <div className="md:col-span-7 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight mb-2 uppercase flex items-center gap-1.5">
                  <Target size={14} className="text-blue-600" />
                  <span>Tender Scope</span>
                </h3>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mb-3">
                  {project.scope || 'No scope description provided for this tender.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="col-span-2">
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Tender Name</p>
                  <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-tight truncate">{project.title}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-tight truncate">{project.category}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Estimated Budget</p>
                  <p className="text-[10.5px] font-bold text-slate-800">₹{parseFloat(project.budget || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Deadline</p>
                  <p className="text-[10.5px] font-bold text-slate-800">{project.submissionDate ? new Date(project.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Tax (GST)</p>
                  <p className="text-[10.5px] font-bold text-slate-800">{project.tax || 18}%</p>
                </div>
              </div>
            </div>

            {/* Progress Overview Card */}
            <div className="md:col-span-5 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs h-full flex flex-col items-center justify-between">
              <h3 className="w-full text-left font-bold text-slate-900 text-xs sm:text-sm tracking-tight mb-2 uppercase">Progress Status</h3>
              <div className="relative w-28 h-28 my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={progressData} innerRadius={42} outerRadius={54} paddingAngle={4} dataKey="value">
                      {progressData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-900">100%</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Ready</span>
                </div>
              </div>
              <div className="w-full p-2 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-blue-600" />
                  <span className="text-[9px] font-bold text-slate-700 uppercase">Readiness</span>
                </div>
                <span className="text-[9px] font-extrabold text-blue-600 uppercase">High</span>
              </div>
            </div>
          </div>

          {/* Completion Review UI */}
          {project.completionStatus && project.completionStatus !== 'Pending' && (
            <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase flex items-center gap-1.5">
                    <Flag size={14} className="text-blue-600" />
                    <span>Completion Review</span>
                  </h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Handover documentation verification</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  project.completionStatus === 'Submitted' ? 'bg-amber-50 text-amber-600' :
                  project.completionStatus === 'Approved' ? 'bg-blue-50 text-blue-600' :
                  'bg-rose-50 text-rose-600'
                }`}>
                  {project.completionStatus}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                {['deliveryChallan', 'ewayBill', 'invoice', 'installationChallan', 'noc'].map(docKey => (
                  <div key={docKey} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <FileText size={12} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-700 uppercase truncate">{docKey.replace(/([A-Z])/g, ' $1').trim()}</p>
                      </div>
                    </div>
                    {project.completionDocuments?.[docKey] && (
                      <a href={project.completionDocuments[docKey]} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all shrink-0">
                        <Download size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {project.completionStatus === 'Submitted' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={handleRejectDocs}
                    disabled={processingDocs}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50"
                  >
                    Reject Changes
                  </button>
                  <button 
                    onClick={handleApproveDocs}
                    disabled={processingDocs}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-2xs hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} />
                    <span>Approve Handover</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Key Dates & Consolidated Team Card */}
        <div className="col-span-12 lg:col-span-4 space-y-3 sm:space-y-3.5">
          {/* Key Dates */}
          <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight mb-2.5 uppercase">Key Dates</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Submission', date: project.submissionDate ? new Date(project.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar },
                { label: 'Registered', date: new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: Calendar },
                { label: 'Last Modified', date: new Date(project.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: Clock },
                { label: 'Status', date: project.status, icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <item.icon size={12} className="text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consolidated Project Team Card */}
          <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Project Team</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Core Ownership */}
              <div className="space-y-1.5">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1">Core Ownership</p>
                {coreTeam.map((member, i) => (
                  <div key={i} className="flex justify-between items-center p-1 hover:bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {member.image ? <img src={member.image} className="w-full h-full object-cover rounded-lg" alt="" /> : member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-bold text-slate-900 truncate">{member.name}</p>
                        <p className="text-[7.5px] text-slate-400 font-semibold uppercase">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assigned Departments & Personnel */}
              {projectAssignments.length > 0 && (
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1">Assigned Teams</p>
                  {projectAssignments.map((assignment, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ShieldCheck size={12} className="text-indigo-500 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-900 truncate">{assignment.title || 'Untitled Project'}</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase bg-blue-50 text-blue-600 shrink-0">{assignment.priority}</span>
                      </div>
                      {assignment.assignee && (
                        <p className="text-[8.5px] font-semibold text-slate-500 truncate">{assignment.assignee.name} ({assignment.department?.name})</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight mb-2.5 uppercase">Activity Log</h3>
            <div className="space-y-2.5">
              {activities.map((activity, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">{activity.text}</p>
                  <p className="text-[8px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                    <Clock size={9} /> {activity.date} • {activity.user}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Edit Project</h2>
                  <p className="text-[8.5px] font-medium text-slate-400">Modify project directives</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingProject(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Smart Transit Upgrade"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Project Manager</label>
                  <select 
                    value={editManager}
                    onChange={(e) => setEditManager(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Manager</option>
                    {members?.filter(m => m.role === 'Project Manager').map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deadline</label>
                  <input 
                    type="date" 
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                  <select 
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe requirements..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 border-t border-slate-100 pt-2.5">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-2xs active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
