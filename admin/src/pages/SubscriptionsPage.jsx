import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Download, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Edit3, 
  MoreVertical, 
  X, 
  Mail, 
  User, 
  Phone, 
  CreditCard,
  Crown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Power,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

const initialSubscriptionsList = [
  {
    id: 1,
    organization: 'BuildTech Pvt. Ltd.',
    domain: 'buildtech.com',
    logoBg: 'bg-blue-600 text-white',
    logoText: 'B',
    plan: 'Business Plan',
    planBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    status: 'Active',
    statusStyle: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    billingCycle: 'Monthly',
    nextRenewalDate: '15 Oct 2025',
    renewalDays: 'in 62 days',
    mrr: '₹34,999',
    amount: '₹34,999 / mo',
    numericAmount: 34999,
    startedOn: '15 Oct 2024',
    contactEmail: 'contact@buildtech.com',
    contactPerson: 'Ramesh Sharma',
    phone: '+91 98765 43210'
  },
  {
    id: 2,
    organization: 'Raj Construction',
    domain: 'rajconstructions.in',
    logoBg: 'bg-purple-600 text-white',
    logoText: 'R',
    plan: 'Professional Plan',
    planBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Active',
    statusStyle: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    billingCycle: 'Monthly',
    nextRenewalDate: '28 Aug 2025',
    renewalDays: 'in 14 days',
    mrr: '₹69,999',
    amount: '₹69,999 / mo',
    numericAmount: 69999,
    startedOn: '28 Aug 2024',
    contactEmail: 'info@rajconstructions.in',
    contactPerson: 'Vikram Singh',
    phone: '+91 98123 45678'
  },
  {
    id: 3,
    organization: 'Green Infra',
    domain: 'greeninfra.org',
    logoBg: 'bg-emerald-600 text-white',
    logoText: 'G',
    plan: 'Business Plan',
    planBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    status: 'Active',
    statusStyle: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    billingCycle: 'Monthly',
    nextRenewalDate: '02 Dec 2025',
    renewalDays: 'in 110 days',
    mrr: '₹34,999',
    amount: '₹34,999 / mo',
    numericAmount: 34999,
    startedOn: '02 Dec 2024',
    contactEmail: 'admin@greeninfra.org',
    contactPerson: 'Ananya Gupta',
    phone: '+91 99887 76655'
  },
  {
    id: 4,
    organization: 'Infra Projects',
    domain: 'infraprojects.com',
    logoBg: 'bg-amber-600 text-white',
    logoText: 'I',
    plan: 'Enterprise Plan',
    planBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    status: 'Active',
    statusStyle: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    billingCycle: 'Annual',
    nextRenewalDate: '10 Jan 2026',
    renewalDays: 'in 149 days',
    mrr: '₹1,49,999',
    amount: '₹17,99,988 / yr',
    numericAmount: 1799988,
    startedOn: '10 Jan 2024',
    contactEmail: 'support@infraprojects.com',
    contactPerson: 'Suresh Reddy',
    phone: '+91 97654 32109'
  },
  {
    id: 5,
    organization: 'TechBuild Solutions',
    domain: 'techbuild.io',
    logoBg: 'bg-cyan-600 text-white',
    logoText: 'T',
    plan: 'Starter Plan',
    planBadge: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    status: 'Trial',
    statusStyle: 'text-amber-600 bg-amber-50 border-amber-200',
    billingCycle: 'Monthly',
    nextRenewalDate: '25 Aug 2025',
    renewalDays: 'in 11 days',
    mrr: '₹0',
    amount: '₹0 (Trial)',
    numericAmount: 0,
    startedOn: '11 Aug 2025',
    contactEmail: 'hello@techbuild.io',
    contactPerson: 'Arjun Mehta',
    phone: '+91 92109 87654'
  },
  {
    id: 6,
    organization: 'Urban Developers',
    domain: 'urbandev.com',
    logoBg: 'bg-indigo-600 text-white',
    logoText: 'U',
    plan: 'Enterprise Plan',
    planBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    status: 'Active',
    statusStyle: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    billingCycle: 'Annual',
    nextRenewalDate: '05 May 2026',
    renewalDays: 'in 264 days',
    mrr: '₹1,49,999',
    amount: '₹17,99,988 / yr',
    numericAmount: 1799988,
    startedOn: '05 May 2024',
    contactEmail: 'info@urbandev.com',
    contactPerson: 'David Wilson',
    phone: '+91 94321 09876'
  },
  {
    id: 7,
    organization: 'Apex Contracts',
    domain: 'apexcontracts.com',
    logoBg: 'bg-rose-600 text-white',
    logoText: 'A',
    plan: 'Professional Plan',
    planBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Past Due',
    statusStyle: 'text-rose-600 bg-rose-50 border-rose-200',
    billingCycle: 'Monthly',
    nextRenewalDate: '01 Aug 2025',
    renewalDays: 'Overdue 13 days',
    mrr: '₹69,999',
    amount: '₹69,999 / mo',
    numericAmount: 69999,
    startedOn: '01 Jul 2024',
    contactEmail: 'billing@apexcontracts.com',
    contactPerson: 'Neha Verma',
    phone: '+91 93210 98765'
  }
];

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptionsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cycleFilter, setCycleFilter] = useState('All Billing Cycles');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Sorting State
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [newSelectedPlan, setNewSelectedPlan] = useState('Business Plan');

  // Toast Notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredSubs.map(s => s.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (id) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter(item => item !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPlanFilter('All Plans');
    setStatusFilter('All Status');
    setCycleFilter('All Billing Cycles');
    setSortColumn(null);
    setCurrentPage(1);
    triggerToast('Subscription filters reset', 'info');
  };

  const handleChangePlanSubmit = (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    let newMrr = '₹34,999';
    let newAmount = '₹34,999 / mo';
    let newBadge = 'bg-blue-50 text-blue-600 border-blue-100';

    if (newSelectedPlan === 'Starter Plan') {
      newMrr = '₹14,999';
      newAmount = '₹14,999 / mo';
      newBadge = 'bg-cyan-50 text-cyan-600 border-cyan-100';
    } else if (newSelectedPlan === 'Professional Plan') {
      newMrr = '₹69,999';
      newAmount = '₹69,999 / mo';
      newBadge = 'bg-purple-50 text-purple-600 border-purple-100';
    } else if (newSelectedPlan === 'Enterprise Plan') {
      newMrr = '₹1,49,999';
      newAmount = '₹17,99,988 / yr';
      newBadge = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    setSubscriptions(subscriptions.map(s => {
      if (s.id === selectedSub.id) {
        return {
          ...s,
          plan: newSelectedPlan,
          planBadge: newBadge,
          mrr: newMrr,
          amount: newAmount
        };
      }
      return s;
    }));

    setShowChangePlanModal(false);
    triggerToast(`Subscription plan for ${selectedSub.organization} updated to ${newSelectedPlan}!`, 'success');
  };

  const handleToggleStatus = (sub) => {
    const nextStatus = sub.status === 'Active' ? 'Cancelled' : 'Active';
    setSubscriptions(subscriptions.map(s => s.id === sub.id ? { ...s, status: nextStatus } : s));
    setActiveDropdownId(null);
    triggerToast(`${sub.organization} subscription set to ${nextStatus}`, 'info');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Organization', 'Domain', 'Plan', 'Status', 'Billing Cycle', 'Next Renewal', 'MRR', 'Amount', 'Started On'];
    const rows = filteredSubs.map(s => [
      s.id,
      `"${s.organization}"`,
      s.domain,
      `"${s.plan}"`,
      s.status,
      s.billingCycle,
      `"${s.nextRenewalDate}"`,
      `"${s.mrr}"`,
      `"${s.amount}"`,
      s.startedOn
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Subscriptions_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    triggerToast('Downloaded Subscriptions CSV report!', 'success');
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Subscriptions
  const filteredSubs = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesSearch = s.organization.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === 'All Plans' || s.plan.includes(planFilter);
      const matchesStatus = statusFilter === 'All Status' || s.status === statusFilter;
      const matchesCycle = cycleFilter === 'All Billing Cycles' || s.billingCycle === cycleFilter;
      return matchesSearch && matchesPlan && matchesStatus && matchesCycle;
    }).sort((a, b) => {
      if (!sortColumn) return 0;
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'amount') {
        valA = a.numericAmount;
        valB = b.numericAmount;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [subscriptions, searchQuery, planFilter, statusFilter, cycleFilter, sortColumn, sortDirection]);

  // Paginated data
  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage) || 1;
  const paginatedSubs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubs.slice(start, start + itemsPerPage);
  }, [filteredSubs, currentPage, itemsPerPage]);

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Notification Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs font-bold animate-in slide-in-from-top-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="text-blue-600 shrink-0" size={24} />
            Organization Subscriptions
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Monitor active organization accounts, track renewals, and manage subscription lifecycles.
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Subscriptions</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Building2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Total</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Subscriptions</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{subscriptions.length}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 15.3%</span>
            <span className="text-slate-400 font-normal">this month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Active</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {subscriptions.filter(s => s.status === 'Active').length}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span>↑ 14.8%</span>
            <span className="text-slate-400 font-normal">healthy standing</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">Trials</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trial Subscriptions</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {subscriptions.filter(s => s.status === 'Trial').length}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <span>↑ 5.6%</span>
            <span className="text-slate-400 font-normal">demo signups</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full">Action Needed</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Past Due</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {subscriptions.filter(s => s.status === 'Past Due').length}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <span>Requires followup</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <XCircle size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">Inactive</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancelled</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {subscriptions.filter(s => s.status === 'Cancelled').length}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <span>churned accounts</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <input 
            type="text"
            placeholder="Search organizations, domains, emails..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Right: Dropdowns & Filter Tools */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select 
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
          >
            <option value="All Plans">All Plans</option>
            <option value="Starter">Starter Plan</option>
            <option value="Business">Business Plan</option>
            <option value="Professional">Professional Plan</option>
            <option value="Enterprise">Enterprise Plan</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Past Due">Past Due</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select 
            value={cycleFilter}
            onChange={(e) => { setCycleFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
          >
            <option value="All Billing Cycles">All Billing Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Annual">Annual</option>
          </select>

          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* Subscriptions Main Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 select-none">
                <th className="py-2.5 px-3.5 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedRowIds.length === filteredSubs.length && filteredSubs.length > 0}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                </th>

                <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('organization')}>
                  <div className="flex items-center gap-1">
                    <span>Organization</span>
                    {sortColumn === 'organization' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                    ) : <ArrowUpDown size={12} className="opacity-40" />}
                  </div>
                </th>

                <th className="py-2.5 px-3.5">Plan</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Billing Cycle</th>
                <th className="py-2.5 px-3.5">Next Renewal</th>
                <th className="py-2.5 px-3.5">MRR</th>

                <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    {sortColumn === 'amount' ? (
                      sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                    ) : <ArrowUpDown size={12} className="opacity-40" />}
                  </div>
                </th>

                <th className="py-2.5 px-3.5">Started On</th>
                <th className="py-2.5 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedSubs.map(sub => {
                const isSelected = selectedRowIds.includes(sub.id);
                return (
                  <tr key={sub.id} className={`hover:bg-slate-50/80 transition relative ${isSelected ? 'bg-blue-50/30' : ''}`}>
                    
                    {/* Checkbox */}
                    <td className="py-3 px-3.5">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleRowSelect(sub.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </td>

                    {/* Organization Details */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl ${sub.logoBg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                          {sub.logoText}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{sub.organization}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{sub.domain}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan Badge */}
                    <td className="py-3 px-3.5">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${sub.planBadge}`}>
                        {sub.plan}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <div className={`w-2 h-2 rounded-full ${
                          sub.status === 'Active' ? 'bg-emerald-500' :
                          sub.status === 'Trial' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></div>
                        <span className={
                          sub.status === 'Active' ? 'text-emerald-700' :
                          sub.status === 'Trial' ? 'text-amber-700' : 'text-rose-700'
                        }>
                          {sub.status}
                        </span>
                      </div>
                    </td>

                    {/* Billing Cycle */}
                    <td className="py-3 px-3.5 text-slate-700 font-bold">
                      {sub.billingCycle}
                    </td>

                    {/* Next Renewal */}
                    <td className="py-3 px-3.5">
                      <p className="font-bold text-slate-800">{sub.nextRenewalDate}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{sub.renewalDays}</p>
                    </td>

                    {/* MRR */}
                    <td className="py-3 px-3.5 font-extrabold text-slate-900">
                      {sub.mrr}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3.5 font-bold text-slate-700">
                      {sub.amount}
                    </td>

                    {/* Started On */}
                    <td className="py-3 px-3.5 text-slate-600 font-medium">
                      {sub.startedOn}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* View Action */}
                        <button 
                          onClick={() => { setSelectedSub(sub); setShowViewModal(true); }}
                          title="View Subscription"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Change Plan Action */}
                        <button 
                          onClick={() => { 
                            setSelectedSub(sub); 
                            setNewSelectedPlan(sub.plan);
                            setShowChangePlanModal(true); 
                          }}
                          title="Change Plan"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Dropdown Menu Trigger */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdownId(activeDropdownId === sub.id ? null : sub.id)}
                            title="More Options"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {activeDropdownId === sub.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                              <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-left text-xs font-semibold animate-in zoom-in-95 duration-150 space-y-0.5">
                                <button 
                                  onClick={() => { setSelectedSub(sub); setShowViewModal(true); setActiveDropdownId(null); }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                >
                                  <Eye size={14} className="text-blue-600" />
                                  <span>View Subscription</span>
                                </button>
                                <button 
                                  onClick={() => { setSelectedSub(sub); setNewSelectedPlan(sub.plan); setShowChangePlanModal(true); setActiveDropdownId(null); }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                >
                                  <Edit3 size={14} className="text-slate-600" />
                                  <span>Upgrade / Change Plan</span>
                                </button>
                                <button 
                                  onClick={() => handleToggleStatus(sub)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                >
                                  <Power size={14} className={sub.status === 'Active' ? 'text-amber-600' : 'text-emerald-600'} />
                                  <span>{sub.status === 'Active' ? 'Cancel Subscription' : 'Re-Activate Subscription'}</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredSubs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredSubs.length)}</span> of <span className="font-bold text-slate-800">{filteredSubs.length}</span> subscriptions
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>

            <div className="flex items-center gap-1 font-bold">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === page ? 'bg-[#1E56F0] text-white shadow-xs' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Subscription Modal */}
      {showViewModal && selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedSub.logoBg} font-black flex items-center justify-center text-base shadow-xs`}>
                  {selectedSub.logoText}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedSub.organization}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedSub.domain}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Active Plan:</span>
                  <span className={`px-2.5 py-0.5 rounded border text-[11px] font-bold ${selectedSub.planBadge}`}>
                    {selectedSub.plan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <span className="font-bold text-emerald-600">{selectedSub.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Billing Cycle:</span>
                  <span className="font-bold text-slate-800">{selectedSub.billingCycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">MRR Contribution:</span>
                  <span className="font-bold text-slate-900">{selectedSub.mrr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Next Renewal Date:</span>
                  <span className="font-bold text-slate-800">{selectedSub.nextRenewalDate}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={15} className="text-slate-400" />
                  <span>{selectedSub.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User size={15} className="text-slate-400" />
                  <span>{selectedSub.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={15} className="text-slate-400" />
                  <span>{selectedSub.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button 
                onClick={() => { setShowViewModal(false); setNewSelectedPlan(selectedSub.plan); setShowChangePlanModal(true); }}
                className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Change Plan
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Change Subscription Plan</h3>
              <button onClick={() => setShowChangePlanModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePlanSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization</label>
                <input 
                  type="text" 
                  disabled
                  value={selectedSub.organization}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Select New Plan</label>
                <select 
                  value={newSelectedPlan}
                  onChange={(e) => setNewSelectedPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none cursor-pointer focus:border-blue-500 transition"
                >
                  <option value="Starter Plan">Starter Plan (₹14,999 / mo)</option>
                  <option value="Business Plan">Business Plan (₹34,999 / mo)</option>
                  <option value="Professional Plan">Professional Plan (₹69,999 / mo)</option>
                  <option value="Enterprise Plan">Enterprise Plan (₹1,49,999 / mo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowChangePlanModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Subscriptions</h3>
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
                  <span>Export Subscriptions (CSV)</span>
                </span>
                <Download size={16} />
              </button>

              <button 
                onClick={handleExportCSV}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Export Summary Report</span>
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

export default SubscriptionsPage;
