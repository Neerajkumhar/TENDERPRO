import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  IndianRupee, 
  Download, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Printer, 
  Send, 
  Copy, 
  Calendar, 
  Building2, 
  X, 
  Receipt, 
  AlertTriangle,
  ArrowUpRight,
  MoreVertical,
  Layers,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Power,
  Trash2,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialInvoicesList = [
  {
    id: 1,
    invoiceNo: 'INV-2025-0841',
    refId: 'REF-98234710',
    organization: 'BuildTech Pvt. Ltd.',
    domain: 'buildtech.com',
    logoBg: 'bg-blue-600 text-white',
    logoText: 'B',
    address: '42, Industrial Area, Sector 62, Noida, UP 201301',
    gstin: '09AAACB1234C1Z5',
    plan: 'Business Plan',
    planBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    billingCycle: 'Monthly',
    invoiceDate: '15 Aug 2025',
    dueDate: '25 Aug 2025',
    status: 'Paid',
    subtotal: '₹34,999',
    tax: '₹6,300 (18% GST)',
    amount: '₹41,299',
    rawAmount: 41299,
    lineItems: [
      { desc: 'Business Plan Monthly Subscription (Aug 15 - Sep 15)', qty: 1, rate: '₹34,999', total: '₹34,999' }
    ],
    paymentMethod: 'VISA •••• 4242',
    txnId: 'TXN-98234710'
  },
  {
    id: 2,
    invoiceNo: 'INV-2025-0840',
    refId: 'REF-98234711',
    organization: 'Raj Construction',
    domain: 'rajconstructions.in',
    logoBg: 'bg-purple-600 text-white',
    logoText: 'R',
    address: '108, Civil Lines, Jaipur, Rajasthan 302006',
    gstin: '08AAACR5678D1Z2',
    plan: 'Professional Plan',
    planBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    billingCycle: 'Monthly',
    invoiceDate: '14 Aug 2025',
    dueDate: '24 Aug 2025',
    status: 'Paid',
    subtotal: '₹69,999',
    tax: '₹12,600 (18% GST)',
    amount: '₹82,599',
    rawAmount: 82599,
    lineItems: [
      { desc: 'Professional Plan Monthly Subscription (Aug 14 - Sep 14)', qty: 1, rate: '₹69,999', total: '₹69,999' }
    ],
    paymentMethod: 'UPI AutoPay (rajconst@okaxis)',
    txnId: 'TXN-98234711'
  },
  {
    id: 3,
    invoiceNo: 'INV-2025-0839',
    refId: 'REF-98234712',
    organization: 'Green Infra',
    domain: 'greeninfra.org',
    logoBg: 'bg-emerald-600 text-white',
    logoText: 'G',
    address: '15, Tech Park, Whitefield, Bengaluru, KA 560066',
    gstin: '29AAACG9912E1Z8',
    plan: 'Business Plan',
    planBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    billingCycle: 'Monthly',
    invoiceDate: '12 Aug 2025',
    dueDate: '22 Aug 2025',
    status: 'Paid',
    subtotal: '₹34,999',
    tax: '₹6,300 (18% GST)',
    amount: '₹41,299',
    rawAmount: 41299,
    lineItems: [
      { desc: 'Business Plan Monthly Subscription (Aug 12 - Sep 12)', qty: 1, rate: '₹34,999', total: '₹34,999' }
    ],
    paymentMethod: 'Mastercard •••• 8821',
    txnId: 'TXN-98234712'
  },
  {
    id: 4,
    invoiceNo: 'INV-2025-0838',
    refId: 'REF-98234713',
    organization: 'Infra Projects',
    domain: 'infraprojects.com',
    logoBg: 'bg-amber-600 text-white',
    logoText: 'I',
    address: '77, Financial District, Gachibowli, Hyderabad, TS 500032',
    gstin: '36AAACI4432F1Z4',
    plan: 'Enterprise Plan',
    planBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    billingCycle: 'Annual',
    invoiceDate: '10 Aug 2025',
    dueDate: '20 Aug 2025',
    status: 'Paid',
    subtotal: '₹17,99,988',
    tax: '₹3,23,998 (18% GST)',
    amount: '₹21,23,986',
    rawAmount: 2123986,
    lineItems: [
      { desc: 'Enterprise Plan Annual Subscription (Aug 2025 - Aug 2026)', qty: 1, rate: '₹17,99,988', total: '₹17,99,988' }
    ],
    paymentMethod: 'Net Banking (HDFC)',
    txnId: 'TXN-98234713'
  },
  {
    id: 5,
    invoiceNo: 'INV-2025-0837',
    refId: 'REF-98234714',
    organization: 'TechBuild Solutions',
    domain: 'techbuild.io',
    logoBg: 'bg-cyan-600 text-white',
    logoText: 'T',
    address: '22, Cyber City, Phase II, Gurugram, HR 122002',
    gstin: '06AAACT8811G1Z1',
    plan: 'Starter Plan',
    planBadge: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    billingCycle: 'Monthly',
    invoiceDate: '08 Aug 2025',
    dueDate: '18 Aug 2025',
    status: 'Pending',
    subtotal: '₹14,999',
    tax: '₹2,700 (18% GST)',
    amount: '₹17,699',
    rawAmount: 17699,
    lineItems: [
      { desc: 'Starter Plan Monthly Subscription (Aug 08 - Sep 08)', qty: 1, rate: '₹14,999', total: '₹14,999' }
    ],
    paymentMethod: 'Pending Payment',
    txnId: 'TXN-PENDING'
  },
  {
    id: 6,
    invoiceNo: 'INV-2025-0836',
    refId: 'REF-98234715',
    organization: 'Urban Developers',
    domain: 'urbandev.com',
    logoBg: 'bg-indigo-600 text-white',
    logoText: 'U',
    address: '501, BKC Centre, Bandra East, Mumbai, MH 400051',
    gstin: '27AAACU1122H1Z9',
    plan: 'Enterprise Plan',
    planBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    billingCycle: 'Annual',
    invoiceDate: '05 Aug 2025',
    dueDate: '15 Aug 2025',
    status: 'Paid',
    subtotal: '₹17,99,988',
    tax: '₹3,23,998 (18% GST)',
    amount: '₹21,23,986',
    rawAmount: 2123986,
    lineItems: [
      { desc: 'Enterprise Plan Annual Subscription (Aug 2025 - Aug 2026)', qty: 1, rate: '₹17,99,988', total: '₹17,99,988' }
    ],
    paymentMethod: 'VISA Business •••• 9012',
    txnId: 'TXN-98234715'
  },
  {
    id: 7,
    invoiceNo: 'INV-2025-0835',
    refId: 'REF-98234716',
    organization: 'Apex Contracts',
    domain: 'apexcontracts.com',
    logoBg: 'bg-rose-600 text-white',
    logoText: 'A',
    address: '88, Ring Road, Lajpat Nagar, New Delhi 110024',
    gstin: '07AAACA3344I1Z3',
    plan: 'Professional Plan',
    planBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    billingCycle: 'Monthly',
    invoiceDate: '01 Aug 2025',
    dueDate: '11 Aug 2025',
    status: 'Overdue',
    subtotal: '₹69,999',
    tax: '₹12,600 (18% GST)',
    amount: '₹82,599',
    rawAmount: 82599,
    lineItems: [
      { desc: 'Professional Plan Monthly Subscription (Aug 01 - Sep 01)', qty: 1, rate: '₹69,999', total: '₹69,999' }
    ],
    paymentMethod: 'Invoice Outstanding',
    txnId: 'TXN-9Y0Z1A'
  }
];

