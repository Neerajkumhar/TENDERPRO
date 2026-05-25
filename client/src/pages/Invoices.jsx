import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  XCircle,
  UploadCloud,
  File,
  X
} from 'lucide-react';

const mockInvoices = [
  {
    id: 'INV-2024-001',
    client: 'Acme Corp.',
    project: 'Alpha Platform',
    issueDate: '2024-01-10',
    dueDate: '2024-02-10',
    amount: 45000.0,
    amount_due: 0.0,
    paid_amount: 45000.0,
    billingAddress: '123 Business Park, San Francisco, CA 94107',
    gstDetails: 'GSTIN: 22AAAAA0000A1Z5',
    reference: 'REF-AP-001',
    poNumber: 'PO-789012',
    poAddress: '123 Business Park, San Francisco, CA 94107',
    status: 'PAID'
  },
  {
    id: 'INV-2024-002',
    client: 'Global Ltd.',
    project: 'Beta Upgrade',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 32150.75,
    amount_due: 32150.75,
    paid_amount: 0.0,
    billingAddress: '456 Global Avenue, London, UK',
    gstDetails: 'VAT: GB123456789',
    reference: 'REF-BU-002',
    poNumber: 'PO-654321',
    poAddress: '456 Global Avenue, London, UK',
    status: 'PENDING'
  },
  {
    id: 'INV-2024-003',
    client: 'Innovate Inc.',
    project: 'Gamma Integration',
    issueDate: '2024-01-20',
    dueDate: '2024-02-20',
    amount: 58900.2,
    amount_due: 16800.2,
    paid_amount: 42100.0,
    billingAddress: '789 Innovation Way, Austin, TX 78701',
    gstDetails: 'GSTIN: 27BBBBB0000B1Z5',
    reference: 'REF-GI-003',
    poNumber: 'PO-123987',
    poAddress: '789 Innovation Way, Austin, TX 78701',
    status: 'OVERDUE'
  },
  {
    id: 'INV-2024-004',
    client: 'Acme Corp.',
    project: 'Alpha Platform',
    issueDate: '2024-01-10',
    dueDate: '2024-02-10',
    amount: 45000.0,
    amount_due: 0.0,
    paid_amount: 45000.0,
    billingAddress: '123 Business Park, San Francisco, CA 94107',
    gstDetails: 'GSTIN: 22AAAAA0000A1Z5',
    reference: 'REF-AP-004',
    poNumber: 'PO-789013',
    poAddress: '123 Business Park, San Francisco, CA 94107',
    status: 'PAID'
  },
  {
    id: 'INV-2024-005',
    client: 'TechFlow',
    project: 'Cloud Migration',
    issueDate: '2024-02-01',
    dueDate: '2024-03-01',
    amount: 12500.0,
    amount_due: 12500.0,
    paid_amount: 0.0,
    billingAddress: '321 Cloud Court, Seattle, WA 98101',
    gstDetails: 'GSTIN: 33CCCCC0000C1Z5',
    reference: 'REF-CM-005',
    poNumber: 'PO-900123',
    poAddress: '321 Cloud Court, Seattle, WA 98101',
    status: 'DRAFT'
  }
];

