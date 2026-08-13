import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Briefcase, 
  Package, 
  Users, 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Edit3, 
  MoreVertical, 
  X, 
  Check, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  Crown,
  Zap,
  Shield,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Download,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Power
} from 'lucide-react';

const initialPlansList = [
  {
    id: 1,
    name: 'Starter Plan',
    subtext: 'Ideal for small sub-contractors and individual tenderers.',
    icon: Zap,
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    price: '₹14,999',
    period: 'per month',
    billingCycle: 'Monthly',
    subscribersCount: 45,
    subscribersUnit: 'Organizations',
    mrr: '₹6,74,955',
    numericPrice: 14999,
    numericMrr: 674955,
    status: 'Active',
    createdOn: '10 Jan 2024',
    maxUsers: 5,
    features: ['5 User Accounts', '10 Tender Applications / Month', 'Basic Document Storage (5GB)', 'Standard Email Support']
  },
  {
    id: 2,
    name: 'Business Plan',
    subtext: 'For growing construction firms and mid-tier agencies.',
    icon: Briefcase,
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    price: '₹34,999',
    period: 'per month',
    billingCycle: 'Monthly',
    subscribersCount: 78,
    subscribersUnit: 'Organizations',
    mrr: '₹27,29,922',
    numericPrice: 34999,
    numericMrr: 2729922,
    status: 'Active',
    createdOn: '15 Jan 2024',
    maxUsers: 25,
    features: ['25 User Accounts', '50 Tender Applications / Month', '25GB Document Storage', 'Priority Support & Tender Alerting', 'Financial Invoice Engine']
  },
  {
    id: 3,
    name: 'Professional Plan',
    subtext: 'Designed for multi-project infrastructure developers.',
    icon: Crown,
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
    price: '₹69,999',
    period: 'per month',
    billingCycle: 'Monthly',
    subscribersCount: 52,
    subscribersUnit: 'Organizations',
    mrr: '₹36,39,948',
    numericPrice: 69999,
    numericMrr: 3639948,
    status: 'Active',
    createdOn: '01 Feb 2024',
    maxUsers: 50,
    features: ['50 User Accounts', 'Unlimited Tender Applications', '100GB Document Storage', 'Dedicated Account Manager', 'Advanced Financial Analytics', 'Project Milestone Tracking']
  },
  {
    id: 4,
    name: 'Enterprise Plan',
    subtext: 'Tailored for large government contractors & conglomerates.',
    icon: Shield,
    iconBg: 'bg-amber-50 text-amber-700 border border-amber-200',
    price: '₹1,49,999',
    period: 'per month',
    billingCycle: 'Yearly',
    subscribersCount: 37,
    subscribersUnit: 'Organizations',
    mrr: '₹55,49,963',
    numericPrice: 149999,
    numericMrr: 5549963,
    status: 'Active',
    createdOn: '10 Mar 2024',
    maxUsers: 200,
    features: ['Unlimited User Seats', 'Custom API Integrations', '1TB Cloud Storage', '24/7 Phone & On-Site Support', 'Custom Role & Access Escalation', 'Dedicated Server Infrastructure']
  },
  {
    id: 5,
    name: 'Custom Trial Plan',
    subtext: 'Temporary 14-day trial plan for new signups.',
    icon: Star,
    iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
    price: '₹0',
    period: '14 Days Free',
    billingCycle: 'Custom',
    subscribersCount: 14,
    subscribersUnit: 'Trial Users',
    mrr: '₹0',
    numericPrice: 0,
    numericMrr: 0,
    status: 'Inactive',
    createdOn: '01 May 2024',
    maxUsers: 2,
    features: ['2 User Seats', '3 Sample Tenders', 'Basic Dashboard Access']
  }
];

