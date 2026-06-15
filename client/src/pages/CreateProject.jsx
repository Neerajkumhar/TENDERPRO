import React, { useState, useEffect } from 'react';
import {
  FileText,
  Target,
  Briefcase,
  Calendar,
  Users,
  IndianRupee,
  ShieldCheck,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  ArrowRight,
  ClipboardList,
  Layers,
  Settings,
  Flag
} from 'lucide-react';

const CreateProject = ({ onCancel, onSave, clients = [], tenders = [] }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    tenderId: '',
    clientId: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
    priority: 'Medium',
    value: '',
    budget: '',
    teamAssignments: {
      projectManager: '',
      techLead: '',
      qaLead: ''
    },
    milestones: []
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

  const sections = [
    { id: 1, title: 'Project Identity', subtitle: 'Basic branding & linkage', icon: Briefcase },
    { id: 2, title: 'Timeline & Status', subtitle: 'Schedule & priority', icon: Calendar },
    { id: 3, title: 'Scope of Work', subtitle: 'Detailed deliverables', icon: Target },
    { id: 4, title: 'Financial Framework', subtitle: 'Budget & valuation', icon: IndianRupee },
    { id: 5, title: 'Resource Team', subtitle: 'Assign leadership', icon: Users },
    { id: 6, title: 'Final Review', subtitle: 'Verify & launch', icon: Flag },
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

  const handleFinalSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="bg-[#F8FAFC] animate-in fade-in duration-700">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0">
            <Layers size={20} />
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Initialize New Project</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-12 gap-6 lg:gap-8">
        {/* Left Sidebar - Steps */}
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky lg:top-28 space-y-4 lg:space-y-8">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-3 pb-4 lg:pb-0 w-full no-scrollbar">
              {sections.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex-shrink-0 w-[220px] sm:w-[260px] lg:w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all text-left group ${activeStep === step.id
                    ? 'bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-100'
                    : 'hover:bg-white hover:shadow-md'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0 ${activeStep === step.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : activeStep > step.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {activeStep > step.id ? <CheckSquare size={16} /> : step.id}
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-black tracking-tight ${activeStep === step.id ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">{step.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content - Form Sections */}
        <div className="col-span-12 lg:col-span-9 pb-20">
          <div className="animate-in slide-in-from-right-8 duration-500">
            {/* Step 1: Project Identity */}
            {activeStep === 1 && (
              <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-6 lg:space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Project Identity</h3>
                    <p className="text-xs text-slate-500 font-medium">Define the core project and link it to an existing tender.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Title <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Smart City Infrastructure Phase 1" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Tender <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.tenderId}
                      onChange={(e) => setFormData({...formData, tenderId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="">Link to active tender</option>
                      {tenders.map(t => (
                        <option key={t.id} value={t.id}>{t.title}{t.reference ? ` (${t.reference})` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Timeline & Status */}
            {activeStep === 2 && (
              <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-6 lg:space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-100">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Timeline & Status</h3>
                    <p className="text-xs text-slate-500 font-medium">Establish the project duration and initial priority.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Completion <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Priority <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Status <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="Planned">Planned / Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Scope of Work */}
            {activeStep === 3 && (
              <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-6 lg:space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Scope of Work</h3>
                    <p className="text-xs text-slate-500 font-medium">Outline the project objectives and core deliverables.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description <span className="text-rose-500">*</span></label>
                    <textarea 
                      placeholder="Explain the project lifecycle and specific goals..." 
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Financial Framework */}
            {activeStep === 4 && (
              <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-6 lg:space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Financial Framework</h3>
                    <p className="text-xs text-slate-500 font-medium">Set the project value and operational budget.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Project Value (INR) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Working Budget (INR) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Resource Team */}
            {activeStep === 5 && (
              <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-6 lg:space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-100">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Resource Team</h3>
                    <p className="text-xs text-slate-500 font-medium">Assign a Project Manager / Department Manager to manage execution.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Manager / Department Manager <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.teamAssignments.projectManager}
                      onChange={(e) => setFormData({...formData, teamAssignments: {...formData.teamAssignments, projectManager: e.target.value}})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="">Select Manager</option>
                      {members.filter(m => m.role === 'Project Manager').map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.role} - {m.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Final Review */}
            {activeStep === 6 && (
              <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-6 lg:space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 shrink-0">
                    <Flag size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Final Review</h3>
                    <p className="text-xs text-slate-500 font-medium">Verify all details before officially launching the project entry.</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">PROJECT TITLE</p>
                      <p className="text-base sm:text-lg font-black text-slate-800">{formData.title || 'Untitled Project'}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TOTAL VALUE</p>
                      <p className="text-base sm:text-lg font-black text-indigo-600">₹{Number(formData.value).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PRIORITY</p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          formData.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                          formData.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                           {formData.priority}
                        </span>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TIMELINE</p>
                        <p className="text-[11px] font-bold text-slate-700">{formData.startDate} → {formData.endDate}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PM ASSIGNED</p>
                        <p className="text-[11px] font-bold text-slate-700">{members.find(m => m.id == formData.teamAssignments.projectManager)?.name || 'Not Assigned'}</p>
                     </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">CORE DESCRIPTION</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                      {formData.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8 sm:mt-12 bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-50 gap-2 sm:gap-4">
              <button
                onClick={handleBack}
                disabled={activeStep === 1}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 active:scale-95'
                  }`}
              >
                <ChevronLeft size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Prev</span>
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {sections.map(s => (
                  <div key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${activeStep === s.id ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}></div>
                ))}
              </div>

              {activeStep === sections.length ? (
                <button 
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-2 sm:gap-3 px-5 sm:px-10 py-2.5 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 uppercase tracking-widest group shrink-0"
                >
                  <Flag size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Launch</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 sm:gap-3 px-5 sm:px-10 py-2.5 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 uppercase tracking-widest shrink-0"
                >
                  <span>Next</span>
                  <ChevronRight size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
