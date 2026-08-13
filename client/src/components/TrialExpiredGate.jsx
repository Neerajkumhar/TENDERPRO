import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Building2, 
  Send, 
  Star, 
  Crown, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  QrCode,
  Wallet
} from 'lucide-react';

const TrialExpiredGate = ({ user, preSelectedPlan = 'Business Plan', onPaymentSuccess }) => {
  const [isYearly, setIsYearly] = useState(true);
  
  // Map pre-selected plan name to id
  const getInitialPlanId = (name) => {
    if (!name) return 'business';
    const lower = name.toLowerCase();
    if (lower.includes('starter')) return 'starter';
    if (lower.includes('pro')) return 'professional';
    if (lower.includes('enterprise')) return 'enterprise';
    return 'business';
  };

  const [selectedPlanId, setSelectedPlanId] = useState(getInitialPlanId(preSelectedPlan));
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    companyName: 'BuildTech Pvt Ltd',
    phone: '+91 98765 43210',
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '123'
  });

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      icon: Send,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Ideal for small sub-contractors and independent tenderers.',
      priceMonthly: '₹2,999',
      priceYearly: '₹2,499',
      numericYearly: 2499,
      numericMonthly: 2999,
      users: 'Up to 5 Users',
      features: [
        'Up to 5 User Seats',
        'Basic Financial Reports',
        'Email & Ticket Support',
        'Document Management (5GB)',
        'Tender Application Engine'
      ]
    },
    {
      id: 'business',
      name: 'Business Plan',
      isPopular: true,
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Ideal for growing construction firms and mid-tier agencies.',
      priceMonthly: '₹5,999',
      priceYearly: '₹4,999',
      numericYearly: 4999,
      numericMonthly: 5999,
      users: 'Up to 10 Users',
      features: [
        'Up to 10 User Seats',
        'Everything in Starter',
        'Team Management & Roles',
        'Invoices, Payments & Expenses',
        'Advanced Financial Analytics',
        'Priority Support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      icon: Star,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      description: 'Advanced tools & analytics for multi-project infrastructure leaders.',
      priceMonthly: '₹9,999',
      priceYearly: '₹8,999',
      numericYearly: 8999,
      numericMonthly: 9999,
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
      name: 'Enterprise Plan',
      icon: Crown,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      description: 'Tailored for large government contractors & conglomerates.',
      priceMonthly: 'Custom',
      priceYearly: 'Custom',
      numericYearly: 0,
      numericMonthly: 0,
      users: 'Unlimited Users',
      features: [
        'Unlimited User Seats',
        'Custom Integrations & ERP Sync',
        'On-Premise Cloud Setup',
        'SLA & 24/7 Priority Support',
        'Dedicated Onboarding Team'
      ]
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[1];
  const monthlyRate = isYearly ? currentPlan.numericYearly : currentPlan.numericMonthly;
  const annualSubtotal = monthlyRate * (isYearly ? 12 : 1);
  const gstTax = Math.round(annualSubtotal * 0.18);
  const grandTotal = annualSubtotal + gstTax;

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (selectedPlanId === 'enterprise') {
      setShowContactSales(true);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess(currentPlan.name, isYearly ? 'Yearly' : 'Monthly');
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Expiry Header */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        <div className="bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-900/80 border border-blue-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            <Lock size={14} className="text-amber-400" />
            <span>3-Day Free Trial Expired</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Select a Plan to Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">TenderPro Dashboard</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your 3-day demo trial period has ended. To continue accessing your dashboard, projects, financial reports, and tender management tools, please select your subscription plan below.
          </p>

          {preSelectedPlan && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 border border-blue-400/40 text-blue-200 rounded-xl text-xs font-bold mt-2">
              <Sparkles size={14} className="text-blue-400" />
              <span>Pre-Selected Demo Plan: <strong className="text-white">{preSelectedPlan}</strong> (Pre-highlighted below)</span>
            </div>
          )}
        </div>

        {/* Plan Frequency Switcher */}
        <div className="flex items-center justify-center pt-2">
          <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700 flex items-center gap-1">
            <button 
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                !isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>

            <button 
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly Billing
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Plan Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {plans.map((plan) => {
            const IconComp = plan.icon;
            const isSelected = selectedPlanId === plan.id;
            const displayPrice = isYearly ? plan.priceYearly : plan.priceMonthly;

            return (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`rounded-3xl p-6 space-y-5 flex flex-col justify-between transition cursor-pointer relative ${
                  isSelected 
                    ? 'bg-slate-800 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/30' 
                    : 'bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/90'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${plan.iconBg}`}>
                        <IconComp size={16} />
                      </div>
                      <h3 className="text-sm font-extrabold text-white">{plan.name}</h3>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] bg-blue-500/20 border border-blue-400/40 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 font-normal leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{displayPrice}</span>
                      {displayPrice !== 'Custom' && <span className="text-xs text-slate-400">/mo</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {displayPrice === 'Custom' ? 'Contact sales' : isYearly ? 'Billed annually' : 'Billed monthly'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-700/60 text-xs text-slate-300 font-normal">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Check size={14} className="text-blue-400" />
                      <span>{plan.users}</span>
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check size={14} className="text-blue-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanId(plan.id);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {isSelected ? 'Plan Selected ✓' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Payment Form Panel */}
        {selectedPlanId !== 'enterprise' ? (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl mt-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Summary</span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>{currentPlan.name}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                    {isYearly ? 'Yearly Plan (Save 20%)' : 'Monthly Plan'}
                  </span>
                </h3>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-blue-400">₹{grandTotal.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 font-medium">Includes 18% GST (₹{gstTax.toLocaleString('en-IN')})</p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              
              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Select Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'card' 
                        ? 'bg-blue-600/30 border-blue-500 text-white' 
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard size={16} />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'upi' 
                        ? 'bg-blue-600/30 border-blue-500 text-white' 
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode size={16} />
                    <span>UPI / GPay / Paytm</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'netbanking' 
                        ? 'bg-blue-600/30 border-blue-500 text-white' 
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet size={16} />
                    <span>Net Banking</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'wire' 
                        ? 'bg-blue-600/30 border-blue-500 text-white' 
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 size={16} />
                    <span>Bank Wire (NEFT)</span>
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={paymentForm.fullName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, fullName: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition" 
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Work Email *</label>
                  <input 
                    type="email" 
                    required 
                    value={paymentForm.email}
                    onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition" 
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Company Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={paymentForm.companyName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, companyName: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition" 
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={paymentForm.phone}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition" 
                  />
                </div>
              </div>

              {/* Submit Payment Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck size={18} className="text-blue-400 shrink-0" />
                  <span>256-Bit SSL Encrypted Payment Gate • Instant Service Activation</span>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing || paymentSuccess}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1E56F0] hover:bg-blue-600 active:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-xl shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Processing Payment...</span>
                  ) : paymentSuccess ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-blue-300" />
                      <span>Payment Verified! Unlocking...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Proceed & Pay ₹{grandTotal.toLocaleString('en-IN')}</span>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </div>

            </form>

          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 text-center mt-6">
            <Crown size={36} className="text-amber-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-white">Enterprise Plan Inquiry</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Our Enterprise accounts include dedicated server instances, custom SLA agreements, and custom user seat volumes.
            </p>
            <button 
              type="button"
              onClick={() => {
                alert('Enterprise Sales request submitted! Our team will contact you within 2 hours.');
                if (onPaymentSuccess) onPaymentSuccess('Enterprise Plan', 'Yearly');
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Submit Enterprise Request & Unlock Trial
            </button>
          </div>
        )}

      </div>

      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-800 mt-12">
        <p>© 2026 TenderPro. Enterprise Tender Management Suite. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default TrialExpiredGate;
