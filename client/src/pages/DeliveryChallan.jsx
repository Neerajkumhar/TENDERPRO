import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportModal from '../components/ExportModal';
import { Search, Plus, Download, Filter, Truck, Edit, Printer, XCircle, X, BarChart3, CheckCircle2, Clock, ShieldCheck, Trash2 } from 'lucide-react';

const mockChallans = [
  { id: 'DEL-2026-001', client: 'Acme Corp.', project: 'Solar Substation', transporter: 'Shree Transports', lrGatePass: 'LR12345 / GP678', dispatchDate: '2026-05-22', materialValue: 18800, eWayBill: 'EWB-998877', shipVia: 'Road', itemsQty: 32, estWeight: '1.8T', signedCopy: 'Uploaded', status: 'DELIVERED' },
  { id: 'DEL-2026-002', client: 'Global Ltd.', project: 'Data Center Retrofit', transporter: 'Rapid Movers', lrGatePass: 'LR22334 / GP112', dispatchDate: '2026-05-23', materialValue: 14950, eWayBill: 'EWB-554433', shipVia: 'Express', itemsQty: 18, estWeight: '950kg', signedCopy: 'Pending', status: 'IN TRANSIT' },
  { id: 'DEL-2026-003', client: 'Innovate Inc.', project: 'Gamma Integration', transporter: 'Skyline Carriers', lrGatePass: 'LR33445 / GP221', dispatchDate: '2026-05-19', materialValue: 27800, eWayBill: 'EWB-112233', shipVia: 'Air', itemsQty: 27, estWeight: '1.2T', signedCopy: 'Uploaded', status: 'PENDING' },
];

const statusClasses = {
  DELIVERED: 'bg-emerald-500 text-white',
  'IN TRANSIT': 'bg-blue-500 text-white',
  PENDING: 'bg-amber-500 text-slate-900',
  CANCELLED: 'bg-rose-500 text-white'
};

