import React, { useState, useEffect } from 'react';
import {
  FileText,
  Target,
  ShieldCheck,
  IndianRupee,
  UploadCloud,
  Users,
  Send,
  HelpCircle,
  ExternalLink,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckSquare
} from 'lucide-react';

const CreateTender = ({ onCancel, initialData, onSave, clients }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState(initialData || {
    id: null,
    title: '',
    clientId: '',
    reference: '',
    category: 'Private',
    submissionDate: '',
    scope: '',
    milestones: '',
    techCriteria: '',
    certifications: '',
    terms: '',
    budget: '',
    tax: '18',
    paymentTerms: 'Milestone Based',
    teamAssignments: {
      managerId: '',
      reviewerId: '',
      approverId: ''
    }
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, []);

  const handleFinalSubmit = () => {
    onSave(formData);
  };
  const [documentSlots, setDocumentSlots] = useState([
    { id: 1, label: 'Tender Notice File', format: 'PDF, DOCX (Max. 20MB)', isFixed: true },
    { id: 2, label: 'Pricing Sheet', format: 'XLSX, PDF (Max. 20MB)', isFixed: true },
    { id: 3, label: 'Certifications', format: 'PDF, JPG (Max. 20MB)', isFixed: true },
  ]);

  const addDocumentSlot = () => {
    const newId = Date.now();
    setDocumentSlots([...documentSlots, {
      id: newId,
      label: 'Other Document',
      format: 'Any Format (Max. 20MB)',
      isFixed: false
    }]);
  };

  const [isUploading, setIsUploading] = useState(null); // Track which slot is uploading

  const handleFileUpload = async (file, slotId) => {
    if (!file) return;
    setIsUploading(slotId);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      if (response.ok) {
        const data = await response.json();
        setDocumentSlots(prev => prev.map(slot => 
          slot.id === slotId ? { ...slot, url: data.url, fileName: file.name } : slot
        ));
        
        // Also update main formData.documents
        const newDoc = { label: documentSlots.find(s => s.id === slotId).label, url: data.url, fileName: file.name };
        setFormData(prev => ({
          ...prev,
          documents: [...(prev.documents || []), newDoc]
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(null);
    }
  };

  const removeDocumentSlot = (id) => {
    setDocumentSlots(documentSlots.filter(slot => slot.id !== id));
  };

  const sections = [
    { id: 1, title: 'Opportunity Overview', subtitle: 'Basic tender details', icon: FileText },
    { id: 2, title: 'Scope & Requirements', subtitle: 'Project boundaries', icon: Target },
    { id: 3, title: 'Internal Eligibility', subtitle: 'Match company criteria', icon: ShieldCheck },
    { id: 4, title: 'Financial Valuation', subtitle: 'Budget & expected value', icon: IndianRupee },
    { id: 5, title: 'Reference Docs', subtitle: 'Attach tender documents', icon: UploadCloud },
    { id: 6, title: 'Internal Team', subtitle: 'Assign team members', icon: Users },
    { id: 7, title: 'Registration', subtitle: 'Finalize internal entry', icon: Send },
  ];

  const handleNext = () => {
    if (activeStep < sections.length) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] animate-in fade-in duration-700">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Plus size={20} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Register New Tender</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all">
            <Plus size={18} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8 grid grid-cols-12 gap-8">
        {/* Left Sidebar - Steps */}
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky top-28 space-y-8">
            <div className="space-y-4">
              {sections.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${activeStep === step.id
                    ? 'bg-white shadow-xl shadow-blue-100/50 ring-1 ring-blue-100'
                    : 'hover:bg-white hover:shadow-md'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${activeStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : activeStep > step.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {activeStep > step.id ? <CheckSquare size={16} /> : step.id}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black tracking-tight ${activeStep === step.id ? 'text-blue-600' : 'text-slate-600'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">{step.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Need Help Card */}
            {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] p-8 relative overflow-hidden group border border-blue-100/50">
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-blue-100 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HelpCircle className="text-blue-600" size={32} />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">Need Help?</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Check our documentation for tender creation guide.</p>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-white text-blue-600 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 hover:shadow-xl transition-all active:scale-95">
                  <span>View Guide</span>
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
            </div> */}
          </div>
        </div>

        {/* Right Content - Form Sections */}
        <div className="col-span-12 lg:col-span-9 pb-20">
          <div className="animate-in slide-in-from-right-8 duration-500">
            {/* Section 1: Basic Details */}
            {activeStep === 1 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Opportunity Overview</h3>
                    <p className="text-xs text-slate-500 font-medium">Log the essential information about this tender opportunity.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tender Title <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Infrastructure Development Jaipur" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="">Select registered client</option>
                      {clients?.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tender Reference ID <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. TNDR/2024/001" 
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Type <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="Private">Private Firm</option>
                      <option value="Government">Govt. Firm</option>
                      <option value="PSU">PSU</option>
                      <option value="Non-Profit">Non-Profit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Deadline <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      value={formData.submissionDate ? formData.submissionDate.split('T')[0] : ''}
                      onChange={(e) => setFormData({...formData, submissionDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Project Scope */}
            {activeStep === 2 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Project Scope</h3>
                    <p className="text-xs text-slate-500 font-medium">Define the boundaries and requirements of the project.</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Description <span className="text-rose-500">*</span></label>
                    <textarea 
                      value={formData.scope}
                      onChange={(e) => setFormData({...formData, scope: e.target.value})}
                      placeholder="Detailed overview of the project objectives..." rows={5} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Milestones <span className="text-rose-500">*</span></label>
                      <textarea 
                        value={formData.milestones}
                        onChange={(e) => setFormData({...formData, milestones: e.target.value})}
                        placeholder="List key deliverables..." rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Eligibility & Conditions */}
            {activeStep === 3 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Eligibility & Conditions</h3>
                    <p className="text-xs text-slate-500 font-medium">Specify the criteria for qualified bidders.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Criteria <span className="text-rose-500">*</span></label>
                    <textarea 
                      value={formData.techCriteria}
                      onChange={(e) => setFormData({...formData, techCriteria: e.target.value})}
                      placeholder="Required technical expertise and past experience..." rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Required Certifications <span className="text-rose-500">*</span></label>
                    <textarea 
                      value={formData.certifications}
                      onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                      placeholder="ISO, Industry specific certifications..." rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terms & Conditions <span className="text-rose-500">*</span></label>
                    <textarea 
                      value={formData.terms}
                      onChange={(e) => setFormData({...formData, terms: e.target.value})}
                      placeholder="Legal and operational terms..." rows={3} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Financial Details */}
            {activeStep === 4 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-100">
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Details</h3>
                    <p className="text-xs text-slate-500 font-medium">Define the budget and payment structure.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Budget (INR) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        placeholder="0.00" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax (%) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.tax}
                        onChange={(e) => setFormData({...formData, tax: e.target.value})}
                        placeholder="18" className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Terms <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                      <option value="Milestone Based">Milestone Based</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Advanced Payment">Advanced Payment</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Documents Upload */}
            {activeStep === 5 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Documents Upload</h3>
                      <p className="text-xs text-slate-500 font-medium">Attach all necessary documentation for the tender.</p>
                    </div>
                  </div>
                  <button
                    onClick={addDocumentSlot}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Add More Files</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {documentSlots.map((upload) => (
                    <div key={upload.id} className="space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{upload.label} <span className="text-rose-500">*</span></label>
                        {!upload.isFixed && (
                          <button
                            onClick={() => removeDocumentSlot(upload.id)}
                            className="text-rose-500 hover:text-rose-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <div className={`border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all group cursor-pointer relative overflow-hidden h-full flex flex-col justify-center
                        ${upload.url ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50/50'}
                      `}>
                        {isUploading === upload.id ? (
                          <div className="flex flex-col items-center animate-pulse">
                            <Upload size={32} className="text-blue-600 animate-bounce mb-4" />
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Uploading...</p>
                          </div>
                        ) : upload.url ? (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6">
                              <CheckSquare size={32} />
                            </div>
                            <p className="text-sm font-black text-slate-900 mb-1 truncate w-full px-4">{upload.fileName}</p>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">File Secured</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all text-slate-400 shadow-sm">
                              <Upload size={32} />
                            </div>
                            <p className="text-sm font-black text-slate-900 mb-1">Drop file here</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">or click to browse</p>
                            <div className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:border-blue-500 group-hover:text-blue-600 transition-all shadow-sm">Browse Files</div>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => handleFileUpload(e.target.files[0], upload.id)}
                        />
                        {!upload.url && <p className="text-[9px] text-slate-400 mt-6 font-bold italic">{upload.format}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Assignments */}
            {activeStep === 6 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Internal Team Assignment</h3>
                    <p className="text-xs text-slate-500 font-medium">Assign internal team members to manage this tender flow.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tender Manager <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.teamAssignments?.managerId}
                      onChange={(e) => setFormData({
                        ...formData, 
                        teamAssignments: { ...formData.teamAssignments, managerId: e.target.value }
                      })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="">Select manager</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reviewer <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.teamAssignments?.reviewerId}
                      onChange={(e) => setFormData({
                        ...formData, 
                        teamAssignments: { ...formData.teamAssignments, reviewerId: e.target.value }
                      })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="">Select reviewer</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Approval Owner <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.teamAssignments?.approverId}
                      onChange={(e) => setFormData({
                        ...formData, 
                        teamAssignments: { ...formData.teamAssignments, approverId: e.target.value }
                      })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="">Select owner</option>
                      {members.filter(m => m.role === 'Admin').map(member => (
                        <option key={member.id} value={member.id}>{member.name} (Admin)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Section 7: Submission */}
            {activeStep === 7 && (
              <div className="card p-10 bg-white border-none shadow-2xl shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                    <Send size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Entry Completion</h3>
                    <p className="text-xs text-slate-500 font-medium">Review and finalize the tender entry in our management system.</p>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-10">
                  <div className="col-span-12 lg:col-span-7 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Mode <span className="text-rose-500">*</span></label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                        <option>Online Portal</option>
                        <option>Physical Submission</option>
                        <option>Email Submission</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Address/URL <span className="text-rose-500">*</span></label>
                      <textarea placeholder="Paste the submission link or detailed address here..." rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Submission Checklist</label>
                    <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-4 border border-slate-100">
                      {[
                        'Tender Notice Read & Understood',
                        'All Documents Attached',
                        'Eligibility Criteria Met',
                        'Financial Details Verified',
                        'Internal Review Completed',
                        'Approval Obtained',
                        'Ready for Submission',
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-4 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                              <CheckSquare className="text-white opacity-0 peer-checked:opacity-100 transition-all" size={16} />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-12 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50">
              <button
                onClick={handleBack}
                disabled={activeStep === 1}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 active:scale-95'
                  }`}
              >
                <ChevronLeft size={20} />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2">
                {sections.map(s => (
                  <div key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${activeStep === s.id ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}></div>
                ))}
              </div>

              {activeStep === sections.length ? (
                <button 
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all shadow-xl active:scale-95 uppercase tracking-widest group"
                >
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  <span>{initialData ? 'Update Entry' : 'Register Opportunity'}</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 uppercase tracking-widest"
                >
                  <span>Next Step</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTender;
