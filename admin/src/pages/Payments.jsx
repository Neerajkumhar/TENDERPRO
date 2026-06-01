import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportModal from '../components/ExportModal';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Plus, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  User,
  X,
  IndianRupee,
  FileText,
  Clock3,
  CheckCircle,
  Shield,
  Edit2,
  Trash2,
  MoreVertical,
  Loader2
} from 'lucide-react';

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    client: '',
    invoiceId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Credit Card',
    amount: '',
    status: 'RECEIVED',
    notes: ''
  });

  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);

  const [quickFilter, setQuickFilter] = useState('ALL');
  const [showQuickFilterDropdown, setShowQuickFilterDropdown] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      triggerToast('Error loading payments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleRecordPayment = async (e) => {
    if (e) e.preventDefault();
    if (!formData.client || !formData.amount || !formData.invoiceNumber) {
      alert('Please fill in client name, invoice number, and payment amount');
      return;
    }

    try {
      const method = editingTransaction ? 'PUT' : 'POST';
      const url = editingTransaction ? `/api/payments/${editingTransaction.id}` : '/api/payments';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        triggerToast(editingTransaction ? 'Payment updated successfully!' : 'Payment recorded successfully!');
        setIsRecordModalOpen(false);
        setEditingTransaction(null);
        fetchPayments();
        fetchInvoices(); 
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Failed to save payment');
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm(`Are you sure you want to delete this transaction?`)) {
      try {
        const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
        if (res.ok) {
          triggerToast(`Transaction deleted successfully.`);
          fetchPayments();
          fetchInvoices();
          setSelectedTransaction(null);
        }
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setFormData({
      client: tx.client,
      invoiceId: tx.invoiceId,
      invoiceNumber: tx.invoiceNumber,
      date: tx.date,
      method: tx.method,
      amount: tx.amount,
      status: tx.status,
      notes: tx.notes || ''
    });
    setIsRecordModalOpen(true);
    setSelectedTransaction(null);
  };

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const exportData = filteredTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });

    if (exportData.length === 0) {
      triggerToast('No transactions matched the selected time period.');
      return;
    }

    const filename = `Payments_Export_${startDate}_to_${endDate}`;

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["ID", "Client", "Invoice", "Date", "Amount", "Status"]],
        body: exportData.map(tx => [tx.paymentId, tx.client, tx.invoiceNumber, tx.date, tx.amount, tx.status]),
      });
      doc.save(`${filename}.pdf`);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (tx.paymentId || '').toLowerCase().includes(query) ||
      (tx.client || '').toLowerCase().includes(query) ||
      (tx.invoiceNumber || '').toLowerCase().includes(query) ||
      (tx.method || '').toLowerCase().includes(query) ||
      (tx.status || '').toLowerCase().includes(query)
    );
    const matchesQuick = quickFilter === 'ALL' || tx.status === quickFilter;
    let matchesDate = true;
    if (startDateFilter) matchesDate = matchesDate && (new Date(tx.date) >= new Date(startDateFilter));
    if (endDateFilter) matchesDate = matchesDate && (new Date(tx.date) <= new Date(endDateFilter));
    return matchesSearch && matchesQuick && matchesDate;
  });

  const totalCount = transactions.length;
  const receivedCount = transactions.filter(t => t.status === 'RECEIVED').length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const receivedAmountVal = transactions.filter(t => t.status === 'RECEIVED').reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const stats = [
    { label: 'TOTAL PAYMENTS', value: String(totalCount), sub: 'ALL TIME RECORDS', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'RECEIVED', value: String(receivedCount), sub: `₹${receivedAmountVal.toLocaleString('en-IN')}`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'PENDING', value: String(pendingCount), sub: 'IN-FLIGHT TXNS', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'RECONCILED', value: `₹${receivedAmountVal.toLocaleString('en-IN')}`, sub: 'SYSTEM SYNCED', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">PAYMENTS</h1>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1">TRANSACTION MANAGEMENT & RECONCILIATION</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setEditingTransaction(null);
              setFormData({
                client: '',
                invoiceId: '',
                invoiceNumber: '',
                date: new Date().toISOString().split('T')[0],
                method: 'Credit Card',
                amount: '',
                status: 'RECEIVED',
                notes: ''
              });
              setIsRecordModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 sm:mb-10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} className="text-blue-500" />
            <span>Export</span>
          </button>
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowDateFilterDropdown(!showDateFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Calendar size={18} className="text-blue-500" />
              <span>{startDateFilter || endDateFilter ? 'Date ON' : 'Date Filter'}</span>
            </button>
            {showDateFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3">
                  <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                  <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                  <button onClick={() => setShowDateFilterDropdown(false)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Apply</button>
                </div>
              </div>
            )}
          </div>
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowQuickFilterDropdown(!showQuickFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Filter size={18} className="text-blue-500" />
              <span>Quick: {quickFilter}</span>
            </button>
            {showQuickFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {['ALL', 'RECEIVED', 'PENDING'].map(status => (
                  <button key={status} onClick={() => { setQuickFilter(status); setShowQuickFilterDropdown(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${quickFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 flex flex-col items-start group hover:shadow-xl transition-all duration-300">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mb-4 transition-transform group-hover:scale-110`}>
              <stat.icon size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-1">{stat.sub}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight italic uppercase">Payment Ledger</h2>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={20} />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 sm:px-10 py-5">Payment ID</th>
                <th className="px-6 sm:px-10 py-5">Client</th>
                <th className="px-6 sm:px-10 py-5">Invoice No.</th>
                <th className="px-6 sm:px-10 py-5">Date</th>
                <th className="px-6 sm:px-10 py-5 text-right">Amount</th>
                <th className="px-6 sm:px-10 py-5 text-center">Status</th>
                <th className="px-6 sm:px-10 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <tr key={tx.id || index} onClick={() => setSelectedTransaction(tx)} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <td className="px-6 sm:px-10 py-6"><span className="text-xs font-black text-blue-600 tracking-tight">{tx.paymentId}</span></td>
                    <td className="px-6 sm:px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-50">{getInitials(tx.client)}</div>
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{tx.client}</span>
                      </div>
                    </td>
                    <td className="px-6 sm:px-10 py-6 text-sm font-bold text-slate-400">{tx.invoiceNumber}</td>
                    <td className="px-6 sm:px-10 py-6 text-sm font-bold text-slate-500">{tx.date}</td>
                    <td className="px-6 sm:px-10 py-6 text-sm font-black text-slate-900 text-right">₹{parseFloat(tx.amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 sm:px-10 py-6 text-center"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tx.status === 'RECEIVED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{tx.status}</span></td>
                    <td className="px-6 sm:px-10 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                         <button onClick={() => openEditModal(tx)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Edit2 size={16} /></button>
                         <button onClick={() => handleDeletePayment(tx.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 sm:px-10 py-20 text-center text-slate-400 font-bold italic">{isLoading ? 'Fetching data...' : 'No payments recorded'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransaction && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 p-6">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedTransaction(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[95vh] text-left">
            <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-3xl ${selectedTransaction.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} shadow-inner`}>
                       <IndianRupee size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{selectedTransaction.paymentId}</h2>
                       <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Transaction audit trail</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTransaction(null)} className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-all"><X size={28} /></button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Profile</label><div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100/50"><div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xs font-black text-slate-400 shadow-sm border border-slate-100 uppercase">{getInitials(selectedTransaction.client)}</div><div className="min-w-0"><p className="text-sm font-black text-slate-800 uppercase truncate">{selectedTransaction.client}</p></div></div></div>
                     <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Billing Reference</label><div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100/50"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileText size={20} /></div><div><p className="text-sm font-black text-slate-800">{selectedTransaction.invoiceNumber}</p></div></div></div>
                  </div>
                  <div className="space-y-8">
                     <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-left"><label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-4">Settlement Amount</label><div className="flex items-baseline gap-1"><span className="text-white font-black text-4xl tracking-tighter italic">₹{parseFloat(selectedTransaction.amount).toLocaleString('en-IN')}</span></div><div className="mt-6 flex items-center gap-3"><div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg ${selectedTransaction.status === 'RECEIVED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{selectedTransaction.status}</div><span className="text-[10px] text-slate-400 font-bold italic">{selectedTransaction.method}</span></div></div>
                  </div>
               </div>
               {selectedTransaction.notes && <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Internal Notes</label><p className="text-xs font-bold text-slate-600 italic">{selectedTransaction.notes}</p></div>}
               <div className="mt-12 flex gap-4"><button onClick={() => setSelectedTransaction(null)} className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-3xl text-xs font-black uppercase tracking-widest border border-slate-100 active:scale-95 transition-all">Close</button><button onClick={() => { triggerToast("Receipt Downloaded!"); setSelectedTransaction(null); }} className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"><Download size={18} />Download Receipt</button></div>
            </div>
          </div>
        </div>
      )}

      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsRecordModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[95vh] text-left">
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{editingTransaction ? 'Edit Payment' : 'Record New Payment'}</h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Transaction billing details</p>
                </div>
                <button onClick={() => setIsRecordModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleRecordPayment} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Reference</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer" value={formData.invoiceId} onChange={(e) => {
                        const invId = e.target.value;
                        const inv = invoices.find(i => i.id === invId);
                        setFormData({ ...formData, invoiceId: invId, invoiceNumber: inv?.invoiceNumber || '', client: inv?.client || '', amount: inv ? (inv.amount_due > 0 ? inv.amount_due : inv.amount) : '' });
                      }}>
                      <option value="">Select Invoice</option>
                      {invoices.map(inv => (<option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.client} (Due: ₹{parseFloat(inv.amount_due || inv.amount).toLocaleString()})</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                    <input type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold opacity-70" value={formData.client} readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                    <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none" value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})}>
                      <option value="Credit Card">Credit Card</option><option value="Bank Transfer">Bank Transfer</option><option value="PayPal">PayPal</option><option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (INR)</label>
                    <div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span><input type="number" placeholder="0.00" className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Status</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="RECEIVED">RECEIVED</option><option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                   <textarea className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold resize-none" rows="2" placeholder="Internal payment reference or details..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={() => setIsRecordModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">{editingTransaction ? 'Save Changes' : 'Record Transaction'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Payments Report" />
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[250] bg-slate-900/90 text-white backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <span className="text-xs font-black uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Payments;
