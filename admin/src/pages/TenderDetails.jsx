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
  AlertCircle
} from 'lucide-react';

const TenderDetails = ({ tenderId, onBack, onEdit, onDelete, user = {}, members = [] }) => {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  useEffect(() => {
    const fetchTenderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tenders/${tenderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tender details.');
        }
        const data = await response.json();
        setTender(data);
      } catch (err) {
        console.error('Error fetching tender:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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
    switch (status) {
      case 'Won': return 'bg-emerald-600 text-white shadow-lg shadow-emerald-100';
      case 'Lost': return 'bg-rose-600 text-white shadow-lg shadow-rose-100';
      case 'Active': return 'bg-blue-600 text-white shadow-lg shadow-blue-100';
      case 'Registered': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-100';
      case 'Draft': return 'bg-slate-500 text-white shadow-lg shadow-slate-100';
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
        </div>
      </div>

      {/* Main Parameters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        ].map((stat, i) => (
          <div key={i} className="card p-6 bg-white border-none shadow-xl shadow-slate-200/30 hover:scale-[1.02] transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-lg font-black text-slate-900 mt-1 truncate max-w-[200px]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sub Tabs Toggle Toolbar */}
      <div className="flex border-b border-slate-200 gap-8 pb-1">
        {['Overview', 'Eligibility & Technical', 'Internal Assignment', 'Reference Docs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub Tabs Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Detailed Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          {activeSubTab === 'Overview' && (
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/20 space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Target size={16} className="text-blue-500" />
                  <span>Opportunity Description & Scope</span>
                </h3>
                <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                  {tender.scope || 'No detailed scope of work has been written for this opportunity yet.'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-emerald-500" />
                  <span>Key Milestones & Deliverables</span>
                </h3>
                <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                  {tender.milestones || 'Milestone boundaries are yet to be finalized.'}
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'Eligibility & Technical' && (
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/20 space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-500" />
                  <span>Technical Evaluation Criteria</span>
                </h3>
                <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                  {tender.techCriteria || 'No technical assessment boundaries have been documented.'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  <span>Required Certifications</span>
                </h3>
                <p className="text-slate-600 font-semibold text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                  {tender.certifications || 'No specific certifications requested.'}
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'Internal Assignment' && (
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/20">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                <span>Internal Opportunity Stakeholders</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Tender Manager', name: getMemberName(tender.teamAssignments?.managerId) },
                  { title: 'Technical Reviewer', name: getMemberName(tender.teamAssignments?.reviewerId) },
                  { title: 'Approval Owner', name: getMemberName(tender.teamAssignments?.approverId) }
                ].map((member, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.title}</p>
                    <p className="text-sm font-black text-slate-800 mt-2">{member.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'Reference Docs' && (
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/20">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span>Uploaded Documents & Files</span>
              </h3>
              {tender.documents && tender.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tender.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-lg text-slate-400 flex items-center justify-center shadow-sm">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">{doc.label}</p>
                          <p className="text-[9px] font-semibold text-slate-400 truncate">{doc.fileName || 'document.pdf'}</p>
                        </div>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
                        title="Download Reference"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 flex flex-col items-center gap-2">
                  <FileText size={32} className="text-slate-300" />
                  <p className="text-slate-400 text-xs font-bold">No documentation attached to this tender opportunity.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Column - Terms, Tax & Checklist */}
        <div className="space-y-6">
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/20 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-500" />
              <span>Financial & Billing Rules</span>
            </h3>
            
            <div className="space-y-4">
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

          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/20 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Assurance Checklists</span>
            </h3>
            <div className="space-y-3.5">
              {[
                { title: 'Tender Notice Read & Understood', checked: true },
                { title: 'All Documents Attached', checked: !!tender.documents?.length },
                { title: 'Eligibility Criteria Met', checked: true },
                { title: 'Financial Details Verified', checked: true },
                { title: 'Internal Review Completed', checked: !!tender.teamAssignments?.reviewerId },
                { title: 'Approval Obtained', checked: !!tender.teamAssignments?.approverId },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                    item.checked ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}>
                    <CheckCircle2 size={14} />
                  </div>
                  <span className={`text-xs font-bold ${
                    item.checked ? 'text-slate-600 font-extrabold' : 'text-slate-400'
                  }`}>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TenderDetails;