const Invoices = ({ onInvoiceClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    tenderId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    amount_due: '',
    paid_amount: '',
    billingAddress: '',
    gstDetails: '',
    reference: '',
    invoiceRef: '',
    poNumber: '',
    poRef: '',
    poAddress: '',
    poDate: '',
    ewayBill: '',
    dispatchDate: '',
    deliveryDate: '',
    transporter: '',
    vehicleNumber: '',
    lrNo: '',
    driverName: '',
    clientGstin: '',
    contactPerson: '',
    contactPhone: '',
    placeOfSupply: '',
    dispatchFrom: '',
    dispatchTo: '',
    shippingAddress: '',
    materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
    notes: ''
  });

  const [clients, setClients] = useState([]);
  const [tenders, setTenders] = useState([]);

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('tender_invoices');
    return saved ? JSON.parse(saved) : mockInvoices;
  });

  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);
  
  // Toast notification state for a premium UX
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const updateInvoices = (newInvoices) => {
    setInvoices(newInvoices);
    localStorage.setItem('tender_invoices', JSON.stringify(newInvoices));
  };

  useEffect(() => {
    const loadBackendInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) return;
        const data = await response.json();
        const backendData = data.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          client: inv.client || '',
          project: inv.project || inv.reference || inv.poNumber || 'General Project',
          issueDate: inv.date ? new Date(inv.date).toISOString().split('T')[0] : inv.issueDate || '',
          dueDate: inv.dueDate || '',
          amount: inv.amount ?? 0,
          status: inv.status || 'PENDING',
          notes: inv.notes || ''
        }));
        if (backendData.length > 0) {
          setInvoices(backendData);
        }
      } catch (error) {
        console.error('Error fetching backend invoices:', error);
      }
    };

    loadBackendInvoices();
    // Load clients and tenders for selects
    const loadClientsAndTenders = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/tenders')
        ]);
        if (cRes.ok) setClients(await cRes.json());
        if (tRes.ok) setTenders(await tRes.json());
      } catch (err) {
        console.error('Error loading clients/tenders:', err);
      }
    };
    loadClientsAndTenders();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index, field, value) => {
    const materialRows = [...formData.materialRows];
    materialRows[index] = { ...materialRows[index], [field]: value };
    setFormData({ ...formData, materialRows });
  };

  const addMaterialRow = () => {
    setFormData({
      ...formData,
      materialRows: [
        ...formData.materialRows,
        { description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }
      ]
    });
  };

  const removeMaterialRow = (index) => {
    setFormData({
      ...formData,
      materialRows: formData.materialRows.filter((_, i) => i !== index)
    });
  };

  const handleCreateInvoice = (e) => {
    if (e) e.preventDefault();
    if (!formData.client || !formData.project || !formData.amount) {
      alert('Please fill in client name, project, and amount');
      return;
    }

    if (editInvoiceId) {
      // Edit mode
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === editInvoiceId) {
          return {
            ...inv,
            client: formData.client,
            project: formData.project,
            issueDate: formData.issueDate,
            dueDate: formData.dueDate,
            amount: parseFloat(formData.amount),
            amount_due: formData.amount_due !== '' ? parseFloat(formData.amount_due) : parseFloat(formData.amount) || 0,
            paid_amount: formData.paid_amount !== '' ? parseFloat(formData.paid_amount) : inv.paid_amount || 0,
            billingAddress: formData.billingAddress,
            gstDetails: formData.gstDetails,
            reference: formData.reference,
            invoiceRef: formData.invoiceRef,
            poNumber: formData.poNumber,
            poRef: formData.poRef,
            poAddress: formData.poAddress,
            poDate: formData.poDate,
            ewayBill: formData.ewayBill,
            dispatchDate: formData.dispatchDate,
            deliveryDate: formData.deliveryDate,
            transporter: formData.transporter,
            vehicleNumber: formData.vehicleNumber,
            lrNo: formData.lrNo,
            driverName: formData.driverName,
            clientGstin: formData.clientGstin,
            contactPerson: formData.contactPerson,
            contactPhone: formData.contactPhone,
            placeOfSupply: formData.placeOfSupply,
            dispatchFrom: formData.dispatchFrom,
            dispatchTo: formData.dispatchTo,
            shippingAddress: formData.shippingAddress,
            materialRows: formData.materialRows,
            notes: formData.notes
          };
        }
        return inv;
      });
      updateInvoices(updatedInvoices);
      triggerToast(`Invoice ${editInvoiceId} updated successfully!`);
      setEditInvoiceId(null);
    } else {
      // Creation mode
      const year = new Date().getFullYear();
      const count = invoices.length + 1;
      const paddedCount = String(count).padStart(3, '0');
      const newId = `INV-${year}-${paddedCount}`;

      const newInvoice = {
        id: newId,
        client: formData.client,
        project: formData.project,
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        amount_due: formData.amount_due !== '' ? parseFloat(formData.amount_due) : parseFloat(formData.amount) || 0,
        paid_amount: formData.paid_amount !== '' ? parseFloat(formData.paid_amount) : 0,
        billingAddress: formData.billingAddress,
        gstDetails: formData.gstDetails,
        reference: formData.reference,
        invoiceRef: formData.invoiceRef,
        poNumber: formData.poNumber,
        poRef: formData.poRef,
        poAddress: formData.poAddress,
        poDate: formData.poDate,
        ewayBill: formData.ewayBill,
        dispatchDate: formData.dispatchDate,
        deliveryDate: formData.deliveryDate,
        transporter: formData.transporter,
        vehicleNumber: formData.vehicleNumber,
        lrNo: formData.lrNo,
        driverName: formData.driverName,
        clientGstin: formData.clientGstin,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        placeOfSupply: formData.placeOfSupply,
        dispatchFrom: formData.dispatchFrom,
        dispatchTo: formData.dispatchTo,
        shippingAddress: formData.shippingAddress,
        materialRows: formData.materialRows,
        notes: formData.notes,
        status: 'PENDING'
      };

      updateInvoices([newInvoice, ...invoices]);
      triggerToast(`Invoice ${newId} generated successfully!`);
    }

    setFormData({
      client: '',
      project: '',
      tenderId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      amount: '',
      amount_due: '',
      paid_amount: '',
      billingAddress: '',
      gstDetails: '',
      reference: '',
      poNumber: '',
      poAddress: '',
      notes: ''
    });
    setFiles([]);
    setIsModalOpen(false);
  };

  const handleEditClick = (invoice) => {
    setEditInvoiceId(invoice.id);
    setFormData({
      client: invoice.client,
      project: invoice.project,
      tenderId: invoice.tenderId || '',
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      amount: String(invoice.amount),
      amount_due: invoice.amount_due != null ? String(invoice.amount_due) : String(invoice.amount || ''),
      paid_amount: invoice.paid_amount != null ? String(invoice.paid_amount) : '',
      billingAddress: invoice.billingAddress || '',
      gstDetails: invoice.gstDetails || '',
      reference: invoice.reference || '',
      invoiceRef: invoice.invoiceRef || '',
      poNumber: invoice.poNumber || '',
      poRef: invoice.poRef || '',
      poAddress: invoice.poAddress || '',
      poDate: invoice.poDate || '',
      ewayBill: invoice.ewayBill || '',
      dispatchDate: invoice.dispatchDate || '',
      deliveryDate: invoice.deliveryDate || '',
      transporter: invoice.transporter || '',
      vehicleNumber: invoice.vehicleNumber || '',
      lrNo: invoice.lrNo || '',
      driverName: invoice.driverName || '',
      clientGstin: invoice.clientGstin || '',
      contactPerson: invoice.contactPerson || '',
      contactPhone: invoice.contactPhone || '',
      placeOfSupply: invoice.placeOfSupply || '',
      dispatchFrom: invoice.dispatchFrom || '',
      dispatchTo: invoice.dispatchTo || '',
      shippingAddress: invoice.shippingAddress || '',
      materialRows: Array.isArray(invoice.materialRows) && invoice.materialRows.length ? invoice.materialRows : [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
      notes: invoice.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm(`Are you sure you want to delete invoice ${id}?`)) {
      updateInvoices(invoices.filter(inv => inv.id !== id));
      triggerToast(`Invoice ${id} deleted successfully!`);
    }
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      triggerToast('No invoices available to export');
      return;
    }

    const headers = ['Invoice No.', 'Client', 'Project', 'Issue Date', 'Due Date', 'Amount', 'Amount Due', 'Paid Amount', 'Transporter', 'Dispatch Date', 'Delivery Date', 'Invoice Ref', 'PO Ref', 'PO Number', 'PO Address', 'Shipping Address', 'GST/Tax Details', 'Status'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber || inv.id,
      inv.client,
      inv.project,
      inv.issueDate,
      inv.dueDate,
      inv.amount.toFixed(2),
      (inv.amount_due != null ? Number(inv.amount_due).toFixed(2) : ''),
      (inv.paid_amount != null ? Number(inv.paid_amount).toFixed(2) : ''),
      inv.transporter || '',
      inv.dispatchDate || '',
      inv.deliveryDate || '',
      inv.invoiceRef || '',
      inv.poRef || '',
      inv.poNumber || '',
      inv.poAddress || '',
      inv.shippingAddress || '',
      inv.gstDetails || '',
      inv.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast('CSV export downloaded successfully!');
  };

  // Filter invoices based on search, status filter, and date filters
  const filteredInvoices = invoices.filter(inv => {
    // 1. Search Query Filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      inv.id.toLowerCase().includes(query) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(query)) ||
      inv.client.toLowerCase().includes(query) ||
      inv.project.toLowerCase().includes(query) ||
      inv.status.toLowerCase().includes(query) ||
      (inv.billingAddress || '').toLowerCase().includes(query) ||
      (inv.gstDetails || '').toLowerCase().includes(query) ||
      (inv.reference || '').toLowerCase().includes(query) ||
      (inv.invoiceRef || '').toLowerCase().includes(query) ||
      (inv.poRef || '').toLowerCase().includes(query) ||
      (inv.poNumber || '').toLowerCase().includes(query) ||
      (inv.poAddress || '').toLowerCase().includes(query) ||
      (inv.transporter || '').toLowerCase().includes(query) ||
      (inv.dispatchDate || '').toLowerCase().includes(query) ||
      (inv.deliveryDate || '').toLowerCase().includes(query) ||
      (inv.shippingAddress || '').toLowerCase().includes(query)
    );

    // 2. Status Filter
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    // 3. Date Filters
    let matchesDate = true;
    if (startDateFilter) {
      matchesDate = matchesDate && (new Date(inv.issueDate) >= new Date(startDateFilter));
    }
    if (endDateFilter) {
      matchesDate = matchesDate && (new Date(inv.issueDate) <= new Date(endDateFilter));
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalInvoices = invoices.length;
  const paidCount = invoices.filter(i => i.status === 'PAID').length;
  const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
  const draftCount = invoices.filter(i => i.status === 'DRAFT').length;
  const totalAmountVal = invoices.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  const stats = [
    { label: 'TOTAL INVOICES', value: String(totalInvoices), icon: FileText, color: 'text-slate-600' },
    { label: 'PAID', value: String(paidCount), icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'PENDING', value: String(pendingCount), icon: Clock, color: 'text-amber-500' },
    { label: 'OVERDUE', value: String(overdueCount), icon: AlertCircle, color: 'text-rose-500' },
    { label: 'DRAFT', value: String(draftCount), icon: FileText, color: 'text-slate-400' },
    { label: 'TOTAL AMOUNT', value: `$${totalAmountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isAmount: true, color: 'text-blue-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen">
      {/* Header Row - Matching Reference Image */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 sm:mb-10 gap-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">INVOICES</h1>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-400 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => {
                  setShowDateFilterDropdown(!showDateFilterDropdown);
                  setShowStatusDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Calendar size={16} className="text-blue-500" />
                <span>{startDateFilter || endDateFilter ? 'Date Active' : 'Date Filter'}</span>
              </button>
              
              {showDateFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Filter by Issue Date</h4>
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
                      className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-100"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowDateFilterDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Filter size={16} className="text-blue-500" />
                <span>Status: {statusFilter}</span>
              </button>
              
              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {['ALL', 'PAID', 'PENDING', 'OVERDUE', 'DRAFT'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        statusFilter === status 
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
              setEditInvoiceId(null);
              setFormData({
                client: '',
                project: '',
                tenderId: '',
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: '',
                amount: '',
                amount_due: '',
                paid_amount: '',
                billingAddress: '',
                gstDetails: '',
                reference: '',
                invoiceRef: '',
                poNumber: '',
                poRef: '',
                poAddress: '',
                poDate: '',
                ewayBill: '',
                dispatchDate: '',
                deliveryDate: '',
                transporter: '',
                vehicleNumber: '',
                lrNo: '',
                driverName: '',
                clientGstin: '',
                contactPerson: '',
                contactPhone: '',
                placeOfSupply: '',
                dispatchFrom: '',
                dispatchTo: '',
                shippingAddress: '',
                materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            <span>Create Invoice</span>
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
        <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
          <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight italic uppercase">Detailed Invoice List</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
            <Filter size={14} />
            <span>Filter List</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 sm:px-8 py-4 sm:py-5">Invoice No.</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Client</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Project</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Dispatch</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Transporter</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Issue Date</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Due Date</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Amount</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Status</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.id || index}
                    onClick={() => onInvoiceClick && onInvoiceClick(invoice.id)}
                    className="transition-all cursor-pointer group"
                  >
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <span className="text-xs sm:text-sm font-black text-blue-600 hover:underline">{invoice.invoiceNumber || invoice.id}</span>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <span className="text-xs sm:text-sm font-black text-slate-800">{invoice.client}</span>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <span className="text-xs sm:text-sm font-bold text-slate-500">{invoice.project}</span>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400">{invoice.dispatchDate || '-'}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400">{invoice.transporter || '-'}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400">{invoice.issueDate}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400">{invoice.dueDate}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-black text-slate-900">${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <span className={`px-2 sm:px-4 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest
                        ${invoice.status === 'PAID' ? 'bg-emerald-500 text-white' : 
                          invoice.status === 'PENDING' ? 'bg-amber-500 text-white' : 
                          invoice.status === 'OVERDUE' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                      <div className="flex items-center justify-end gap-3 sm:gap-4 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(invoice); }}
                          className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id); }}
                          className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 sm:px-8 py-10 text-center text-slate-400 font-bold italic">
                    No invoices matching search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 sm:p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-2xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
                    {editInvoiceId ? `Edit Invoice: ${editInvoiceId}` : 'Generate New Invoice'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">
                    {editInvoiceId ? 'Modify billing details and documents' : 'Setup billing details & documents'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditInvoiceId(null);
                    setFormData({
                      client: '',
                      project: '',
                      tenderId: '',
                      issueDate: new Date().toISOString().split('T')[0],
                      dueDate: '',
                      amount: '',
                      amount_due: '',
                      paid_amount: '',
                      billingAddress: '',
                      gstDetails: '',
                      reference: '',
                      invoiceRef: '',
                      poNumber: '',
                      poRef: '',
                      poAddress: '',
                      poDate: '',
                      ewayBill: '',
                      dispatchDate: '',
                      deliveryDate: '',
                      transporter: '',
                      vehicleNumber: '',
                      lrNo: '',
                      driverName: '',
                      clientGstin: '',
                      contactPerson: '',
                      contactPhone: '',
                      placeOfSupply: '',
                      dispatchFrom: '',
                      dispatchTo: '',
                      shippingAddress: '',
                      materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
                      notes: ''
                    });
                  }}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                      <select
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                        value={formData.client}
                        onChange={(e) => setFormData({...formData, client: e.target.value})}
                      >
                        <option value="">Select client</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"> Project Title</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.tenderId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const tender = tenders.find(t => String(t.id) === String(selectedId));
                        const projectTitle = tender ? (tender.title || tender.name || '') : '';
                        // If tender maps to a client, pick its client name when available
                        let clientName = formData.client;
                        if (tender) {
                          if (tender.clientId && clients.length > 0) {
                            const c = clients.find(ci => String(ci.id) === String(tender.clientId));
                            if (c) clientName = c.name;
                          } else if (tender.clientName) {
                            clientName = tender.clientName;
                          }
                        }
                        setFormData({...formData, tenderId: selectedId, project: projectTitle, client: clientName});
                      }}
                    >
                      <option value="">Select tender (optional)</option>
                      {tenders.map(t => (
                        <option key={t.id} value={t.id}>{t.title || t.name || t.reference || `Tender ${t.id}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Amount (USD)</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Address</label>
                    <textarea
                      rows="3"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                      placeholder="Enter billing / client address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST / Tax Details</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.gstDetails}
                      onChange={(e) => setFormData({...formData, gstDetails: e.target.value})}
                      placeholder="GSTIN, Tax details or invoice tax note"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference / Invoice Ref.</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      placeholder="PO or reference number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PO Number</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.poNumber}
                      onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
                      placeholder="PO / Reference number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Ref.</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.invoiceRef}
                      onChange={(e) => setFormData({...formData, invoiceRef: e.target.value})}
                      placeholder="Invoice reference"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PO Ref.</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.poRef}
                      onChange={(e) => setFormData({...formData, poRef: e.target.value})}
                      placeholder="PO reference"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PO Date</label>
                    <input
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.poDate}
                      onChange={(e) => setFormData({...formData, poDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Way Bill</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.ewayBill}
                      onChange={(e) => setFormData({...formData, ewayBill: e.target.value})}
                      placeholder="E-Way bill number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transporter</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.transporter}
                      onChange={(e) => setFormData({...formData, transporter: e.target.value})}
                      placeholder="Transporter name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Number</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                      placeholder="Vehicle number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LR / Gate Pass</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.lrNo}
                      onChange={(e) => setFormData({...formData, lrNo: e.target.value})}
                      placeholder="LR or gate pass"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.driverName}
                      onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                      placeholder="Driver name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Date</label>
                    <input
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.dispatchDate}
                      onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Date</label>
                    <input
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Place of Supply</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.placeOfSupply}
                      onChange={(e) => setFormData({...formData, placeOfSupply: e.target.value})}
                      placeholder="Place of supply"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client GSTIN</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.clientGstin}
                      onChange={(e) => setFormData({...formData, clientGstin: e.target.value})}
                      placeholder="Client GSTIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Person</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="Contact person"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      placeholder="Contact number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shipping Address</label>
                    <textarea
                      rows="2"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                      placeholder="Shipping address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch From</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.dispatchFrom}
                      onChange={(e) => setFormData({...formData, dispatchFrom: e.target.value})}
                      placeholder="Dispatch origin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch To</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.dispatchTo}
                      onChange={(e) => setFormData({...formData, dispatchTo: e.target.value})}
                      placeholder="Delivery destination"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PO Address</label>
                  <textarea
                    rows="2"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                    value={formData.poAddress}
                    onChange={(e) => setFormData({...formData, poAddress: e.target.value})}
                    placeholder="PO billing / delivery address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Due</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.amount_due}
                      onChange={(e) => setFormData({...formData, amount_due: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({...formData, paid_amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supporting Documents (Drag & Drop)</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 transition-all flex flex-col items-center justify-center text-center
                      ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}
                  >
                    <input 
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className={`p-3 sm:p-4 rounded-2xl bg-white shadow-sm mb-4 transition-transform ${isDragging ? 'scale-110 text-blue-600' : 'text-slate-400'}`}>
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">Drop documents here or click to browse</p>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Supports PDF, PNG, JPG (Max 10MB)</p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in slide-in-from-top-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <File size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-800 truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
                  <textarea 
                    rows="3"
                    placeholder="Include payment instructions or terms..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditInvoiceId(null);
                      setFormData({
                        client: '',
                        project: '',
                        tenderId: '',
                        issueDate: new Date().toISOString().split('T')[0],
                        dueDate: '',
                        amount: '',
                        amount_due: '',
                        paid_amount: '',
                        billingAddress: '',
                        gstDetails: '',
                        reference: '',
                        poNumber: '',
                        poAddress: '',
                        notes: ''
                      });
                    }}
                    className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    {editInvoiceId ? 'Cancel' : 'Discard Draft'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleCreateInvoice}
                    className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    {editInvoiceId ? 'Save Changes' : 'Generate & Send Invoice'}
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

export default Invoices;
