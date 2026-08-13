import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  RotateCcw, 
  Download, 
  Calendar, 
  ChevronDown, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  Layers, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const topOrganizationsList = [
  { id: 1, name: 'Infra Projects', bg: 'bg-amber-600 text-white', logo: 'I', plan: 'Enterprise Plan', cycle: 'Annual', rev: '₹17,99,988', rawRev: 1799988, growth: '+18.2%', up: true, domain: 'infraprojects.com' },
  { id: 2, name: 'Urban Developers', bg: 'bg-indigo-600 text-white', logo: 'U', plan: 'Enterprise Plan', cycle: 'Annual', rev: '₹17,99,988', rawRev: 1799988, growth: '+15.4%', up: true, domain: 'urbandev.com' },
  { id: 3, name: 'Raj Construction', bg: 'bg-purple-600 text-white', logo: 'R', plan: 'Professional Plan', cycle: 'Monthly', rev: '₹8,39,988', rawRev: 839988, growth: '+22.1%', up: true, domain: 'rajconstructions.in' },
  { id: 4, name: 'BuildTech Pvt. Ltd.', bg: 'bg-blue-600 text-white', logo: 'B', plan: 'Business Plan', cycle: 'Monthly', rev: '₹4,19,988', rawRev: 419988, growth: '+10.5%', up: true, domain: 'buildtech.com' },
  { id: 5, name: 'Green Infra', bg: 'bg-emerald-600 text-white', logo: 'G', plan: 'Business Plan', cycle: 'Monthly', rev: '₹4,19,988', rawRev: 419988, growth: '+8.3%', up: true, domain: 'greeninfra.org' },
  { id: 6, name: 'Apex Contracts', bg: 'bg-rose-600 text-white', logo: 'A', plan: 'Professional Plan', cycle: 'Monthly', rev: '₹3,49,995', rawRev: 349995, growth: '+5.2%', up: true, domain: 'apexcontracts.com' },
  { id: 7, name: 'TechBuild Solutions', bg: 'bg-cyan-600 text-white', logo: 'T', plan: 'Starter Plan', cycle: 'Monthly', rev: '₹1,79,988', rawRev: 179988, growth: '+12.9%', up: true, domain: 'techbuild.io' },
  { id: 8, name: 'Matrix Infra Group', bg: 'bg-teal-600 text-white', logo: 'M', plan: 'Business Plan', cycle: 'Annual', rev: '₹3,49,990', rawRev: 349990, growth: '+14.1%', up: true, domain: 'matrixinfra.com' },
  { id: 9, name: 'Lighthouse Builders', bg: 'bg-orange-600 text-white', logo: 'L', plan: 'Starter Plan', cycle: 'Monthly', rev: '₹1,19,988', rawRev: 119988, growth: '+6.4%', up: true, domain: 'lighthouse.in' },
  { id: 10, name: 'Vanguard Civil', bg: 'bg-slate-700 text-white', logo: 'V', plan: 'Professional Plan', cycle: 'Annual', rev: '₹6,99,990', rawRev: 699990, growth: '+19.8%', up: true, domain: 'vanguardcivil.com' }
];

const planBreakdownList = [
  { plan: 'Business Plan', subscribers: 69, price: '₹34,999/mo', revenue: '₹24,15,320', share: '49.5%', growth: '+21.4%' },
  { plan: 'Professional Plan', subscribers: 18, price: '₹69,999/mo', revenue: '₹12,45,880', share: '25.5%', growth: '+18.9%' },
  { plan: 'Enterprise Plan', subscribers: 4, price: '₹17,99,988/yr', revenue: '₹8,65,450', share: '17.7%', growth: '+15.2%' },
  { plan: 'Starter Plan', subscribers: 17, price: '₹14,999/mo', revenue: '₹2,48,670', share: '5.1%', growth: '+9.8%' },
  { plan: 'Custom Plan', subscribers: 1, price: 'Contract', revenue: '₹99,999', share: '2.1%', growth: '+5.0%' }
];