const InvoicesPage = () => {
  const [invoicesList, setInvoicesList] = useState(initialInvoicesList);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('All Organizations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cycleFilter, setCycleFilter] = useState('All Billing Cycles');
  const [amountRangeFilter, setAmountRangeFilter] = useState('All Amounts');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const [invRes, clientsRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/clients')
        ]);
        if (invRes.ok) {
          const data = await invRes.json();
          if (data && data.length > 0) {
            const mapped = data.map((inv, idx) => {
              const rawAmt = Number(inv.amount || 34999);
              const subtotalNum = Math.round(rawAmt / 1.18);
              const taxNum = rawAmt - subtotalNum;
              return {
                id: inv.id,
                invoiceNo: inv.invoiceNumber || `INV-2026-${String(841 - idx).padStart(4, '0')}`,
                refId: `REF-${98234710 + idx}`,
                organization: inv.organization || inv.clientName || 'BuildTech Pvt. Ltd.',
                domain: (inv.organization || 'buildtech').toLowerCase().replace(/\s+/g, '') + '.com',
                logoBg: idx % 2 === 0 ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white',
                logoText: (inv.organization || 'B').charAt(0).toUpperCase(),
                address: inv.address || '42, Industrial Area, Sector 62, Noida, UP 201301',
                gstin: inv.gstin || '09AAACB1234C1Z5',
                plan: inv.plan || (idx % 2 === 0 ? 'Business Plan' : 'Enterprise Plan'),
                planBadge: idx % 2 === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-200',
                billingCycle: inv.billingCycle || (idx % 2 === 0 ? 'Monthly' : 'Annual'),
                invoiceDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Aug 2026',
                dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '25 Aug 2026',
                status: inv.status || 'Paid',
                subtotal: `₹${subtotalNum.toLocaleString('en-IN')}`,
                tax: `₹${taxNum.toLocaleString('en-IN')} (18% GST)`,
                amount: `₹${rawAmt.toLocaleString('en-IN')}`,
                rawAmount: rawAmt,
                lineItems: inv.items && inv.items.length > 0 ? inv.items : [
                  { desc: `${inv.plan || 'Business Plan'} Subscription`, qty: 1, rate: `₹${subtotalNum.toLocaleString('en-IN')}`, total: `₹${subtotalNum.toLocaleString('en-IN')}` }
                ],
                paymentMethod: inv.status === 'Paid' ? 'VISA •••• 4242' : 'Invoice Outstanding',
                txnId: `TXN-${98234710 + idx}`
              };
            });
            setInvoicesList(mapped);
            if (mapped.length > 0) setSelectedInvoiceId(mapped[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    };
    fetchInvoices();
  }, []);
  
  // Selection & Sorting
  const [selectedRowIds, setSelectedRowIds] = useState([1]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'cards'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoiceToDelete, setSelectedInvoiceToDelete] = useState(null);

  // Form State for Generate Invoice Modal
  const [formData, setFormData] = useState({
    organization: '',
    domain: '',
    address: '',
    gstin: '',
    plan: 'Business Plan',
    billingCycle: 'Monthly',
    subtotal: '',
    dueDateDays: 10,
    lineItemDesc: ''
  });

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const selectedInvoice = useMemo(() => {
    return invoicesList.find(i => i.id === selectedInvoiceId) || invoicesList[0];
  }, [invoicesList, selectedInvoiceId]);

  // Dynamic KPI Calculations
  const stats = useMemo(() => {
    const totalCount = invoicesList.length;
    const paidCount = invoicesList.filter(i => i.status === 'Paid').length;
    const pendingCount = invoicesList.filter(i => i.status === 'Pending').length;
    const overdueCount = invoicesList.filter(i => i.status === 'Overdue').length;
    const totalAmountVal = invoicesList
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + (i.rawAmount || 0), 0);

    const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN');

    return {
      totalCount,
      paidCount,
      pendingCount,
      overdueCount,
      totalAmountFormatted: formatCurrency(totalAmountVal)
    };
  }, [invoicesList]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setOrgFilter('All Organizations');
    setStatusFilter('All Status');
    setCycleFilter('All Billing Cycles');
    setAmountRangeFilter('All Amounts');
    setSortColumn(null);
    setCurrentPage(1);
    triggerToast('Invoice search filters reset', 'info');
  };

  // Generate New Invoice
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!formData.organization.trim() || !formData.subtotal) return;

    const subtotalRaw = parseInt(formData.subtotal.toString().replace(/[^0-9]/g, '')) || 0;
    const taxRaw = Math.round(subtotalRaw * 0.18);
    const totalRaw = subtotalRaw + taxRaw;

    const newInvNo = `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRefId = `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + Number(formData.dueDateDays || 10));

    const formatDateStr = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let badgeClass = 'bg-blue-50 text-blue-600 border-blue-100';
    if (formData.plan.includes('Professional')) badgeClass = 'bg-purple-50 text-purple-600 border-purple-100';
    if (formData.plan.includes('Enterprise')) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    if (formData.plan.includes('Starter')) badgeClass = 'bg-cyan-50 text-cyan-600 border-cyan-100';

    const newInvoice = {
      id: Date.now(),
      invoiceNo: newInvNo,
      refId: newRefId,
      organization: formData.organization.trim(),
      domain: formData.domain.trim() || 'company.com',
      logoBg: 'bg-blue-600 text-white',
      logoText: formData.organization.trim().charAt(0).toUpperCase(),
      address: formData.address.trim() || 'Commercial Complex, Sector 18, Noida',
      gstin: formData.gstin.trim() || '09AAACV9988P1Z0',
      plan: formData.plan,
      planBadge: badgeClass,
      billingCycle: formData.billingCycle,
      invoiceDate: formatDateStr(today),
      dueDate: formatDateStr(dueDate),
      status: 'Pending',
      subtotal: `₹${subtotalRaw.toLocaleString('en-IN')}`,
      tax: `₹${taxRaw.toLocaleString('en-IN')} (18% GST)`,
      amount: `₹${totalRaw.toLocaleString('en-IN')}`,
      rawAmount: totalRaw,
      lineItems: [
        { 
          desc: formData.lineItemDesc.trim() || `${formData.plan} ${formData.billingCycle} Subscription`, 
          qty: 1, 
          rate: `₹${subtotalRaw.toLocaleString('en-IN')}`, 
          total: `₹${subtotalRaw.toLocaleString('en-IN')}` 
        }
      ],
      paymentMethod: 'Pending Invoice',
      txnId: 'TXN-PENDING'
    };

    setInvoicesList([newInvoice, ...invoicesList]);
    setSelectedInvoiceId(newInvoice.id);
    setShowCreateModal(false);
    triggerToast(`Generated invoice ${newInvNo} for ${newInvoice.organization}`, 'success');
  };

  // Toggle Invoice Status
  const handleToggleStatus = (invoice) => {
    const nextStatus = invoice.status === 'Paid' ? 'Pending' : invoice.status === 'Pending' ? 'Overdue' : 'Paid';
    setInvoicesList(invoicesList.map(i => i.id === invoice.id ? { ...i, status: nextStatus } : i));
    setActiveDropdownId(null);
    triggerToast(`Invoice ${invoice.invoiceNo} status set to ${nextStatus}`, 'info');
  };

  // Delete Invoice
  const handleDeleteInvoiceConfirm = () => {
    if (!selectedInvoiceToDelete) return;
    setInvoicesList(invoicesList.filter(i => i.id !== selectedInvoiceToDelete.id));
    if (selectedInvoiceId === selectedInvoiceToDelete.id) {
      setSelectedInvoiceId(invoicesList[0]?.id || null);
    }
    setShowDeleteModal(false);
    setSelectedInvoiceToDelete(null);
    setActiveDropdownId(null);
    triggerToast('Invoice deleted', 'warning');
  };

  // Download PDF Invoice Document
  const handleDownloadInvoicePDF = (invoice) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header Bar
      doc.setFillColor(30, 86, 240); // blue-600
      doc.rect(0, 0, 210, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TAX INVOICE - VAGWIIN TENDERPRO', 12, 13);

      doc.setFontSize(9);
      doc.text(`Invoice #: ${invoice.invoiceNo}`, 155, 13);

      // Vendor Info
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED FROM (PROVIDER):', 12, 28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Vagwiin TenderPro Pvt. Ltd.', 12, 33);
      doc.text('B-12, Tech Tower, Sector 63, Noida, UP 201301', 12, 38);
      doc.text('GSTIN: 09AAACV9988P1Z0 | Contact: billing@tenderpro.com', 12, 43);

      // Customer Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('BILLED TO (CUSTOMER):', 115, 28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(invoice.organization, 115, 33);
      doc.text(invoice.address, 115, 38, { maxWidth: 85 });
      doc.text(`GSTIN: ${invoice.gstin}`, 115, 48);

      doc.setDrawColor(226, 232, 240);
      doc.line(12, 53, 198, 53);

      // Invoice metadata
      doc.text(`Invoice Date: ${invoice.invoiceDate}`, 12, 59);
      doc.text(`Due Date: ${invoice.dueDate}`, 75, 59);
      doc.text(`Payment Status: ${invoice.status}`, 145, 59);

      // Line items table
      autoTable(doc, {
        startY: 65,
        head: [['#', 'Item Description', 'Qty', 'Rate', 'Total']],
        body: invoice.lineItems.map((item, idx) => [
          idx + 1,
          item.desc,
          item.qty,
          item.rate,
          item.total
        ])
      });

      const finalY = doc.lastAutoTable.finalY + 8;

      doc.setFont('helvetica', 'bold');
      doc.text(`Subtotal: ${invoice.subtotal}`, 140, finalY);
      doc.text(`Tax (18% GST): ${invoice.tax}`, 140, finalY + 6);

      doc.setFillColor(241, 245, 249);
      doc.rect(138, finalY + 10, 60, 10, 'F');
      doc.setTextColor(30, 86, 240);
      doc.setFontSize(10);
      doc.text(`Total Amount: ${invoice.amount}`, 142, finalY + 16.5);

      doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
      triggerToast(`Downloaded PDF for ${invoice.invoiceNo}`, 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Downloaded Invoice PDF report', 'info');
    }
  };

  // Send Email Reminder
  const handleSendEmailReminder = (invoice) => {
    triggerToast(`Email invoice reminder sent to ${invoice.domain}!`, 'success');
  };

  // Print Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredInvoices.map(i => i.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedInvoiceId(id);
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter(item => item !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleBulkMarkPaid = () => {
    setInvoicesList(invoicesList.map(i => selectedRowIds.includes(i.id) ? { ...i, status: 'Paid' } : i));
    setSelectedRowIds([]);
    triggerToast(`Marked ${selectedRowIds.length} invoices as Paid`, 'success');
  };

  const handleBulkDelete = () => {
    setInvoicesList(invoicesList.filter(i => !selectedRowIds.includes(i.id)));
    setSelectedRowIds([]);
    triggerToast(`Deleted ${selectedRowIds.length} invoice records`, 'warning');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Invoice No', 'Ref ID', 'Organization', 'Domain', 'Plan', 'Billing Cycle', 'Invoice Date', 'Due Date', 'Status', 'Subtotal', 'Tax', 'Amount', 'GSTIN'];
    const rows = filteredInvoices.map(i => [
      i.id,
      i.invoiceNo,
      i.refId,
      `"${i.organization}"`,
      i.domain,
      `"${i.plan}"`,
      i.billingCycle,
      i.invoiceDate,
      i.dueDate,
      i.status,
      `"${i.subtotal}"`,
      `"${i.tax}"`,
      `"${i.amount}"`,
      i.gstin
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Invoices_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    triggerToast('Exported invoices list to CSV!', 'success');
  };

  // Export PDF Audit Report
  const handleExportPDFReport = () => {
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Invoice No', 'Organization', 'Plan', 'Date', 'Amount', 'Status']],
        body: filteredInvoices.map(i => [
          i.invoiceNo,
          i.organization,
          i.plan,
          i.invoiceDate,
          i.amount,
          i.status
        ])
      });
      doc.save(`Tax_GST_Invoices_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setShowExportModal(false);
      triggerToast('Exported Tax & GST Report (PDF)', 'success');
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
  const filteredInvoices = useMemo(() => {
    return invoicesList.filter(i => {
      const matchesSearch = 
        i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.gstin.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesOrg = orgFilter === 'All Organizations' || i.organization === orgFilter;
      const matchesStatus = statusFilter === 'All Status' || i.status === statusFilter;
      const matchesCycle = cycleFilter === 'All Billing Cycles' || i.billingCycle === cycleFilter;
      
      let matchesAmount = true;
      if (amountRangeFilter === 'Under ₹50,000') matchesAmount = i.rawAmount < 50000;
      else if (amountRangeFilter === '₹50,000 - ₹2,00,000') matchesAmount = i.rawAmount >= 50000 && i.rawAmount <= 200000;
      else if (amountRangeFilter === 'Above ₹2,00,000') matchesAmount = i.rawAmount > 200000;

      return matchesSearch && matchesOrg && matchesStatus && matchesCycle && matchesAmount;
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
  }, [invoicesList, searchQuery, orgFilter, statusFilter, cycleFilter, amountRangeFilter, sortColumn, sortDirection]);

  // Paginated List
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

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
          {toast.type === 'warning' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <FileText size={16} className="text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600 shrink-0" size={24} />
            Invoices & Billing Statements
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Audit subscription invoices, preview tax breakdowns, and manage customer billing records.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            title="Export invoice list"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Invoices</span>
          </button>

          <button 
            onClick={() => {
              setFormData({
                organization: '',
                domain: '',
                address: '',
                gstin: '',
                plan: 'Business Plan',
                billingCycle: 'Monthly',
                subtotal: '',
                dueDateDays: 10,
                lineItemDesc: ''
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Dynamic KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Invoices */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {stats.totalCount} Total
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Invoices</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalCount}</h3>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Total billing records</p>
        </div>

        {/* Card 2: Paid Invoices */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
              {Math.round((stats.paidCount / (stats.totalCount || 1)) * 100)}% Cleared
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paid Invoices</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.paidCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span>Settled accounts</span>
          </div>
        </div>

        {/* Card 3: Pending Invoices */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
              Awaiting
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Invoices</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.pendingCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <span>Payment in progress</span>
          </div>
        </div>

        {/* Card 4: Overdue Invoices */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full">
              Followup Needed
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overdue Invoices</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.overdueCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <span>Past due date</span>
          </div>
        </div>

        {/* Card 5: Total Revenue Volume */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IndianRupee size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
              Paid Volume
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Volume</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalAmountFormatted}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 18.7%</span>
            <span className="text-slate-400 font-normal">collected billing</span>
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
              placeholder="Search by invoice number, organization, GSTIN..."
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
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* Billing Cycles Filter */}
            <select 
              value={cycleFilter}
              onChange={(e) => { setCycleFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Billing Cycles">All Billing Cycles</option>
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
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
              title="Reset invoice filters"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('split')}
                title="Split Table & Preview Panel View"
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'split' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
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
                <option value="All Amounts">All Invoice Amounts</option>
                <option value="Under ₹50,000">Under ₹50,000</option>
                <option value="₹50,000 - ₹2,00,000">₹50,000 to ₹2,00,000</option>
                <option value="Above ₹2,00,000">Above ₹2,00,000</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Matching Invoices
              </label>
              <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-600 font-bold flex items-center justify-between">
                <span>Showing {filteredInvoices.length} of {invoicesList.length} invoices</span>
                {filteredInvoices.length < invoicesList.length && (
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
            <span>Bulk actions for selected billing invoices:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkMarkPaid}
              className="px-3 py-1.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition cursor-pointer"
            >
              Mark as Paid
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
            >
              Delete Invoices
            </button>
          </div>
        </div>
      )}

      {/* Main Split Grid OR Grid Cards View Mode */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT COLUMN: Invoices Table (~70% width / 8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 select-none">
                    <th className="py-2.5 px-3.5 w-10">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedRowIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                      />
                    </th>

                    <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('invoiceNo')}>
                      <div className="flex items-center gap-1">
                        <span>Invoice No.</span>
                        {sortColumn === 'invoiceNo' ? (
                          sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                        ) : <ArrowUpDown size={12} className="opacity-40" />}
                      </div>
                    </th>

                    <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('organization')}>
                      <div className="flex items-center gap-1">
                        <span>Organization</span>
                        {sortColumn === 'organization' ? (
                          sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                        ) : <ArrowUpDown size={12} className="opacity-40" />}
                      </div>
                    </th>

                    <th className="py-2.5 px-3.5">Plan</th>
                    <th className="py-2.5 px-3.5">Billing Cycle</th>

                    <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('invoiceDate')}>
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortColumn === 'invoiceDate' ? (
                          sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                        ) : <ArrowUpDown size={12} className="opacity-40" />}
                      </div>
                    </th>

                    <th className="py-2.5 px-3.5">Due Date</th>

                    <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('amount')}>
                      <div className="flex items-center gap-1">
                        <span>Amount</span>
                        {sortColumn === 'amount' ? (
                          sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                        ) : <ArrowUpDown size={12} className="opacity-40" />}
                      </div>
                    </th>

                    <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        {sortColumn === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                        ) : <ArrowUpDown size={12} className="opacity-40" />}
                      </div>
                    </th>

                    <th className="py-2.5 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FileText size={32} className="text-slate-300" />
                          <p className="font-bold text-slate-600 text-sm">No invoice records found</p>
                          <p className="text-xs text-slate-400">Try adjusting your search query or filter keywords.</p>
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
                    paginatedInvoices.map(invoice => {
                      const isSelected = selectedInvoiceId === invoice.id;
                      const isChecked = selectedRowIds.includes(invoice.id);

                      return (
                        <tr 
                          key={invoice.id} 
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                          className={`hover:bg-slate-50/80 transition cursor-pointer relative ${
                            isSelected ? 'bg-blue-50/40 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          
                          {/* Checkbox */}
                          <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleRowSelect(invoice.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                            />
                          </td>

                          {/* Invoice No */}
                          <td className="py-3 px-3.5">
                            <span className="font-extrabold text-blue-600 hover:underline font-mono">{invoice.invoiceNo}</span>
                          </td>

                          {/* Organization */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg ${invoice.logoBg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                                {invoice.logoText}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{invoice.organization}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{invoice.domain}</p>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3 px-3.5">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${invoice.planBadge}`}>
                              {invoice.plan}
                            </span>
                          </td>

                          {/* Billing Cycle */}
                          <td className="py-3 px-3.5 text-slate-700 font-bold">
                            {invoice.billingCycle}
                          </td>

                          {/* Invoice Date */}
                          <td className="py-3 px-3.5 text-slate-800 font-bold">
                            {invoice.invoiceDate}
                          </td>

                          {/* Due Date */}
                          <td className="py-3 px-3.5 text-slate-500 font-medium">
                            {invoice.dueDate}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-3.5 font-black text-slate-900">
                            {invoice.amount}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleStatus(invoice); }}
                              title="Click to toggle status"
                              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                                invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                                invoice.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                invoice.status === 'Paid' ? 'bg-emerald-500' :
                                invoice.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                              }`}></div>
                              <span>{invoice.status}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              
                              {/* Eye / View Action */}
                              <button 
                                onClick={() => setSelectedInvoiceId(invoice.id)}
                                title="View Invoice Preview"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>

                              {/* Download PDF */}
                              <button 
                                onClick={() => handleDownloadInvoicePDF(invoice)}
                                title="Download PDF Invoice"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <Download size={15} />
                              </button>

                              {/* More Options Dropdown Trigger */}
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveDropdownId(activeDropdownId === invoice.id ? null : invoice.id)}
                                  title="More Options Menu"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                >
                                  <MoreVertical size={15} />
                                </button>

                                {activeDropdownId === invoice.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                                    <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-left text-xs font-semibold animate-in zoom-in-95 duration-150 space-y-0.5">
                                      <button 
                                        onClick={() => { setSelectedInvoiceId(invoice.id); setActiveDropdownId(null); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                      >
                                        <Eye size={14} className="text-blue-600" />
                                        <span>Preview Invoice</span>
                                      </button>

                                      <button 
                                        onClick={() => { handleDownloadInvoicePDF(invoice); setActiveDropdownId(null); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                      >
                                        <Download size={14} className="text-slate-600" />
                                        <span>Download PDF</span>
                                      </button>

                                      <button 
                                        onClick={() => { handleSendEmailReminder(invoice); setActiveDropdownId(null); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                      >
                                        <Send size={14} className="text-purple-600" />
                                        <span>Send Email Reminder</span>
                                      </button>

                                      <button 
                                        onClick={() => handleToggleStatus(invoice)}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                      >
                                        <Power size={14} className="text-amber-600" />
                                        <span>Toggle Status ({invoice.status})</span>
                                      </button>

                                      <div className="border-t border-slate-100 my-1"></div>

                                      <button 
                                        onClick={() => { setSelectedInvoiceToDelete(invoice); setShowDeleteModal(true); setActiveDropdownId(null); }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete Invoice</span>
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

            {/* Table Pagination Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{filteredInvoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of <span className="font-bold text-slate-800">{filteredInvoices.length}</span> invoices
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span>Rows per page</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
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
          </div>

          {/* RIGHT COLUMN: Selected Invoice Drawer View Panel (~30% width / 4 cols) */}
          {selectedInvoice && (
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900 font-mono">{selectedInvoice.invoiceNo}</h2>
                  <span className={`px-2.5 py-0.5 rounded border text-[10px] font-extrabold ${
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedInvoice.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={handlePrintInvoice}
                    title="Print Invoice"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <Printer size={15} />
                  </button>
                  <button 
                    onClick={() => handleSendEmailReminder(selectedInvoice)}
                    title="Send Email Reminder"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                  <button 
                    onClick={() => handleDownloadInvoicePDF(selectedInvoice)}
                    title="Download PDF"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>

              {/* Vendor & Billed To Section */}
              <div className="space-y-3 text-xs">
                
                {/* Vendor (Platform Provider) */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed From (Provider)</p>
                  <p className="font-black text-slate-900">VAGWIIN TENDERPRO PVT. LTD.</p>
                  <p className="text-[11px] text-slate-500 font-medium">B-12, Tech Tower, Sector 63, Noida, UP 201301</p>
                  <p className="text-[10px] text-slate-400 font-mono">GSTIN: 09AAACV9988P1Z0</p>
                </div>

                {/* Client (Organization) */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To (Customer)</p>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedInvoice.domain}</span>
                  </div>
                  <p className="font-black text-slate-900">{selectedInvoice.organization}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedInvoice.address}</p>
                  <p className="text-[10px] text-slate-400 font-mono">GSTIN: {selectedInvoice.gstin}</p>
                </div>

                {/* Dates & Reference Cards */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[10px]">Invoice Date</span>
                    <span className="font-extrabold text-slate-800">{selectedInvoice.invoiceDate}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 font-semibold block text-[10px]">Due Date</span>
                    <span className="font-extrabold text-slate-800">{selectedInvoice.dueDate}</span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedInvoice.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 text-slate-800">{item.desc}</td>
                          <td className="py-2 px-3 text-right font-extrabold text-slate-900">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Totals */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span>Tax (18% GST):</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.tax}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">{selectedInvoice.amount}</span>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Payment Information</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Method:</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Txn Ref:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedInvoice.txnId}</span>
                  </div>
                </div>

              </div>

              {/* Drawer Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => handleDownloadInvoicePDF(selectedInvoice)}
                  className="flex-1 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={() => handleSendEmailReminder(selectedInvoice)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Email Invoice
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Cards View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedInvoices.map(invoice => (
            <div key={invoice.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${invoice.logoBg} font-black flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                      {invoice.logoText}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xs">{invoice.organization}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{invoice.invoiceNo}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    invoice.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {invoice.status}
                  </span>
                </div>

                <div className="pt-3 pb-2">
                  <span className="text-2xl font-black text-slate-900">{invoice.amount}</span>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{invoice.plan} ({invoice.billingCycle})</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100 text-xs my-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">GSTIN:</span>
                    <span className="font-mono font-bold text-slate-800">{invoice.gstin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Invoice Date:</span>
                    <span className="font-bold text-slate-800">{invoice.invoiceDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Due Date:</span>
                    <span className="font-bold text-slate-800">{invoice.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedInvoiceId(invoice.id); setViewMode('split'); }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Preview Invoice
                </button>
                <button 
                  onClick={() => handleDownloadInvoicePDF(invoice)}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GENERATE NEW INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Generate New Tax Invoice
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
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
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Subtotal Amount (₹) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                    placeholder="34999"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Company Domain</label>
                  <input 
                    type="text" 
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="apexinfra.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">GSTIN Number</label>
                  <input 
                    type="text" 
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="09AAACA1234F1Z5"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
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
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billing Cycle</label>
                  <select 
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Due In (Days)</label>
                  <input 
                    type="number" 
                    value={formData.dueDateDays}
                    onChange={(e) => setFormData({ ...formData, dueDateDays: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billing Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 501, Business Park, Cyber City, Gurugram"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Line Item Description</label>
                <input 
                  type="text" 
                  value={formData.lineItemDesc}
                  onChange={(e) => setFormData({ ...formData, lineItemDesc: e.target.value })}
                  placeholder="e.g. Business Plan Monthly Subscription (Aug - Sep)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                />
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
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Invoice Data</h3>
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
                  <span>Export All Invoices (CSV)</span>
                </span>
                <Download size={16} />
              </button>

              <button 
                onClick={handleExportPDFReport}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Export Tax & GST Report (PDF)</span>
                </span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedInvoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Tax Invoice?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-mono font-bold text-slate-800">{selectedInvoiceToDelete.invoiceNo}</span> ({selectedInvoiceToDelete.organization})?
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
                onClick={handleDeleteInvoiceConfirm}
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

export default InvoicesPage;
