import React, { useState, useEffect, useRef } from 'react';
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
  X,
  IndianRupee,
  Loader2
} from 'lucide-react';

const Invoices = ({ onInvoiceClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    tenderId: '',
    tenderValue: '',
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
    notes: '',
    status: 'PENDING'
  });

  const [clients, setClients] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateFilterDropdown, setShowDateFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
        setShowDateFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const loadBackendInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      const backendData = data.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        client: inv.client || '',
        project: inv.project || inv.reference || inv.poNumber || 'General Project',
        issueDate: inv.date ? new Date(inv.date).toISOString().split('T')[0] : inv.issueDate || '',
        dueDate: inv.dueDate || '',
        amount: parseFloat(inv.amount ?? 0),
        status: (inv.status || 'Pending').toUpperCase(),
        tenderId: inv.tenderId,
        billingAddress: inv.billingAddress || '',
        gstDetails: inv.gstDetails || '',
        reference: inv.reference || '',
        invoiceRef: inv.invoiceRef || '',
        poNumber: inv.poNumber || '',
        poRef: inv.poRef || '',
        poAddress: inv.poAddress || '',
        poDate: inv.poDate || '',
        ewayBill: inv.ewayBill || '',
        dispatchDate: inv.dispatchDate || '',
        deliveryDate: inv.deliveryDate || '',
        transporter: inv.transporter || '',
        vehicleNumber: inv.vehicleNumber || '',
        lrNo: inv.lrNo || '',
        driverName: inv.driverName || '',
        clientGstin: inv.clientGstin || '',
        contactPerson: inv.contactPerson || '',
        contactPhone: inv.contactPhone || '',
        placeOfSupply: inv.placeOfSupply || '',
        dispatchFrom: inv.dispatchFrom || '',
        dispatchTo: inv.dispatchTo || '',
        shippingAddress: inv.shippingAddress || '',
        materialRows: inv.items ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items) : [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
        notes: inv.notes || '',
        attachments: inv.attachments ? (typeof inv.attachments === 'string' ? JSON.parse(inv.attachments) : inv.attachments) : []
      }));
      setInvoices(backendData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [clientsRes, tendersRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/tenders')
      ]);
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (tendersRes.ok) setTenders(await tendersRes.json());
    } catch (err) {
      console.error('Error fetching clients/tenders:', err);
    }
  };

  useEffect(() => {
    loadBackendInvoices();
    loadMetadata();
  }, []);

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

  const mapStatusToBackend = (s) => {
    if (s === 'PAID') return 'Paid';
    if (s === 'PENDING') return 'Pending';
    if (s === 'OVERDUE') return 'Overdue';
    if (s === 'DRAFT') return 'Pending';
    return 'Pending';
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          attachment: data.url
        }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    if (e) e.preventDefault();
    if (!formData.client || !formData.project || !formData.amount) {
      alert('Please fill in client name, project, and amount');
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      amount_due: formData.amount_due !== '' ? parseFloat(formData.amount_due) : parseFloat(formData.amount) || 0,
      paid_amount: formData.paid_amount !== '' ? parseFloat(formData.paid_amount) : 0,
      date: formData.issueDate,
      attachments: formData.attachment ? [{ name: 'Invoice Document', url: formData.attachment }] : []
    };

    if (!editInvoiceId) {
      payload.status = mapStatusToBackend(formData.status);
    } else {
      delete payload.status;
    }

    try {
      const url = editInvoiceId ? `/api/invoices/${editInvoiceId}` : '/api/invoices';
      const method = editInvoiceId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        triggerToast(editInvoiceId ? 'Invoice updated!' : 'Invoice created!');
        loadBackendInvoices();
        setIsModalOpen(false);
        setEditInvoiceId(null);
        setFormData({ client: '', project: '', tenderId: '', tenderValue: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', amount: '', amount_due: '', paid_amount: '', billingAddress: '', gstDetails: '', reference: '', invoiceRef: '', poNumber: '', poRef: '', poAddress: '', poDate: '', ewayBill: '', dispatchDate: '', deliveryDate: '', transporter: '', vehicleNumber: '', lrNo: '', driverName: '', clientGstin: '', contactPerson: '', contactPhone: '', placeOfSupply: '', dispatchFrom: '', dispatchTo: '', shippingAddress: '', materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }], notes: '', status: 'PENDING', attachment: '' });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleEditClick = (invoice) => {
    setEditInvoiceId(invoice.id);
    const existingAttachment = invoice.attachments && invoice.attachments[0] ? invoice.attachments[0].url : '';
    const associatedTender = tenders.find(t => t.id === invoice.tenderId);
    setFormData({
      ...invoice,
      amount: String(invoice.amount),
      amount_due: String(invoice.amount_due || invoice.amount || ''),
      paid_amount: String(invoice.paid_amount || ''),
      attachment: existingAttachment,
      tenderValue: associatedTender ? String(associatedTender.budget || '') : '',
      materialRows: Array.isArray(invoice.materialRows) && invoice.materialRows.length 
        ? invoice.materialRows 
        : [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }]
    });
    setIsModalOpen(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Delete this invoice permanently?')) {
      try {
        const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        if (response.ok) {
          triggerToast('Invoice deleted');
          loadBackendInvoices();
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const exportData = filteredInvoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      return invDate >= start && invDate <= end;
    });

    if (exportData.length === 0) {
      triggerToast('No data for period');
      return;
    }

    const filename = `Invoices_Export_${startDate}_${endDate}`;
    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [["No.", "Client", "Project", "Date", "Amount", "Status"]],
        body: exportData.map(i => [i.invoiceNumber || i.id, i.client, i.project, i.issueDate, i.amount, i.status]),
        styles: { fontSize: 8 }
      });
      doc.save(`${filename}.pdf`);
    } else if (format === 'csv') {
      const headers = ['No.', 'Client', 'Project', 'Date', 'Amount', 'Status'];
      const csv = [headers, ...exportData.map(i => [i.invoiceNumber || i.id, i.client, i.project, i.issueDate, i.amount, i.status])].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${filename}.csv`; link.click();
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = Object.values(inv).some(val => String(val).toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    let matchesDate = true;
    if (startDateFilter) matchesDate = matchesDate && (new Date(inv.issueDate) >= new Date(startDateFilter));
    if (endDateFilter) matchesDate = matchesDate && (new Date(inv.issueDate) <= new Date(endDateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalInvoices = invoices.length;
  const paidCount = invoices.filter(i => i.status === 'PAID').length;
  const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
  const totalAmountVal = invoices.reduce((sum, i) => sum + i.amount, 0);

  const stats = [
    { label: 'TOTAL INVOICES', value: String(totalInvoices), color: 'text-slate-700' },
    { label: 'PAID', value: String(paidCount), color: 'text-blue-600' },
    { label: 'PENDING', value: String(pendingCount), color: 'text-amber-600' },
    { label: 'OVERDUE', value: String(overdueCount), color: 'text-rose-600' },
    { label: 'TOTAL REVENUE', value: `₹${totalAmountVal.toLocaleString('en-IN')}`, color: 'text-blue-600' },
    { label: 'ACTIVE DISPATCH', value: String(invoices.filter(i => i.transporter).length), color: 'text-purple-600' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-left">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-[9px] text-slate-500 font-medium">Manage and generate client billing invoices.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          
          <div className="relative flex items-center gap-1.5" ref={filterRef}>
            <button 
              onClick={() => setShowDateFilterDropdown(!showDateFilterDropdown)} 
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
            >
              <Calendar size={13} className="text-blue-500" />
              <span>{startDateFilter || endDateFilter ? 'Date ON' : 'Date'}</span>
            </button>
            
            {showDateFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <h4 className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-2">Filter by Date</h4>
                <div className="space-y-2">
                  <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" />
                  <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold" />
                  <button onClick={() => setShowDateFilterDropdown(false)} className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider">Apply</button>
                </div>
              </div>
            )}
            
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
              setEditInvoiceId(null); 
              setFormData({ client: '', project: '', tenderId: '', tenderValue: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', amount: '', amount_due: '', paid_amount: '', billingAddress: '', gstDetails: '', reference: '', invoiceRef: '', poNumber: '', poRef: '', poAddress: '', poDate: '', ewayBill: '', dispatchDate: '', deliveryDate: '', transporter: '', vehicleNumber: '', lrNo: '', driverName: '', clientGstin: '', contactPerson: '', contactPhone: '', placeOfSupply: '', dispatchFrom: '', dispatchTo: '', shippingAddress: '', materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }], notes: '', status: 'PENDING', attachment: '' }); 
              setIsModalOpen(true); 
            }} 
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            <Plus size={14} />
            <span>New Invoice</span>
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

      {/* Detailed Invoice List Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Detailed Invoice List</h2>
          {isLoading && <Loader2 className="animate-spin text-blue-500" size={16} />}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-3.5 py-2">No.</th>
                <th className="px-3.5 py-2">Client</th>
                <th className="px-3.5 py-2">Project</th>
                <th className="px-3.5 py-2">Issue Date</th>
                <th className="px-3.5 py-2">Amount</th>
                <th className="px-3.5 py-2">Status</th>
                <th className="px-3.5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.id || index} onClick={() => onInvoiceClick && onInvoiceClick(invoice.id)} className="transition-all cursor-pointer hover:bg-slate-50/70">
                    <td className="px-3.5 py-2"><span className="text-[10.5px] font-bold text-blue-600">{invoice.invoiceNumber || invoice.id.slice(0,8)}</span></td>
                    <td className="px-3.5 py-2"><span className="text-[11px] font-bold text-slate-800 uppercase">{invoice.client}</span></td>
                    <td className="px-3.5 py-2"><span className="text-[10.5px] font-medium text-slate-500 truncate max-w-[150px] block uppercase">{invoice.project}</span></td>
                    <td className="px-3.5 py-2"><span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{invoice.issueDate}</span></td>
                    <td className="px-3.5 py-2"><span className="text-[11px] font-extrabold text-slate-900 whitespace-nowrap">₹{invoice.amount.toLocaleString('en-IN')}</span></td>
                    <td className="px-3.5 py-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs whitespace-nowrap ${invoice.status === 'PAID' ? 'bg-blue-500 text-white' : invoice.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEditClick(invoice)} className="p-1 hover:bg-blue-50 text-blue-600 rounded-md transition-all" title="Edit"><Edit size={13} /></button>
                        <button onClick={() => handleDeleteInvoice(invoice.id)} className="p-1 hover:bg-rose-50 text-rose-500 rounded-md transition-all" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-xs italic font-medium">{isLoading ? 'Fetching data...' : 'No invoices found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate / Edit Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{editInvoiceId ? 'Edit Invoice' : 'Generate Invoice'}</h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Transaction billing audit details</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateInvoice} className="space-y-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Client</label>
                  <select 
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    value={formData.client} 
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Tender</label>
                  <select 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                    value={formData.tenderId} 
                    onChange={(e) => {
                      const t = tenders.find(t => t.id === e.target.value);
                      let suggestedAmount = '';
                      if (t) {
                        const invoicesForTender = invoices.filter(inv => inv.tenderId === e.target.value);
                        const invoicedSum = invoicesForTender.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
                        suggestedAmount = String(Math.max(0, Number(t.budget || 0) - invoicedSum));
                      }
                      setFormData({
                        ...formData, 
                        tenderId: e.target.value, 
                        project: t ? t.title : '',
                        client: t && t.client ? t.client.name : formData.client,
                        tenderValue: t ? (t.budget || '') : '',
                        amount: !editInvoiceId && t ? suggestedAmount : formData.amount
                      });
                    }}
                  >
                    <option value="">Select Tender</option>
                    {tenders.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tender Value (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input 
                        type="text" 
                        disabled
                        placeholder="0.00" 
                        className="w-full pl-7 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 opacity-75" 
                        value={formData.tenderValue} 
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Billing Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input 
                        type="number" 
                        required
                        placeholder="0.00" 
                        className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                        value={formData.amount} 
                        onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Upload Invoice Document</label>
                  <div className={`relative border border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 ${formData.attachment ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                    {isUploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={20} />
                    ) : formData.attachment ? (
                      <div className="z-10 text-center flex flex-col items-center gap-1.5">
                        <CheckCircle2 className="text-blue-500" size={20} />
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Document Uploaded</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a 
                            href={formData.attachment} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View File
                          </a>
                          <span className="text-slate-300 text-xs">|</span>
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, attachment: '' }));
                            }} 
                            className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer z-20"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="text-slate-400" size={20} />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Click or drag file to upload</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 sticky bottom-0 bg-white pb-1">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={isUploading} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95 disabled:opacity-50">
                    {isUploading ? 'Uploading...' : (editInvoiceId ? 'Update Invoice' : 'Generate & Send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Invoices Report" />
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[250] bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-blue-500 shrink-0" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Invoices;
