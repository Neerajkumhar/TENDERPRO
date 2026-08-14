import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportModal from '../components/ExportModal';
import { Search, Plus, Download, Filter, Truck, Edit, Printer, XCircle, X, BarChart3, CheckCircle2, Clock, ShieldCheck, Trash2, Eye, Loader2 } from 'lucide-react';

const statusClasses = {
  DELIVERED: 'bg-blue-500 text-white',
  'IN TRANSIT': 'bg-blue-500 text-white',
  PENDING: 'bg-amber-500 text-white',
  CANCELLED: 'bg-rose-500 text-white'
};

const defaultDeliveryForm = {
  tenderId: '',
  client: '',
  project: '',
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
  invoiceRef: '',
  poRef: '',
  poDate: '',
  ewayBill: '',
  dispatchFrom: '',
  dispatchTo: '',
  shippingAddress: '',
  materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
  files: []
};

const DeliveryChallan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [challans, setChallans] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallans = async () => {
    try {
      const response = await fetch('/api/delivery-challans');
      if (response.ok) {
        const data = await response.json();
        setChallans(data);
      }
    } catch (error) {
      console.error('Error fetching delivery challans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
    const fetchTenders = async () => {
      try {
        const response = await fetch('/api/tenders');
        if (response.ok) {
          const data = await response.json();
          setTenders(data);
        }
      } catch (error) {
        console.error('Error fetching tenders:', error);
      }
    };
    fetchTenders();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptConfig, setReceiptConfig] = useState({
    companyName: 'TenderPro Solutions Pvt. Ltd.',
    logoSrc: '',
    address: '1234, 5th Floor, Corporate Park, Sector 15, Gurugram, Haryana - 122001',
    phone: '+91 98765 43210',
    email: 'info@tenderpro.com',
    gstin: '06AABCT1234A1Z5'
  });
  const [createForm, setCreateForm] = useState(() => ({ ...defaultDeliveryForm }));

  const filteredChallans = challans.filter(challan => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = [challan.challanNumber || challan.id, challan.client, challan.project, challan.shipVia, challan.status]
      .some(field => String(field).toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'ALL' || challan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalChallans = challans.length;
  const deliveredCount = challans.filter(c => c.status === 'DELIVERED').length;
  const transitCount = challans.filter(c => c.status === 'IN TRANSIT').length;
  const pendingCount = challans.filter(c => c.status === 'PENDING').length;
  const totalItems = challans.reduce((sum, c) => sum + Number(c.itemsQty || 0), 0);

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const exportData = filteredChallans.filter(challan => {
      const date = new Date(challan.dispatchDate);
      return date >= start && date <= end;
    });

    if (exportData.length === 0) {
      alert('No challans matched the selected time period.');
      return;
    }

    const filename = `Delivery_Challans_${startDate}_to_${endDate}`;

    if (format === 'xlsx') {
      const exportRows = exportData.map(c => ({
        "Challan No.": c.challanNumber || c.id,
        "Client": c.client,
        "Project": c.project,
        "Dispatch Date": c.dispatchDate,
        "Transporter": c.transporter,
        "E-Way Bill": c.eWayBill,
        "Items Qty": c.itemsQty,
        "Value": c.materialValue,
        "Status": c.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Challans");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Delivery Challans Report", 14, 15);
      doc.setFontSize(9);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);
      
      const rows = exportData.map(c => [
        c.challanNumber || c.id, 
        `${c.client} / ${c.project}`, 
        c.dispatchDate, 
        c.transporter, 
        c.itemsQty, 
        `₹${parseFloat(c.materialValue || 0).toLocaleString('en-IN')}`, 
        c.status
      ]);
      
      autoTable(doc, {
        startY: 28,
        head: [["Challan No.", "Client / Project", "Dispatch Date", "Transporter", "Qty", "Value", "Status"]],
        body: rows,
        styles: { fontSize: 8 }
      });
      doc.save(`${filename}.pdf`);
    } else if (format === 'csv') {
      const headers = ['Challan No.', 'Client / Project', 'Dispatch Date', 'Transporter', 'Items Qty', 'Material Value', 'Status'];
      const rows = exportData.map(c => [c.challanNumber || c.id, `${c.client} / ${c.project}`, c.dispatchDate, c.transporter, c.itemsQty, `₹${c.materialValue}`, c.status]);
      const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${filename}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setCreateForm(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }));
  };

  const handleCreateMaterialChange = (index, field, value) => {
    setCreateForm(prev => {
      const materialRows = [...prev.materialRows];
      materialRows[index] = { ...materialRows[index], [field]: value };
      return { ...prev, materialRows };
    });
  };

  const handleAddMaterialRow = () => {
    setCreateForm(prev => ({
      ...prev,
      materialRows: [...prev.materialRows, { description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }]
    }));
  };

  const handleCreateSave = async () => {
    const payload = {
      tenderId: createForm.tenderId || null,
      client: createForm.client,
      project: createForm.project,
      dispatchDate: createForm.dispatchDate,
      deliveryDate: createForm.deliveryDate,
      transporter: createForm.transporter,
      vehicleNumber: createForm.vehicleNumber,
      lrNo: createForm.lrNo,
      driverName: createForm.driverName,
      clientGstin: createForm.clientGstin,
      contactPerson: createForm.contactPerson,
      contactPhone: createForm.contactPhone,
      placeOfSupply: createForm.placeOfSupply,
      invoiceRef: createForm.invoiceRef,
      poRef: createForm.poRef,
      poDate: createForm.poDate,
      ewayBill: createForm.ewayBill,
      dispatchFrom: createForm.dispatchFrom,
      dispatchTo: createForm.dispatchTo,
      shippingAddress: createForm.shippingAddress,
      materialRows: createForm.materialRows,
      status: 'PENDING'
    };

    try {
      const response = await fetch('/api/delivery-challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchChallans();
        setCreateOpen(false);
      } else {
        alert('Failed to create delivery challan');
      }
    } catch (error) {
      console.error('Error creating delivery challan:', error);
      alert('Network error creating delivery challan');
    }
  };

  const handleDetails = (challan) => {
    setSelected(challan);
    setIsEditing(false);
    setModalOpen(true);
    setCreateOpen(false);
  };

  const handleEdit = (challan) => {
    setSelected({ ...challan });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async (updated) => {
    try {
      const response = await fetch(`/api/delivery-challans/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        fetchChallans();
        setModalOpen(false);
      } else {
        alert('Failed to update delivery challan');
      }
    } catch (error) {
      console.error('Error updating delivery challan:', error);
      alert('Network error updating delivery challan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery challan?')) {
      try {
        const response = await fetch(`/api/delivery-challans/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchChallans();
        } else {
          alert('Failed to delete delivery challan');
        }
      } catch (error) {
        console.error('Error deleting delivery challan:', error);
        alert('Network error deleting delivery challan');
      }
    }
  };

  const handlePrintOpen = (challan) => {
    setSelected(challan);
    setReceiptOpen(true);
    setCreateOpen(false);
    setModalOpen(false);
  };

  const handleReceiptLogoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setReceiptConfig(prev => ({ ...prev, logoSrc: event.target.result }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const stats = [
    { label: 'TOTAL CHALLANS', value: totalChallans, sub: 'ALL CONSIGNMENTS', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50/80' },
    { label: 'DELIVERED', value: deliveredCount, sub: 'COMPLETED TRANSITS', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50/80' },
    { label: 'IN TRANSIT', value: transitCount, sub: 'ACTIVE ON ROAD', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50/80' },
    { label: 'PENDING', value: pendingCount, sub: 'AWAITING DISPATCH', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/80' },
    { label: 'ITEMS DISPATCHED', value: totalItems, sub: 'UNIT COUNT TOTAL', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50/80' }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-left">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Delivery Challans</h1>
          <p className="text-[9px] text-slate-500 font-medium">Dispatch and consignment delivery management.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              setCreateForm({ ...defaultDeliveryForm });
              setCreateOpen(true);
              setModalOpen(false);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95"
          >
            <Plus size={14} />
            <span>New Challan</span>
          </button>
        </div>
      </div>

      {/* Toolbar (Search & Filters) */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search challans..." 
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
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border rounded-lg text-[9px] font-bold transition-all shadow-2xs active:scale-95 ${showFilterDropdown || statusFilter !== 'ALL' ? 'border-blue-300 text-blue-600 bg-blue-50/50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={13} className="text-blue-500" />
              <span>Status: {statusFilter}</span>
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-50 animate-in fade-in slide-in-from-top-1">
                {['ALL', 'PENDING', 'IN TRANSIT', 'DELIVERED', 'CANCELLED'].map(status => (
                  <button key={status} onClick={() => { setStatusFilter(status); setShowFilterDropdown(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-2.5">
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

      {/* Delivery Ledger Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Delivery Ledger</h2>
            <p className="text-[9px] text-slate-500 font-medium">Tracking dispatches and deliveries across active clients.</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="animate-spin text-blue-500" size={16} />}
            <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Showing {filteredChallans.length} records</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <th className="px-3.5 py-2">Challan No.</th>
                <th className="px-3.5 py-2">Client / Project</th>
                <th className="px-3.5 py-2">Transporter</th>
                <th className="px-3.5 py-2">LR &amp; Gate Pass</th>
                <th className="px-3.5 py-2">Dispatch Date</th>
                <th className="px-3.5 py-2 text-right">Value (₹)</th>
                <th className="px-3.5 py-2">E-way Bill</th>
                <th className="px-3.5 py-2 text-center">Status</th>
                <th className="px-3.5 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredChallans.length > 0 ? filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-slate-50/70 transition-all cursor-pointer group">
                  <td className="px-3.5 py-2 font-bold text-blue-600 text-[10.5px]">{challan.challanNumber || challan.id}</td>
                  <td className="px-3.5 py-2">
                    <div className="font-bold text-slate-800 uppercase tracking-tight text-[11px]">{challan.client}</div>
                    <div className="text-[9.5px] font-medium text-slate-500 truncate max-w-[180px]">{challan.project}</div>
                  </td>
                  <td className="px-3.5 py-2 text-slate-700 font-medium text-[10.5px]">{challan.transporter}</td>
                  <td className="px-3.5 py-2 text-slate-500 font-medium text-[10px] italic">{challan.lrGatePass}</td>
                  <td className="px-3.5 py-2 text-slate-500 font-medium text-[10px] whitespace-nowrap">{challan.dispatchDate}</td>
                  <td className="px-3.5 py-2 font-extrabold text-slate-900 text-[11px] text-right whitespace-nowrap">₹{parseFloat(challan.materialValue || 0).toLocaleString('en-IN')}</td>
                  <td className="px-3.5 py-2 text-slate-600 font-medium text-[10px]">{challan.eWayBill}</td>
                  <td className="px-3.5 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs whitespace-nowrap ${statusClasses[challan.status] || 'bg-slate-400 text-white'}`}>
                      {challan.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleDetails(challan)} className="p-1 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-md transition-all" title="Details"><Eye size={13} /></button>
                      <button onClick={() => handlePrintOpen(challan)} className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md transition-all" title="Print"><Printer size={13} /></button>
                      <button onClick={() => handleEdit(challan)} className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-all" title="Edit"><Edit size={13} /></button>
                      <button onClick={() => handleDelete(challan.id)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-400 text-xs italic font-medium">{loading ? 'Fetching data...' : 'No delivery challans found'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Edit Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl z-70 border border-slate-100 overflow-hidden text-left">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{isEditing ? 'Edit Delivery Challan' : 'Delivery Challan Details'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Challan No.</label>
                  <div className="text-xs font-bold text-blue-600">{selected.challanNumber || selected.id}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client</label>
                  {isEditing ? (
                    <input value={selected.client} onChange={e => setSelected({...selected, client: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-bold text-slate-800">{selected.client}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Project</label>
                  {isEditing ? (
                    <input value={selected.project} onChange={e => setSelected({...selected, project: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-bold text-slate-800">{selected.project}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transporter</label>
                  {isEditing ? (
                    <input value={selected.transporter} onChange={e => setSelected({...selected, transporter: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-medium text-slate-600">{selected.transporter}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LR &amp; Gate Pass</label>
                  {isEditing ? (
                    <input value={selected.lrGatePass} onChange={e => setSelected({...selected, lrGatePass: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-medium text-slate-600">{selected.lrGatePass}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">E-way Bill</label>
                  {isEditing ? (
                    <input value={selected.eWayBill} onChange={e => setSelected({...selected, eWayBill: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-medium text-slate-600">{selected.eWayBill}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dispatch Date</label>
                  {isEditing ? (
                    <input type="date" value={selected.dispatchDate} onChange={e => setSelected({...selected, dispatchDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-medium text-slate-600">{selected.dispatchDate}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Number</label>
                  {isEditing ? (
                    <input value={selected.vehicleNumber || ''} onChange={e => setSelected({...selected, vehicleNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold" />
                  ) : (
                    <div className="text-xs font-medium text-slate-600">{selected.vehicleNumber || '-'}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 transition">Close</button>
              {isEditing && (
                <button onClick={() => handleSave(selected)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition shadow-xs">Save Changes</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setCreateOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col text-left">
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[90vh] custom-scrollbar space-y-4">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Create Delivery Challan</h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">New Consignment Registration</p>
                </div>
                <button onClick={() => setCreateOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Select Tender (Optional)</label>
                  <select
                    value={createForm.tenderId || ''}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const selectedTender = tenders.find(t => t.id === tId);
                      if (selectedTender) {
                        setCreateForm(prev => ({
                          ...prev,
                          tenderId: tId,
                          client: selectedTender.client?.name || '',
                          project: selectedTender.title || '',
                          poRef: selectedTender.poNumber || selectedTender.woNumber || selectedTender.reference || '',
                          shippingAddress: selectedTender.client?.address || selectedTender.client?.location || '',
                          contactPerson: selectedTender.client?.manager || '',
                          contactPhone: selectedTender.client?.managerPhone || '',
                          clientGstin: selectedTender.client?.gstAddress || '',
                        }));
                      } else {
                        setCreateForm(prev => ({
                          ...prev,
                          tenderId: '',
                          client: '',
                          project: '',
                          poRef: '',
                          shippingAddress: '',
                          contactPerson: '',
                          contactPhone: '',
                          clientGstin: '',
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="">-- Select Tender --</option>
                    {tenders.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.client?.name || 'No Client'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Consignee Client Name</label>
                  <input value={createForm.client} onChange={(e) => setCreateForm(prev => ({ ...prev, client: e.target.value }))} placeholder="Client organisation" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Project Name</label>
                  <input value={createForm.project} onChange={(e) => setCreateForm(prev => ({ ...prev, project: e.target.value }))} placeholder="Associated project" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Transporter</label>
                  <input value={createForm.transporter} onChange={(e) => setCreateForm(prev => ({ ...prev, transporter: e.target.value }))} placeholder="Transporter name" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Vehicle Number</label>
                  <input value={createForm.vehicleNumber} onChange={(e) => setCreateForm(prev => ({ ...prev, vehicleNumber: e.target.value }))} placeholder="e.g. DL 01 AB 1234" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Dispatch Date</label>
                  <input type="date" value={createForm.dispatchDate} onChange={(e) => setCreateForm(prev => ({ ...prev, dispatchDate: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">E-way Bill</label>
                  <input value={createForm.ewayBill} onChange={(e) => setCreateForm(prev => ({ ...prev, ewayBill: e.target.value }))} placeholder="e.g. EWB-123456" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Shipping Address</label>
                  <input value={createForm.shippingAddress} onChange={(e) => setCreateForm(prev => ({ ...prev, shippingAddress: e.target.value }))} placeholder="Destination address" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500 transition" />
                </div>
              </div>

              {/* Materials Checklist */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Consignment Items</h3>
                  <button type="button" onClick={handleAddMaterialRow} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-blue-100 transition">+ Add Item</button>
                </div>

                <div className="space-y-2">
                  {createForm.materialRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-12 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <input value={row.description} onChange={(e) => handleCreateMaterialChange(rowIndex, 'description', e.target.value)} placeholder="Description" className="col-span-12 sm:col-span-4 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none" />
                      <input value={row.itemCode} onChange={(e) => handleCreateMaterialChange(rowIndex, 'itemCode', e.target.value)} placeholder="Code" className="col-span-4 sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none" />
                      <input value={row.qty} onChange={(e) => handleCreateMaterialChange(rowIndex, 'qty', e.target.value)} placeholder="Qty" className="col-span-4 sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none" />
                      <input value={row.unit} onChange={(e) => handleCreateMaterialChange(rowIndex, 'unit', e.target.value)} placeholder="Unit" className="col-span-4 sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none" />
                      <input value={row.rate} onChange={(e) => handleCreateMaterialChange(rowIndex, 'rate', e.target.value)} placeholder="Rate" className="col-span-12 sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 transition">Cancel</button>
                <button type="button" onClick={handleCreateSave} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition shadow-xs">Register Dispatch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptOpen && selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-2 py-4">
          <style>{`
            @media print { 
              @page { size: A4 portrait; margin: 0; }
              html, body { height: 100vh !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; }
              body * { visibility: hidden; } 
              #delivery-receipt, #delivery-receipt * { visibility: visible; } 
              #delivery-receipt { 
                position: absolute !important; 
                left: 0 !important; 
                top: 0 !important; 
                width: 100% !important; 
                height: 100vh !important; 
                max-height: 100vh !important;
                overflow: hidden !important; 
                border: none !important; 
                box-shadow: none !important; 
                margin: 0 !important;
                padding: 5mm !important; 
                box-sizing: border-box !important;
              } 
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          `}</style>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setReceiptOpen(false)}></div>
          <div id="delivery-receipt" className="relative bg-white w-full sm:max-w-4xl shadow-2xl overflow-hidden border border-slate-200 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-2xl text-left">
            {/* Receipt Header Edit Bar */}
            <div className="bg-slate-100 border-b border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 print:hidden sticky top-0 z-[100]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">Receipt Customization</div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => window.print()} className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold uppercase tracking-wider text-[10px] hover:bg-blue-700 transition shadow-xs">🖨️ Print</button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                  <span>Change Logo</span>
                  <input type="file" accept="image/*" onChange={handleReceiptLogoSelect} className="hidden" />
                </label>
                <button onClick={() => setReceiptOpen(false)} className="p-1.5 bg-white hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition border border-slate-200"><X size={16} /></button>
              </div>
            </div>

            <div className="relative z-0 p-4 sm:p-6 print:p-5 space-y-3 print:space-y-3 font-sans">
              {/* WATERMARK */}
              {receiptConfig.logoSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1] opacity-[0.1]">
                  <img src={receiptConfig.logoSrc} alt="watermark" className="w-[70%] max-h-[70%] object-contain grayscale" />
                </div>
              )}
              
              {/* HEADER */}
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-3">
                <div className="flex items-start gap-3 flex-[1.5] w-full lg:w-auto">
                  {receiptConfig.logoSrc && (
                    <img src={receiptConfig.logoSrc} alt="Logo" className="w-16 h-16 object-contain p-1 border border-slate-200 rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      value={receiptConfig.companyName}
                      onChange={(e) => setReceiptConfig(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full text-base font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 print:border-none px-1 py-0.5 outline-none mb-1"
                    />
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <div>{receiptConfig.address}</div>
                      <div>Phone: {receiptConfig.phone} • Email: {receiptConfig.email}</div>
                      <div>GSTIN: {receiptConfig.gstin}</div>
                    </div>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <div className="text-base font-black text-blue-900 tracking-tight uppercase">DELIVERY CHALLAN</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">{selected.challanNumber || selected.id}</div>
                  <div className="text-[10px] text-slate-500">Date: {selected.dispatchDate || 'N/A'}</div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 text-xs">
                <div className="space-y-1">
                  <div><span className="font-bold text-slate-500 uppercase text-[9px]">Client:</span> <span className="font-bold text-slate-800 uppercase">{selected.client}</span></div>
                  <div><span className="font-bold text-slate-500 uppercase text-[9px]">Project:</span> <span className="font-medium text-slate-800">{selected.project}</span></div>
                  <div><span className="font-bold text-slate-500 uppercase text-[9px]">Shipping Address:</span> <span className="text-slate-700">{selected.shippingAddress || 'N/A'}</span></div>
                </div>
                <div className="space-y-1">
                  <div><span className="font-bold text-slate-500 uppercase text-[9px]">Transporter:</span> <span className="font-medium text-slate-800">{selected.transporter}</span></div>
                  <div><span className="font-bold text-slate-500 uppercase text-[9px]">Vehicle No:</span> <span className="text-slate-700">{selected.vehicleNumber || 'N/A'}</span></div>
                  <div><span className="font-bold text-slate-500 uppercase text-[9px]">Status:</span> <span className="font-bold text-blue-600">{selected.status}</span></div>
                </div>
              </div>

              {/* MATERIALS TABLE */}
              <div className="py-1">
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase">
                      <th className="py-1 px-2 border-r border-slate-200 w-8 text-center">#</th>
                      <th className="py-1 px-2 border-r border-slate-200">Item Description</th>
                      <th className="py-1 px-2 border-r border-slate-200">Item Code</th>
                      <th className="py-1 px-2 border-r border-slate-200 text-center w-16">Qty</th>
                      <th className="py-1 px-2 border-r border-slate-200 text-right w-24">Rate (₹)</th>
                      <th className="py-1 px-2 text-right w-28">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.materialRows?.length ? selected.materialRows : [
                      { description: 'Equipment Set', itemCode: 'EQ-01', qty: 1, unit: 'Set', rate: selected.materialValue || 0 }
                    ]).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200 last:border-0">
                        <td className="py-1 px-2 text-center text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="py-1 px-2 font-bold text-slate-800 border-r border-slate-200">{row.description}</td>
                        <td className="py-1 px-2 text-slate-600 border-r border-slate-200">{row.itemCode || '-'}</td>
                        <td className="py-1 px-2 text-center font-bold text-slate-800 border-r border-slate-200">{row.qty} {row.unit}</td>
                        <td className="py-1 px-2 text-right text-slate-700 border-r border-slate-200">₹{parseFloat(row.rate || 0).toLocaleString('en-IN')}</td>
                        <td className="py-1 px-2 text-right font-bold text-slate-900">₹{(parseFloat(row.qty || 1) * parseFloat(row.rate || 0)).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <div className="text-[9px] font-bold uppercase text-slate-400 mb-6">Authorized Signatory</div>
                  <div className="font-bold text-slate-800">Supplier Signatory</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase text-slate-400 mb-6">Receiver Signature</div>
                  <div className="font-bold text-slate-800">Site In-Charge</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold uppercase text-slate-400 mb-6">Company Stamp</div>
                  <div className="text-slate-400 italic text-[10px]">Verified & Sealed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExportReport}
        title="Export Delivery Challans"
      />
    </div>
  );
};

export default DeliveryChallan;
