import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Tag, 
  Edit2, 
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  MoreVertical,
  UploadCloud
} from 'lucide-react';

const mockBudgets = [
  { id: 1, name: 'Logistics Expansion', department: 'OPERATIONS', status: 'ON TRACK', allocated: 150000, spent: 105000, utilization: 70, trend: '+2.4%', color: 'bg-blue-600' },
  { id: 2, name: 'Digital Ad Spend', department: 'MARKETING', status: 'ON TRACK', allocated: 85000, spent: 42500, utilization: 50, trend: '+1.2%', color: 'bg-emerald-500' },
  { id: 3, name: 'Core Infrastructure R&D', department: 'R&D', status: 'OVER BUDGET', allocated: 120000, spent: 128000, utilization: 106, trend: '+5.8%', color: 'bg-rose-500' },
  { id: 4, name: 'Recruitment Drive', department: 'HUMAN RESOURCES', status: 'ON TRACK', allocated: 45000, spent: 31500, utilization: 70, trend: '+0.5%', color: 'bg-amber-500' },
  { id: 5, name: 'Cloud Server Upgrades', department: 'IT INFRASTRUCTURE', status: 'UNDER BUDGET', allocated: 90000, spent: 54000, utilization: 60, trend: '-1.1%', color: 'bg-indigo-500' },
];

const mockExpenses = [
  { id: 'EXP-2024-001', category: 'Cloud Server Upgrades', vendor: 'AWS', date: '2024-05-10', description: 'Server Hosting Fees', amount: 12500.00, status: 'APPROVED' },
  { id: 'EXP-2024-002', category: 'Digital Ad Spend', vendor: 'AdSense', date: '2024-05-12', description: 'Social Media Campaign', amount: 8400.00, status: 'PENDING' },
  { id: 'EXP-2024-003', category: 'Logistics Expansion', vendor: 'Dell', date: '2024-05-15', description: 'New Workstations', amount: 15600.00, status: 'APPROVED' },
  { id: 'EXP-2024-004', category: 'Recruitment Drive', vendor: 'British Airways', date: '2024-05-18', description: 'Client Meeting - London', amount: 2300.00, status: 'REJECTED' },
  { id: 'EXP-2024-005', category: 'Core Infrastructure R&D', vendor: 'Adobe', date: '2024-05-20', description: 'Creative Cloud Subscription', amount: 1200.00, status: 'APPROVED' },
];

