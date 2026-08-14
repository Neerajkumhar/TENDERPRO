import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  IndianRupee, 
  Briefcase, 
  Users, 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Target, 
  DollarSign, 
  Edit3, 
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  XCircle,
  Loader2,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Tag,
  Flag
} from 'lucide-react';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer
} from 'recharts';
import CsvPreviewModal from '../components/CsvPreviewModal';
import PdfPreviewModal from '../components/PdfPreviewModal';

const TenderDetails = ({ tenderId, onBack, onEdit, onDelete, onProjectClick, user = {}, members = [] }) => {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewCsv, setPreviewCsv] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [tenderTasks, setTenderTasks] = useState([]);

  const fetchTenderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tenders/${tenderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tender details.');
      }
      const data = await response.json();
      
      if (typeof data.documents === 'string') {
        try { data.documents = JSON.parse(data.documents); } catch(e) { data.documents = []; }
      }
      if (typeof data.teamAssignments === 'string') {
        try { data.teamAssignments = JSON.parse(data.teamAssignments); } catch(e) { data.teamAssignments = {}; }
      }
      if (typeof data.completionDocuments === 'string') {
        try { 
          let parsed = JSON.parse(data.completionDocuments); 
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          data.completionDocuments = parsed; 
        } catch(e) { 
          data.completionDocuments = {}; 
        }
      }

      setTender(data);

      try {
        const assigRes = await fetch('/api/assignments');
        if(assigRes.ok) {
          const assigData = await assigRes.json();
          setRelatedProjects(assigData.filter(a => a.tenderId === tenderId));
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      }

      try {
        const tasksRes = await fetch(`/api/tasks?tenderId=${tenderId}`);
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTenderTasks(tasksData);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }

    } catch (err) {
      console.error('Error fetching tender:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) {
      fetchTenderDetails();
    }
  }, [tenderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-xs">Loading Tender Details...</p>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Tender Details Error</h3>
        <p className="text-slate-500 mt-1 max-w-xs font-medium text-xs">{error || 'Tender record not found.'}</p>
        <button 
          onClick={onBack}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-2xs hover:bg-blue-700 transition-all uppercase tracking-wider"
        >
          <ArrowLeft size={13} />
          <span>Back to Tenders</span>
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'won':
      case 'completed': 
        return 'bg-blue-600 text-white shadow-2xs';
      case 'under review':
        return 'bg-amber-500 text-white shadow-2xs';
      case 'paid': 
        return 'bg-blue-500 text-white shadow-2xs';
      case 'lost': return 'bg-rose-600 text-white shadow-2xs';
      case 'active': return 'bg-blue-600 text-white shadow-2xs';
      case 'registered': return 'bg-indigo-600 text-white shadow-2xs';
      case 'draft': return 'bg-slate-500 text-white shadow-2xs';
      default: return 'bg-slate-500 text-white';
    }
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN')}`;
  };

  const checklists = [
    { title: 'Tender Notice Read & Understood', checked: true },
    { title: 'All Documents Attached', checked: !!tender.documents?.length },
    { title: 'Eligibility Criteria Met', checked: true },
    { title: 'Financial Details Verified', checked: true },
    { title: 'Internal Review Completed', checked: !!tender.teamAssignments?.reviewerId },
    { title: 'Approval Obtained', checked: !!tender.teamAssignments?.approverId },
  ];

  const hasCompletionStage = ['won', 'completed', 'paid'].includes(tender.status?.toLowerCase()) || !!tender.completionStatus;

  if (hasCompletionStage) {
    checklists.push(
      { title: 'Completion Docs Submitted', checked: tender.completionStatus === 'Submitted' || tender.completionStatus === 'Approved' },
      { title: 'Final Completion Approved', checked: tender.completionStatus === 'Approved' }
    );
  }
  
  let displayChecklist = [];
  const isRegisteredOrDraft = ['registered', 'draft'].includes(tender.status?.toLowerCase());
  const hasExecutionState = ['won', 'completed', 'paid'].includes(tender.status?.toLowerCase());
  const totalTasks = tenderTasks.length;
  const totalProjects = relatedProjects.length;

  let readinessScore = 0;

  if (isRegisteredOrDraft) {
    readinessScore = 0;
    displayChecklist = [...checklists];
  } else if (hasExecutionState || totalTasks > 0 || totalProjects > 0) {
    relatedProjects.forEach(project => {
      displayChecklist.push({
        title: `Project: ${project.title || 'Assigned Project'}`,
        checked: project.status?.toLowerCase() === 'completed'
      });
    });
    tenderTasks.forEach(task => {
      displayChecklist.push({
        title: `Task: ${task.title}`,
        checked: ['completed', 'done'].includes(task.status?.toLowerCase())
      });
    });

    if (displayChecklist.length === 0) {
      displayChecklist.push({
        title: 'Pending project execution initialization',
        checked: false
      });
    }

    const completedTasks = tenderTasks.filter(t => ['completed', 'done'].includes(t.status?.toLowerCase())).length;
    const completedProjects = relatedProjects.filter(p => p.status?.toLowerCase() === 'completed').length;
    
    const totalItems = totalTasks + totalProjects;
    if (totalItems > 0) {
      readinessScore = Math.round(((completedTasks + completedProjects) / totalItems) * 100);
    } else {
      readinessScore = 0;
    }
  } else {
    displayChecklist = [...checklists];
    readinessScore = Math.round((checklists.filter(c => c.checked).length / checklists.length) * 100);
  }

  const radialData = [{ name: 'Readiness', uv: readinessScore, fill: '#2563eb' }];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 overflow-x-hidden">
      {/* Header breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center shadow-2xs border border-slate-200 transition-all active:scale-95 shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Tenders</span>
              <ChevronRight size={10} />
              <span>{tender.reference || 'REF: N/A'}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">{tender.title}</h1>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${getStatusColor(tender.status)}`}>
            {tender.status}
          </span>
          {onEdit && (
            <button 
              onClick={() => onEdit(tender)}
              className="p-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 rounded-lg transition-all shadow-2xs active:scale-95"
              title="Edit Opportunity"
            >
              <Edit3 size={13} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(tender.id)}
              className="p-1.5 bg-white border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-lg transition-all shadow-2xs active:scale-95"
              title="Delete Opportunity"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Top Parameter Cards - Client card + 4 stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 w-full">
        {/* Client / Sponsor Card (Span 6) */}
        <div className="lg:col-span-6 min-w-0 bg-white rounded-xl shadow-2xs border border-slate-200/80 p-3.5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5 mb-2.5">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Building2 size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Client / Sponsor</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">
                  {tender.client?.name || 'Unassigned Client'}
                </p>
              </div>
              {tender.client?.status && (
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                  tender.client.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                  tender.client.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {tender.client.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: Tag,    label: 'Industry',  value: tender.client?.industry },
                { icon: Tag,    label: 'Firm Type',  value: tender.client?.firmType },
                { icon: MapPin, label: 'Location',   value: tender.client?.location },
                { icon: Phone,  label: 'Phone',      value: tender.client?.phone },
                { icon: Mail,   label: 'Email',      value: tender.client?.email },
                { icon: Globe,  label: 'Website',    value: tender.client?.website },
              ].map(({ icon: Icon, label, value }) =>
                value ? (
                  <div key={label} className="flex items-start gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="p-1 bg-white rounded text-blue-500 shadow-2xs shrink-0 mt-0.5">
                      <Icon size={10} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
                      <p className="text-[10px] font-bold text-slate-700 truncate">{value}</p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {tender.client?.manager && (
            <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                {tender.client.manager.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Point of Contact</p>
                <p className="text-[10.5px] font-bold text-slate-800 truncate leading-tight">{tender.client.manager} {tender.client.managerPhone && `• ${tender.client.managerPhone}`}</p>
              </div>
            </div>
          )}
        </div>

        {/* 4 Stat Cards (Span 6) */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {[
            { label: 'Tender Budget (INR)', value: formatCurrency(tender.budget), icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Submission Due',
              value: tender.submissionDate
                ? new Date(tender.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Not Set',
              icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Tender Category', value: tender.category || 'Private Firm', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Bid Type', value: tender.bidType || 'Standard', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-2.5 rounded-xl shadow-2xs border border-slate-200/80 flex items-center gap-2.5 overflow-hidden">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 truncate leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3.5">
        
        {/* Scope & Milestones (Span 2) */}
        <div className="lg:col-span-2 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
            <Target size={14} className="text-blue-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Scope &amp; Milestones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs">
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <h3 className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Opportunity Description</h3>
              <p className="text-slate-600 font-medium text-[11px] leading-relaxed whitespace-pre-line">
                {tender.scope || 'No detailed scope of work written yet.'}
              </p>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <h3 className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Key Deliverables</h3>
              <p className="text-slate-600 font-medium text-[11px] leading-relaxed whitespace-pre-line">
                {tender.milestones || 'Milestone boundaries yet to be finalized.'}
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Score (Span 1) */}
        <div className="lg:col-span-1 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col items-center justify-between relative">
          <div className="flex items-center justify-between w-full border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-blue-600" />
              <span>Compliance Score</span>
            </h3>
            <span className="text-[8.5px] font-bold text-blue-600 uppercase">{readinessScore}% Ready</span>
          </div>
          <div className="w-full flex-1 min-h-[140px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <RadialBarChart 
                cx="50%" cy="50%" innerRadius="70%" outerRadius="95%" barSize={10} 
                data={radialData} startAngle={180} endAngle={0}
              >
                <RadialBar minAngle={15} background={{ fill: '#f1f5f9' }} clockWise dataKey="uv" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{readinessScore}%</span>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Verification</span>
            </div>
          </div>
        </div>

        {/* Technical Parameters (Span 2) */}
        <div className="lg:col-span-2 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
            <ShieldCheck size={14} className="text-indigo-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Technical Parameters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs">
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <h3 className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Evaluation Criteria</h3>
              <p className="text-slate-600 font-medium text-[11px] leading-relaxed whitespace-pre-line">
                {tender.techCriteria || 'No technical assessment boundaries documented.'}
              </p>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <h3 className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">Required Certifications</h3>
              <p className="text-slate-600 font-medium text-[11px] leading-relaxed whitespace-pre-line">
                {tender.certifications || 'No specific certifications requested.'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Projects (Span 1) */}
        <div className="lg:col-span-1 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Briefcase size={13} className="text-blue-600" />
              <span>Related Projects</span>
            </h3>
            <span className="text-[8px] font-bold text-slate-400 uppercase">{relatedProjects.length} Projects</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] custom-scrollbar pr-1">
            {relatedProjects.length > 0 ? (
              relatedProjects.map((project, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onProjectClick && onProjectClick(project.tenderId || tender.id)}
                  className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-lg flex flex-col gap-1.5 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10.5px] font-bold text-slate-800 leading-tight truncate">
                      {project.title || project.department?.name || 'Assigned Project'}
                    </span>
                    <span className={`shrink-0 px-1.5 py-0.2 text-[7.5px] font-bold uppercase rounded ${
                      project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase pt-1 border-t border-slate-200/50">
                    <span>{project.department?.name || 'General'}</span>
                    <span className="text-slate-600 truncate max-w-[120px]">{project.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg min-h-[120px]">
                <Briefcase size={18} className="text-slate-300 mb-1" />
                <p className="text-[8.5px] font-bold text-slate-400 uppercase">No active projects</p>
              </div>
            )}
          </div>
        </div>

        {/* Documentation Vault (Span 2) */}
        <div className="lg:col-span-2 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
            <FileText size={14} className="text-blue-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Documentation Vault</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs">
            {/* Reference Docs */}
            <div>
              <h3 className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-2">Reference Documents</h3>
              {Array.isArray(tender.documents) && tender.documents.length > 0 ? (
                <div className="space-y-1.5">
                  {tender.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={13} className="text-slate-400 shrink-0" />
                        <p className="text-[10px] font-bold text-slate-700 truncate">{doc.label}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          const fileName = doc.fileName?.toLowerCase() || '';
                          const docUrl = doc.url?.toLowerCase() || '';
                          if (fileName.endsWith('.csv') || docUrl.endsWith('.csv')) { e.preventDefault(); setPreviewCsv(doc); } 
                          else if (fileName.endsWith('.pdf') || docUrl.endsWith('.pdf')) { e.preventDefault(); setPreviewPdf(doc); } 
                          else { window.open(doc.url, '_blank'); }
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <p className="text-[8.5px] font-bold text-slate-400 uppercase">No reference docs attached.</p>
                </div>
              )}
            </div>

            {/* Completion Docs */}
            <div>
              <h3 className="text-[8px] font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center justify-between">
                <span>Completion Documents</span>
                {tender.completionStatus === 'Approved' && (
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[7.5px]">Verified</span>
                )}
                {tender.completionStatus === 'Submitted' && (
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded text-[7.5px]">Pending Review</span>
                )}
              </h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Delivery Challan', url: tender.completionDocuments?.deliveryChallan },
                  { label: 'E-way Bill', url: tender.completionDocuments?.ewayBill },
                  { label: 'Invoice', url: tender.completionDocuments?.invoice },
                  { label: 'Installation Challan', url: tender.completionDocuments?.installationChallan },
                  { label: 'NOC', url: tender.completionDocuments?.noc },
                ].map((doc, idx) => (
                  doc.url ? (
                    <div key={idx} className="flex justify-between items-center p-1.5 bg-blue-50/50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                        <p className="text-[9.5px] font-bold text-slate-700 truncate">{doc.label}</p>
                      </div>
                      <a href={doc.url} target="_blank" rel="noreferrer" className="px-2 py-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded transition-colors shrink-0">
                        <ExternalLink size={10} />
                        View
                      </a>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assurance Checklist (Span 1) */}
        <div className="lg:col-span-1 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <h2 className="text-[9px] font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-blue-600" />
              <span>Assurance Checklist</span>
            </h2>
            <span className="text-[8px] font-bold text-slate-400 uppercase">{displayChecklist.filter(c => c.checked).length}/{displayChecklist.length}</span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
            {displayChecklist.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                item.checked ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  item.checked ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 size={10} />
                </div>
                <span className={`text-[9.5px] font-semibold truncate ${item.checked ? 'text-slate-800' : 'text-slate-400'}`}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {previewCsv && (
        <CsvPreviewModal 
          url={previewCsv.url}
          fileName={previewCsv.fileName || previewCsv.label}
          onClose={() => setPreviewCsv(null)}
        />
      )}

      {previewPdf && (
        <PdfPreviewModal 
          url={previewPdf.url}
          fileName={previewPdf.fileName || previewPdf.label}
          onClose={() => setPreviewPdf(null)}
        />
      )}
    </div>
  );
};

export default TenderDetails;