const SubscriptionPlans = () => {
  // Main Data States
  const [plansList, setPlansList] = useState(initialPlansList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cycleFilter, setCycleFilter] = useState('All Billing Cycles');
  const [priceFilter, setPriceFilter] = useState('All Prices');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Sorting & View States
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Dynamic Form State for Create & Edit
  const [formData, setFormData] = useState({
    name: '',
    subtext: '',
    price: '',
    period: 'per month',
    billingCycle: 'Monthly',
    maxUsers: 25,
    status: 'Active',
    features: ['Standard Module Access', 'Email Support', 'Invoice Engine'],
    newFeatureInput: ''
  });

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  // Dynamic KPI Calculations
  const stats = useMemo(() => {
    const totalPlans = plansList.length;
    const activePlans = plansList.filter(p => p.status === 'Active').length;
    const totalSubs = plansList.reduce((acc, p) => acc + (p.subscribersCount || 0), 0);
    const totalMrrNumeric = plansList
      .filter(p => p.status === 'Active')
      .reduce((acc, p) => acc + (p.numericMrr || 0), 0);
    const totalAnnualNumeric = totalMrrNumeric * 12;

    const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

    return {
      totalPlans,
      activePlans,
      totalSubs,
      mrrFormatted: formatCurrency(totalMrrNumeric),
      annualFormatted: formatCurrency(totalAnnualNumeric)
    };
  }, [plansList]);

  // Feature Add / Remove handlers for Modals
  const handleAddFeature = () => {
    if (!formData.newFeatureInput.trim()) return;
    setFormData({
      ...formData,
      features: [...formData.features, formData.newFeatureInput.trim()],
      newFeatureInput: ''
    });
  };

  const handleRemoveFeature = (indexToRemove) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setCycleFilter('All Billing Cycles');
    setPriceFilter('All Prices');
    setSortColumn(null);
    setCurrentPage(1);
    triggerToast('Filters reset to default view', 'info');
  };

  // Create Plan
  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    const numericPriceVal = parseInt(formData.price.toString().replace(/[^0-9]/g, '')) || 0;
    const priceFormatted = `₹${numericPriceVal.toLocaleString('en-IN')}`;

    const newPlan = {
      id: Date.now(),
      name: formData.name.trim(),
      subtext: formData.subtext.trim() || 'Custom subscription plan',
      icon: Star,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      price: priceFormatted,
      numericPrice: numericPriceVal,
      period: formData.period || 'per month',
      billingCycle: formData.billingCycle,
      subscribersCount: 0,
      subscribersUnit: 'Organizations',
      mrr: '₹0',
      numericMrr: 0,
      status: formData.status,
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      maxUsers: parseInt(formData.maxUsers) || 25,
      features: formData.features.length > 0 ? formData.features : ['Standard Access', 'Email Support']
    };

    setPlansList([newPlan, ...plansList]);
    setShowCreateModal(false);
    triggerToast(`Subscription plan "${newPlan.name}" created successfully!`, 'success');
  };

  // Update Plan
  const handleUpdatePlan = (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const numericPriceVal = parseInt(formData.price.toString().replace(/[^0-9]/g, '')) || 0;
    const priceFormatted = `₹${numericPriceVal.toLocaleString('en-IN')}`;
    const newMrrNumeric = numericPriceVal * (selectedPlan.subscribersCount || 0);

    const updated = plansList.map(p => {
      if (p.id === selectedPlan.id) {
        return {
          ...p,
          name: formData.name.trim(),
          subtext: formData.subtext.trim(),
          price: priceFormatted,
          numericPrice: numericPriceVal,
          period: formData.period,
          billingCycle: formData.billingCycle,
          maxUsers: parseInt(formData.maxUsers) || 1,
          status: formData.status,
          features: formData.features,
          numericMrr: newMrrNumeric,
          mrr: `₹${newMrrNumeric.toLocaleString('en-IN')}`
        };
      }
      return p;
    });

    setPlansList(updated);
    setShowEditModal(false);
    triggerToast(`Plan "${formData.name}" updated successfully!`, 'success');
  };

  // Toggle Plan Active Status
  const handleToggleStatus = (plan) => {
    const nextStatus = plan.status === 'Active' ? 'Inactive' : 'Active';
    setPlansList(plansList.map(p => p.id === plan.id ? { ...p, status: nextStatus } : p));
    setActiveDropdownId(null);
    triggerToast(`Plan "${plan.name}" status changed to ${nextStatus}`, 'info');
  };

  // Duplicate / Clone Plan
  const handleDuplicatePlan = (plan) => {
    const clonedPlan = {
      ...plan,
      id: Date.now(),
      name: `${plan.name} (Copy)`,
      subscribersCount: 0,
      mrr: '₹0',
      numericMrr: 0,
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setPlansList([clonedPlan, ...plansList]);
    setActiveDropdownId(null);
    triggerToast(`Cloned plan as "${clonedPlan.name}"`, 'success');
  };

  // Delete Plan Confirmation & Trigger
  const handleDeletePlanConfirm = () => {
    if (!selectedPlan) return;
    setPlansList(plansList.filter(p => p.id !== selectedPlan.id));
    setShowDeleteModal(false);
    setSelectedPlan(null);
    setActiveDropdownId(null);
    triggerToast('Subscription plan removed', 'warning');
  };

  // Bulk Operations
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredPlans.map(p => p.id));
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

  const handleBulkActivate = () => {
    setPlansList(plansList.map(p => selectedRowIds.includes(p.id) ? { ...p, status: 'Active' } : p));
    setSelectedRowIds([]);
    triggerToast(`Activated ${selectedRowIds.length} subscription plans`, 'success');
  };

  const handleBulkDeactivate = () => {
    setPlansList(plansList.map(p => selectedRowIds.includes(p.id) ? { ...p, status: 'Inactive' } : p));
    setSelectedRowIds([]);
    triggerToast(`Deactivated ${selectedRowIds.length} subscription plans`, 'info');
  };

  const handleBulkDelete = () => {
    setPlansList(plansList.filter(p => !selectedRowIds.includes(p.id)));
    triggerToast(`Deleted ${selectedRowIds.length} selected plans`, 'warning');
    setSelectedRowIds([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Plan Name', 'Price', 'Billing Cycle', 'Subscribers', 'MRR', 'Status', 'Max Users', 'Created On'];
    const rows = filteredPlans.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.price}"`,
      p.billingCycle,
      p.subscribersCount,
      `"${p.mrr}"`,
      p.status,
      p.maxUsers,
      p.createdOn
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Subscription_Plans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('Exported plans data to CSV!', 'success');
  };

  // Sort Handler
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Filtering & Sorting Calculation
  const filteredPlans = useMemo(() => {
    return plansList.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.subtext.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
      const matchesCycle = cycleFilter === 'All Billing Cycles' || p.billingCycle === cycleFilter;
      
      let matchesPrice = true;
      if (priceFilter === 'Under ₹25,000') matchesPrice = p.numericPrice < 25000;
      else if (priceFilter === '₹25,000 - ₹75,000') matchesPrice = p.numericPrice >= 25000 && p.numericPrice <= 75000;
      else if (priceFilter === 'Above ₹75,000') matchesPrice = p.numericPrice > 75000;

      return matchesSearch && matchesStatus && matchesCycle && matchesPrice;
    }).sort((a, b) => {
      if (!sortColumn) return 0;
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'price') {
        valA = a.numericPrice;
        valB = b.numericPrice;
      } else if (sortColumn === 'mrr') {
        valA = a.numericMrr;
        valB = b.numericMrr;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [plansList, searchQuery, statusFilter, cycleFilter, priceFilter, sortColumn, sortDirection]);

  // Paginated List
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage) || 1;
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPlans.slice(start, start + itemsPerPage);
  }, [filteredPlans, currentPage, itemsPerPage]);

  // Open Edit Modal helper
  const openEditModalFor = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      subtext: plan.subtext,
      price: plan.numericPrice.toString(),
      period: plan.period || 'per month',
      billingCycle: plan.billingCycle,
      maxUsers: plan.maxUsers,
      status: plan.status,
      features: [...plan.features],
      newFeatureInput: ''
    });
    setShowEditModal(true);
    setActiveDropdownId(null);
  };

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'warning' ? 'bg-amber-900 text-amber-100 border-amber-700' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Zap size={16} className="text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Crown className="text-blue-600 shrink-0" size={24} />
            Subscription Plans
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure pricing tiers, manage subscription packages, and monitor recurring revenue streams.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            title="Export plans to CSV file"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button 
            onClick={() => setShowComparisonModal(true)}
            title="View Plans Comparison Matrix"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <BarChart3 size={14} className="text-blue-600" />
            <span>Comparison Matrix</span>
          </button>

          <button 
            onClick={() => {
              setFormData({
                name: '',
                subtext: '',
                price: '',
                period: 'per month',
                billingCycle: 'Monthly',
                maxUsers: 25,
                status: 'Active',
                features: ['Standard Module Access', 'Email Support', 'Invoice Engine'],
                newFeatureInput: ''
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Dynamic Top KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Plans */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {stats.totalPlans} Tiers
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Plans</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalPlans}</h3>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Configured plans in system</p>
        </div>

        {/* Card 2: Active Plans */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
              {Math.round((stats.activePlans / (stats.totalPlans || 1)) * 100)}% Published
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Plans</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.activePlans}</h3>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Available for subscription</p>
        </div>

        {/* Card 3: Total Subscriptions */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Package size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
              Live Accounts
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Subscriptions</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalSubs}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 15.3%</span>
            <span className="text-slate-400 font-normal">active organizations</span>
          </div>
        </div>

        {/* Card 4: MRR */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Users size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
              Monthly
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring (MRR)</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.mrrFormatted}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span>↑ 22.1%</span>
            <span className="text-slate-400 font-normal">monthly run-rate</span>
          </div>
        </div>

        {/* Card 5: Annual Revenue */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <FileCheck size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full">
              ARR Project.
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projected Annual (ARR)</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.annualFormatted}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-600">
            <span>↑ 18.6%</span>
            <span className="text-slate-400 font-normal">annual trajectory</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text"
              placeholder="Search plans by name, tagline or features..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Right: Controls & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {/* Billing Cycles Filter */}
            <select 
              value={cycleFilter}
              onChange={(e) => { setCycleFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Billing Cycles">All Billing Cycles</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>

            {/* Expandable Advanced Filters Button */}
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition cursor-pointer ${
                showAdvancedFilters || priceFilter !== 'All Prices'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {priceFilter !== 'All Prices' && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            {/* Reset Filter Button */}
            <button 
              onClick={handleResetFilters}
              title="Reset all search filters"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* View Mode Toggle Switch (Table vs Grid Cards) */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Grid Cards View"
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={15} />
              </button>
            </div>

          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Filter By Price Range
              </label>
              <select
                value={priceFilter}
                onChange={(e) => { setPriceFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="All Prices">All Prices</option>
                <option value="Under ₹25,000">Under ₹25,000 / mo</option>
                <option value="₹25,000 - ₹75,000">₹25,000 to ₹75,000 / mo</option>
                <option value="Above ₹75,000">Above ₹75,000 / mo</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Filter Count
              </label>
              <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-600 font-bold flex items-center justify-between">
                <span>Showing {filteredPlans.length} of {plansList.length} plans</span>
                {filteredPlans.length < plansList.length && (
                  <button onClick={handleResetFilters} className="text-blue-600 hover:underline text-[11px]">Clear Filters</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar (When rows selected) */}
      {selectedRowIds.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span className="px-2 py-0.5 bg-white/20 rounded-lg">{selectedRowIds.length} Selected</span>
            <span>Bulk actions for selected subscription plans:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkActivate}
              className="px-3 py-1.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition cursor-pointer"
            >
              Activate Selected
            </button>
            <button 
              onClick={handleBulkDeactivate}
              className="px-3 py-1.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition cursor-pointer"
            >
              Deactivate Selected
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Main View: Table Mode OR Cards Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 select-none">
                  
                  {/* Select All Checkbox */}
                  <th className="py-2.5 px-3.5 w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedRowIds.length === filteredPlans.length && filteredPlans.length > 0}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                  </th>

                  {/* Plan Name Column */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>Plan Name</span>
                      {sortColumn === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Price Column */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      {sortColumn === 'price' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Billing Cycle */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('billingCycle')}>
                    <div className="flex items-center gap-1">
                      <span>Billing Cycle</span>
                      {sortColumn === 'billingCycle' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Subscribers */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('subscribersCount')}>
                    <div className="flex items-center gap-1">
                      <span>Subscribers</span>
                      {sortColumn === 'subscribersCount' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* MRR */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('mrr')}>
                    <div className="flex items-center gap-1">
                      <span>MRR</span>
                      {sortColumn === 'mrr' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Status */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Created On */}
                  <th className="py-2.5 px-3.5">Created On</th>

                  {/* Actions */}
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertTriangle size={32} className="text-slate-300" />
                        <p className="font-bold text-slate-600 text-sm">No subscription plans found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search or filter keywords.</p>
                        <button 
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPlans.map(plan => {
                    const IconComponent = plan.icon || Star;
                    const isSelected = selectedRowIds.includes(plan.id);

                    return (
                      <tr key={plan.id} className={`hover:bg-slate-50/80 transition relative ${isSelected ? 'bg-blue-50/30' : ''}`}>
                        
                        {/* Checkbox */}
                        <td className="py-3 px-3.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleRowSelect(plan.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                        </td>

                        {/* Plan Name & Emblem */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl ${plan.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                              <IconComponent size={16} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs">{plan.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[200px]">{plan.subtext}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3.5">
                          <p className="font-extrabold text-slate-900">{plan.price}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{plan.period}</p>
                        </td>

                        {/* Billing Cycle */}
                        <td className="py-3 px-3.5 font-bold text-slate-700">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                            plan.billingCycle === 'Monthly' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            plan.billingCycle === 'Yearly' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {plan.billingCycle}
                          </span>
                        </td>

                        {/* Subscribers */}
                        <td className="py-3 px-3.5">
                          <p className="font-extrabold text-slate-900">{plan.subscribersCount}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{plan.subscribersUnit}</p>
                        </td>

                        {/* MRR */}
                        <td className="py-3 px-3.5 font-extrabold text-slate-900">
                          {plan.mrr}
                        </td>

                        {/* Status Toggle Badge */}
                        <td className="py-3 px-3.5">
                          <button 
                            onClick={() => handleToggleStatus(plan)}
                            title="Click to toggle status"
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                              plan.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${plan.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                            <span>{plan.status}</span>
                          </button>
                        </td>

                        {/* Created On */}
                        <td className="py-3 px-3.5 text-slate-600 font-medium text-[11px]">
                          {plan.createdOn}
                        </td>

                        {/* Row Actions */}
                        <td className="py-3 px-3.5 text-center relative">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* View Action */}
                            <button 
                              onClick={() => { setSelectedPlan(plan); setShowViewModal(true); }}
                              title="View Plan Details"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit Action */}
                            <button 
                              onClick={() => openEditModalFor(plan)}
                              title="Edit Plan Settings"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>

                            {/* More Options Dropdown Trigger */}
                            <div className="relative">
                              <button 
                                onClick={() => setActiveDropdownId(activeDropdownId === plan.id ? null : plan.id)}
                                title="More Options Menu"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <MoreVertical size={15} />
                              </button>

                              {/* Dropdown Menu Popup */}
                              {activeDropdownId === plan.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                                  <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-left text-xs font-semibold animate-in zoom-in-95 duration-150 space-y-0.5">
                                    <button 
                                      onClick={() => { setSelectedPlan(plan); setShowViewModal(true); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                    >
                                      <Eye size={14} className="text-blue-600" />
                                      <span>View Details</span>
                                    </button>

                                    <button 
                                      onClick={() => openEditModalFor(plan)}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                    >
                                      <Edit3 size={14} className="text-slate-600" />
                                      <span>Edit Plan</span>
                                    </button>

                                    <button 
                                      onClick={() => handleToggleStatus(plan)}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                    >
                                      <Power size={14} className={plan.status === 'Active' ? 'text-amber-600' : 'text-emerald-600'} />
                                      <span>{plan.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                                    </button>

                                    <button 
                                      onClick={() => handleDuplicatePlan(plan)}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition"
                                    >
                                      <Copy size={14} className="text-purple-600" />
                                      <span>Duplicate Plan</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    <button 
                                      onClick={() => { setSelectedPlan(plan); setShowDeleteModal(true); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete Plan</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPlans.map(plan => {
            const IconComponent = plan.icon || Star;
            return (
              <div key={plan.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-4 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${plan.iconBg} flex items-center justify-center font-bold`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{plan.name}</h3>
                        <p className="text-[10px] text-slate-400 font-medium">{plan.billingCycle} Cycle</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleToggleStatus(plan)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                        plan.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {plan.status}
                    </button>
                  </div>

                  <div className="pt-3 pb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">{plan.subtext}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100 text-xs my-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Subscribers:</span>
                      <span className="font-bold text-slate-900">{plan.subscribersCount} Orgs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">MRR Contribution:</span>
                      <span className="font-bold text-blue-600">{plan.mrr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Max User Seats:</span>
                      <span className="font-bold text-slate-800">{plan.maxUsers} Users</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features included:</p>
                    {plan.features.slice(0, 4).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check size={14} className="text-blue-600 shrink-0" />
                        <span className="line-clamp-1">{f}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-[10px] text-blue-600 font-bold pt-1">+ {plan.features.length - 4} more features</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button 
                    onClick={() => { setSelectedPlan(plan); setShowViewModal(true); }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => openEditModalFor(plan)}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Edit Settings
                  </button>
                  <button 
                    onClick={() => handleDuplicatePlan(plan)}
                    title="Duplicate Plan"
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs transition cursor-pointer"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shadow-xs">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredPlans.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredPlans.length)}</span> of <span className="font-bold text-slate-800">{filteredPlans.length}</span> subscription plans
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Rows per page</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
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

      {/* CREATE NEW PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Create Subscription Plan
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Plan Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Growth Plan"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Price (₹) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="49999"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Tagline / Description</label>
                <input 
                  type="text" 
                  value={formData.subtext}
                  onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                  placeholder="e.g. Suited for expanding infrastructure teams."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billing Cycle</label>
                  <select 
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Users</label>
                  <input 
                    type="number" 
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Feature List Builder */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Included Features</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={formData.newFeatureInput}
                    onChange={(e) => setFormData({ ...formData, newFeatureInput: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    placeholder="Type feature and press Enter or Add"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.features.map((feat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200">
                      <span>{feat}</span>
                      <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-600" />
                Edit Plan: {selectedPlan.name}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Plan Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Price (₹)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={formData.subtext}
                  onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billing Cycle</label>
                  <select 
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Users</label>
                  <input 
                    type="number" 
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Feature List Builder */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Edit Plan Features</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={formData.newFeatureInput}
                    onChange={(e) => setFormData({ ...formData, newFeatureInput: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    placeholder="Type new feature and press Add"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.features.map((feat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200">
                      <span>{feat}</span>
                      <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setShowDeleteModal(true); }}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Plan</span>
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PLAN DETAILS MODAL */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${selectedPlan.iconBg} font-extrabold flex items-center justify-center text-base shadow-xs`}>
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedPlan.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedPlan.price} / {selectedPlan.period}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Active Subscribers:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.subscribersCount} Organizations</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Monthly Revenue (MRR):</span>
                  <span className="font-bold text-blue-600">{selectedPlan.mrr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Max Users Cap:</span>
                  <span className="font-bold text-slate-800">{selectedPlan.maxUsers} User Seats</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <span className={`font-bold ${selectedPlan.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {selectedPlan.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="font-bold text-slate-700">Included Features:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600">
                      <Check size={14} className="text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button 
                onClick={() => { setShowViewModal(false); openEditModalFor(selectedPlan); }}
                className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Edit Plan
              </button>
              <button 
                onClick={() => { handleToggleStatus(selectedPlan); setShowViewModal(false); }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Toggle Status
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN COMPARISON MATRIX MODAL */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Subscription Plans Comparison Matrix
              </h3>
              <button onClick={() => setShowComparisonModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-slate-500 font-bold border-b border-slate-200/80">
                    <th className="py-3 px-3.5">Plan Name</th>
                    <th className="py-3 px-3.5">Price</th>
                    <th className="py-3 px-3.5">Billing</th>
                    <th className="py-3 px-3.5">Max Seats</th>
                    <th className="py-3 px-3.5">Subscribers</th>
                    <th className="py-3 px-3.5">MRR</th>
                    <th className="py-3 px-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {plansList.map(plan => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 font-extrabold text-slate-900">{plan.name}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-800">{plan.price}</td>
                      <td className="py-3 px-3.5 text-slate-600">{plan.billingCycle}</td>
                      <td className="py-3 px-3.5 text-slate-600">{plan.maxUsers} Users</td>
                      <td className="py-3 px-3.5 text-slate-600">{plan.subscribersCount}</td>
                      <td className="py-3 px-3.5 font-bold text-blue-600">{plan.mrr}</td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          plan.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100 transition cursor-pointer"
              >
                <Download size={14} />
                <span>Export Comparison CSV</span>
              </button>

              <button 
                onClick={() => setShowComparisonModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Subscription Plan?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <span className="font-bold text-slate-800">"{selectedPlan.name}"</span>? This action will archive this tier from the super admin dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePlanConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionPlans;
