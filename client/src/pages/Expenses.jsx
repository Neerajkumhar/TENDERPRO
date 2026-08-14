import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExportModal from '../components/ExportModal';
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
  UploadCloud,
  Loader2
} from 'lucide-react';

const Expenses = ({ onViewExpense, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    department: 'OPERATIONS',
    category: 'OFFICE',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    status: 'PENDING',
    document: null
  });

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(['OFFICE', 'TRAVEL', 'MARKETING', 'SALARIES', 'INFRASTRUCTURE', 'OPERATIONS', 'R&D', 'OTHERS']);
  const [departments, setDepartments] = useState(['OPERATIONS', 'MARKETING', 'SALES', 'IT', 'FINANCE', 'HR', 'R&D']);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      triggerToast('Error loading expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
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
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: formData.department,
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
        triggerToast(editingExpense ? `Expense updated successfully!` : `Expense recorded successfully!`);
        setIsModalOpen(false);
        setEditingExpense(null);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const startEditExpense = (expense) => {
    setEditingExpense(expense);
    setFormData({
      department: expense.department || 'OPERATIONS',
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
        triggerToast(`Expense deleted permanently.`);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
    setDeleteConfirmId(null);
  };

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const exportData = expenses.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    if (exportData.length === 0) {
      triggerToast("No expenses found for the selected period.");
      return;
    }

    const filename = `Expenses_Report_${startDate}_to_${endDate}`;

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["ID", "Category", "Vendor", "Date", "Amount", "Status"]],
        body: exportData.map(item => [item.id, item.category, item.vendor, item.date, item.amount.toLocaleString(), item.status]),
        styles: { fontSize: 8 }
      });
      doc.save(`${filename}.pdf`);
    }
  };

  const filteredExpenses = expenses.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (item.id || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.vendor || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query) ||
      (item.status || '').toLowerCase().includes(query) ||
      (item.department || '').toLowerCase().includes(query)
    );
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = expenses.length;
  const approvedCount = expenses.filter(e => e.status === 'APPROVED').length;
  const pendingCount = expenses.filter(e => e.status === 'PENDING').length;
  const rejectedCount = expenses.filter(e => e.status === 'REJECTED').length;
  const totalAmountSum = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const stats = [
    { label: 'TOTAL EXPENSES', value: totalCount.toString(), color: 'text-slate-700' },
    { label: 'APPROVED', value: approvedCount.toString(), color: 'text-blue-600' },
    { label: 'PENDING', value: pendingCount.toString(), color: 'text-amber-600' },
    { label: 'REJECTED', value: rejectedCount.toString(), color: 'text-rose-600' },
    { label: 'RECURRING', value: '0', color: 'text-blue-500' },
    { label: 'TOTAL AMOUNT', value: `₹${totalAmountSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-slate-900' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-left">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Expenses</h1>
          <p className="text-[9px] text-slate-500 font-medium">Manage and track company expenditures.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          
          <div className="relative flex items-center gap-1.5">
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border rounded-lg text-[9px] font-bold transition-all shadow-2xs active:scale-95 ${showFilterDropdown || categoryFilter !== 'ALL' || statusFilter !== 'ALL' ? 'border-blue-300 text-blue-600 bg-blue-50/50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={13} className="text-blue-500" />
                <span>Filters</span>
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                      <select className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">ALL CATEGORIES</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">ALL STATUSES</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={() => { setCategoryFilter('ALL'); setStatusFilter('ALL'); }} className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-wider">Reset</button>
                      <button onClick={() => setShowFilterDropdown(false)} className="flex-[2] py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-xs">Apply</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsExportModalOpen(true)} 
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
            >
              <Download size={13} className="text-blue-500" />
              <span>Export</span>
            </button>
          </div>
          
          <button 
            onClick={() => { 
              setEditingExpense(null); 
              setFormData({ department: user?.department?.name || 'OPERATIONS', category: 'OFFICE', vendor: '', date: new Date().toISOString().split('T')[0], description: '', amount: '', status: 'PENDING', document: null }); 
              setIsModalOpen(true); 
            }} 
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            <Plus size={14} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-2.5">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{stat.label}</span>
            <span className={`text-sm sm:text-base font-extrabold ${stat.color} tracking-tight truncate`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Expense Ledger Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Expense Ledger</h2>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={16} />}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-3.5 py-2">Expense ID</th>
                <th className="px-3.5 py-2">Dept</th>
                <th className="px-3.5 py-2">Category</th>
                <th className="px-3.5 py-2">Vendor</th>
                <th className="px-3.5 py-2">Date</th>
                <th className="px-3.5 py-2 text-right">Amount</th>
                <th className="px-3.5 py-2 text-center">Status</th>
                <th className="px-3.5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense, index) => (
                  <tr key={expense.id || index} className="transition-all hover:bg-slate-50/70 group">
                    <td onClick={() => onViewExpense && onViewExpense(expense.id)} className="px-3.5 py-2 text-[10.5px] font-bold text-blue-600 tracking-tight cursor-pointer hover:underline">{expense.id}</td>
                    <td className="px-3.5 py-2 text-[10.5px] font-medium text-slate-500 uppercase">{expense.department || '-'}</td>
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <Tag size={11} className="text-slate-300" />
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{expense.category}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2 text-[11px] font-medium text-slate-600 uppercase">{expense.vendor}</td>
                    <td className="px-3.5 py-2 text-[10px] font-medium text-slate-400 whitespace-nowrap">{expense.date}</td>
                    <td className="px-3.5 py-2 text-[11px] font-extrabold text-slate-900 text-right whitespace-nowrap">₹{parseFloat(expense.amount).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs whitespace-nowrap ${expense.status === 'APPROVED' ? 'bg-blue-500 text-white' : expense.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEditExpense(expense)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all" title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400 text-xs italic font-medium">{isLoading ? 'Fetching data...' : 'No expenses recorded'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[90vh] text-left">
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{editingExpense ? 'Modify Expenditure' : 'Record New Expenditure'}</h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Transaction billing details</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleSaveExpense} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Department</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Vendor Name</label>
                    <input type="text" placeholder="e.g. AWS" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Transaction Date</label>
                    <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Approval Status</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Expenditure Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input type="number" placeholder="0.00" className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Purpose / Description</label>
                  <textarea rows="2" placeholder="Reason for this expense..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Supporting Document</label>
                  <div className="relative border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center text-center">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, document: e.target.files[0]})} accept=".pdf,image/*" />
                    <UploadCloud size={20} className="text-slate-400 mb-1" />
                    <p className="text-[11px] font-semibold text-slate-600 truncate max-w-full px-4">{formData.document ? (formData.document instanceof File ? formData.document.name : 'Document Attached') : 'Click to upload receipt/invoice'}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 pt-2 sticky bottom-0 bg-white pb-1">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95">{editingExpense ? 'Update Record' : 'Record Transaction'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 p-5 text-center z-[120] my-auto">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={22} /></div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1 uppercase">Delete Record?</h3>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-4">This action is permanent and will remove the transaction from audit logs.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={() => confirmDelete(deleteConfirmId)} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-600 transition-all shadow-2xs active:scale-95">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-blue-500 shrink-0" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Expense Ledger" />
    </div>
  );
};

export default Expenses;
