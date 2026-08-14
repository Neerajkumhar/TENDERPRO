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

  const handleDownloadReceipt = (tx) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      // Header Bar styling
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 148, 15, 'F');

      // Title Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TENDERPRO SYSTEMS - PAYMENT RECEIPT', 8, 9.5);

      // Metadata Info
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFontSize(8);
      doc.text(`Receipt ID: ${tx.paymentId || 'N/A'}`, 8, 24);
      doc.text(`Date: ${tx.date || 'N/A'}`, 8, 29);
      doc.text(`Reference Invoice: ${tx.invoiceNumber || 'N/A'}`, 8, 34);

      // Line separator
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.line(8, 39, 140, 39);

      // Amount Table
      autoTable(doc, {
        startY: 44,
        margin: { left: 8, right: 8 },
        head: [['Particulars', 'Payment Method', 'Amount (INR)']],
        body: [
          [
            `Payment against ${tx.invoiceNumber || 'Invoice'}\nClient: ${tx.client || 'N/A'}`,
            tx.method || 'Direct Transfer',
            `Rs. ${parseFloat(tx.amount || 0).toLocaleString('en-IN')}`
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
        styles: { fontSize: 8 },
      });

      doc.save(`Receipt_${tx.paymentId || 'Transaction'}.pdf`);
    } catch (e) {
      console.error(e);
      triggerToast('Error generating receipt');
    }
  };

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
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
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'TX';
    return name.slice(0, 2).toUpperCase();
  };

  const handleRecordPayment = async (e) => {
    if (e) e.preventDefault();
    if (!formData.client || !formData.amount || !formData.invoiceNumber) {
      alert('Please fill in client name, invoice number, and payment amount');
      return;
    }

    const inv = invoices.find(i => i.id === formData.invoiceId);
    if (!inv) {
      alert('Selected invoice not found');
      return;
    }

    const isSameInvoice = editingTransaction && editingTransaction.invoiceId === formData.invoiceId;
    const oldAmount = (isSameInvoice && editingTransaction.status === 'RECEIVED') ? parseFloat(editingTransaction.amount || 0) : 0;
    const maxAllowed = parseFloat(inv.amount_due !== undefined && inv.amount_due !== null ? inv.amount_due : inv.amount) + oldAmount;

    if (parseFloat(formData.amount) > maxAllowed) {
      alert(`Payment amount ₹${parseFloat(formData.amount).toLocaleString('en-IN')} exceeds the invoice amount due of ₹${maxAllowed.toLocaleString('en-IN')}`);
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
        styles: { fontSize: 8 }
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
  const receivedAmountVal = transactions.filter(t => t.status === 'RECEIVED').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const stats = [
    { label: 'TOTAL PAYMENTS', value: String(totalCount), sub: 'ALL TIME RECORDS', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50/80' },
    { label: 'RECEIVED', value: String(receivedCount), sub: `₹${receivedAmountVal.toLocaleString('en-IN')}`, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50/80' },
    { label: 'PENDING', value: String(pendingCount), sub: 'IN-FLIGHT TXNS', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/80' },
    { label: 'RECONCILED', value: `₹${receivedAmountVal.toLocaleString('en-IN')}`, sub: 'SYSTEM SYNCED', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50/80' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-left">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Payments</h1>
          <p className="text-[9px] text-slate-500 font-medium">Transaction management & reconciliation.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            <Plus size={14} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
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
              onClick={() => setShowDateFilterDropdown(!showDateFilterDropdown)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
            >
              <Calendar size={13} className="text-blue-500" />
              <span>{startDateFilter || endDateFilter ? 'Date ON' : 'Date'}</span>
            </button>
            {showDateFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-2">
                  <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" />
                  <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" />
                  <button onClick={() => setShowDateFilterDropdown(false)} className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider">Apply</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowQuickFilterDropdown(!showQuickFilterDropdown)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
            >
              <Filter size={13} className="text-blue-500" />
              <span>Filter: {quickFilter}</span>
            </button>
            {showQuickFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-50 animate-in fade-in slide-in-from-top-1">
                {['ALL', 'RECEIVED', 'PENDING'].map(status => (
                  <button key={status} onClick={() => { setQuickFilter(status); setShowQuickFilterDropdown(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${quickFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
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

      {/* Payment Ledger Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Payment Ledger</h2>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={16} />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <th className="px-3.5 py-2">Payment ID</th>
                <th className="px-3.5 py-2">Client</th>
                <th className="px-3.5 py-2">Invoice No.</th>
                <th className="px-3.5 py-2">Date</th>
                <th className="px-3.5 py-2 text-right">Amount</th>
                <th className="px-3.5 py-2 text-center">Status</th>
                <th className="px-3.5 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <tr key={tx.id || index} onClick={() => setSelectedTransaction(tx)} className="hover:bg-slate-50/70 transition-all cursor-pointer group">
                    <td className="px-3.5 py-2"><span className="text-[10.5px] font-bold text-blue-600 tracking-tight">{tx.paymentId}</span></td>
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200">{getInitials(tx.client)}</div>
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{tx.client}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2 text-[10.5px] font-medium text-slate-500">{tx.invoiceNumber}</td>
                    <td className="px-3.5 py-2 text-[10px] font-medium text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="px-3.5 py-2 text-[11px] font-extrabold text-slate-900 text-right whitespace-nowrap">₹{parseFloat(tx.amount).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2 text-center"><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs ${tx.status === 'RECEIVED' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>{tx.status}</span></td>
                    <td className="px-3.5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                         <button onClick={() => openEditModal(tx)} className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-all" title="Edit"><Edit2 size={13} /></button>
                         <button onClick={() => handleDeletePayment(tx.id)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-xs italic font-medium">{isLoading ? 'Fetching data...' : 'No payments recorded'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setSelectedTransaction(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[90vh] text-left">
            <div className="p-4 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-center mb-4">
                  <div>
                     <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{selectedTransaction.paymentId}</h2>
                     <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Transaction Details</p>
                  </div>
                  <button onClick={() => setSelectedTransaction(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={16} /></button>
               </div>
               
               <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center mb-4">
                 <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Settlement Amount</p>
                 <p className="text-lg font-extrabold text-slate-950">₹{parseFloat(selectedTransaction.amount).toLocaleString('en-IN')}</p>
                 <div className="mt-1.5 flex items-center justify-center gap-1.5">
                   <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${selectedTransaction.status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{selectedTransaction.status}</span>
                   <span className="text-[9px] font-semibold text-slate-500">• {selectedTransaction.method}</span>
                 </div>
               </div>

               <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Customer</span>
                    <span className="text-[11px] font-bold text-slate-700 uppercase">{selectedTransaction.client}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Billing Reference</span>
                    <span className="text-[11px] font-bold text-slate-700">{selectedTransaction.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Payment Date</span>
                    <span className="text-[11px] font-medium text-slate-600">{selectedTransaction.date}</span>
                  </div>
                  {selectedTransaction.notes && (
                    <div className="pt-1">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Internal Notes</span>
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">{selectedTransaction.notes}</p>
                    </div>
                  )}
               </div>

               <div className="flex gap-2 pt-1">
                 <button onClick={() => setSelectedTransaction(null)} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-200 transition-all">Close</button>
                 <button onClick={() => { handleDownloadReceipt(selectedTransaction); setSelectedTransaction(null); }} className="flex-[2] py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-xs flex items-center justify-center gap-1.5"><Download size={13} />Receipt</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Record / Edit Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setIsRecordModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[90vh] text-left">
            <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">{editingTransaction ? 'Edit Payment' : 'Record New Payment'}</h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Billing Transaction Details</p>
                </div>
                <button onClick={() => setIsRecordModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleRecordPayment} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Invoice Reference</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer" 
                    value={formData.invoiceId} 
                    onChange={(e) => {
                      const invId = e.target.value;
                      const inv = invoices.find(i => i.id === invId);
                      setFormData({ ...formData, invoiceId: invId, invoiceNumber: inv?.invoiceNumber || '', client: inv?.client || '', amount: inv ? (inv.amount_due > 0 ? inv.amount_due : inv.amount) : '' });
                    }}
                  >
                    <option value="">Select Invoice</option>
                    {invoices.map(inv => (<option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.client} (Due: ₹{parseFloat(inv.amount_due !== undefined && inv.amount_due !== null ? inv.amount_due : inv.amount).toLocaleString()})</option>))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Client Name</label>
                    <input type="text" className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 opacity-75" value={formData.client} readOnly />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Payment Date</label>
                    <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Payment Method</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer" value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})}>
                      <option value="Credit Card">Credit Card</option><option value="Bank Transfer">Bank Transfer</option><option value="PayPal">PayPal</option><option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Transaction Status</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="RECEIVED">RECEIVED</option><option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input type="number" placeholder="0.00" className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notes</label>
                   <textarea className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none" rows="2" placeholder="Internal payment reference or details..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsRecordModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95">{editingTransaction ? 'Save Changes' : 'Record Transaction'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Payments Report" />
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[250] bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-blue-500 shrink-0" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Payments;
