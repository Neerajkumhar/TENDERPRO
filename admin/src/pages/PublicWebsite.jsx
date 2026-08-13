import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Building2, 
  Users, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Layers, 
  Send, 
  Star, 
  Crown, 
  Mail, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Globe, 
  Lock, 
  Zap, 
  FileText, 
  HelpCircle, 
  BarChart3, 
  PhoneCall, 
  Sparkles,
  ArrowLeft,
  Menu,
  ChevronDown,
  Play,
  Download,
  Award,
  CheckSquare,
  Sliders,
  Briefcase,
  Clock
} from 'lucide-react';

const PublicWebsite = ({ onNavigateLogin, onNavigateSignup }) => {
  const [isYearly, setIsYearly] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('business');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [showApplyFormPage, setShowApplyFormPage] = useState(false);
  const [showPlanCheckoutModal, setShowPlanCheckoutModal] = useState(false);
  const [showDemoSuccessModal, setShowDemoSuccessModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  
  // Interactive section states
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeSolutionTab, setActiveSolutionTab] = useState('contractors');
  const [selectedFeature, setSelectedFeature] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    phoneNumber: '',
    jobRole: '',
    noOfEmployees: '',
    country: '',
    requirements: '',
    selectedPlan: 'Business Plan'
  });

  const [checkoutFormData, setCheckoutFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    phoneNumber: '',
    selectedPlanId: 'business'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openApplyDemo = (email = '') => {
    setFormData(prev => ({
      ...prev,
      workEmail: email || prev.workEmail || demoEmail || ''
    }));
    setShowApplyFormPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFormSubmit = (e) => {
    e.preventDefault();
    setSubmittedEmail(formData.workEmail);
    localStorage.setItem('preSelectedPlan', formData.selectedPlan || 'Business Plan');
    localStorage.setItem('trialStartDate', new Date().toISOString());
    localStorage.setItem('subscriptionActive', 'false');
    localStorage.removeItem('isTrialExpiredSimulated');
    setShowApplyFormPage(false);
    setShowDemoSuccessModal(true);
    showToast(`Demo application submitted for ${formData.workEmail || 'your account'}! (Selected plan: ${formData.selectedPlan || 'Business Plan'})`);
    setFormData({
      fullName: '',
      workEmail: '',
      companyName: '',
      phoneNumber: '',
      jobRole: '',
      noOfEmployees: '',
      country: '',
      requirements: '',
      selectedPlan: 'Business Plan'
    });
    setDemoEmail('');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setSubmittedEmail(checkoutFormData.workEmail);
    const planObj = plans.find(p => p.id === checkoutFormData.selectedPlanId);
    const planName = planObj ? planObj.name + ' Plan' : 'Business Plan';
    localStorage.setItem('preSelectedPlan', planName);
    localStorage.setItem('trialStartDate', new Date().toISOString());
    localStorage.setItem('subscriptionActive', 'false');
    localStorage.removeItem('isTrialExpiredSimulated');
    setShowPlanCheckoutModal(false);
    setShowDemoSuccessModal(true);
    showToast(`Plan registration completed for ${checkoutFormData.workEmail}! (Selected plan: ${planName})`);
    setCheckoutFormData({
      fullName: '',
      workEmail: '',
      companyName: '',
      phoneNumber: '',
      selectedPlanId: 'business'
    });
  };

  const handleBottomDemoSubmit = (e) => {
    e.preventDefault();
    openApplyDemo(demoEmail);
  };

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Send,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'Perfect for small teams and independent contractors getting started.',
      priceMonthly: '₹2,999',
      priceYearly: '₹2,499',
      annualTotal: 'Billed ₹24,990 annually',
      users: 'Up to 5 Users',
      features: [
        'Up to 5 User Seats',
        'Basic Financial Reports',
        'Email & Ticket Support',
        'Document Management (5GB)',
        'Tender Bidding Engine'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      isPopular: true,
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Ideal for growing businesses needing team oversight & financial workflows.',
      priceMonthly: '₹5,999',
      priceYearly: '₹4,999',
      annualTotal: 'Billed ₹45,990 annually',
      users: 'Up to 10 Users',
      features: [
        'Up to 10 User Seats',
        'Everything in Starter',
        'Team Management & Roles',
        'Invoices, Payments & Expenses',
        'Advanced Financial Analytics',
        'Priority Phone & Chat Support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Star,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      description: 'Advanced tools & analytics for multi-project infrastructure leaders.',
      priceMonthly: '₹9,999',
      priceYearly: '₹8,999',
      annualTotal: 'Billed ₹89,990 annually',
      users: 'Up to 25 Users',
      features: [
        'Up to 25 User Seats',
        'Everything in Business',
        'Custom Workflow Automation',
        'Developer API & Webhooks',
        'Dedicated Success Manager',
        'Challan & Asset Tracking'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      description: 'Tailored solutions for large conglomerates & government agencies.',
      priceMonthly: 'Custom',
      priceYearly: 'Custom',
      annualTotal: 'Contact sales for custom pricing',
      users: 'Unlimited Users',
      features: [
        'Unlimited User Seats',
        'Custom Integrations & ERP Sync',
        'On-Premise / Isolated Cloud',
        'SLA & 24/7 Priority Support',
        'Dedicated Onboarding Team'
      ]
    }
  ];

  const featuresList = [
    {
      id: 'orgs',
      title: 'Organization Management',
      icon: Building2,
      color: 'blue',
      desc: 'Create, audit and govern multiple business entities from a centralized control panel with role-based access.',
      detail: 'Manage unlimited subsidiaries, branches, and entity structures. Centralize compliance documents, tax IDs, and global settings across your organization.'
    },
    {
      id: 'users',
      title: 'User & Role Control',
      icon: Users,
      color: 'cyan',
      desc: 'Enforce security with fine-grained access rules, permission matrixes, and audit trail records.',
      detail: 'Define custom role permissions for Tender Managers, Finance Leads, Site Engineers, and Subcontractors to ensure strict data segregation.'
    },
    {
      id: 'subs',
      title: 'Subscription & Billing',
      icon: CreditCard,
      color: 'indigo',
      desc: 'Flexible SaaS pricing plans, automated invoice generation, renewal alerts, and tier management.',
      detail: 'Automate billing cycles, handle plan upgrades/downgrades seamlessly, and generate recurring GST-compliant tax invoices automatically.'
    },
    {
      id: 'payments',
      title: 'Payments & Invoices',
      icon: Wallet,
      color: 'emerald',
      desc: 'Track accounts receivable/payable, generate delivery challans, and sync vendor payment receipts.',
      detail: 'Integrated invoice generation, expense filing, installation challans, and payment gateway reconciliation for tender projects.'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: TrendingUp,
      color: 'purple',
      desc: 'Gain real-time business insights with interactive revenue charts, tender win rates, and cash flow reports.',
      detail: 'Export comprehensive PDF/Excel reports on tender profitability, department budgets, member attendance, and active project health.'
    },
    {
      id: 'tenders',
      title: 'Tender Bidding Suite',
      icon: FileText,
      color: 'amber',
      desc: 'End-to-end tender lifecycle tracking from discovery and document prep to submission and award.',
      detail: 'Track EMD deposits, deadline alerts, competitor analysis, document checklists, and submission status across government & private portals.'
    }
  ];

  const faqs = [
    {
      q: 'How does the 3-Day Free Demo work?',
      a: 'Once you fill out the application form, our onboarding team sets up a fully functional demo account for your team within 24 hours. You get 3 full days of unrestricted access to explore Tenders, Projects, Financials, and Team Management with zero credit card required.'
    },
    {
      q: 'Can I switch or upgrade my subscription plan later?',
      a: 'Yes! You can upgrade, downgrade, or adjust user seats anytime from your Subscription Settings. Upgrades take effect immediately with pro-rated billing calculation.'
    },
    {
      q: 'Is our tender and financial data secure?',
      a: 'Absolutely. TenderPro uses enterprise-grade 256-bit SSL encryption for data in transit and AES-256 encryption at rest. We adhere to ISO 27001 standards and execute regular vulnerability assessments.'
    },
    {
      q: 'Does TenderPro support multi-organization management?',
      a: 'Yes, our Business and Enterprise plans allow Super Admins and Enterprise owners to manage multiple legal entities, clients, and branches from a unified dashboard.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major Credit Cards, Debit Cards, Net Banking, UPI (GPay, PhonePe, Paytm), and Direct Bank Wire Transfer (NEFT/RTGS/IMPS) for quarterly and annual invoicing.'
    },
    {
      q: 'Do you offer dedicated customer support & onboarding?',
      a: 'Yes, all plans include email and ticket support. Business and Professional plans include priority phone support, while Enterprise accounts receive a dedicated Account Manager and custom training sessions.'
    }
  ];

  const solutions = {
    contractors: {
      title: 'For Main Construction Contractors',
      subtitle: 'Streamline bid management, sub-contractor allocations, and project budgets in one unified suite.',
      points: [
        'Centralized Tender Document Repository & EMD Tracking',
        'Sub-contractor Assignment & Performance Scoring',
        'Budget vs Actual Cost Reconciliation',
        'Automate Installation & Delivery Challan Sign-offs'
      ]
    },
    subcontractors: {
      title: 'For Sub-contractors & Vendors',
      subtitle: 'Accelerate payment approvals, track work orders, and never miss a tender milestone.',
      points: [
        'Instant Work Order Notifications & Milestone Updates',
        'Direct Invoice & Expense Receipt Uploads',
        'Delivery Challan Proof & Attendance Logs',
        'Fast-track Payment Status Transparency'
      ]
    },
    enterprises: {
      title: 'For Infrastructure Developers & Enterprises',
      subtitle: 'Manage multi-entity portfolios, cross-department governance, and executive analytics.',
      points: [
        'Multi-Organization Management & Executive Dashboards',
        'Granular Role-based Access & Audit Logs',
        'API & ERP Integration (SAP, Tally, Oracle)',
        'Custom Approval Matrixes & Financial Controls'
      ]
    },
    bidders: {
      title: 'For Government Tender Specialists',
      subtitle: 'Win more tenders with organized document vaults, deadline alerts, and bid tracking.',
      points: [
        'Government Portal Bid Management (GeM, eProcure, CPWD)',
        'Automated Deadline Reminders & EMD Refund Alerts',
        'BoQ Cost Estimation & Competitor Win/Loss Metrics',
        'Audit-ready Document Bundling & Compliance Checks'
      ]
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    localStorage.setItem('preSelectedPlan', plan.name + ' Plan');
    if (plan.id === 'enterprise') {
      setShowContactModal(true);
    } else {
      setCheckoutFormData(prev => ({
        ...prev,
        selectedPlanId: plan.id
      }));
      setShowPlanCheckoutModal(true);
    }
  };

  // If viewing dedicated full-page Demo Application
  if (showApplyFormPage) {
    return (
      <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowApplyFormPage(false)}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 border border-blue-400/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900">TENDER</span>
                  <span className="text-lg font-black tracking-tight text-blue-600">PRO</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">3-Days Free Trial & Demo Application</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setShowApplyFormPage(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  if (onNavigateLogin) {
                    onNavigateLogin();
                  } else {
                    window.location.href = '/login';
                  }
                }}
                className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        </header>

        {/* Full Page Body */}
        <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
            
            {/* Left Column: Benefits & Trust Callout */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200/80 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>3 Days Free Trial Demo</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Start Your 3 Days Free Trial Demo
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Fill out the form to request a personalized 3-day demo environment tailored for your organization.
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Full Platform Access</p>
                    <p className="text-[11px] text-slate-500 font-normal">Explore Tenders, Projects, Team & Financials</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Zero Obligation & Instant Setup</p>
                    <p className="text-[11px] text-slate-500 font-normal">No credit card required. Cancel anytime.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dedicated Specialist Onboarding</p>
                    <p className="text-[11px] text-slate-500 font-normal">Our team configures your environment in 24 hours.</p>
                  </div>
                </div>
              </div>

              {/* Enterprise Security Banner */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-5 shadow-xl space-y-2 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-white">
                  <ShieldCheck size={20} className="text-blue-400" />
                  <span>Enterprise Security Assurance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Your data is encrypted end-to-end and strictly managed according to enterprise privacy standards.
                </p>
              </div>
            </div>

            {/* Right Column: Full Page Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-xl space-y-6">
                
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Apply for Demo
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                    Please fill in your company details below to request your 3-day demo access.
                  </p>
                </div>

                <form onSubmit={handleApplyFormSubmit} className="space-y-4 text-xs sm:text-sm">
                  
                  {/* Full Name */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email"
                      required
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      placeholder="Enter your work email"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Row 1: Company Name & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter company name"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                        <div className="px-3 bg-slate-50 border-r border-slate-200 flex items-center gap-1.5 text-slate-700 font-medium text-xs sm:text-sm shrink-0">
                          <span className="text-base leading-none">🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input 
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="Enter phone number"
                          className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-xs sm:text-sm placeholder-slate-400 outline-none min-w-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Preferred Plan & Job Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                        Preferred Trial Plan
                      </label>
                      <select 
                        value={formData.selectedPlan}
                        onChange={(e) => setFormData({ ...formData, selectedPlan: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                      >
                        <option value="Starter Plan">Starter Plan (5 Users)</option>
                        <option value="Business Plan">Business Plan (10 Users)</option>
                        <option value="Professional Plan">Professional Plan (25 Users)</option>
                        <option value="Enterprise Plan">Enterprise Plan (Unlimited)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                        Job Role <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.jobRole}
                        onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                      >
                        <option value="" disabled>Select your role</option>
                        <option value="CEO / Founder">CEO / Founder</option>
                        <option value="Director / VP">Director / VP</option>
                        <option value="Manager / Lead">Manager / Lead</option>
                        <option value="Tender Specialist / Bid Manager">Tender Specialist / Bid Manager</option>
                        <option value="Engineer / Estimator">Engineer / Estimator</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: No. of Employees & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                        No. of Employees <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.noOfEmployees}
                        onChange={(e) => setFormData({ ...formData, noOfEmployees: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                      >
                        <option value="" disabled>Select company size</option>
                        <option value="1 - 10 employees">1 - 10 employees</option>
                        <option value="11 - 50 employees">11 - 50 employees</option>
                        <option value="51 - 200 employees">51 - 200 employees</option>
                        <option value="201 - 500 employees">201 - 500 employees</option>
                        <option value="500+ employees">500+ employees</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                      >
                        <option value="" disabled>Select your country</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs sm:text-sm">
                      How can we help you?
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Tell us about your requirements (optional)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-[#1E56F0] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition mt-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Start Free Demo</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1 text-center">
                    <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
                    <span>No credit card required • Full access • Cancel anytime</span>
                  </div>

                </form>
              </div>
            </div>

          </div>
        </main>

        {/* Page Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Visuark. All rights reserved. <span className="mx-1 hidden sm:inline">•</span> <span className="font-semibold text-slate-700">Made by: Khushi Rajawat & Neeraj Kumar</span></p>
            <button onClick={() => setShowApplyFormPage(false)} className="text-blue-600 font-bold hover:underline cursor-pointer">
              Back to Home Page
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // MAIN WEBSITE LANDING PAGE VIEW
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">TENDER</span>
                <span className="text-lg font-black tracking-tight text-blue-600">PRO</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide hidden xs:block">One Platform. Complete Control.</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-blue-600 transition cursor-pointer">Solutions</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 transition cursor-pointer">Pricing</button>
            <button onClick={() => scrollToSection('resources')} className="hover:text-blue-600 transition cursor-pointer">Resources</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition cursor-pointer">About Us</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-blue-600 transition cursor-pointer">Testimonials</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-blue-600 transition cursor-pointer">FAQ</button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={() => {
                if (onNavigateLogin) {
                  onNavigateLogin();
                } else {
                  showToast('Redirecting to login portal...');
                  window.location.href = '/login';
                }
              }}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Log In
            </button>

            <button 
              onClick={() => openApplyDemo()}
              className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply for Demo</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-4 pb-6 border-t border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700 px-2">
              <button onClick={() => scrollToSection('features')} className="text-left py-2 hover:text-blue-600 transition">Features</button>
              <button onClick={() => scrollToSection('solutions')} className="text-left py-2 hover:text-blue-600 transition">Solutions</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left py-2 hover:text-blue-600 transition">Pricing</button>
              <button onClick={() => scrollToSection('resources')} className="text-left py-2 hover:text-blue-600 transition">Resources & Stats</button>
              <button onClick={() => scrollToSection('about')} className="text-left py-2 hover:text-blue-600 transition">About Us</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-left py-2 hover:text-blue-600 transition">Testimonials</button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-2 hover:text-blue-600 transition">FAQ</button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5 px-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigateLogin) onNavigateLogin();
                  else window.location.href = '/login';
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold text-center"
              >
                Log In
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openApplyDemo();
                }}
                className="w-full py-2.5 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center shadow-md"
              >
                Apply for 3 Days Free Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-white">
        {/* Glowing Background Radial Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                One Platform. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                  Complete Control.
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
                Manage tenders, projects, organizations, subscriptions, payments, and team operations – all from one powerful unified workspace.
              </p>
            </div>

            {/* Feature Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-700 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>All-in-One Solution</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Scalable Architecture</span>
              </div>
            </div>

            {/* Hero Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button 
                onClick={() => openApplyDemo()}
                className="px-6 py-3.5 bg-[#1E56F0] hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl text-xs font-extrabold shadow-xl shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Apply for 3 Days Demo</span>
                <ArrowRight size={16} />
              </button>

              <button 
                onClick={() => scrollToSection('pricing')}
                className="px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                View Plans & Pricing
              </button>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              No credit card required • 3 Days full access • Setup in 24 hours
            </p>

          </div>

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <img 
              src="/images/hero-team.png" 
              alt="TenderPro Team & Enterprise Collaboration" 
              className="w-full h-auto max-w-lg lg:max-w-none object-contain drop-shadow-lg"
            />
          </div>

        </div>
      </section>

      {/* 3. TRUSTED COMPANIES SECTION */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
            Trusted by growing construction firms, infrastructure agencies & contractors
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-600 font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-2 hover:text-blue-600 transition cursor-pointer" onClick={() => showToast('BuildTech Pvt Ltd client profile')}>
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>BuildTech</span>
            </div>
            <div className="flex items-center gap-2 hover:text-indigo-600 transition cursor-pointer" onClick={() => showToast('InfraProjects client profile')}>
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>InfraProjects</span>
            </div>
            <div className="flex items-center gap-2 hover:text-cyan-600 transition cursor-pointer" onClick={() => showToast('Urban Developers client profile')}>
              <Building2 className="w-5 h-5 text-cyan-600" />
              <span>Urban Developers</span>
            </div>
            <div className="flex items-center gap-2 hover:text-emerald-600 transition cursor-pointer" onClick={() => showToast('Green Infra client profile')}>
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Green Infra</span>
            </div>
            <div className="flex items-center gap-2 hover:text-rose-600 transition cursor-pointer" onClick={() => showToast('Raj Construction client profile')}>
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              <span>Raj Construction</span>
            </div>
            <div className="flex items-center gap-2 hover:text-amber-500 transition cursor-pointer" onClick={() => showToast('Alpha Builders client profile')}>
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Alpha Builders</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-12 sm:py-16 px-4 sm:px-8 bg-slate-50/70">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 text-center">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} />
              <span>Core Modules</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful Features to Simplify Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Everything you need to manage tenders, track budgets, and scale your operations.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 text-left">
            {featuresList.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={feat.id} 
                  className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-4 hover:border-blue-400 hover:shadow-xl transition group shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{feat.title}</h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedFeature(feat)}
                    className="pt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. SOLUTIONS SECTION */}
      <section id="solutions" className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Layers size={14} />
              <span>Tailored Solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Every Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Discover how TenderPro transforms operations for your specific industry role.
            </p>
          </div>

          {/* Solutions Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
            <button 
              onClick={() => setActiveSolutionTab('contractors')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSolutionTab === 'contractors' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Main Contractors
            </button>
            <button 
              onClick={() => setActiveSolutionTab('subcontractors')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSolutionTab === 'subcontractors' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sub-contractors & Vendors
            </button>
            <button 
              onClick={() => setActiveSolutionTab('enterprises')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSolutionTab === 'enterprises' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Infra Developers & Enterprises
            </button>
            <button 
              onClick={() => setActiveSolutionTab('bidders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSolutionTab === 'bidders' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Government Tender Bidders
            </button>
          </div>

          {/* Active Solution Card Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {solutions[activeSolutionTab].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {solutions[activeSolutionTab].subtitle}
                </p>

                <div className="space-y-3 pt-1">
                  {solutions[activeSolutionTab].points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  <button 
                    onClick={() => openApplyDemo()}
                    className="px-5 py-3 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Request Solution Demo</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Solution Highlights</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Verified Workflow Template</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Configured out-of-the-box to accelerate your bidding velocity, improve margin predictability, and reduce compliance liability.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="py-12 sm:py-16 px-4 sm:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/60 relative">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <CreditCard size={14} />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple Pricing. <span className="text-blue-600">Maximum Value.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Choose the perfect plan for your business with no hidden fees.
            </p>

            {/* Frequency Toggle Switch */}
            <div className="pt-3 flex items-center justify-center">
              <div className="bg-slate-100 p-1.5 rounded-full border border-slate-200 flex items-center gap-1 relative shadow-inner">
                <button 
                  onClick={() => setIsYearly(false)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    !isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Billing
                </button>

                <button 
                  onClick={() => setIsYearly(true)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yearly Billing
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {plans.map((plan) => {
              const IconComp = plan.icon;
              const isSelected = selectedPlanId === plan.id;
              const displayPrice = isYearly ? plan.priceYearly : plan.priceMonthly;

              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-2xl p-6 space-y-5 flex flex-col justify-between transition cursor-pointer relative ${
                    plan.isPopular 
                      ? 'bg-gradient-to-b from-blue-50/90 via-white to-white border-2 border-blue-600 shadow-xl shadow-blue-500/10' 
                      : isSelected 
                      ? 'bg-white border-2 border-blue-500 shadow-lg ring-2 ring-blue-500/20' 
                      : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${plan.iconBg}`}>
                          <IconComp size={16} />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Selected</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium min-h-[36px]">
                      {plan.description}
                    </p>

                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{displayPrice}</span>
                        {displayPrice !== 'Custom' && <span className="text-xs text-slate-500 font-medium">/month</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {displayPrice === 'Custom' ? plan.annualTotal : isYearly ? plan.annualTotal : 'Billed monthly'}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-200 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Check size={14} className="text-blue-600 shrink-0" />
                        <span>{plan.users}</span>
                      </div>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check size={14} className="text-blue-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      plan.isPopular 
                        ? 'bg-[#1E56F0] hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900'
                    }`}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. RESOURCES & STATS SECTION */}
      <section id="resources" className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
              <Award size={14} className="text-slate-600" />
              <span>Platform Statistics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Trusted Performance at Scale
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Empowering organizations nationwide to bid, manage, and deliver infrastructure projects seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-50 border border-slate-200/80 p-5 sm:p-6 rounded-xl space-y-1 shadow-xs hover:shadow-md transition">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900">99.9%</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Uptime</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 sm:p-6 rounded-xl space-y-1 shadow-xs hover:shadow-md transition">
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-600">10,000+</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenders Managed</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 sm:p-6 rounded-xl space-y-1 shadow-xs hover:shadow-md transition">
              <h3 className="text-3xl sm:text-4xl font-black text-purple-600">500+</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Enterprises</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 sm:p-6 rounded-xl space-y-1 shadow-xs hover:shadow-md transition">
              <h3 className="text-3xl sm:text-4xl font-black text-amber-600">₹500Cr+</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tender Volume</p>
            </div>
          </div>

          {/* Helpful Resource Downloads */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900">Looking for technical specs & security documentation?</h4>
              <p className="text-xs text-slate-600">Download our platform whitepaper and security architecture overview.</p>
            </div>

            <button 
              onClick={() => showToast('Downloading TenderPro Technical Whitepaper...')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              <Download size={16} />
              <span>Download Whitepaper</span>
            </button>
          </div>

        </div>
      </section>

      {/* 8. ABOUT US SECTION */}
      <section id="about" className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Globe size={14} />
                <span>About TenderPro</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Reinventing How Businesses Win & Deliver Tenders
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                TenderPro was built to replace fragmented spreadsheets, missed bid deadlines, and disconnected financial tracking with a singular, intelligent command center.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                From small sub-contractors submitting local bids to multi-entity conglomerates governing infrastructure projects across states, TenderPro brings clarity, speed, and governance.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-900">ISO 27001 Certified</h4>
                  <p className="text-[11px] text-slate-500">Enterprise Data Security</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-900">24/7 Operations</h4>
                  <p className="text-[11px] text-slate-500">Continuous Monitoring</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-2xl p-7 text-white space-y-5 shadow-xl">
                <h3 className="text-2xl font-extrabold">Our Mission</h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  "To empower construction, engineering, and infrastructure enterprises with seamless digital tools that maximize win rates, automate administrative friction, and drive operational excellence."
                </p>
                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">Engineering Leadership Team</p>
                    <p className="text-blue-200 text-[11px]">TenderPro Suite</p>
                  </div>
                  <ShieldCheck size={32} className="text-blue-300" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-12 sm:py-16 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider">
              <Star size={14} />
              <span>Customer Success</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Loved by Industry Leaders
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              See how companies scale faster with TenderPro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "TenderPro streamlined our bidding pipeline completely. We eliminated bid deadline bottlenecks and increased our tender win rate by 34% within 6 months."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rajesh Sharma</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Director, BuildTech Pvt Ltd</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "Managing payments, installation challans, and team attendance across 14 site projects used to be chaotic. TenderPro brought everything under one dashboard."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  VS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Vikram Singh</h4>
                  <p className="text-[10px] text-slate-500 font-medium">VP Operations, InfraProjects</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "The financial invoice reconciliation engine and sub-contractor allocations alone saved our finance team hundreds of hours every month."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  AG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ananya Gupta</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Head of Finance, Green Infra</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Everything you need to know about TenderPro trials, pricing, and security.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition"
                >
                  <button 
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-200/60 pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. 3-DAY DEMO CTA SECTION */}
      <section id="demo" className="py-10 sm:py-14 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-white via-blue-50/60 to-indigo-50/60 border border-blue-100 rounded-2xl p-6 sm:p-9 shadow-lg relative overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: 3D Calendar Emblem & Info */}
            <div className="md:col-span-6 flex items-start gap-5">
              
              {/* 3D Calendar Badge Graphic */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 p-2 shadow-xl shrink-0 flex flex-col justify-between border border-blue-400/40 relative">
                <div className="h-4 bg-white/20 rounded-md flex items-center justify-around px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <div className="text-center my-auto">
                  <span className="text-3xl font-black text-white leading-none block">3</span>
                  <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest block">DAYS</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                  <Check size={14} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  Experience <span className="text-blue-600">Tender Pro</span> with 3 Days Free Demo
                </h3>

                <div className="space-y-1.5 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Full access to all features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Email Input Form */}
            <div className="md:col-span-6 space-y-3">
              <form onSubmit={handleBottomDemoSubmit} className="space-y-3">
                <div className="relative">
                  <input 
                    type="email"
                    required
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="Enter your work email*"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 transition shadow-xs"
                  />
                  <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  Apply for 3 Days Demo
                </button>
              </form>

              <p className="text-[10px] text-center text-slate-500 font-medium">
                Our team will contact you within 24 hours
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 12. FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-200 pt-12 pb-8 px-4 sm:px-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-black text-slate-900">TENDER</span>
                  <span className="text-base font-black text-blue-600">PRO</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-sm font-normal leading-relaxed">
                The all-in-one platform to manage tenders, organizations, users, subscriptions, payments, and operational workflows.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => showToast('Facebook page')} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer" title="Facebook">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button onClick={() => showToast('Twitter / X profile')} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer" title="Twitter / X">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button onClick={() => showToast('LinkedIn profile')} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer" title="LinkedIn">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </button>
                <button onClick={() => showToast('Instagram page')} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer" title="Instagram">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </button>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Product</p>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition cursor-pointer">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 transition cursor-pointer">Pricing</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-blue-600 transition cursor-pointer">Solutions</button></li>
                <li><button onClick={() => showToast('Roadmap: AI BoQ Estimation coming Q3 2026')} className="hover:text-blue-600 transition cursor-pointer">Roadmap</button></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Resources</p>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => showToast('Opening API & Developer Specs...')} className="hover:text-blue-600 transition cursor-pointer">Documentation</button></li>
                <li><button onClick={() => showToast('Help Center: support@tenderpro.com')} className="hover:text-blue-600 transition cursor-pointer">Help Center</button></li>
                <li><button onClick={() => showToast('Blog: Winning GeM Tenders in 2026')} className="hover:text-blue-600 transition cursor-pointer">Blog</button></li>
                <li><button onClick={() => showToast('REST API Reference v2.4')} className="hover:text-blue-600 transition cursor-pointer">API Reference</button></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3">
              <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Company</p>
              <ul className="space-y-2 font-medium">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition cursor-pointer">About Us</button></li>
                <li><button onClick={() => setShowContactModal(true)} className="hover:text-blue-600 transition cursor-pointer">Contact Us</button></li>
                <li><button onClick={() => showToast('Careers: We are hiring Senior React & Node Engineers!')} className="hover:text-blue-600 transition cursor-pointer">Careers</button></li>
                <li><button onClick={() => showToast('Privacy Policy: Enterprise Data Security Compliant')} className="hover:text-blue-600 transition cursor-pointer">Privacy Policy</button></li>
              </ul>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
            <p>© 2026 Visuark. All rights reserved. <span className="mx-1 hidden sm:inline">•</span> <span className="font-semibold text-slate-700">Made by: Khushi Rajawat & Neeraj Kumar</span></p>
            <div className="flex items-center gap-6">
              <button onClick={() => showToast('Terms of Service')} className="hover:text-slate-800 transition cursor-pointer">Terms of Service</button>
              <button onClick={() => showToast('Privacy Policy')} className="hover:text-slate-800 transition cursor-pointer">Privacy Policy</button>
            </div>
          </div>

        </div>
      </footer>

      {/* PLAN CHECKOUT / REGISTRATION MODAL */}
      {showPlanCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Start 3-Day Free Trial</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Selected Plan Registration</p>
                </div>
              </div>
              <button onClick={() => setShowPlanCheckoutModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Plan Switcher Header inside Modal */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Selected Plan:</span>
                  <h4 className="text-lg font-black text-slate-900">
                    {plans.find(p => p.id === checkoutFormData.selectedPlanId)?.name} Plan
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-600">
                    {isYearly 
                      ? plans.find(p => p.id === checkoutFormData.selectedPlanId)?.priceYearly 
                      : plans.find(p => p.id === checkoutFormData.selectedPlanId)?.priceMonthly
                    }
                  </span>
                  <span className="text-[10px] text-slate-500 block font-medium">/month ({isYearly ? 'Yearly' : 'Monthly'})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-xs font-semibold text-slate-700">
                <span>{plans.find(p => p.id === checkoutFormData.selectedPlanId)?.users}</span>
                <span className="text-emerald-600 font-bold">3 Days Free Trial • Instant Access</span>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select / Switch Plan</label>
                <select 
                  value={checkoutFormData.selectedPlanId}
                  onChange={(e) => setCheckoutFormData({ ...checkoutFormData, selectedPlanId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="starter">Starter Plan (₹2,499/mo yearly)</option>
                  <option value="business">Business Plan (₹4,999/mo yearly)</option>
                  <option value="professional">Professional Plan (₹8,999/mo yearly)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={checkoutFormData.fullName}
                  onChange={(e) => setCheckoutFormData({ ...checkoutFormData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Sharma" 
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition" 
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Email *</label>
                <input 
                  type="email" 
                  required 
                  value={checkoutFormData.workEmail}
                  onChange={(e) => setCheckoutFormData({ ...checkoutFormData, workEmail: e.target.value })}
                  placeholder="name@company.com" 
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={checkoutFormData.companyName}
                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, companyName: e.target.value })}
                    placeholder="e.g. BuildTech Pvt Ltd" 
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition" 
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={checkoutFormData.phoneNumber}
                    onChange={(e) => setCheckoutFormData({ ...checkoutFormData, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210" 
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition" 
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowPlanCheckoutModal(false)} className="px-4 py-2.5 text-slate-600 font-bold hover:text-slate-900 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5">
                  <span>Start 3-Day Trial</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEATURE DETAILS MODAL */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedFeature.title}</h3>
              </div>
              <button onClick={() => setSelectedFeature(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {selectedFeature.detail}
            </p>

            <div className="pt-2">
              <button 
                onClick={() => {
                  setSelectedFeature(null);
                  openApplyDemo();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Try this feature in Demo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEMO SUCCESS MODAL */}
      {showDemoSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Application Received!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you for applying for a 3-Day Free Demo with <span className="font-bold text-slate-900">{submittedEmail}</span>. Our team will configure your workspace and contact you within 24 hours.
            </p>
            <button 
              onClick={() => setShowDemoSuccessModal(false)}
              className="w-full py-3 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              Back to Website
            </button>
          </div>
        </div>
      )}

      {/* CONTACT SALES MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Crown size={20} className="text-amber-500" />
                Contact Enterprise Sales
              </h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); showToast('Sales inquiry sent! We will reach out shortly.'); setShowContactModal(false); }} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Company Name</label>
                <input type="text" required placeholder="e.g. BuildTech Pvt. Ltd." className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Work Email</label>
                <input type="email" required placeholder="name@company.com" className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Team Size</label>
                <select className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer">
                  <option>50 - 200 Users</option>
                  <option>200 - 500 Users</option>
                  <option>500+ Users</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowContactModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition cursor-pointer">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicWebsite;