const defaultDeliveryForm = {
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
  const totalItems = challans.reduce((sum, c) => sum + (c.itemsQty || 0), 0);

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
        "Challan No.": c.id,
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
      doc.setFontSize(18);
      doc.text("Delivery Challans Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
      
      const rows = exportData.map(c => [
        c.id, 
        `${c.client} / ${c.project}`, 
        c.dispatchDate, 
        c.transporter, 
        c.itemsQty, 
        `₹${c.materialValue.toLocaleString()}`, 
        c.status
      ]);
      
      autoTable(doc, {
        startY: 35,
        head: [["Challan No.", "Client / Project", "Date", "Transporter", "Qty", "Value", "Status"]],
        body: rows,
      });
      doc.save(`${filename}.pdf`);
    } else if (format === 'csv') {
      const headers = ['Challan No.', 'Client / Project', 'Dispatch Date', 'Transporter', 'Items Qty', 'Material Value', 'Status'];
      const rows = exportData.map(c => [c.id, `${c.client} / ${c.project}`, c.dispatchDate, c.transporter, c.itemsQty, c.materialValue, c.status]);
      const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsExportModalOpen(false);
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
    // Map properties to backend expected naming format
    const payload = {
      client: createForm.client,
      project: createForm.project,
      transporter: createForm.transporter,
      lrNo: createForm.lrNo,
      dispatchDate: createForm.dispatchDate,
      ewayBill: createForm.ewayBill,
      status: 'PENDING',
      dispatchFrom: createForm.dispatchFrom,
      dispatchTo: createForm.dispatchTo,
      shippingAddress: createForm.shippingAddress,
      vehicleNumber: createForm.vehicleNumber,
      deliveryDate: createForm.deliveryDate,
      driverName: createForm.driverName,
      clientGstin: createForm.clientGstin,
      contactPerson: createForm.contactPerson,
      contactPhone: createForm.contactPhone,
      placeOfSupply: createForm.placeOfSupply,
      invoiceRef: createForm.invoiceRef,
      poRef: createForm.poRef,
      poDate: createForm.poDate,
      materialRows: createForm.materialRows
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
        alert('Failed to register delivery challan');
      }
    } catch (error) {
      console.error('Error creating delivery challan:', error);
      alert('Network error registering delivery challan');
    }
  };

  const handleReceiptLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const logoUrl = URL.createObjectURL(file);
    setReceiptConfig(prev => ({ ...prev, logoSrc: logoUrl }));
  };

  const handlePrintOpen = (challan) => {
    setSelected(challan);
    setReceiptOpen(true);
    setCreateOpen(false);
    setModalOpen(false);
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
    setCreateOpen(false);
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

  return (
    <div className="p-4 sm:p-6 lg:p-7 bg-[#f8fafc] min-h-screen text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-5 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">DELIVERY CHALLANS</h1>
          <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mt-0.5">DISPATCH & DELIVERY MANAGEMENT</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              setCreateForm({ ...defaultDeliveryForm });
              setCreateOpen(true);
              setModalOpen(false);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            <span>New Challan</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search challans..." 
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={16} className="text-blue-500" />
            <span>Export Report</span>
          </button>
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Filter size={16} className="text-blue-500" />
              <span>Status: {statusFilter}</span>
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 shadow-xl rounded-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {['ALL', 'PENDING', 'IN TRANSIT', 'DELIVERED', 'CANCELLED'].map(status => (
                  <button key={status} onClick={() => { setStatusFilter(status); setShowFilterDropdown(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl sm:rounded-[1.5rem] shadow-2xl z-70 overflow-hidden">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">{isEditing ? 'Edit Delivery Challan' : 'Delivery Challan Details'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 transition">Close</button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Challan No.</label>
                <div className="mt-1.5 sm:mt-2 font-black text-slate-900">{selected.challanNumber || selected.id}</div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</label>
                {isEditing ? (
                  <input value={selected.client} onChange={e => setSelected({...selected, client: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-black text-slate-800 uppercase">{selected.client}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</label>
                {isEditing ? (
                  <input value={selected.project} onChange={e => setSelected({...selected, project: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-black text-slate-800">{selected.project}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transporter</label>
                {isEditing ? (
                  <input value={selected.transporter} onChange={e => setSelected({...selected, transporter: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-700">{selected.transporter}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LR & Gate Pass</label>
                {isEditing ? (
                  <input value={selected.lrGatePass} onChange={e => setSelected({...selected, lrGatePass: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.lrGatePass}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-way Bill</label>
                {isEditing ? (
                  <input value={selected.eWayBill} onChange={e => setSelected({...selected, eWayBill: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.eWayBill}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Date</label>
                {isEditing ? (
                  <input type="date" value={selected.dispatchDate} onChange={e => setSelected({...selected, dispatchDate: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.dispatchDate}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Date</label>
                {isEditing ? (
                  <input type="date" value={selected.deliveryDate} onChange={e => setSelected({...selected, deliveryDate: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.deliveryDate}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch From</label>
                {isEditing ? (
                  <input value={selected.dispatchFrom} onChange={e => setSelected({...selected, dispatchFrom: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.dispatchFrom}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch To</label>
                {isEditing ? (
                  <input value={selected.dispatchTo} onChange={e => setSelected({...selected, dispatchTo: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.dispatchTo}</div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping Address</label>
                {isEditing ? (
                  <textarea value={selected.shippingAddress} onChange={e => setSelected({...selected, shippingAddress: e.target.value})} rows="2" className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold resize-none" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.shippingAddress}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Number</label>
                {isEditing ? (
                  <input value={selected.vehicleNumber} onChange={e => setSelected({...selected, vehicleNumber: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.vehicleNumber}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Name</label>
                {isEditing ? (
                  <input value={selected.driverName} onChange={e => setSelected({...selected, driverName: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.driverName}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client GSTIN</label>
                {isEditing ? (
                  <input value={selected.clientGstin} onChange={e => setSelected({...selected, clientGstin: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.clientGstin}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</label>
                {isEditing ? (
                  <input value={selected.contactPerson} onChange={e => setSelected({...selected, contactPerson: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.contactPerson}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
                {isEditing ? (
                  <input value={selected.contactPhone} onChange={e => setSelected({...selected, contactPhone: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold" />
                ) : (
                  <div className="mt-1.5 sm:mt-2 font-bold text-slate-600">{selected.contactPhone}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                {isEditing ? (
                  <select value={selected.status} onChange={e => setSelected({...selected, status: e.target.value})} className="w-full mt-1.5 sm:mt-2 p-3 border border-slate-200 rounded-xl sm:rounded-2xl focus:border-blue-400 outline-none font-bold appearance-none">
                    <option value="PENDING">PENDING</option>
                    <option value="IN TRANSIT">IN TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                ) : (
                  <div className="mt-1.5 sm:mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusClasses[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className="p-5 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0 bg-slate-50">
              <button onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition order-2 sm:order-1">Close</button>
              {isEditing && (
                <button onClick={() => handleSave(selected)} className="px-5 py-3 rounded-xl sm:rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 order-1 sm:order-2">Save Changes</button>
              )}
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCreateOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[1120px] rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 sm:mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-500 mb-2">New Consignment Registration</p>
                  <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black uppercase tracking-tight text-slate-900">Create Delivery Challan</h2>
                </div>
                <button onClick={() => setCreateOpen(false)} className="px-5 py-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition">Discard Draft</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Consignee Client Name</label>
                    <input value={createForm.client} onChange={(e) => setCreateForm(prev => ({ ...prev, client: e.target.value }))} placeholder="Enter client organisation" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Dispatch Date</label>
                      <input type="date" value={createForm.dispatchDate} onChange={(e) => setCreateForm(prev => ({ ...prev, dispatchDate: e.target.value }))} className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Est. Delivery Date</label>
                      <input type="date" value={createForm.deliveryDate} onChange={(e) => setCreateForm(prev => ({ ...prev, deliveryDate: e.target.value }))} className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Transporter Partner</label>
                    <input value={createForm.transporter} onChange={(e) => setCreateForm(prev => ({ ...prev, transporter: e.target.value }))} placeholder="E.g., SafeExpress, VRL Logistics" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Lorry Receipt (LR) No</label>
                      <input value={createForm.lrNo} onChange={(e) => setCreateForm(prev => ({ ...prev, lrNo: e.target.value }))} placeholder="E.g., LR-SK-908122" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Vehicle Reg. Number</label>
                      <input value={createForm.vehicleNumber} onChange={(e) => setCreateForm(prev => ({ ...prev, vehicleNumber: e.target.value }))} placeholder="E.g., HR55AB1234" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Tender / Project Name</label>
                    <input value={createForm.project} onChange={(e) => setCreateForm(prev => ({ ...prev, project: e.target.value }))} placeholder="Enter associated project/tender" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Client GSTIN</label>
                      <input value={createForm.clientGstin} onChange={(e) => setCreateForm(prev => ({ ...prev, clientGstin: e.target.value }))} placeholder="E.g., 06AABCA1234A1Z5" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">PO / Reference No</label>
                      <input value={createForm.poRef} onChange={(e) => setCreateForm(prev => ({ ...prev, poRef: e.target.value }))} placeholder="E.g., PO/2025/01234" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Contact Person</label>
                      <input value={createForm.contactPerson} onChange={(e) => setCreateForm(prev => ({ ...prev, contactPerson: e.target.value }))} placeholder="E.g., Mr. Rakesh Sharma" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Contact Phone</label>
                      <input value={createForm.contactPhone} onChange={(e) => setCreateForm(prev => ({ ...prev, contactPhone: e.target.value }))} placeholder="E.g., +91 98765 43210" className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 block mb-2">Full Shipping Address</label>
                    <textarea value={createForm.shippingAddress} onChange={(e) => setCreateForm(prev => ({ ...prev, shippingAddress: e.target.value }))} rows="2" placeholder="Site address for material delivery..." className="w-full px-5 py-4 rounded-xl sm:rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition shadow-sm resize-none" />
                  </div>
                </div>
              </div>

              <div className="mt-10 sm:mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-slate-500 italic">Consignment Materials Checklist</h3>
                  <button type="button" onClick={handleAddMaterialRow} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95">+ Add Row</button>
                </div>

                <div className="space-y-4">
                  {createForm.materialRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Description</label>
                        <input value={row.description} onChange={(e) => handleCreateMaterialChange(rowIndex, 'description', e.target.value)} placeholder="E.g., Air Handling Unit" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-400" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Item Code</label>
                        <input value={row.itemCode} onChange={(e) => handleCreateMaterialChange(rowIndex, 'itemCode', e.target.value)} placeholder="E.g., ACU-02" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-400" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">HSN Code</label>
                        <input value={row.hsnCode} onChange={(e) => handleCreateMaterialChange(rowIndex, 'hsnCode', e.target.value)} placeholder="8415" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-400" />
                      </div>
                      <div className="lg:col-span-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Qty</label>
                        <input value={row.qty} onChange={(e) => handleCreateMaterialChange(rowIndex, 'qty', e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-400" />
                      </div>
                      <div className="lg:col-span-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Unit</label>
                        <input value={row.unit} onChange={(e) => handleCreateMaterialChange(rowIndex, 'unit', e.target.value)} placeholder="pcs" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-400" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Rate (₹)</label>
                        <input value={row.rate} onChange={(e) => handleCreateMaterialChange(rowIndex, 'rate', e.target.value)} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-indigo-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 sm:mt-12">
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-4">Supporting Documentation</div>
                <div className="relative rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 sm:p-12 text-center hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer">
                  <input type="file" multiple onChange={handleCreateFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="mx-auto inline-flex flex-col items-center justify-center gap-4 text-slate-400">
                    <div className="h-14 w-14 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600">
                      <Plus size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base font-black text-slate-700">Drop files or click to browse</div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">E-WAY BILL, PHOTOS, GATE PASS (MAX 5MB)</div>
                    </div>
                  </div>
                </div>
                {createForm.files.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {createForm.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-white shadow-sm animate-in slide-in-from-top-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{file.name}</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-10 sm:mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition order-2 sm:order-1">Cancel</button>
                <button type="button" onClick={handleCreateSave} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-200 active:scale-95 order-1 sm:order-2">Register & Queue Dispatch</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setReceiptOpen(false)}></div>
          <div id="delivery-receipt" className="relative bg-white w-full sm:max-w-[1100px] sm:w-[95vw] shadow-2xl overflow-hidden border-x sm:border border-slate-300 h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto rounded-none sm:rounded-[2.5rem]">
            {/* Receipt Header Edit Bar */}
            <div className="bg-slate-100 border-b-2 border-slate-300 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 print:hidden sticky top-0 z-[100]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Receipt Customization</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">Print Receipt</button>
                <button onClick={() => setReceiptOpen(false)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition border border-slate-200 shadow-sm"><XCircle size={20} /></button>
              </div>
            </div>

            <div className="relative z-0 p-4 sm:p-10 print:p-8 space-y-6 print:space-y-4 print:border-2 print:border-slate-800 print:h-[calc(100vh-10mm)] print:rounded-sm print:flex print:flex-col">
              {/* WATERMARK */}
              {receiptConfig.logoSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1] opacity-[0.1]">
                  <img src={receiptConfig.logoSrc} alt="watermark" className="w-[70%] max-h-[70%] object-contain grayscale" />
                </div>
              )}
              {/* HEADER: Logo, Company Info, Title, and Challan Details */}
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                {/* Left: Logo and Company Info */}
                <div className="flex flex-col sm:flex-row items-start gap-5 flex-[1.5] w-full lg:w-auto">
                  <label className="group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-slate-200 print:border-none flex items-center justify-center overflow-hidden bg-slate-50 print:bg-transparent cursor-pointer hover:bg-slate-100 transition relative flex-shrink-0 shadow-inner">
                    {receiptConfig.logoSrc ? (
                      <>
                        <img src={receiptConfig.logoSrc} alt="Logo" className="h-full w-full object-contain p-2 print:p-0" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center print:hidden">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-400 text-center px-1 print:hidden">Add Logo</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleReceiptLogoSelect} className="hidden" />
                  </label>
                  <div className="flex-1 w-full sm:min-w-0">
                    <input
                      value={receiptConfig.companyName}
                      onChange={(e) => setReceiptConfig(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full text-lg sm:text-xl font-black text-slate-900 bg-white print:bg-transparent border-2 border-transparent hover:border-slate-200 print:border-none rounded-lg px-1 outline-none transition mb-2 truncate"
                    />
                    <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <textarea
                        value={receiptConfig.address}
                        onChange={(e) => setReceiptConfig(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full font-bold resize-none bg-transparent outline-none border border-transparent hover:border-slate-200 print:border-none rounded px-1 -ml-1"
                        rows="2"
                      />
                      <div className="flex items-center gap-2"><span className="font-black text-slate-400 uppercase tracking-tighter w-12">Phone</span> <input type="text" value={receiptConfig.phone} onChange={e => setReceiptConfig(prev => ({...prev, phone: e.target.value}))} className="flex-1 bg-transparent outline-none border border-transparent hover:border-slate-200 print:border-none rounded px-1" /></div>
                      <div className="flex items-center gap-2"><span className="font-black text-slate-400 uppercase tracking-tighter w-12">Email</span> <input type="text" value={receiptConfig.email} onChange={e => setReceiptConfig(prev => ({...prev, email: e.target.value}))} className="flex-1 bg-transparent outline-none border border-transparent hover:border-slate-200 print:border-none rounded px-1" /></div>
                      <div className="flex items-center gap-2"><span className="font-black text-slate-400 uppercase tracking-tighter w-12">GSTIN</span> <input type="text" value={receiptConfig.gstin} onChange={e => setReceiptConfig(prev => ({...prev, gstin: e.target.value}))} className="flex-1 bg-transparent outline-none border border-transparent hover:border-slate-200 print:border-none rounded px-1" /></div>
                    </div>
                  </div>
                </div>

                {/* Right: Challan Info */}
                <div className="flex-1 text-left lg:text-right w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight italic">DELIVERY CHALLAN</div>
                  <div className="mt-4 lg:ml-auto inline-block text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest">Number</span>
                        <span className="font-bold text-slate-900">{selected.challanNumber || selected.id}</span>
                        <span className="font-black text-slate-400 uppercase tracking-widest">Date</span>
                        <span className="font-bold text-slate-900">{selected.dispatchDate || ''}</span>
                        <span className="font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <span className="font-black text-emerald-600 uppercase tracking-widest">{selected.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID: Clean format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-8 border-y-2 border-slate-50">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</span>
                    <span className="text-sm font-black text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.client}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</span>
                    <span className="text-sm font-bold text-slate-700 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.project}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supply Area</span>
                    <span className="text-sm font-bold text-slate-600 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.placeOfSupply || 'Internal Depot'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Delivery Site</span>
                    <span className="text-sm font-bold text-slate-600 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.shippingAddress || 'Not specified'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Ref</span>
                    <span className="text-sm font-black text-blue-600 flex-1 sm:border-l sm:pl-4 border-slate-100">#{selected.invoiceRef || 'DRAFT-001'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">PO / Ref No</span>
                    <span className="text-sm font-bold text-slate-700 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.poRef || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Date</span>
                    <span className="text-sm font-bold text-slate-600 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.poDate || 'TBD'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Via</span>
                    <span className="text-sm font-black text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100 uppercase tracking-tight italic">{selected.shipVia || 'SURFACE TRANSPORT'}</span>
                  </div>
                </div>
              </div>

              {/* MATERIALS TABLE */}
              <div className="py-4">
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        <th className="py-4 px-4 w-[5%] text-center">#</th>
                        <th className="py-4 px-4 w-[40%]">Item Description</th>
                        <th className="py-4 px-4 w-[15%]">Code / HSN</th>
                        <th className="py-4 px-4 w-[15%] text-center">Qty / Unit</th>
                        <th className="py-4 px-4 w-[25%] text-right">Valuation (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selected.materialRows?.length ? selected.materialRows : [{ description: 'Material goods delivered', itemCode: 'MTL-001', hsnCode: '8415', qty: selected.itemsQty || 1, unit: 'Nos', rate: selected.itemsQty ? (selected.materialValue / selected.itemsQty).toFixed(2) : selected.materialValue || 0, remarks: 'Main delivery' }]).map((row, idx) => {
                        const amount = Number(row.qty || 0) * Number(row.rate || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 text-xs text-slate-400 font-black text-center">{idx + 1}</td>
                            <td className="py-4 px-4">
                              <div className="font-black text-slate-800 uppercase tracking-tight text-xs sm:text-sm">{row.description}</div>
                              {row.remarks && <div className="text-[10px] text-slate-400 mt-1 italic">{row.remarks}</div>}
                            </td>
                            <td className="py-4 px-4 text-xs font-bold text-slate-500">{row.itemCode || row.hsnCode || '--'}</td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-black text-slate-900">{row.qty}</span>
                              <span className="text-[10px] font-black text-slate-400 ml-1 uppercase">{row.unit}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="font-black text-slate-900">₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">@ ₹{Number(row.rate).toLocaleString()}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center py-6 px-2 gap-6">
                  <div className="flex-1 max-w-md">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount in Words</span>
                    <div className="text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    {(() => {
                      const amount = selected.materialValue || 0;
                      const crores = Math.floor(amount / 10000000);
                      const lakhs = Math.floor((amount % 10000000) / 100000);
                      const thousands = Math.floor((amount % 100000) / 1000);
                      const hundreds = Math.floor(amount % 1000);
                      const words = [];
                      if (crores > 0) words.push(`${crores} Crore${crores > 1 ? 's' : ''}`);
                      if (lakhs > 0) words.push(`${lakhs} Lakh${lakhs > 1 ? 's' : ''}`);
                      if (thousands > 0) words.push(`${thousands} Thousand`);
                      if (hundreds > 0) words.push(`${hundreds} Rupees`);
                      return words.length > 0 ? words.join(' ') + ' Only' : 'Zero Rupees Only';
                    })()}
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-center sm:min-w-[200px] p-6 bg-slate-900 rounded-[1.5rem] shadow-xl shadow-slate-200">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Grand Total</span>
                    <div className="text-2xl font-black text-white tracking-tighter italic">₹{selected.materialValue?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                  </div>
                </div>
              </div>

              {/* FOOTER: Transport & Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-8 pt-10 border-t-2 border-slate-50 print:mt-auto">
                <div className="md:col-span-1 flex flex-col space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">Transit Protocol</span>
                  <div className="flex flex-col text-xs space-y-2.5 text-slate-600 px-1">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="font-black text-slate-400 uppercase text-[9px] tracking-widest">Mode</span> <span className="font-bold">{selected.shipVia || 'ROAD'}</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="font-black text-slate-400 uppercase text-[9px] tracking-widest">Vehicle</span> <span className="font-bold">{selected.vehicleNumber || '--'}</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="font-black text-slate-400 uppercase text-[9px] tracking-widest">LR No</span> <span className="font-bold">{selected.lrGatePass || '--'}</span></div>
                    <div className="flex justify-between"><span className="font-black text-slate-400 uppercase text-[9px] tracking-widest">E-Way</span> <span className="font-bold truncate max-w-[100px]">{selected.eWayBill || '--'}</span></div>
                  </div>
                </div>

                <div className="md:col-span-1 flex flex-col justify-end">
                  <div className="h-20 border-b-2 border-slate-100 w-full mb-3 flex items-end justify-center relative">
                     <span className="absolute bottom-1 text-[8px] font-black text-slate-200 uppercase tracking-[0.5em]">Seal &amp; Signature</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Dispatch Authorized</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{receiptConfig.companyName}</div>
                </div>

                <div className="md:col-span-1 flex flex-col justify-end">
                  <div className="h-20 border-b-2 border-slate-100 w-full mb-3 flex items-end justify-center relative">
                     <span className="absolute bottom-1 text-[8px] font-black text-slate-200 uppercase tracking-[0.5em]">Received Copy</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Consignee Receipt</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Received in good condition</div>
                </div>

                <div className="md:col-span-1 flex flex-col items-center justify-end">
                  <div className="w-24 h-24 rounded-3xl border-2 border-slate-50 flex items-center justify-center bg-slate-50/50 border-dashed">
                    <Truck size={32} className="text-slate-200" />
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3">Company Stamp</div>
                </div>
              </div>

              <div className="text-center text-[10px] font-bold text-slate-400 pt-10 border-t border-slate-50 uppercase tracking-[0.2em]">
                Verified consignment for industrial logistics. Electronic copy generated via TenderPro Portal.
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 print:hidden border-t border-slate-100 pt-6">
                <button onClick={() => setReceiptOpen(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition order-2 sm:order-1">Discard</button>
                <button onClick={() => window.print()} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-xl active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2">
                  <Printer size={16} />
                  Print Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'TOTAL CHALLANS', value: totalChallans, sub: 'ALL CONSIGNMENTS', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'DELIVERED', value: deliveredCount, sub: 'COMPLETED TRANSITS', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'IN TRANSIT', value: transitCount, sub: 'ACTIVE ON ROAD', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'PENDING', value: pendingCount, sub: 'AWAITING DISPATCH', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'ITEMS DISPATCHED', value: totalItems, sub: 'UNIT COUNT TOTAL', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-100 flex flex-col items-start group hover:shadow-md transition-all duration-300">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3 transition-transform group-hover:scale-105`}>
              <stat.icon size={18} />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{stat.label}</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight block leading-none">{stat.value}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block mt-1 leading-none">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight uppercase">Delivery Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[8.5px] sm:text-[9.5px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-5 sm:px-8 py-3.5">Reference</th>
                <th className="px-5 sm:px-8 py-3.5">Client / Project</th>
                <th className="px-5 sm:px-8 py-3.5">Transporter</th>
                <th className="px-5 sm:px-8 py-3.5 hidden md:table-cell">LR &amp; Gate Pass</th>
                <th className="px-5 sm:px-8 py-3.5">Date</th>
                <th className="px-5 sm:px-8 py-3.5 text-right">Value (₹)</th>
                <th className="px-5 sm:px-8 py-3.5 text-center">Status</th>
                <th className="px-5 sm:px-8 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredChallans.length > 0 ? filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                  <td className="px-5 sm:px-8 py-4 font-black text-slate-900 text-xs sm:text-sm">{challan.challanNumber || challan.id}</td>
                  <td className="px-5 sm:px-8 py-4">
                    <div className="font-black text-slate-800 uppercase tracking-tight text-xs sm:text-sm">{challan.client}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[200px]">{challan.project}</div>
                  </td>
                  <td className="px-5 sm:px-8 py-4 text-slate-700 font-bold text-xs">{challan.transporter}</td>
                  <td className="px-5 sm:px-8 py-4 text-slate-500 font-medium text-xs hidden md:table-cell italic">{challan.lrGatePass}</td>
                  <td className="px-5 sm:px-8 py-4 text-slate-600 font-bold text-xs">{challan.dispatchDate}</td>
                  <td className="px-5 sm:px-8 py-4 font-black text-slate-900 text-xs sm:text-sm text-right">₹{challan.materialValue.toLocaleString()}</td>
                  <td className="px-5 sm:px-8 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider ${statusClasses[challan.status] || 'bg-slate-400 text-white'}`}>
                      {challan.status}
                    </span>
                  </td>
                  <td className="px-5 sm:px-8 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleDetails(challan)} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all" title="Details"><Search size={15} /></button>
                      <button onClick={() => handlePrintOpen(challan)} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-all" title="Print Receipt"><Printer size={15} /></button>
                      <button onClick={() => handleEdit(challan)} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all" title="Edit Record"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(challan.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all" title="Delete Record"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-5 sm:px-8 py-12 text-center text-slate-400 font-bold italic">No consignment records located</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