const cycleBreakdownList = [
  { cycle: 'Monthly Billing', contracts: 104, revenue: '₹28,54,320', share: '58.5%', avgDuration: '11.2 months', renewalRate: '94.2%' },
  { cycle: 'Annual Billing', contracts: 5, revenue: '₹16,45,000', share: '33.7%', avgDuration: '12.0 months', renewalRate: '98.5%' },
  { cycle: 'Custom / Quarterly', contracts: 3, revenue: '₹3,76,000', share: '7.8%', avgDuration: '6.0 months', renewalRate: '91.0%' }
];

const RevenuePage = () => {
  const [comparePeriod, setComparePeriod] = useState('Previous Period');
  const [overviewFrequency, setOverviewFrequency] = useState('Daily');
  const [trendFrequency, setTrendFrequency] = useState('Monthly');
  const [selectedDatePreset, setSelectedDatePreset] = useState('01 May 2025 - 31 May 2025');

  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showOrgsModal, setShowOrgsModal] = useState(false);

  // Orgs Modal state
  const [orgsSearch, setOrgsSearch] = useState('');
  const [orgsPlanFilter, setOrgsPlanFilter] = useState('All Plans');
  const [orgsPage, setOrgsPage] = useState(1);

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Preset Date Selection Handler
  const handleSelectDatePreset = (label) => {
    setSelectedDatePreset(label);
    setShowDateModal(false);
    triggerToast(`Revenue timeframe updated to ${label}`, 'info');
  };

  // Export CSV Revenue Data
  const handleExportCSV = () => {
    const headers = ['Organization', 'Domain', 'Plan Tier', 'Billing Cycle', 'Revenue (₹)', 'Growth Rate'];
    const rows = topOrganizationsList.map(o => [
      `"${o.name}"`,
      o.domain,
      `"${o.plan}"`,
      o.cycle,
      `"${o.rev}"`,
      o.growth
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Revenue_Ledger_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    triggerToast('Exported revenue ledger data to CSV!', 'success');
  };

  // Export PDF Revenue Financial Audit Report
  const handleExportPDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(30, 86, 240);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TENDERPRO SUPER ADMIN - FINANCIAL REVENUE REPORT', 10, 12);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text(`Timeframe: ${selectedDatePreset}`, 10, 26);
      doc.text(`Compared Against: ${comparePeriod}`, 10, 31);
      doc.text(`Total Revenue: ₹48,75,320 | MRR: ₹24,58,320 | ARPU: ₹4,820`, 10, 36);

      autoTable(doc, {
        startY: 42,
        head: [['Organization', 'Domain', 'Plan Tier', 'Billing Cycle', 'Revenue', 'Growth']],
        body: topOrganizationsList.map(o => [
          o.name,
          o.domain,
          o.plan,
          o.cycle,
          o.rev,
          o.growth
        ])
      });

      doc.save(`Revenue_Financial_Analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
      setShowExportModal(false);
      triggerToast('Exported Financial Revenue Analysis (PDF)', 'success');
    } catch (err) {
      console.error(err);
      handleExportCSV();
    }
  };

  // Filtered Orgs for Modal
  const filteredOrgs = useMemo(() => {
    return topOrganizationsList.filter(o => {
      const matchesSearch = o.name.toLowerCase().includes(orgsSearch.toLowerCase()) ||
                            o.domain.toLowerCase().includes(orgsSearch.toLowerCase());
      const matchesPlan = orgsPlanFilter === 'All Plans' || o.plan === orgsPlanFilter;
      return matchesSearch && matchesPlan;
    });
  }, [orgsSearch, orgsPlanFilter]);

  // Chart Coordinates based on Frequency
  const chartPoints = useMemo(() => {
    if (overviewFrequency === 'Daily') {
      return {
        pathCurrent: "M 30 130 Q 80 80, 130 115 T 230 75 T 330 85 T 430 65 T 480 25",
        pathPrev: "M 30 140 Q 90 110, 150 125 T 270 95 T 390 100 T 480 70",
        labels: ["01 May", "06 May", "11 May", "16 May", "21 May", "26 May", "31 May"]
      };
    } else if (overviewFrequency === 'Weekly') {
      return {
        pathCurrent: "M 30 140 Q 120 70, 240 90 T 360 40 T 480 20",
        pathPrev: "M 30 150 Q 120 110, 240 120 T 360 80 T 480 60",
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
      };
    } else {
      return {
        pathCurrent: "M 30 150 Q 150 100, 300 60 T 480 15",
        pathPrev: "M 30 160 Q 150 130, 300 95 T 480 50",
        labels: ["Mar 25", "Apr 25", "May 25", "Jun 25"]
      };
    }
  }, [overviewFrequency]);

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'warning' ? 'bg-rose-900 text-rose-100 border-rose-700' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <IndianRupee size={16} className="text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="text-blue-600 shrink-0" size={24} />
            Revenue Analytics & Financial Performance
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Track gross recurring revenue (MRR), plan contribution breakdowns, and organization billing expansion.
          </p>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Compare Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
            <span className="text-slate-400 font-normal">Compare:</span>
            <select 
              value={comparePeriod}
              onChange={(e) => { setComparePeriod(e.target.value); triggerToast(`Comparison period set to ${e.target.value}`, 'info'); }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Previous Period">Previous Period</option>
              <option value="Previous Year">Previous Year</option>
              <option value="Target Budget">Target Budget</option>
            </select>
          </div>

          {/* Export Button */}
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Report</span>
          </button>

          {/* Date Picker Badge */}
          <button 
            onClick={() => setShowDateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 shadow-xs cursor-pointer hover:bg-slate-50 active:scale-95 transition"
          >
            <span>{selectedDatePreset}</span>
            <Calendar size={13} className="text-blue-600 shrink-0" />
          </button>

        </div>
      </div>

      {/* Top 5 KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IndianRupee size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
              Gross Revenue
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">₹48,75,320</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 18.7%</span>
            <span className="text-slate-400 font-normal">vs {comparePeriod}</span>
          </div>
        </div>

        {/* Card 2: Recurring Revenue (MRR) */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <RefreshCw size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              MRR Pace
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recurring Revenue (MRR)</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">₹24,58,320</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 22.1%</span>
            <span className="text-slate-400 font-normal">vs {comparePeriod}</span>
          </div>
        </div>

        {/* Card 3: New Revenue */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              New Expansion
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Sales Revenue</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">₹16,32,450</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 16.3%</span>
            <span className="text-slate-400 font-normal">vs {comparePeriod}</span>
          </div>
        </div>

        {/* Card 4: ARPU */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Users size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
              ARPU Metric
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Revenue / Account</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">₹4,820</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 12.4%</span>
            <span className="text-slate-400 font-normal">vs {comparePeriod}</span>
          </div>
        </div>

        {/* Card 5: Refunds */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <RotateCcw size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full">
              Disputed
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Refunds & Reversals</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">₹1,28,450</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <span>↓ 8.3%</span>
            <span className="text-slate-400 font-normal">vs {comparePeriod}</span>
          </div>
        </div>

      </div>

      {/* ROW 1: CHARTS SECTION (Revenue Overview + Revenue by Plan + Revenue by Billing Cycle) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Revenue Overview (50% width / 6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-600" />
                Revenue Overview Trend
              </h2>
              <select 
                value={overviewFrequency}
                onChange={(e) => setOverviewFrequency(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition"
              >
                <option value="Daily">Daily View</option>
                <option value="Weekly">Weekly View</option>
                <option value="Monthly">Monthly View</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span>Current Period ({selectedDatePreset})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-slate-400 border-t border-dashed"></div>
                <span>{comparePeriod}</span>
              </div>
            </div>

            {/* SVG Line Combo Chart Graphic */}
            <div className="h-[200px] w-full pt-3 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1" />

                {/* Y Axis Labels */}
                <text x="0" y="25" fill="#94A3B8" fontSize="10" fontWeight="bold">₹8L</text>
                <text x="0" y="65" fill="#94A3B8" fontSize="10" fontWeight="bold">₹6L</text>
                <text x="0" y="105" fill="#94A3B8" fontSize="10" fontWeight="bold">₹4L</text>
                <text x="0" y="145" fill="#94A3B8" fontSize="10" fontWeight="bold">₹2L</text>

                {/* Dashed Previous Period Line */}
                <path 
                  d={chartPoints.pathPrev} 
                  fill="none" 
                  stroke="#CBD5E1" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                />

                {/* Solid Current Period Line */}
                <path 
                  d={chartPoints.pathCurrent} 
                  fill="none" 
                  stroke="#1E56F0" 
                  strokeWidth="3.5"
                />

                {/* Points */}
                <circle cx="30" cy="130" r="4" fill="#1E56F0" />
                <circle cx="110" cy="85" r="4" fill="#1E56F0" />
                <circle cx="190" cy="105" r="4" fill="#1E56F0" />
                <circle cx="270" cy="80" r="4" fill="#1E56F0" />
                <circle cx="350" cy="90" r="4" fill="#1E56F0" />
                <circle cx="430" cy="65" r="4" fill="#1E56F0" />
                <circle cx="480" cy="25" r="5" fill="#1E56F0" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* X Axis Labels */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold pt-1 pl-6">
                {chartPoints.labels.map((lbl, i) => (
                  <span key={i}>{lbl}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-100 flex items-center justify-between">
            <span>Peak Day Revenue: ₹7,85,400 (May 31)</span>
            <span className="font-bold text-blue-600">Updated Real-Time</span>
          </div>
        </div>

        {/* Revenue by Plan Donut (25% width / 3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <PieChart size={16} className="text-blue-600" />
                Revenue by Plan
              </h2>
              <button 
                onClick={() => setShowPlanModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>

            <div className="flex flex-col items-center justify-center relative py-2">
              <div className="w-32 h-32 rounded-full border-[12px] border-blue-600 border-t-blue-500 border-r-amber-500 border-b-cyan-500 flex items-center justify-center shadow-xs">
                <div className="text-center">
                  <p className="text-xs font-black text-slate-900">₹48,75,320</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span>Business Plan</span>
                </div>
                <span className="font-bold text-slate-800">₹24,15,320 (49.5%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Professional Plan</span>
                </div>
                <span className="font-bold text-slate-800">₹12,45,880 (25.5%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Enterprise Plan</span>
                </div>
                <span className="font-bold text-slate-800">₹8,65,450 (17.7%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <span>Starter Plan</span>
                </div>
                <span className="font-bold text-slate-800">₹2,48,670 (5.1%)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowPlanModal(true)}
            className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Plan Performance Details
          </button>
        </div>

        {/* Revenue by Billing Cycle Donut (25% width / 3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Layers size={16} className="text-blue-600" />
                Billing Cycle Split
              </h2>
              <button 
                onClick={() => setShowCycleModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>

            <div className="flex flex-col items-center justify-center relative py-2">
              <div className="w-32 h-32 rounded-full border-[12px] border-blue-600 border-t-blue-500 border-r-amber-500 border-b-purple-500 flex items-center justify-center shadow-xs">
                <div className="text-center">
                  <p className="text-xs font-black text-slate-900">₹48,75,320</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span>Monthly Billing</span>
                </div>
                <span className="font-bold text-slate-800">₹28,54,320 (58.5%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Annual Billing</span>
                </div>
                <span className="font-bold text-slate-800">₹16,45,000 (33.7%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Custom / Quarterly</span>
                </div>
                <span className="font-bold text-slate-800">₹3,76,000 (7.8%)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowCycleModal(true)}
            className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Contract Cycle Details
          </button>
        </div>

      </div>

      {/* ROW 2: REVENUE TRENDS (BAR CHART) & TOP ORGANIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Revenue Trends Bar Chart (60% width / 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              12-Month Revenue Growth Trends
            </h2>
            <select 
              value={trendFrequency}
              onChange={(e) => setTrendFrequency(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition"
            >
              <option value="Monthly">Monthly Bar</option>
              <option value="Quarterly">Quarterly Bar</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-blue-600"></div>
              <span>Recurring (MRR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-blue-400"></div>
              <span>New Sales</span>
            </div>
          </div>

          {/* SVG Bar Chart Graphic */}
          <div className="h-[200px] w-full pt-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 550 180">
              
              {/* Y Grid Lines */}
              <line x1="0" y1="20" x2="550" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="60" x2="550" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="100" x2="550" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="550" y2="140" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="0" y="25" fill="#94A3B8" fontSize="10" fontWeight="bold">₹50L</text>
              <text x="0" y="65" fill="#94A3B8" fontSize="10" fontWeight="bold">₹35L</text>
              <text x="0" y="105" fill="#94A3B8" fontSize="10" fontWeight="bold">₹20L</text>
              <text x="0" y="145" fill="#94A3B8" fontSize="10" fontWeight="bold">₹10L</text>

              {/* Month Bars Group */}
              {[
                { m: 'Jun 24', mrr: 75, n: 35, x: 45 },
                { m: 'Jul 24', mrr: 85, n: 40, x: 85 },
                { m: 'Aug 24', mrr: 95, n: 45, x: 125 },
                { m: 'Sep 24', mrr: 100, n: 50, x: 165 },
                { m: 'Oct 24', mrr: 110, n: 55, x: 205 },
                { m: 'Nov 24', mrr: 115, n: 60, x: 245 },
                { m: 'Dec 24', mrr: 125, n: 65, x: 285 },
                { m: 'Jan 25', mrr: 130, n: 70, x: 325 },
                { m: 'Feb 25', mrr: 135, n: 72, x: 365 },
                { m: 'Mar 25', mrr: 140, n: 75, x: 405 },
                { m: 'Apr 25', mrr: 148, n: 80, x: 445 },
                { m: 'May 25', mrr: 155, n: 85, x: 485 }
              ].map((item, idx) => (
                <g key={idx}>
                  {/* MRR Bar */}
                  <rect 
                    x={item.x} 
                    y={160 - item.mrr} 
                    width="12" 
                    height={item.mrr} 
                    fill="#1E56F0" 
                    rx="3"
                  />
                  {/* New Sales Bar */}
                  <rect 
                    x={item.x + 14} 
                    y={160 - item.n} 
                    width="12" 
                    height={item.n} 
                    fill="#60a5fa" 
                    rx="3"
                  />
                  <text x={item.x - 2} y="176" fill="#94A3B8" fontSize="8" fontWeight="bold">{item.m}</text>
                </g>
              ))}

            </svg>
          </div>
        </div>

        {/* Top Organizations by Revenue Table (40% width / 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                Top Organizations by Revenue
              </h2>
              <button 
                onClick={() => setShowOrgsModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                View All ({topOrganizationsList.length})
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {topOrganizationsList.slice(0, 5).map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${org.bg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                            {org.logo}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{org.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{org.domain}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-bold">
                          {org.plan}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {org.rev}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-600">
                        {org.growth}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-100 flex items-center justify-between">
            <span>Calculated over current billing period</span>
            <button 
              onClick={() => setShowOrgsModal(true)}
              className="font-bold text-blue-600 hover:underline"
            >
              See All Accounts →
            </button>
          </div>
        </div>

      </div>

      {/* DATE PRESET TIMEFRAME MODAL */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Select Revenue Timeframe
              </h3>
              <button onClick={() => setShowDateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              {[
                '01 May 2025 - 31 May 2025',
                '01 Apr 2025 - 30 Apr 2025',
                'Q2 2025 (Apr - Jun)',
                'Q1 2025 (Jan - Mar)',
                'Year to Date (YTD 2025)'
              ].map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSelectDatePreset(preset)}
                  className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    selectedDatePreset === preset
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{preset}</span>
                  {selectedDatePreset === preset && <CheckCircle2 size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAN BREAKDOWN DETAILS MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PieChart size={20} className="text-blue-600" />
                Revenue Breakdown by Subscription Plan
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Plan Name</th>
                    <th className="py-2.5 px-3.5">Price</th>
                    <th className="py-2.5 px-3.5">Subscribers</th>
                    <th className="py-2.5 px-3.5 text-right">Revenue (₹)</th>
                    <th className="py-2.5 px-3.5 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {planBreakdownList.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 font-extrabold text-slate-900">{p.plan}</td>
                      <td className="py-3 px-3.5 text-slate-600">{p.price}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-800">{p.subscribers} orgs</td>
                      <td className="py-3 px-3.5 text-right font-black text-blue-600">{p.revenue}</td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-700">{p.share}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold">Total Revenue Contribution:</span>
              <span className="font-extrabold text-slate-900">₹48,75,320 (100.0%)</span>
            </div>
          </div>
        </div>
      )}

      {/* CYCLE BREAKDOWN DETAILS MODAL */}
      {showCycleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers size={20} className="text-blue-600" />
                Revenue Breakdown by Contract Billing Cycle
              </h3>
              <button onClick={() => setShowCycleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Billing Cycle</th>
                    <th className="py-2.5 px-3.5">Active Contracts</th>
                    <th className="py-2.5 px-3.5">Avg Duration</th>
                    <th className="py-2.5 px-3.5 text-right">Revenue (₹)</th>
                    <th className="py-2.5 px-3.5 text-right">Renewal %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {cycleBreakdownList.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 font-extrabold text-slate-900">{c.cycle}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-800">{c.contracts} contracts</td>
                      <td className="py-3 px-3.5 text-slate-600">{c.avgDuration}</td>
                      <td className="py-3 px-3.5 text-right font-black text-blue-600">{c.revenue}</td>
                      <td className="py-3 px-3.5 text-right font-bold text-emerald-600">{c.renewalRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold">Total Contract Volume:</span>
              <span className="font-extrabold text-slate-900">112 Contracts</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP ORGANIZATIONS FULL BREAKDOWN MODAL */}
      {showOrgsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                All Top Organizations Revenue Ledger
              </h3>
              <button onClick={() => setShowOrgsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="Search organization or domain..."
                  value={orgsSearch}
                  onChange={(e) => setOrgsSearch(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                />
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <select 
                value={orgsPlanFilter}
                onChange={(e) => setOrgsPlanFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
              >
                <option value="All Plans">All Plans</option>
                <option value="Starter Plan">Starter Plan</option>
                <option value="Business Plan">Business Plan</option>
                <option value="Professional Plan">Professional Plan</option>
                <option value="Enterprise Plan">Enterprise Plan</option>
              </select>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Organization</th>
                    <th className="py-2.5 px-3.5">Plan Tier</th>
                    <th className="py-2.5 px-3.5">Billing Cycle</th>
                    <th className="py-2.5 px-3.5 text-right">Revenue (₹)</th>
                    <th className="py-2.5 px-3.5 text-right">Growth Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${org.bg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                            {org.logo}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{org.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{org.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[10px] font-bold">
                          {org.plan}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-700">{org.cycle}</td>
                      <td className="py-3 px-3.5 text-right font-black text-slate-900">{org.rev}</td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-600">{org.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold">Showing {filteredOrgs.length} top account contributions</span>
              <button 
                onClick={() => setShowOrgsModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-900"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Revenue Reports</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button 
                onClick={handleExportCSV}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  <span>Export Revenue Ledger (CSV)</span>
                </span>
                <Download size={16} />
              </button>

              <button 
                onClick={handleExportPDFReport}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Export Financial Analysis (PDF)</span>
                </span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RevenuePage;
