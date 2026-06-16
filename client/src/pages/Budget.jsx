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
  Clock
} from 'lucide-react';

const mockCategories = [
  { id: 1, name: 'Logistics Expansion', department: 'OPERATIONS', status: 'ON TRACK', allocated: 150000, spent: 105000, utilization: 70, trend: '+2.4%', color: 'bg-blue-600' },
  { id: 2, name: 'Digital Ad Spend', department: 'MARKETING', status: 'ON TRACK', allocated: 85000, spent: 42500, utilization: 50, trend: '+1.2%', color: 'bg-emerald-500' },
  { id: 3, name: 'Core Infrastructure R&D', department: 'R&D', status: 'OVER BUDGET', allocated: 120000, spent: 128000, utilization: 106, trend: '+5.8%', color: 'bg-rose-500' },
  { id: 4, name: 'Recruitment Drive', department: 'HUMAN RESOURCES', status: 'ON TRACK', allocated: 45000, spent: 31500, utilization: 70, trend: '+0.5%', color: 'bg-amber-500' },
  { id: 5, name: 'Cloud Server Upgrades', department: 'IT INFRASTRUCTURE', status: 'UNDER BUDGET', allocated: 90000, spent: 54000, utilization: 60, trend: '-1.1%', color: 'bg-indigo-500' },
];

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

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgetList(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
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
    fetchExpenses();
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
    else if (computedUtilization >= 90) newStatus = 'ON TRACK'; // Or some warning state
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

  // Premium Toast Notification state
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
          color: 'bg-indigo-500',
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

    const filename = `Budget_Report_${startDate}_to_${endDate}`;

    if (format === 'csv') {
      const headers = ['Category ID', 'Budget Category', 'Status', 'Allocated Amount', 'Spent Amount', 'Utilization %'];
      const rows = filteredBudgets.map(item => [
        item.id,
        item.name,
        item.status,
        item.allocated.toFixed(2),
        item.spent.toFixed(2),
        `${item.utilization}%`
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Budget report CSV downloaded!');
    } else if (format === 'xlsx') {
      const exportRows = filteredBudgets.map(item => ({
        "ID": item.id,
        "Category": item.name,
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
      doc.setFontSize(18);
      doc.text("Budget Planning Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
      
      const rows = filteredBudgets.map(item => [item.id, item.name, item.status, item.allocated.toLocaleString(), item.spent.toLocaleString(), `${item.utilization}%`]);
      autoTable(doc, {
        startY: 35,
        head: [["ID", "Category", "Status", "Allocated", "Spent", "Util %"]],
        body: rows,
      });
      doc.save(`${filename}.pdf`);
    }
  };

  // Filter criteria logic
  const filteredBudgets = computedBudgetList.filter(item => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(query) || item.status.toLowerCase().includes(query) || (item.department || '').toLowerCase().includes(query);

    // 2. Status Filter
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    // 3. Department Filter
    const matchesDept = departmentFilter === 'ALL DEPARTMENTS' || (item.department || 'OPERATIONS') === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const criticalCount = filteredBudgets.filter(b => b.status === 'OVER BUDGET').length;
  const overallUtilizationRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const stats = [
    { label: 'TOTAL BUDGET', value: `$${totalAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `FISCAL YEAR: ${selectedFY}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'TOTAL SPENT', value: `$${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `${overallUtilizationRate}% OF TOTAL UTILIZED`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'REMAINING', value: `$${totalRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'AVAILABLE BALANCE', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'OVER BUDGET', value: String(criticalCount), sub: 'CRITICAL ATTENTION', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'SAVINGS GOAL', value: '12%', sub: 'TARGET SAVINGS: 15%', icon: Target, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'PROJECTS', value: '24', sub: 'ACTIVE ALLOCATION', icon: Layers, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  // Group budgets by department
  const uniqueDepartments = [...new Set(filteredBudgets.map(b => b.department || 'OPERATIONS'))];
  const departmentStats = uniqueDepartments.map(dept => {
    const deptBudgets = filteredBudgets.filter(b => (b.department || 'OPERATIONS') === dept);
    const allocated = deptBudgets.reduce((sum, b) => sum + b.allocated, 0);
    const spent = deptBudgets.reduce((sum, b) => sum + b.spent, 0);
    const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    const activeCount = deptBudgets.length;
    // determine worst status
    let status = 'ON TRACK';
    if (deptBudgets.some(b => b.status === 'OVER BUDGET')) status = 'OVER BUDGET';
    else if (deptBudgets.every(b => b.status === 'UNDER BUDGET')) status = 'UNDER BUDGET';
    return { dept, allocated, spent, utilization, activeCount, status };
  });

  // Budgets to show in the tabular view
  const tabularBudgets = activeDepartmentView ? filteredBudgets.filter(b => (b.department || 'OPERATIONS') === activeDepartmentView) : [];

  if (selectedCategoryDetails) {
    const categoryExpenses = expenses.filter(e => e.category === selectedCategoryDetails.name);
    return <BudgetDetails category={selectedCategoryDetails} expenses={categoryExpenses} onBack={() => setSelectedCategoryDetails(null)} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-7 bg-[#f8fafc] min-h-screen text-left relative">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-5 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">BUDGET PLANNING</h1>
          <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mt-0.5">RESOURCE ALLOCATION & EXPENSE TRACKING</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            <span>Add New Budget</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search budgets..." 
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={16} className="text-blue-500" />
            <span>Export Report</span>
          </button>
          
          <div className="flex bg-white p-1 border border-slate-100 rounded-xl shadow-sm">
            {periods.map((p) => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${period === p ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowGlobalFilter(!showGlobalFilter)}
              className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-105 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all shadow-sm border ${showGlobalFilter ? 'bg-slate-100 text-slate-805' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={16} className="text-blue-500" />
              <span>{(statusFilter !== 'ALL' || departmentFilter !== 'ALL DEPARTMENTS' || selectedFY !== 'FY 2024') ? 'Filters Active' : 'Filters'}</span>
            </button>

            {showGlobalFilter && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-150 shadow-xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Filters</h4>
                  <button 
                    onClick={() => {
                      setStatusFilter('ALL');
                      setDepartmentFilter('ALL DEPARTMENTS');
                      setShowGlobalFilter(false);
                      triggerToast('Filters reset to default');
                    }}
                    className="text-[9px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget Status</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['ALL', 'ON TRACK', 'OVER BUDGET', 'UNDER BUDGET'].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`py-1.5 rounded-lg text-[8px] sm:text-[9px] font-bold transition-all ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Layers size={14} className="text-purple-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</span>
                    </div>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] sm:text-[10px] font-bold outline-none"
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
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-100 flex flex-col items-start group hover:shadow-md transition-all duration-300">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3 transition-transform group-hover:scale-105`}>
              <stat.icon size={18} />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{stat.label}</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight block leading-none">{stat.value}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block mt-1 leading-none">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {!activeDepartmentView ? (
        <>
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-left">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight uppercase">Departments</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentStats.length > 0 ? (
              departmentStats.map((stat, index) => (
                <div 
                  key={index} 
                  onClick={() => setActiveDepartmentView(stat.dept)}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative overflow-hidden cursor-pointer text-left"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                    stat.status === 'ON TRACK' ? 'bg-blue-600' : 
                    stat.status === 'OVER BUDGET' ? 'bg-rose-500' : 
                    'bg-emerald-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-4 pt-1">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 mb-2 rounded-full text-[8.5px] font-black uppercase tracking-wide ${
                        stat.status === 'ON TRACK' ? 'bg-blue-50 text-blue-600' : 
                        stat.status === 'OVER BUDGET' ? 'bg-rose-50 text-rose-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {stat.status}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight uppercase line-clamp-1" title={stat.dept}>{stat.dept}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stat.activeCount} Active {stat.activeCount === 1 ? 'Budget' : 'Budgets'}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50/50 rounded-xl p-3">
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Allocated</span>
                      <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">${stat.allocated.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-3">
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Spent</span>
                      <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">${stat.spent.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[8.5px] sm:text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Overall Utilization</span>
                      <span className={`text-xs font-black ${stat.utilization > 100 ? 'text-rose-500' : 'text-slate-800'}`}>{stat.utilization}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div 
                        className={`h-full ${stat.utilization > 100 ? 'bg-rose-500' : 'bg-blue-600'} transition-all duration-1000`} 
                        style={{ width: `${Math.min(stat.utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                <Layers size={36} className="mx-auto text-slate-200 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 uppercase italic">No Departments Found</h3>
                <p className="text-xs text-slate-400 mt-1">No departments match the selected filters.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-left">
            <div>
              <button 
                onClick={() => setActiveDepartmentView(null)}
                className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest mb-2 transition-all"
              >
                <ArrowLeft size={12} />
                <span>Back to Departments</span>
              </button>
              <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight uppercase">{activeDepartmentView} Budgets</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                <span>Live Tracking Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[850px]">
                <thead>
                  <tr className="text-[8.5px] sm:text-[9.5px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-5 sm:px-8 py-3.5">Budget Category</th>
                    <th className="px-5 sm:px-8 py-3.5">Status</th>
                    <th className="px-5 sm:px-8 py-3.5">Allocated</th>
                    <th className="px-5 sm:px-8 py-3.5">Expenditure</th>
                    <th className="px-5 sm:px-8 py-3.5">Utilization Progress</th>
                    <th className="px-5 sm:px-8 py-3.5">Trend</th>
                    <th className="px-5 sm:px-8 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tabularBudgets.length > 0 ? (
                    tabularBudgets.map((cat, index) => (
                      <tr key={cat.id || index} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <td className="px-5 sm:px-8 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-1 h-8 rounded-full ${cat.color || 'bg-slate-400'}`}></div>
                            <div>
                              <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight uppercase block">{cat.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{cat.department || 'OPERATIONS'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider transition-all
                            ${cat.status === 'ON TRACK' ? 'bg-blue-600 text-white' : 
                              cat.status === 'OVER BUDGET' ? 'bg-rose-500 text-white' : 
                              'bg-emerald-500 text-white'}`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-5 sm:px-8 py-4 text-xs sm:text-sm font-black text-slate-800 tracking-tight">${cat.allocated.toLocaleString()}</td>
                        <td className="px-5 sm:px-8 py-4 text-xs sm:text-sm font-black text-slate-800 tracking-tight">${cat.spent.toLocaleString()}</td>
                        <td className="px-5 sm:px-8 py-4 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${cat.utilization > 100 ? 'bg-rose-500' : 'bg-blue-600'} transition-all`} 
                                style={{ width: `${Math.min(cat.utilization, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-800 italic">{cat.utilization}%</span>
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-4">
                          <div className={`flex items-center gap-1 text-[9px] font-bold ${cat.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                            <ArrowUpRight size={12} className={cat.trend.startsWith('-') ? 'rotate-90' : ''} />
                            {cat.trend}
                          </div>
                        </td>
                        <td className="px-5 sm:px-8 py-4 text-center">
                          <button 
                            onClick={() => setSelectedCategoryDetails(cat)}
                            className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-5 sm:px-8 py-12 text-center text-slate-400 font-bold italic">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Initialize Budget Allocation</h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Set financial targets & departments</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Q3 Operational Overhead"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Category</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiscal Year</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                      value={formData.fiscalYear}
                      onChange={(e) => setFormData({...formData, fiscalYear: e.target.value})}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocation Period</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {periods.map(p => (
                        <button 
                          key={p}
                          onClick={() => setFormData({...formData, period: p})}
                          className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${formData.period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-rose-500">Alert Threshold (%)</label>
                    <div className="relative">
                      <Percent size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number"
                        placeholder="80"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                        value={formData.threshold}
                        onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Allocation ($)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocation Purpose</label>
                  <textarea 
                    rows="3"
                    placeholder="Briefly explain the intent for this budget allocation..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Discard Draft
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveBudget}
                    className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
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
        <div className="fixed bottom-8 right-8 z-[200] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-black uppercase tracking-widest">{toastMessage}</span>
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
