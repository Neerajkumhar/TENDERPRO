import React, { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';

const mockTransactions = [];
const mockAlerts = [];

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    invoice: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Credit Card',
    amount: '',
    status: 'RECEIVED'
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('tender_payments');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter out the old mock data IDs so only user-created payments remain
      return parsed.filter(t => !['PMT-2024-001', 'PMT-2024-002', 'PMT-2024-003', 'PMT-2024-004'].includes(t.id));
    }
    return mockTransactions;
  });

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);

  const [quickFilter, setQuickFilter] = useState('ALL');
  const [showQuickFilterDropdown, setShowQuickFilterDropdown] = useState(false);

  // Premium Toast UX state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
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
    fetchInvoices();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const updateTransactions = (newTx) => {
    setTransactions(newTx);
    localStorage.setItem('tender_payments', JSON.stringify(newTx));
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleRecordPayment = (e) => {
    if (e) e.preventDefault();
    if (!formData.client || !formData.amount || !formData.invoice) {
      alert('Please fill in client name, invoice number, and payment amount');
      return;
    }

    const count = transactions.length + 1;
    const paddedCount = String(count).padStart(3, '0');
    const newId = `PMT-2024-${paddedCount}`;

    const dateObj = new Date(formData.date);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

    const newTx = {
      id: newId,
      client: formData.client,
      initials: getInitials(formData.client),
      invoice: formData.invoice.startsWith('#') ? formData.invoice : `#${formData.invoice}`,
      date: formattedDate,
      method: formData.method,
      amount: parseFloat(formData.amount) || 0,
      status: formData.status
    };

    updateTransactions([newTx, ...transactions]);
    triggerToast(`Payment ${newId} recorded successfully!`);

    setFormData({
      client: '',
      invoice: '',
      date: new Date().toISOString().split('T')[0],
      method: 'Credit Card',
      amount: '',
      status: 'RECEIVED'
    });
    setIsRecordModalOpen(false);
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      triggerToast('No transactions to export');
      return;
    }

    const headers = ['Payment ID', 'Client', 'Invoice No.', 'Date', 'Method', 'Amount', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.client,
      tx.invoice,
      tx.date,
      tx.method,
      tx.amount.toFixed(2),
      tx.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('CSV export downloaded successfully!');
  };

  // Filter transactions based on search query, date filter, and quick filter status
  const filteredTransactions = transactions.filter(tx => {
    // 1. Search filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      tx.id.toLowerCase().includes(query) ||
      tx.client.toLowerCase().includes(query) ||
      tx.invoice.toLowerCase().includes(query) ||
      tx.method.toLowerCase().includes(query) ||
      tx.status.toLowerCase().includes(query)
    );

    // 2. Quick filter (status)
    const matchesQuick = quickFilter === 'ALL' || tx.status === quickFilter;

    // 3. Date filters
    let matchesDate = true;
    if (startDateFilter) {
      matchesDate = matchesDate && (new Date(tx.date) >= new Date(startDateFilter));
    }
    if (endDateFilter) {
      matchesDate = matchesDate && (new Date(tx.date) <= new Date(endDateFilter));
    }

    return matchesSearch && matchesQuick && matchesDate;
  });

  const totalCount = transactions.length;
  const receivedCount = transactions.filter(t => t.status === 'RECEIVED').length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const overdueCount = mockAlerts.length;
  const receivedAmountVal = transactions.filter(t => t.status === 'RECEIVED').reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'TOTAL PAYMENTS', value: String(totalCount), sub: '+12% FROM LAST MONTH', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'RECEIVED', value: String(receivedCount), sub: `$${receivedAmountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TOTAL`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'PENDING', value: String(pendingCount), sub: `${pendingCount} REQUIRING ACTION`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'OVERDUE', value: String(overdueCount), sub: 'CRITICAL ATTENTION', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'FAILED', value: '0', sub: 'ALL CLEAR', icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'RECONCILED', value: `$${receivedAmountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: '98% ACCURACY', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen">
      {/* Header - Matching Reference Image */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">PAYMENTS</h1>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1">TRANSACTION MANAGEMENT & RECONCILIATION</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsRecordModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Search & Main Filters - Matching Reference Image */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sm:mb-10">
        <div className="relative flex-1">
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
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => {
                setShowDateFilterDropdown(!showDateFilterDropdown);
                setShowQuickFilterDropdown(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Calendar size={18} className="text-blue-500" />
              <span>{startDateFilter || endDateFilter ? 'Date Active' : 'Date Filter'}</span>
            </button>

            {showDateFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Filter by Date</h4>
                  {(startDateFilter || endDateFilter) && (
                    <button 
                      onClick={() => {
                        setStartDateFilter('');
                        setEndDateFilter('');
                      }}
                      className="text-[8px] font-black text-rose-500 hover:underline uppercase tracking-widest"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setShowDateFilterDropdown(false)}
                    className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => {
                setShowQuickFilterDropdown(!showQuickFilterDropdown);
                setShowDateFilterDropdown(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Filter size={18} className="text-blue-500" />
              <span>Quick: {quickFilter}</span>
            </button>

            {showQuickFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {['ALL', 'RECEIVED', 'PENDING'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setQuickFilter(status);
                      setShowQuickFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      quickFilter === status 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Grid - Matching Reference Image */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-start group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} mb-4 sm:mb-6 transition-transform group-hover:scale-110`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 sm:mb-2">{stat.value}</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">{stat.sub}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">
        {/* Main Table Section - Matching Reference Image */}
        <div className="flex-1 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight italic uppercase">Payment Transactions</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                    <User size={12} className="text-slate-300 sm:w-[14px] sm:h-[14px]" />
                  </div>
                ))}
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">+12 Active Users</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="px-6 sm:px-10 py-5 sm:py-6">Payment ID</th>
                  <th className="px-6 sm:px-10 py-5 sm:py-6">Client</th>
                  <th className="px-6 sm:px-10 py-5 sm:py-6">Invoice No.</th>
                  <th className="px-6 sm:px-10 py-5 sm:py-6">Date</th>
                  <th className="px-6 sm:px-10 py-5 sm:py-6">Method</th>
                  <th className="px-6 sm:px-10 py-5 sm:py-6 text-right">Amount</th>
                  <th className="px-6 sm:px-10 py-5 sm:py-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => (
                    <tr key={tx.id || index} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <td className="px-6 sm:px-10 py-6 sm:py-8">
                        <span className="text-xs sm:text-sm font-black text-blue-600 tracking-tight">{tx.id}</span>
                      </td>
                      <td className="px-6 sm:px-10 py-6 sm:py-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-slate-400 border border-slate-50">
                            {tx.initials}
                          </div>
                          <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{tx.client}</span>
                        </div>
                      </td>
                      <td className="px-6 sm:px-10 py-6 sm:py-8 text-xs sm:text-sm font-bold text-slate-400">{tx.invoice}</td>
                      <td className="px-6 sm:px-10 py-6 sm:py-8 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-tighter leading-tight whitespace-pre-line">
                        {tx.date.split(',').join('\n')}
                      </td>
                      <td className="px-6 sm:px-10 py-6 sm:py-8 text-xs sm:text-sm font-bold text-slate-500">{tx.method}</td>
                      <td className="px-6 sm:px-10 py-6 sm:py-8 text-xs sm:text-sm font-black text-slate-900 text-right">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 sm:px-10 py-6 sm:py-8 text-center">
                        <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest
                          ${tx.status === 'RECEIVED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 sm:px-10 py-10 text-center text-slate-400 text-xs sm:text-sm font-bold italic">
                      No payments matching criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Alerts - Matching Reference Image */}
        <div className="w-full xl:w-96 space-y-6">
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest italic">Overdue Alerts</h3>
              <AlertCircle size={18} className="text-rose-500" />
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              {mockAlerts.map((alert, index) => (
                <div key={index} className="flex justify-between items-start group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-tight">{alert.client}</span>
                      {alert.days && <span className="text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-widest italic">({alert.days})</span>}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block mt-1">{alert.invoice}</span>
                  </div>
                  <button className="text-slate-200 hover:text-blue-500 transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
              {mockAlerts.length === 0 && (
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 italic">No overdue alerts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsRecordModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-2xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Record New Payment</h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Setup transaction billing details</p>
                </div>
                <button 
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Acme Corp."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Number</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                      value={formData.invoice}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const selectedInv = invoices.find(inv => inv.invoiceNumber === selectedVal || inv.id === selectedVal);
                        
                        setFormData({
                          ...formData, 
                          invoice: selectedVal,
                          ...(selectedInv ? { 
                            client: selectedInv.client || formData.client, 
                            amount: selectedInv.amount_due || selectedInv.amount || formData.amount 
                          } : {})
                        });
                      }}
                    >
                      <option value="">Select Invoice</option>
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.invoiceNumber || inv.id}>
                          {inv.invoiceNumber || inv.id} - {inv.client}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
                      value={formData.method}
                      onChange={(e) => setFormData({...formData, method: e.target.value})}
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (USD)</label>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Status</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleRecordPayment}
                    className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    Record Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification Banner */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900/90 text-white backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <span className="text-xs font-black uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Payments;
