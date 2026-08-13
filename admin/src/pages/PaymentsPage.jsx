import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee, 
  Download, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Copy, 
  Calendar, 
  Building2, 
  X, 
  Mail, 
  User, 
  Phone, 
  Receipt,
  FileSpreadsheet,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Grid,
  List,
  Power,
  Trash2,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialPaymentsList = [
  {
    id: 1,
    txnId: 'TXN_98234710',
    refId: 'PAY_8829104',
    organization: 'BuildTech Pvt. Ltd.',
    logoBg: 'bg-blue-600 text-white',
    logoText: 'B',
    subscriber: 'John Doe',
    email: 'john.doe@buildtech.com',
    plan: 'Business Plan',
    amount: '₹34,999',
    rawAmount: 34999,
    status: 'Success',
    paymentMethod: 'VISA Credit Card',
    methodSub: '•••• 4242',
    date: '20 Jun 2025',
    time: '10:30 AM',
    invoiceNo: 'INV-2025-0841',
    gateway: 'Razorpay'
  },
  {
    id: 2,
    txnId: 'TXN_98234711',
    refId: 'PAY_8829105',
    organization: 'Raj Construction',
    logoBg: 'bg-purple-600 text-white',
    logoText: 'R',
    subscriber: 'Priya Sharma',
    email: 'priya.sharma@rajconstruction.in',
    plan: 'Professional Plan',
    amount: '₹69,999',
    rawAmount: 69999,
    status: 'Success',
    paymentMethod: 'UPI AutoPay',
    methodSub: 'rajconst@okaxis',
    date: '19 Jun 2025',
    time: '04:15 PM',
    invoiceNo: 'INV-2025-0840',
    gateway: 'Razorpay'
  },
  {
    id: 3,
    txnId: 'TXN_98234712',
    refId: 'PAY_8829106',
    organization: 'Green Infra',
    logoBg: 'bg-emerald-600 text-white',
    logoText: 'G',
    subscriber: 'Michael Johnson',
    email: 'michael.j@greeninfra.com',
    plan: 'Business Plan',
    amount: '₹34,999',
    rawAmount: 34999,
    status: 'Success',
    paymentMethod: 'Mastercard',
    methodSub: '•••• 8821',
    date: '18 Jun 2025',
    time: '11:20 AM',
    invoiceNo: 'INV-2025-0839',
    gateway: 'Stripe'
  },
  {
    id: 4,
    txnId: 'TXN_98234713',
    refId: 'PAY_8829107',
    organization: 'Infra Projects',
    logoBg: 'bg-amber-600 text-white',
    logoText: 'I',
    subscriber: 'Amit Patel',
    email: 'amit.patel@infraprojects.com',
    plan: 'Enterprise Plan',
    amount: '₹17,99,988',
    rawAmount: 1799988,
    status: 'Success',
    paymentMethod: 'Net Banking',
    methodSub: 'HDFC Corporate',
    date: '17 Jun 2025',
    time: '09:45 AM',
    invoiceNo: 'INV-2025-0838',
    gateway: 'Razorpay'
  },
  {
    id: 5,
    txnId: 'TXN_98234714',
    refId: 'PAY_8829108',
    organization: 'TechBuild Solutions',
    logoBg: 'bg-cyan-600 text-white',
    logoText: 'T',
    subscriber: 'Sneha Iyer',
    email: 'sneha.iyer@techbuild.com',
    plan: 'Starter Plan',
    amount: '₹14,999',
    rawAmount: 14999,
    status: 'Pending',
    paymentMethod: 'UPI Direct',
    methodSub: 'sneha@upi',
    date: '16 Jun 2025',
    time: '02:30 PM',
    invoiceNo: 'INV-2025-0837',
    gateway: 'Razorpay'
  },
  {
    id: 6,
    txnId: 'TXN_98234715',
    refId: 'PAY_8829109',
    organization: 'Urban Developers',
    logoBg: 'bg-indigo-600 text-white',
    logoText: 'U',
    subscriber: 'David Wilson',
    email: 'david.wilson@urbandev.com',
    plan: 'Enterprise Plan',
    amount: '₹17,99,988',
    rawAmount: 1799988,
    status: 'Success',
    paymentMethod: 'VISA Business',
    methodSub: '•••• 9012',
    date: '15 Jun 2025',
    time: '05:10 PM',
    invoiceNo: 'INV-2025-0836',
    gateway: 'Stripe'
  },
  {
    id: 7,
    txnId: 'TXN_98234716',
    refId: 'PAY_8829110',
    organization: 'Apex Contracts',
    logoBg: 'bg-rose-600 text-white',
    logoText: 'A',
    subscriber: 'Neha Verma',
    email: 'neha.verma@futurecon.com',
    plan: 'Professional Plan',
    amount: '₹69,999',
    rawAmount: 69999,
    status: 'Failed',
    paymentMethod: 'Mastercard',
    methodSub: 'Insufficient Funds',
    date: '14 Jun 2025',
    time: '08:25 AM',
    invoiceNo: 'INV-2025-0835',
    gateway: 'Razorpay'
  }
];

