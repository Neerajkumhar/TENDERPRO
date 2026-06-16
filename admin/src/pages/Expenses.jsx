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

const Expenses = ({ onViewExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
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
      (item.status || '').toLowerCase().includes(query)
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
    { label: 'TOTAL EXPENSES', value: totalCount.toString(), icon: FileText, color: 'text-slate-600' },
    { label: 'APPROVED', value: approvedCount.toString(), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'PENDING', value: pendingCount.toString(), icon: Clock, color: 'text-amber-500' },
    { label: 'REJECTED', value: rejectedCount.toString(), icon: XCircle, color: 'text-rose-500' },
    { label: 'RECURRING', value: '0', icon: RefreshCw, color: 'text-blue-500' },
    { label: 'TOTAL AMOUNT', value: `₹${totalAmountSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-slate-900' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen relative text-left">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 sm:mb-10 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">EXPENSES</h1>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1">MANAGE AND TRACK COMPANY EXPENDITURES</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search expenses..." className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Filter size={16} className="text-blue-500" />
                <span>Filters</span>
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</label><select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="ALL">ALL CATEGORIES</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</label><select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="ALL">ALL STATUSES</option><option value="APPROVED">APPROVED</option><option value="PENDING">PENDING</option><option value="REJECTED">REJECTED</option></select></div>
                    <button onClick={() => setShowFilterDropdown(false)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">Apply</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setIsExportModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><Download size={16} className="text-blue-500" /><span>Export</span></button>
          </div>
          
          <button onClick={() => { setEditingExpense(null); setFormData({ category: 'OFFICE', vendor: '', date: new Date().toISOString().split('T')[0], description: '', amount: '', status: 'PENDING', document: null }); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"><Plus size={18} /><span>Add Expense</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">{stat.label}</span>
            <span className={`text-xl sm:text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-50 bg-white flex justify-between items-center gap-4">
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight italic uppercase">Expense Ledger</h2>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={20} />}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
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
                    <td onClick={() => onViewExpense(expense.id)} className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-black text-blue-600 tracking-tight cursor-pointer hover:underline">{expense.id}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6"><div className="flex items-center gap-2"><Tag size={12} className="text-slate-300" /><span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{expense.category}</span></div></td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-500 uppercase">{expense.vendor}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400">{expense.date}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-500">{expense.description}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-black text-slate-900 text-right">₹{parseFloat(expense.amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-center"><span className={`px-2 sm:px-4 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${expense.status === 'APPROVED' ? 'bg-emerald-500 text-white' : expense.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>{expense.status}</span></td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEditExpense(expense)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 sm:p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="px-6 sm:px-8 py-20 text-center text-slate-400 font-bold italic">{isLoading ? 'Fetching data...' : 'No expenses recorded'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[95vh] text-left">
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{editingExpense ? 'Modify Expenditure' : 'Record New Expenditure'}</h2><p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Transaction billing details</p></div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleSaveExpense} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label><select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label><input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label><input type="text" placeholder="e.g. AWS" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Approval Status</label><select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none cursor-pointer" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="APPROVED">APPROVED</option><option value="PENDING">PENDING</option><option value="REJECTED">REJECTED</option></select></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expenditure Amount (INR)</label><div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span><input type="number" placeholder="0.00" className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} /></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose / Description</label><textarea rows="2" placeholder="Reason for this expense..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supporting Document</label><div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center text-center"><input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, document: e.target.files[0]})} accept=".pdf,image/*" /><UploadCloud size={24} className="text-slate-400 mb-2" /><p className="text-xs font-bold text-slate-600 truncate max-w-full px-4">{formData.document ? (formData.document instanceof File ? formData.document.name : 'Document Attached') : 'Click to upload receipt/invoice'}</p></div></div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-white pb-2"><button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button><button type="submit" className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">{editingExpense ? 'Update Record' : 'Record Transaction'}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 p-8 text-center z-[120] my-auto">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={28} /></div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">Delete Record?</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8 italic">This action is permanent and will remove the transaction from audit logs.</p>
            <div className="flex gap-4"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button><button onClick={() => confirmDelete(deleteConfirmId)} className="px-6 py-3.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95">Confirm Delete</button></div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-8 right-8 z-[200] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <span className="text-xs font-black uppercase tracking-widest">{toastMessage}</span>
        </div>
      )}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Expense Ledger" />
    </div>
  );
};

export default Expenses;
