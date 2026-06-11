import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  IndianRupee, 
  Briefcase, 
  Users, 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Target, 
  Award, 
  DollarSign, 
  Edit3, 
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  XCircle,
  Loader2
} from 'lucide-react';
import { 
  RadialBarChart, 
  RadialBar, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import CsvPreviewModal from '../components/CsvPreviewModal';
import PdfPreviewModal from '../components/PdfPreviewModal';
import TenderCompletionModal from '../components/TenderCompletionModal';

const TenderDetails = ({ tenderId, onBack, onEdit, onDelete, onProjectClick, user = {}, members = [] }) => {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewCsv, setPreviewCsv] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');

  const fetchTenderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tenders/${tenderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tender details.');
      }
      const data = await response.json();
      
      // Parse JSON string fields if they are returned as strings by the DB
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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm tracking-wide">Loading Tender Details...</p>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Tender Details Error</h3>
        <p className="text-slate-500 mt-2 max-w-md font-semibold">{error || 'Tender record not found.'}</p>
        <button 
          onClick={onBack}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
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
        return 'bg-emerald-600 text-white shadow-lg shadow-emerald-100';
      case 'under review':
        return 'bg-amber-500 text-white shadow-lg shadow-amber-100';
      case 'paid': 
        return 'bg-emerald-500 text-white shadow-lg shadow-emerald-50';
      case 'lost': return 'bg-rose-600 text-white shadow-lg shadow-rose-100';
      case 'active': return 'bg-blue-600 text-white shadow-lg shadow-blue-100';
      case 'registered': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-100';
      case 'draft': return 'bg-slate-500 text-white shadow-lg shadow-slate-100';
      default: return 'bg-slate-500 text-white';
    }
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN')}`;
  };

  // Helper to find member name by ID
  const getMemberName = (id) => {
    if (!id) return 'Unassigned';
    const match = members.find(m => String(m.id) === String(id));
    return match ? `${match.name} (${match.role})` : 'Unassigned';
  };

  const isTenderManager = String(tender.teamAssignments?.managerId) === String(user.id);
  const canSubmitCompletion = tender.status === 'Won' && isTenderManager;

  const checklists = [
    { title: 'Tender Notice Read & Understood', checked: true },
    { title: 'All Documents Attached', checked: !!tender.documents?.length },
    { title: 'Eligibility Criteria Met', checked: true },
    { title: 'Financial Details Verified', checked: true },
    { title: 'Internal Review Completed', checked: !!tender.teamAssignments?.reviewerId },
    { title: 'Approval Obtained', checked: !!tender.teamAssignments?.approverId },
    { title: 'Completion Docs Submitted', checked: tender.completionStatus === 'Submitted' || tender.completionStatus === 'Approved' },
    { title: 'Final Completion Approved', checked: tender.completionStatus === 'Approved' },
  ];
  
  const readinessScore = Math.round((checklists.filter(c => c.checked).length / checklists.length) * 100);

  const radialData = [{ name: 'Readiness', uv: readinessScore, fill: readinessScore === 100 ? '#10b981' : '#3b82f6' }];

  const handleCompletionAction = async (action) => {
    if (action === 'reject-start') {
      setRejecting(true);
      return;
    }
    if (action === 'cancel-reject') {
      setRejecting(false);
      setRejectRemark('');
      return;
    }

    setVerifying(true);
    try {
      const endpoint = action === 'approve' ? 'approve-completion' : 'reject-completion';
      const body = action === 'reject' ? JSON.stringify({ reason: rejectRemark || 'Completion requirements not met.' }) : null;
      
      const response = await fetch(`/api/tenders/${tenderId}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} completion`);
      alert(`Tender completion has been successfully ${action === 'approve' ? 'approved' : 'rejected'}!`);
      setRejecting(false);
      setRejectRemark('');
      fetchTenderDetails();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen space-y-8">
      {/* Header breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100 transition-all active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Tenders</span>
              <ChevronRight size={12} />
              <span>{tender.reference || 'REF: N/A'}</span>
            </div>
            <h1 className="text-3xl font-black text-[#1e293b] tracking-tight mt-1">{tender.title}</h1>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {canSubmitCompletion && (
            <button 
              onClick={() => setShowCompletionModal(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
            >
              <Flag size={16} />
              <span>Mark for Completion</span>
            </button>
          )}
          <span className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(tender.status)}`}>
            {tender.status}
          </span>
          {onEdit && (
            <button 
              onClick={() => onEdit(tender)}
              className="p-3 bg-white border border-slate-200 hover:border-amber-300 text-slate-500 hover:text-amber-600 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center"
              title="Edit Opportunity"
            >
              <Edit3 size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(tender.id)}
              className="p-3 bg-white border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center"
              title="Delete Opportunity"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Parameters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Client / Sponsor', value: tender.client?.name || 'Unassigned Client', icon: Users, color: 'blue' },
          { label: 'Tender Budget (INR)', value: formatCurrency(tender.budget), icon: IndianRupee, color: 'emerald' },
          { 
            label: 'Submission Deadline', 
            value: tender.submissionDate 
              ? new Date(tender.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) 
              : 'Not Set', 
            icon: Clock, 
            color: 'rose' 
          },
          { label: 'Tender Category', value: tender.category || 'Private Firm', icon: Briefcase, color: 'amber' },
          { label: 'Bid Type', value: tender.bidType || 'Private', icon: FileText, color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="card p-6 bg-white border-none shadow-xl shadow-slate-200/30 hover:scale-[1.02] transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-black text-slate-900 mt-1 truncate max-w-[150px]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pt-6">
        
        {/* --- ROW 1 --- */}
        {/* Scope & Milestones (Span 2) */}
        <div className="lg:col-span-2 flex flex-col space-y-6 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Target size={20} className="text-blue-500" />
            <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Scope & Milestones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Opportunity Description</h3>
              <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line">
                {tender.scope || 'No detailed scope of work has been written for this opportunity yet.'}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Key Deliverables</h3>
              <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line">
                {tender.milestones || 'Milestone boundaries are yet to be finalized.'}
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Gauge (Span 1) */}
        <div className="lg:col-span-1 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col items-center relative">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 w-full">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Compliance Score</span>
          </h3>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={16} 
                data={radialData} startAngle={180} endAngle={0}
              >
                <RadialBar minAngle={15} background={{ fill: '#f1f5f9' }} clockWise dataKey="uv" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
              <span className="text-4xl font-black text-slate-800 tracking-tighter">{readinessScore}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready</span>
            </div>
          </div>
        </div>

        {/* --- ROW 2 --- */}
        {/* Technical Evaluation (Span 2) */}
        <div className="lg:col-span-2 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <ShieldCheck size={20} className="text-indigo-500" />
            <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Technical Parameters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Evaluation Criteria</h3>
              <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl">
                {tender.techCriteria || 'No technical assessment boundaries have been documented.'}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Required Certifications</h3>
              <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl">
                {tender.certifications || 'No specific certifications requested.'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Projects (Span 1) */}
        <div className="lg:col-span-1 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 w-full">
            <Briefcase size={16} className="text-blue-500" />
            <span>Related Projects</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2">
            {relatedProjects.length > 0 ? (
              relatedProjects.map((project, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onProjectClick && onProjectClick(project.tenderId || tender.id)}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col pr-2">
                      <span className="text-sm font-bold text-slate-800 leading-tight">
                        {project.title || project.department?.name || 'Assigned Project'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 line-clamp-2 mt-1 italic">
                        "{project.description || 'No specific description provided'}"
                      </span>
                    </div>
                    <span className={`shrink-0 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${
                      project.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                        {project.department?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Manager</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {(project.department?.manager?.image || project.assignee?.image) ? (
                            <img src={project.department?.manager?.image || project.assignee?.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users size={10} className="text-slate-400" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {project.department?.manager?.name || project.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl min-h-[220px]">
                <Briefcase size={24} className="text-slate-300 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active projects</p>
              </div>
            )}
          </div>
        </div>

        {/* --- ROW 3 --- */}
        {/* Financial Rules (Span 1) */}
        <div className="lg:col-span-1 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <DollarSign size={20} className="text-emerald-500" />
            <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Financial Rules</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400">Payment Terms</span>
              <span className="text-xs font-black text-slate-700">{tender.paymentTerms || 'Milestone Based'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400">Applicable Goods Tax</span>
              <span className="text-xs font-black text-slate-700">{tender.tax || 18}% GST</span>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Billing Terms</span>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {tender.terms || 'Standard contract term definitions apply.'}
              </p>
            </div>
          </div>
        </div>

        {/* Internal Stakeholders (Span 2) */}
        <div className="lg:col-span-2 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <Users size={20} className="text-amber-500" />
            <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Internal Stakeholders</h2>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 flex-1 items-center">
            {[
              { title: 'Tender Manager', name: getMemberName(tender.teamAssignments?.managerId) },
              { title: 'Technical Reviewer', name: getMemberName(tender.teamAssignments?.reviewerId) },
              { title: 'Approval Owner', name: getMemberName(tender.teamAssignments?.approverId) }
            ].map((member, idx) => (
              <div key={idx} className="flex-1 min-w-[180px] p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.title}</p>
                <p className="text-sm font-bold text-slate-800 mt-2">{member.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- ROW 4 --- */}
        {/* Documentation Vault (Span 2) */}
        <div className="lg:col-span-2 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <FileText size={20} className="text-blue-500" />
            <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Documentation Vault</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            {/* Reference Docs */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Reference Documents</h3>
              {Array.isArray(tender.documents) && tender.documents.length > 0 ? (
                <div className="space-y-3">
                  {tender.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={16} className="text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{doc.label}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          const fileName = doc.fileName?.toLowerCase() || '';
                          const docUrl = doc.url?.toLowerCase() || '';
                          if (fileName.endsWith('.csv') || docUrl.endsWith('.csv')) { e.preventDefault(); setPreviewCsv(doc); } 
                          else if (fileName.endsWith('.pdf') || docUrl.endsWith('.pdf')) { e.preventDefault(); setPreviewPdf(doc); } 
                          else { window.open(doc.url, '_blank'); }
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No reference documentation attached.</p>
                </div>
              )}
            </div>

            {/* Completion Docs */}
            {tender.completionDocuments && Object.values(tender.completionDocuments).some(url => url) && (
              <div className="flex flex-col h-full">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center justify-between">
                  <span>Completion Documents</span>
                  {tender.completionStatus === 'Approved' && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md">Verified</span>
                  )}
                  {tender.completionStatus === 'Submitted' && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-md">Pending Review</span>
                  )}
                </h3>
                <div className="space-y-3 flex-1">
                  {[
                    { label: 'Delivery Challan', url: tender.completionDocuments.deliveryChallan },
                    { label: 'E-way Bill', url: tender.completionDocuments.ewayBill },
                    { label: 'Invoice', url: tender.completionDocuments.invoice },
                    { label: 'Installation Challan', url: tender.completionDocuments.installationChallan },
                    { label: 'NOC', url: tender.completionDocuments.noc },
                  ].map((doc, idx) => (
                    doc.url ? (
                      <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.label}</p>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors shrink-0">
                          <ExternalLink size={14} />
                          View
                        </a>
                      </div>
                    ) : (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 border-dashed rounded-xl opacity-60">
                         <div className="flex items-center gap-3 min-w-0">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-500 truncate">{doc.label}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Not Uploaded</p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
                
                {tender.completionStatus === 'Submitted' && user?.role === 'Admin' && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                    {rejecting ? (
                      <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <textarea
                          placeholder="Enter rejection remark (optional)"
                          value={rejectRemark}
                          onChange={(e) => setRejectRemark(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-rose-200 focus:outline-none focus:border-rose-400 bg-rose-50/30 placeholder:text-rose-300 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleCompletionAction('cancel-reject')}
                            disabled={verifying}
                            className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleCompletionAction('reject')}
                            disabled={verifying}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
                          >
                            {verifying ? <Loader2 size={14} className="animate-spin" /> : null}
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCompletionAction('approve')}
                          disabled={verifying}
                          className="flex-[2] px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {verifying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          Verify & Complete
                        </button>
                        <button
                          onClick={() => handleCompletionAction('reject-start')}
                          disabled={verifying}
                          className="flex-[1] px-4 py-3 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assurance Checklist (Span 1) */}
        <div className="lg:col-span-1 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Checklist</h2>
          </div>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {checklists.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${
                item.checked ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  item.checked ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 size={12} />
                </div>
                <span className={`text-[11px] font-bold leading-tight ${item.checked ? 'text-slate-800' : 'text-slate-400'}`}>
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

      {showCompletionModal && (
        <TenderCompletionModal 
          tender={tender}
          onClose={() => setShowCompletionModal(false)}
          onSubmit={fetchTenderDetails}
        />
      )}
    </div>
  );
};

export default TenderDetails;