const PaymentsPage = () => {
  const [paymentsList, setPaymentsList] = useState(initialPaymentsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('All Organizations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [methodFilter, setMethodFilter] = useState('All Payment Methods');
  const [amountRangeFilter, setAmountRangeFilter] = useState('All Amounts');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Selection & Sorting
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Form State for Record Payment Modal
  const [formData, setFormData] = useState({
    organization: '',
    subscriber: '',
    email: '',
    plan: 'Business Plan',
    amount: '',
    paymentMethod: 'VISA Credit Card',
    status: 'Success',
    gateway: 'Razorpay',
    invoiceNo: ''
  });

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Dynamic KPI Calculations
  const stats = useMemo(() => {
    const totalCount = paymentsList.length;
    const successCount = paymentsList.filter(p => p.status === 'Success').length;
    const pendingCount = paymentsList.filter(p => p.status === 'Pending').length;
    const failedCount = paymentsList.filter(p => p.status === 'Failed').length;
    const totalAmountVal = paymentsList
      .filter(p => p.status === 'Success')
      .reduce((sum, p) => sum + (p.rawAmount || 0), 0);

    const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

    return {
      totalCount,
      successCount,
      pendingCount,
      failedCount,
      totalAmountFormatted: formatCurrency(totalAmountVal)
    };
  }, [paymentsList]);

  // Copy to clipboard helper
  const copyToClipboard = (text, label = 'Text') => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} (${text}) to clipboard!`, 'info');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setOrgFilter('All Organizations');
    setStatusFilter('All Status');
    setMethodFilter('All Payment Methods');
    setAmountRangeFilter('All Amounts');
    setSortColumn(null);
    setCurrentPage(1);
    triggerToast('Payment search filters reset to default', 'info');
  };

  // Record New Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!formData.organization.trim() || !formData.amount) return;

    const rawAmt = parseInt(formData.amount.toString().replace(/[^0-9]/g, '')) || 0;
    const formattedAmt = `₹${rawAmt.toLocaleString('en-IN')}`;
    const newTxnId = `TXN_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newRefId = `PAY_${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newInvNo = formData.invoiceNo ? formData.invoiceNo.trim() : `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      id: Date.now(),
      txnId: newTxnId,
      refId: newRefId,
      organization: formData.organization.trim(),
      logoBg: 'bg-blue-600 text-white',
      logoText: formData.organization.trim().charAt(0).toUpperCase(),
      subscriber: formData.subscriber.trim() || 'Admin User',
      email: formData.email.trim() || 'billing@company.com',
      plan: formData.plan,
      amount: formattedAmt,
      rawAmount: rawAmt,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      methodSub: 'Manual Record',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      invoiceNo: newInvNo,
      gateway: formData.gateway || 'Manual Wire'
    };

    setPaymentsList([newPayment, ...paymentsList]);
    setShowRecordModal(false);
    triggerToast(`Payment of ${formattedAmt} recorded for ${newPayment.organization}`, 'success');
  };

  // Toggle Payment Status
  const handleToggleStatus = (txn) => {
    const nextStatus = txn.status === 'Success' ? 'Pending' : txn.status === 'Pending' ? 'Failed' : 'Success';
    setPaymentsList(paymentsList.map(p => p.id === txn.id ? { ...p, status: nextStatus } : p));
    setActiveDropdownId(null);
    triggerToast(`Transaction ${txn.txnId} status updated to ${nextStatus}`, 'info');
  };

  // Delete Payment Record
  const handleDeletePaymentConfirm = () => {
    if (!selectedTxn) return;
    setPaymentsList(paymentsList.filter(p => p.id !== selectedTxn.id));
    setShowDeleteModal(false);
    setSelectedTxn(null);
    setActiveDropdownId(null);
    triggerToast('Payment record removed', 'warning');
  };

  // Download PDF Receipt
  const handleDownloadReceiptPDF = (txn) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

      // Header Bar styling
      doc.setFillColor(30, 86, 240); // blue-600
      doc.rect(0, 0, 148, 16, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TENDERPRO SUPER ADMIN - PAYMENT RECEIPT', 8, 10.5);

      // Metadata Info
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.text(`Transaction ID: ${txn.txnId}`, 8, 24);
      doc.text(`Reference ID: ${txn.refId}`, 8, 29);
      doc.text(`Invoice No: ${txn.invoiceNo}`, 8, 34);
      doc.text(`Date & Time: ${txn.date} at ${txn.time}`, 8, 39);

      doc.setDrawColor(226, 232, 240);
      doc.line(8, 44, 140, 44);

      // Organization Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('ORGANIZATION & SUBSCRIBER:', 8, 52);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Organization: ${txn.organization}`, 8, 58);
      doc.text(`Subscriber: ${txn.subscriber} (${txn.email})`, 8, 63);
      doc.text(`Plan Tier: ${txn.plan}`, 8, 68);

      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS:', 8, 78);

      doc.setFont('helvetica', 'normal');
      doc.text(`Method: ${txn.paymentMethod}`, 8, 84);
      doc.text(`Gateway: ${txn.gateway}`, 8, 89);
      doc.text(`Status: ${txn.status}`, 8, 94);

      doc.setDrawColor(226, 232, 240);
      doc.line(8, 100, 140, 100);

      // Total Box
      doc.setFillColor(241, 245, 249);
      doc.rect(8, 105, 132, 14, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('TOTAL AMOUNT PAID:', 12, 114);
      doc.setTextColor(30, 86, 240);
      doc.text(txn.amount, 95, 114);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('This is an official system receipt generated by TenderPro Super Admin Panel.', 8, 134);

      doc.save(`Payment_Receipt_${txn.txnId}.pdf`);
      triggerToast(`Downloaded Receipt PDF for ${txn.txnId}`, 'success');
    } catch (err) {
      console.error('Error generating PDF receipt:', err);
      triggerToast('Downloaded text summary receipt', 'info');
    }
  };

  // Bulk Operations
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredPayments.map(p => p.id));
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

  const handleBulkMarkSuccess = () => {
    setPaymentsList(paymentsList.map(p => selectedRowIds.includes(p.id) ? { ...p, status: 'Success' } : p));
    setSelectedRowIds([]);
    triggerToast(`Marked ${selectedRowIds.length} transactions as Success`, 'success');
  };

  const handleBulkDelete = () => {
    setPaymentsList(paymentsList.filter(p => !selectedRowIds.includes(p.id)));
    setSelectedRowIds([]);
    triggerToast(`Deleted ${selectedRowIds.length} payment records`, 'warning');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Txn ID', 'Ref ID', 'Organization', 'Subscriber', 'Email', 'Plan', 'Amount', 'Status', 'Payment Method', 'Gateway', 'Invoice No', 'Date', 'Time'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.txnId,
      p.refId,
      `"${p.organization}"`,
      `"${p.subscriber}"`,
      p.email,
      `"${p.plan}"`,
      `"${p.amount}"`,
      p.status,
      `"${p.paymentMethod}"`,
      p.gateway,
      p.invoiceNo,
      p.date,
      p.time
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payment_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    triggerToast('Exported payments list to CSV!', 'success');
  };

  // Export PDF Table Report
  const handleExportPDFReport = () => {
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Txn ID', 'Organization', 'Plan', 'Amount', 'Status', 'Method', 'Date']],
        body: filteredPayments.map(p => [
          p.txnId,
          p.organization,
          p.plan,
          p.amount,
          p.status,
          p.paymentMethod,
          p.date
        ])
      });
      doc.save(`Payments_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setShowExportModal(false);
      triggerToast('Exported Financial Audit Report (PDF)', 'success');
    } catch (err) {
      console.error(err);
      handleExportCSV();
    }
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
  const filteredPayments = useMemo(() => {
    return paymentsList.filter(p => {
      const matchesSearch = 
        p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subscriber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesOrg = orgFilter === 'All Organizations' || p.organization === orgFilter;
      const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
      const matchesMethod = methodFilter === 'All Payment Methods' || p.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());
      
      let matchesAmount = true;
      if (amountRangeFilter === 'Under ₹50,000') matchesAmount = p.rawAmount < 50000;
      else if (amountRangeFilter === '₹50,000 - ₹2,00,000') matchesAmount = p.rawAmount >= 50000 && p.rawAmount <= 200000;
      else if (amountRangeFilter === 'Above ₹2,00,000') matchesAmount = p.rawAmount > 200000;

      return matchesSearch && matchesOrg && matchesStatus && matchesMethod && matchesAmount;
    }).sort((a, b) => {
      if (!sortColumn) return 0;
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'amount') {
        valA = a.rawAmount;
        valB = b.rawAmount;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [paymentsList, searchQuery, orgFilter, statusFilter, methodFilter, amountRangeFilter, sortColumn, sortDirection]);

  // Paginated List
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'warning' ? 'bg-rose-900 text-rose-100 border-rose-700' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <XCircle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <CreditCard size={16} className="text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="text-blue-600 shrink-0" size={24} />
            Payment Transactions & Logs
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Track incoming payments, audit gateway settlements, and manage organization billing transactions.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            title="Export payment logs"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Transactions</span>
          </button>

          <button 
            onClick={() => {
              setFormData({
                organization: '',
                subscriber: '',
                email: '',
                plan: 'Business Plan',
                amount: '',
                paymentMethod: 'VISA Credit Card',
                status: 'Success',
                gateway: 'Razorpay',
                invoiceNo: ''
              });
              setShowRecordModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Dynamic KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Payments */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CreditCard size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {stats.totalCount} Txns
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Payments</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalCount}</h3>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Total logged transactions</p>
        </div>

        {/* Card 2: Successful Payments */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
              {Math.round((stats.successCount / (stats.totalCount || 1)) * 100)}% Rate
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Successful</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.successCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span>Settled transactions</span>
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
              In-Flight
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.pendingCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <span>Awaiting confirmation</span>
          </div>
        </div>

        {/* Card 4: Failed Payments */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <XCircle size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full">
              Declined
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failed / Declined</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.failedCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <span>Requires retry</span>
          </div>
        </div>

        {/* Card 5: Total Revenue Volume */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IndianRupee size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
              Settled Volume
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Volume</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalAmountFormatted}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 18.7%</span>
            <span className="text-slate-400 font-normal">reconciled revenue</span>
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
              placeholder="Search by organization, Txn ID, subscriber, or invoice..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Right: Dropdowns & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Organization Filter */}
            <select 
              value={orgFilter}
              onChange={(e) => { setOrgFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition max-w-[160px] truncate"
            >
              <option value="All Organizations">All Organizations</option>
              <option value="BuildTech Pvt. Ltd.">BuildTech Pvt. Ltd.</option>
              <option value="Raj Construction">Raj Construction</option>
              <option value="Green Infra">Green Infra</option>
              <option value="Infra Projects">Infra Projects</option>
              <option value="TechBuild Solutions">TechBuild Solutions</option>
              <option value="Urban Developers">Urban Developers</option>
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Status">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Payment Methods Filter */}
            <select 
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Payment Methods">All Methods</option>
              <option value="VISA">VISA</option>
              <option value="Mastercard">Mastercard</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
            </select>

            {/* Expandable Advanced Filters Button */}
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition cursor-pointer ${
                showAdvancedFilters || amountRangeFilter !== 'All Amounts'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {amountRangeFilter !== 'All Amounts' && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            {/* Reset button */}
            <button 
              onClick={handleResetFilters}
              title="Reset payment filters"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* View Mode Switcher */}
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
                Filter By Amount Range
              </label>
              <select
                value={amountRangeFilter}
                onChange={(e) => { setAmountRangeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="All Amounts">All Transaction Amounts</option>
                <option value="Under ₹50,000">Under ₹50,000</option>
                <option value="₹50,000 - ₹2,00,000">₹50,000 to ₹2,00,000</option>
                <option value="Above ₹2,00,000">Above ₹2,00,000</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Filter Results
              </label>
              <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-600 font-bold flex items-center justify-between">
                <span>Showing {filteredPayments.length} of {paymentsList.length} txns</span>
                {filteredPayments.length < paymentsList.length && (
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
            <span>Bulk actions for selected transaction logs:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkMarkSuccess}
              className="px-3 py-1.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition cursor-pointer"
            >
              Mark as Success
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
            >
              Delete Records
            </button>
          </div>
        </div>
      )}

      {/* Main Content View: Table Mode OR Cards Mode */}
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
                      checked={selectedRowIds.length === filteredPayments.length && filteredPayments.length > 0}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                  </th>

                  {/* Transaction ID Column */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('txnId')}>
                    <div className="flex items-center gap-1">
                      <span>Transaction ID</span>
                      {sortColumn === 'txnId' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Organization Column */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('organization')}>
                    <div className="flex items-center gap-1">
                      <span>Organization</span>
                      {sortColumn === 'organization' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Plan */}
                  <th className="py-2.5 px-3.5">Plan</th>

                  {/* Amount Column */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('amount')}>
                    <div className="flex items-center gap-1">
                      <span>Amount</span>
                      {sortColumn === 'amount' ? (
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

                  {/* Payment Method */}
                  <th className="py-2.5 px-3.5">Payment Method</th>

                  {/* Date & Time */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      <span>Date & Time</span>
                      {sortColumn === 'date' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Actions */}
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CreditCard size={32} className="text-slate-300" />
                        <p className="font-bold text-slate-600 text-sm">No payment records found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search query or filter settings.</p>
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
                  paginatedPayments.map(txn => {
                    const isSelected = selectedRowIds.includes(txn.id);

                    return (
                      <tr key={txn.id} className={`hover:bg-slate-50/80 transition relative ${isSelected ? 'bg-blue-50/30' : ''}`}>
                        
                        {/* Checkbox */}
                        <td className="py-3 px-3.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleRowSelect(txn.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                        </td>

                        {/* Transaction ID & Ref */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 font-mono">{txn.txnId}</span>
                            <button 
                              onClick={() => copyToClipboard(txn.txnId, 'Transaction ID')}
                              title="Copy Transaction ID"
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">{txn.refId}</p>
                        </td>

                        {/* Organization & Subscriber */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg ${txn.logoBg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                              {txn.logoText}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{txn.organization}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{txn.subscriber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3 px-3.5 font-bold text-slate-800">
                          {txn.plan}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3.5 font-extrabold text-slate-900">
                          {txn.amount}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3.5">
                          <button
                            onClick={() => handleToggleStatus(txn)}
                            title="Click to toggle status"
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                              txn.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                              txn.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                              'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              txn.status === 'Success' ? 'bg-emerald-500' :
                              txn.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}></div>
                            <span>{txn.status}</span>
                          </button>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-3.5">
                          <p className="font-bold text-slate-800">{txn.paymentMethod}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{txn.methodSub}</p>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-3.5">
                          <p className="font-bold text-slate-800">{txn.date}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{txn.time}</p>
                        </td>

                        {/* Row Actions */}
                        <td className="py-3 px-3.5 text-center relative">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* View Action */}
                            <button 
                              onClick={() => { setSelectedTxn(txn); setShowViewModal(true); }}
                              title="View Payment Details"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Download Receipt Action */}
                            <button 
                              onClick={() => handleDownloadReceiptPDF(txn)}
                              title="Download PDF Receipt"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                              <Receipt size={15} />
                            </button>

                            {/* More Options Dropdown Trigger */}
                            <div className="relative">
                              <button 
                                onClick={() => setActiveDropdownId(activeDropdownId === txn.id ? null : txn.id)}
                                title="More Options Menu"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <MoreVertical size={15} />
                              </button>

                              {/* Dropdown Menu Popup */}
                              {activeDropdownId === txn.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                                  <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-left text-xs font-semibold animate-in zoom-in-95 duration-150 space-y-0.5">
                                    <button 
                                      onClick={() => { setSelectedTxn(txn); setShowViewModal(true); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Eye size={14} className="text-blue-600" />
                                      <span>View Payment Details</span>
                                    </button>

                                    <button 
                                      onClick={() => { handleDownloadReceiptPDF(txn); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Receipt size={14} className="text-slate-600" />
                                      <span>Download Receipt (PDF)</span>
                                    </button>

                                    <button 
                                      onClick={() => { copyToClipboard(txn.txnId, 'Txn ID'); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Copy size={14} className="text-purple-600" />
                                      <span>Copy Txn ID</span>
                                    </button>

                                    <button 
                                      onClick={() => handleToggleStatus(txn)}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Power size={14} className="text-amber-600" />
                                      <span>Toggle Status ({txn.status})</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    <button 
                                      onClick={() => { setSelectedTxn(txn); setShowDeleteModal(true); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete Record</span>
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
        /* Cards View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedPayments.map(txn => (
            <div key={txn.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${txn.logoBg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                      {txn.logoText}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xs">{txn.organization}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{txn.txnId}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    txn.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    txn.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {txn.status}
                  </span>
                </div>

                <div className="pt-3 pb-2">
                  <span className="text-2xl font-black text-slate-900">{txn.amount}</span>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{txn.plan}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100 text-xs my-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Subscriber:</span>
                    <span className="font-bold text-slate-800">{txn.subscriber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Method:</span>
                    <span className="font-bold text-slate-800">{txn.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Invoice No:</span>
                    <span className="font-bold text-slate-900 font-mono">{txn.invoiceNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Date & Time:</span>
                    <span className="font-bold text-slate-700">{txn.date} ({txn.time})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedTxn(txn); setShowViewModal(true); }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleDownloadReceiptPDF(txn)}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Receipt size={14} />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shadow-xs">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredPayments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredPayments.length)}</span> of <span className="font-bold text-slate-800">{filteredPayments.length}</span> payment logs
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

      {/* RECORD NEW PAYMENT MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" />
                Record Manual Payment Log
              </h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Apex Infrastructure"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Amount (₹) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="34999"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Subscriber / Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.subscriber}
                    onChange={(e) => setFormData({ ...formData, subscriber: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Work Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rajesh@apex.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Plan Tier</label>
                  <select 
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Starter Plan">Starter Plan</option>
                    <option value="Business Plan">Business Plan</option>
                    <option value="Professional Plan">Professional Plan</option>
                    <option value="Enterprise Plan">Enterprise Plan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Method</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="VISA Credit Card">VISA Credit Card</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="UPI AutoPay">UPI AutoPay</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Wire Transfer">Bank Wire (NEFT)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Invoice Number (Optional)</label>
                <input 
                  type="text" 
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  placeholder="e.g. INV-2025-9921"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button 
                  type="button" 
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PAYMENT DETAILS MODAL */}
      {showViewModal && selectedTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${selectedTxn.logoBg} font-black flex items-center justify-center text-base shadow-xs`}>
                  {selectedTxn.logoText}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedTxn.organization}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedTxn.txnId}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Amount Paid:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedTxn.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Payment Status:</span>
                  <span className={`font-bold ${
                    selectedTxn.status === 'Success' ? 'text-emerald-600' :
                    selectedTxn.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {selectedTxn.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Payment Method:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Gateway / Provider:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.gateway}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Invoice Ref:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedTxn.invoiceNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Transaction Date:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.date} at {selectedTxn.time}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <User size={15} className="text-slate-400 shrink-0" />
                  <span>{selectedTxn.subscriber}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <span>{selectedTxn.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={15} className="text-slate-400 shrink-0" />
                  <span>{selectedTxn.plan}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button 
                onClick={() => handleDownloadReceiptPDF(selectedTxn)}
                className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Receipt size={15} />
                <span>PDF Receipt</span>
              </button>
              <button 
                onClick={() => copyToClipboard(selectedTxn.txnId, 'Txn ID')}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Copy ID
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

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Payment Logs</h3>
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
                  <span>Export Transactions (CSV)</span>
                </span>
                <Download size={16} />
              </button>

              <button 
                onClick={handleExportPDFReport}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Export Financial Audit (PDF)</span>
                </span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <XCircle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Payment Log?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove payment <span className="font-mono font-bold text-slate-800">{selectedTxn.txnId}</span> ({selectedTxn.organization})?
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
                onClick={handleDeletePaymentConfirm}
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

export default PaymentsPage;