const Expenses = ({ onViewExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    category: 'OFFICE',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    status: 'PENDING',
    document: null
  });

  const [budgetList, setBudgetList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
    const savedBudgets = localStorage.getItem('tender_budgets');
    const parsedBudgets = savedBudgets ? JSON.parse(savedBudgets) : mockBudgets;
    setBudgetList(parsedBudgets);
    
    if (parsedBudgets && parsedBudgets.length > 0) {
      const budgetNames = parsedBudgets.map(b => b.name);
      setCategories(budgetNames);
      setFormData(prev => ({ ...prev, category: budgetNames[0] }));
    }
  }, []);

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

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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

  const updateExpenses = async () => {
    await fetchExpenses();
  };

  const handleSaveExpense = async (e) => {
    if (e) e.preventDefault();
    if (!formData.vendor || !formData.amount) {
      alert('Please fill in vendor name and expenditure amount');
      return;
    }

    let documentData = formData.document;
    if (formData.document instanceof File) {
      documentData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ name: formData.document.name, type: formData.document.type, data: reader.result });
        reader.readAsDataURL(formData.document);
      });
    }

    try {
      if (editingExpense) {
        // Edit Mode
        const response = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: formData.category,
            vendor: formData.vendor,
            date: formData.date,
            description: formData.description,
            amount: parseFloat(formData.amount) || 0,
            status: formData.status,
            document: documentData
          })
        });

        if (response.ok) {
          await fetchExpenses();
          triggerToast(`Expense ${editingExpense.id} updated successfully!`);
          setEditingExpense(null);
        }
      } else {
        // Create Mode
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: formData.category,
            vendor: formData.vendor,
            date: formData.date,
            description: formData.description,
            amount: parseFloat(formData.amount) || 0,
            status: formData.status || 'PENDING',
            document: documentData
          })
        });

        if (response.ok) {
          const newExpense = await response.json();
          await fetchExpenses();
          triggerToast(`Expense ${newExpense.id} recorded successfully!`);
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }

    setFormData({
      category: categories.length > 0 ? categories[0] : '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      status: 'PENDING',
      document: null
    });
    setIsModalOpen(false);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const startEditExpense = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      vendor: expense.vendor,
      date: expense.date,
      description: expense.description,
      amount: String(expense.amount),
      status: expense.status,
      document: expense.document || null
    });
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchExpenses();
        triggerToast(`Expense ${id} deleted permanently.`);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      triggerToast('No expenses to export');
      return;
    }

    const headers = ['Expense ID', 'Category', 'Vendor', 'Date', 'Description', 'Amount', 'Status'];
    const rows = filteredExpenses.map(item => [
      item.id,
      item.category,
      item.vendor,
      item.date,
      item.description,
      Number(item.amount).toFixed(2),
      item.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('CSV export downloaded successfully!');
  };

  // Filter conditions
  const filteredExpenses = expenses.filter(item => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (item.id || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.vendor || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query) ||
      (item.status || '').toLowerCase().includes(query)
    );

    // 2. Category Filter
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    // 3. Status Filter
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = expenses.length;
  const approvedCount = expenses.filter(e => e.status === 'APPROVED').length;
  const pendingCount = expenses.filter(e => e.status === 'PENDING').length;
  const rejectedCount = expenses.filter(e => e.status === 'REJECTED').length;
  const totalAmountSum = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const stats = [
    { label: 'TOTAL EXPENSES', value: totalCount.toString(), icon: FileText, color: 'text-slate-600' },
    { label: 'APPROVED', value: approvedCount.toString(), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'PENDING', value: pendingCount.toString(), icon: Clock, color: 'text-amber-500' },
    { label: 'REJECTED', value: rejectedCount.toString(), icon: XCircle, color: 'text-rose-500' },
    { label: 'RECURRING', value: '0', icon: RefreshCw, color: 'text-blue-500' },
    { label: 'TOTAL AMOUNT', value: `$${totalAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-slate-900' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen relative">
      {/* Header Row - Matching Reference Image */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 sm:mb-10 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">EXPENSES</h1>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1">MANAGE AND TRACK COMPANY EXPENDITURES</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Filter size={16} className="text-blue-500" />
                <span>{(categoryFilter !== 'ALL' || statusFilter !== 'ALL') ? 'Filters Active' : 'Filters'}</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Filters</h4>
                    {(categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                      <button 
                        onClick={() => {
                          setCategoryFilter('ALL');
                          setStatusFilter('ALL');
                        }}
                        className="text-[8px] font-black text-rose-500 hover:underline uppercase tracking-widest"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                      <select
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="ALL">ALL CATEGORIES</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Approval Status</label>
                      <select
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="ALL">ALL STATUSES</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => setShowFilterDropdown(false)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={16} className="text-blue-500" />
              <span>Export</span>
            </button>
          </div>
          
          <button 
            onClick={() => {
              setEditingExpense(null);
              setFormData({
                category: categories.length > 0 ? categories[0] : '',
                vendor: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                status: 'PENDING',
                document: null
              });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Stats Bar - Matching Reference Image */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col justify-center">
            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">{stat.label}</span>
            <span className={`text-xl sm:text-2xl font-black ${stat.color} tracking-tight`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Table Section - Matching Reference Image */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-50 bg-white">
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight italic uppercase">Expense Ledger</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 sm:px-8 py-4 sm:py-5">Expense ID</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Category</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Vendor</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Date</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Description</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Amount</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-center">Status</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense, index) => (
                  <tr key={expense.id || index} className="transition-all hover:bg-slate-50 group">
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <button 
                        onClick={() => onViewExpense && onViewExpense(expense.id)}
                        className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-800 tracking-tight hover:underline focus:outline-none"
                      >
                        {expense.id}
                      </button>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <div className="flex items-center gap-2">
                         <Tag size={12} className="text-slate-300 sm:w-3.5 sm:h-3.5" />
                         <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight uppercase">{expense.category}</span>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-tighter">{expense.vendor}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400">{expense.date}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-500">{expense.description}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-black text-slate-900 text-right">${Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-center">
                      <span className={`px-2 sm:px-4 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest
                        ${expense.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                          expense.status === 'PENDING' ? 'bg-amber-500 text-white' : 
                          expense.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white'}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                      <div className="flex items-center justify-end gap-2 sm:gap-3 transition-opacity">
                        <button 
                          onClick={() => startEditExpense(expense)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-1.5 sm:p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 sm:px-8 py-10 text-center text-slate-400 text-xs sm:text-sm font-bold italic">
                    No expenditures matching filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
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
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
                    {editingExpense ? 'Modify Expenditure' : 'Record New Expenditure'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">
                    {editingExpense ? `Editing record: ${editingExpense.id}` : 'Enter transaction details below'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Amazon Web Services"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.vendor}
                      onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Approval Status</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expenditure Amount ($)</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose / Description</label>
                  <textarea 
                    rows="3"
                    placeholder="Briefly describe the reason for this expense..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supporting Document (Optional)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center text-center">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={(e) => setFormData({...formData, document: e.target.files[0]})} 
                      accept=".pdf,image/*"
                    />
                    <UploadCloud size={24} className="text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-600">
                      {formData.document ? formData.document.name : 'Click or drag to upload receipt/invoice'}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveExpense}
                    className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    {editingExpense ? 'Update Expenditure' : 'Save Expenditure'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDeleteConfirmId(null)}
          ></div>
          
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 p-8 text-center z-[120]">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-100/50">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Expenditure?</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8">
              Are you sure you want to delete expense <span className="text-blue-600 font-black">{deleteConfirmId}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
              >
                Delete Expense
              </button>
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
    </div>
  );
};

export default Expenses;
