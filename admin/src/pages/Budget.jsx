import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExportModal from '../components/ExportModal';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Plus, 
  Wallet,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Target,
  Layers,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
  XCircle,
  BarChart3,
  Percent,
  Clock,
  Loader2
} from 'lucide-react';

import BudgetDetails from './BudgetDetails';

const Budget = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('ANNUAL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'OPERATIONS',
    period: 'ANNUAL',
    fiscalYear: '2024-25',
    amount: '',
    threshold: '80',
    description: ''
  });

  const categories = ['OPERATIONS', 'MARKETING', 'R&D', 'HUMAN RESOURCES', 'IT INFRASTRUCTURE', 'LOGISTICS', 'LEGAL'];
  const periods = ['ANNUAL', 'QUARTERLY', 'MONTHLY'];
  const years = ['2023-24', '2024-25', '2025-26'];

  const [budgetList, setBudgetList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgetList(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };
    const fetchTenders = async () => {
      try {
        const response = await fetch('/api/tenders');
        if (response.ok) {
          const data = await response.json();
          setTenders(data);
        }
      } catch (error) {
        console.error('Error fetching tenders:', error);
      }
    };
    fetchExpenses();
    fetchTenders();
    fetchBudgets();
  }, []);

  // Compute dynamic spent amounts from expenses
  const computedBudgetList = budgetList.map(budget => {
    const budgetExpenses = expenses.filter(e => e.category === budget.name && e.status !== 'REJECTED');
    const computedSpent = budgetExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const computedUtilization = budget.allocated > 0 ? Math.round((computedSpent / budget.allocated) * 100) : 0;
    
    // Auto-update status if OVER BUDGET
    let newStatus = budget.status;
    if (computedUtilization > 100) newStatus = 'OVER BUDGET';
    else if (computedUtilization >= 90) newStatus = 'ON TRACK';
    else if (computedUtilization < 100 && budget.status === 'OVER BUDGET') newStatus = 'ON TRACK';

    return {
      ...budget,
      spent: computedSpent,
      utilization: computedUtilization,
      status: newStatus
    };
  });

  const [selectedFY, setSelectedFY] = useState('FY 2024');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL DEPARTMENTS');
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);

  const [activeDepartmentView, setActiveDepartmentView] = useState(null);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleSaveBudget = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('Please fill in budget title and allocation amount');
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.title.toUpperCase(),
          department: formData.category,
          allocated: parseFloat(formData.amount) || 0,
          status: 'ON TRACK',
          trend: '0.0%',
          color: 'bg-blue-500',
          fiscalYear: formData.fiscalYear,
          period: formData.period,
          threshold: parseInt(formData.threshold) || 80,
          description: formData.description
        })
      });

      if (response.ok) {
        triggerToast(`Budget category "${formData.title}" initialized successfully!`);
        fetchBudgets();
        setFormData({
          title: '',
          category: 'OPERATIONS',
          period: 'ANNUAL',
          fiscalYear: '2024-25',
          amount: '',
          threshold: '80',
          description: ''
        });
        setIsModalOpen(false);
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Error connecting to the server');
    }
  };

  const handleExportReport = ({ format, startDate, endDate }) => {
    if (filteredBudgets.length === 0) {
      triggerToast('No budget allocations to export');
      return;
    }

    const filename = `Admin_Budget_Report_${startDate}_to_${endDate}`;

    if (format === 'xlsx') {
      const exportRows = filteredBudgets.map(item => ({
        "ID": item.id,
        "Category": item.name,
        "Department": item.department,
        "Status": item.status,
        "Allocated": item.allocated,
        "Spent": item.spent,
        "Utilization %": item.utilization
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Budgets");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Global Budget Planning Report", 14, 15);
      doc.setFontSize(9);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);
      
      const rows = filteredBudgets.map(item => [item.id, item.name, item.department, item.status, `₹${item.allocated.toLocaleString('en-IN')}`, `₹${item.spent.toLocaleString('en-IN')}`]);
      autoTable(doc, {
        startY: 28,
        head: [["ID", "Category", "Dept", "Status", "Allocated", "Spent"]],
        body: rows,
        styles: { fontSize: 8 }
      });
      doc.save(`${filename}.pdf`);
    } else if (format === 'csv') {
      const rows = filteredBudgets.map(item => [item.id, item.name, item.department, item.status, item.allocated, item.spent]);
      const csvContent = [["ID", "Category", "Dept", "Status", "Allocated", "Spent"], ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Filter criteria logic
  const filteredBudgets = computedBudgetList.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(query) || item.status.toLowerCase().includes(query) || (item.department || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesDept = departmentFilter === 'ALL DEPARTMENTS' || (item.department || 'OPERATIONS') === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const criticalCount = filteredBudgets.filter(b => b.status === 'OVER BUDGET').length;
  const overallUtilizationRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const savingsRate = totalAllocated > 0 ? Math.round(((totalAllocated - totalSpent) / totalAllocated) * 100) : 0;

  const stats = [
    { label: 'TOTAL BUDGET', value: `₹${totalAllocated.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `FY: ${selectedFY}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50/80' },
    { label: 'TOTAL SPENT', value: `₹${totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `${overallUtilizationRate}% UTILIZED`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50/80' },
    { label: 'REMAINING', value: `₹${totalRemaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'AVAILABLE BALANCE', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50/80' },
    { label: 'OVER BUDGET', value: String(criticalCount), sub: 'CRITICAL ITEMS', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50/80' },
    { label: 'SAVINGS GOAL', value: `${savingsRate}%`, sub: 'SAVINGS RATE', icon: Target, color: 'text-amber-500', bg: 'bg-amber-50/80' },
    { label: 'PROJECTS', value: String(tenders.length), sub: 'ACTIVE ALLOCATION', icon: Layers, color: 'text-slate-600', bg: 'bg-slate-50/80' },
  ];

  // Group budgets by department
  const uniqueDepartments = [...new Set(filteredBudgets.map(b => b.department || 'OPERATIONS'))];
  const departmentStats = uniqueDepartments.map(dept => {
    const deptBudgets = filteredBudgets.filter(b => (b.department || 'OPERATIONS') === dept);
    const allocated = deptBudgets.reduce((sum, b) => sum + b.allocated, 0);
    const spent = deptBudgets.reduce((sum, b) => sum + b.spent, 0);
    const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    const activeCount = deptBudgets.length;
    let status = 'ON TRACK';
    if (deptBudgets.some(b => b.status === 'OVER BUDGET')) status = 'OVER BUDGET';
    else if (deptBudgets.every(b => b.status === 'UNDER BUDGET')) status = 'UNDER BUDGET';
    return { dept, allocated, spent, utilization, activeCount, status };
  });

  const tabularBudgets = activeDepartmentView ? filteredBudgets.filter(b => (b.department || 'OPERATIONS') === activeDepartmentView) : [];

  if (selectedCategoryDetails) {
    const categoryExpenses = expenses.filter(e => e.category === selectedCategoryDetails.name);
    return <BudgetDetails category={selectedCategoryDetails} expenses={categoryExpenses} onBack={() => setSelectedCategoryDetails(null)} />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-left">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Budget Planning</h1>
          <p className="text-[9px] text-slate-500 font-medium">Resource allocation and financial expenditure tracking.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            <Plus size={14} />
            <span>Add New Budget</span>
          </button>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search budgets..." 
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
          >
            <Download size={13} className="text-blue-500" />
            <span>Export</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowGlobalFilter(!showGlobalFilter)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border rounded-lg text-[9px] font-bold transition-all shadow-2xs active:scale-95 ${showGlobalFilter || (statusFilter !== 'ALL' || departmentFilter !== 'ALL DEPARTMENTS') ? 'border-blue-300 text-blue-600 bg-blue-50/50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={13} className="text-blue-500" />
              <span>{(statusFilter !== 'ALL' || departmentFilter !== 'ALL DEPARTMENTS') ? 'Filters ON' : 'Filters'}</span>
            </button>

            {showGlobalFilter && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">Active Filters</h4>
                  <button 
                    onClick={() => {
                      setStatusFilter('ALL');
                      setDepartmentFilter('ALL DEPARTMENTS');
                      setShowGlobalFilter(false);
                      triggerToast('Filters reset to default');
                    }}
                    className="text-[8.5px] font-bold text-blue-600 uppercase hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target size={12} className="text-blue-500" />
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {['ALL', 'ON TRACK', 'OVER BUDGET', 'UNDER BUDGET'].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`py-1 rounded-md text-[8px] font-bold transition-all ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Layers size={12} className="text-purple-500" />
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                    </div>
                    <select 
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-semibold outline-none"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="ALL DEPARTMENTS">ALL DEPARTMENTS</option>
                      {categories.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => setShowGlobalFilter(false)}
                    className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <div className="flex justify-between items-center mb-1.5 w-full">
              <div className={`w-6 h-6 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={13} />
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{stat.sub}</span>
            </div>
            <div className="w-full">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate w-full">{stat.label}</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none truncate">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {!activeDepartmentView ? (
        <>
          <div className="flex justify-between items-center pt-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Departments Overview</h2>
            {loading && <Loader2 className="animate-spin text-blue-500" size={16} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {departmentStats.length > 0 ? (
              departmentStats.map((stat, index) => (
                <div 
                  key={index} 
                  onClick={() => setActiveDepartmentView(stat.dept)}
                  className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col group relative overflow-hidden cursor-pointer text-left"
                >
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${
                    stat.status === 'ON TRACK' ? 'bg-blue-600' : 
                    stat.status === 'OVER BUDGET' ? 'bg-rose-500' : 
                    'bg-blue-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-2.5 pt-0.5">
                    <div>
                      <span className={`inline-block px-2 py-0.5 mb-1 rounded text-[7.5px] font-bold uppercase tracking-wider ${
                        stat.status === 'ON TRACK' ? 'bg-blue-50 text-blue-600' : 
                        stat.status === 'OVER BUDGET' ? 'bg-rose-50 text-rose-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {stat.status}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight uppercase line-clamp-1" title={stat.dept}>{stat.dept}</h3>
                      <p className="text-[8.5px] font-medium text-slate-400 uppercase tracking-tight mt-0.5">{stat.activeCount} Active {stat.activeCount === 1 ? 'Budget' : 'Budgets'}</p>
                    </div>
                    <div className="p-1 rounded-md bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <div className="bg-slate-50/70 rounded-lg p-2 border border-slate-100">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Allocated</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block">₹{stat.allocated.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-slate-50/70 rounded-lg p-2 border border-slate-100">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Spent</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight block">₹{stat.spent.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Overall Utilization</span>
                      <span className={`text-[10.5px] font-extrabold ${stat.utilization > 100 ? 'text-rose-500' : 'text-slate-800'}`}>{stat.utilization}%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.utilization > 100 ? 'bg-rose-500' : 'bg-blue-600'} transition-all duration-500`} 
                        style={{ width: `${Math.min(stat.utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-white rounded-xl border border-slate-200/80">
                <Layers size={28} className="mx-auto text-slate-300 mb-1" />
                <h3 className="text-xs font-bold text-slate-800 uppercase">No Departments Found</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">No departments match the selected filters.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-left pt-1">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveDepartmentView(null)}
                className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-all p-1 bg-white border border-slate-200 rounded-md shadow-2xs"
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{activeDepartmentView} Budgets</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
              <span>Live Tracking Active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[750px]">
                <thead>
                  <tr className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                    <th className="px-3.5 py-2">Budget Category</th>
                    <th className="px-3.5 py-2">Status</th>
                    <th className="px-3.5 py-2">Allocated</th>
                    <th className="px-3.5 py-2">Expenditure</th>
                    <th className="px-3.5 py-2">Utilization Progress</th>
                    <th className="px-3.5 py-2">Trend</th>
                    <th className="px-3.5 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tabularBudgets.length > 0 ? (
                    tabularBudgets.map((cat, index) => (
                      <tr key={cat.id || index} className="hover:bg-slate-50/70 transition-all cursor-pointer group">
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-6 rounded-full ${cat.color || 'bg-slate-400'}`}></div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-800 tracking-tight uppercase block">{cat.name}</span>
                              <span className="text-[8.5px] font-medium text-slate-400 uppercase">{cat.department || 'OPERATIONS'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs
                            ${cat.status === 'ON TRACK' ? 'bg-blue-600 text-white' : 
                              cat.status === 'OVER BUDGET' ? 'bg-rose-500 text-white' : 
                              'bg-blue-500 text-white'}`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-[11px] font-bold text-slate-800 tracking-tight">₹{cat.allocated.toLocaleString('en-IN')}</td>
                        <td className="px-3.5 py-2 text-[11px] font-bold text-slate-800 tracking-tight">₹{cat.spent.toLocaleString('en-IN')}</td>
                        <td className="px-3.5 py-2 min-w-[120px]">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${cat.utilization > 100 ? 'bg-rose-500' : 'bg-blue-600'} transition-all`} 
                                style={{ width: `${Math.min(cat.utilization, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-800">{cat.utilization}%</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2">
                          <div className={`flex items-center gap-0.5 text-[9px] font-bold ${cat.trend.startsWith('+') ? 'text-rose-500' : 'text-blue-500'}`}>
                            <ArrowUpRight size={11} className={cat.trend.startsWith('-') ? 'rotate-90' : ''} />
                            {cat.trend}
                          </div>
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <button 
                            onClick={() => setSelectedCategoryDetails(cat)}
                            className="px-2.5 py-1 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-md text-[8.5px] font-bold uppercase tracking-wider transition-all border border-slate-200 shadow-2xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-xs italic font-medium">
                        No budget allocations for this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add New Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 p-6">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh] text-left">
            <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Initialize Budget Allocation</h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Set financial targets & departments</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Budget Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Q3 Operational Overhead"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Department Category</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fiscal Year</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                      value={formData.fiscalYear}
                      onChange={(e) => setFormData({...formData, fiscalYear: e.target.value})}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Allocation Period</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                      {periods.map(p => (
                        <button 
                          key={p}
                          type="button"
                          onClick={() => setFormData({...formData, period: p})}
                          className={`flex-1 py-1 rounded-md text-[8.5px] font-bold uppercase transition-all ${formData.period === p ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 text-rose-500">Alert Threshold (%)</label>
                    <div className="relative">
                      <Percent size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number"
                        placeholder="80"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                        value={formData.threshold}
                        onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Total Allocation (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Allocation Purpose</label>
                  <textarea 
                    rows="2"
                    placeholder="Briefly explain the intent for this budget allocation..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex gap-2 pt-2 sticky bottom-0 bg-white pb-1">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveBudget}
                    className="flex-[2] py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95"
                  >
                    Activate Budget
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExportReport}
        title="Export Budget Report"
      />
    </div>
  );
};

export default Budget;
