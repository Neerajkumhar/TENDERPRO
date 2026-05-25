import React, { useState } from 'react';
import { Search, Plus, Download, Filter, Truck, Edit, Printer } from 'lucide-react';

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
  const [challans, setChallans] = useState(() => {
    const saved = localStorage.getItem('delivery_challans');
    return saved ? JSON.parse(saved) : mockChallans;
  });
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
    return [challan.id, challan.client, challan.project, challan.shipVia, challan.status]
      .some(field => String(field).toLowerCase().includes(query));
  });

  const totalChallans = challans.length;
  const deliveredCount = challans.filter(c => c.status === 'DELIVERED').length;
  const transitCount = challans.filter(c => c.status === 'IN TRANSIT').length;
  const pendingCount = challans.filter(c => c.status === 'PENDING').length;
  const totalItems = challans.reduce((sum, c) => sum + (c.itemsQty || 0), 0);

  const handleExportCSV = () => {
    if (filteredChallans.length === 0) {
      alert('No challans to export');
      return;
    }
    const headers = ['Challan No.', 'Client / Project', 'Dispatch', 'Received', 'Ship Via', 'Items Qty', 'Est. Weight', 'Signed Copy', 'Status'];
    const rows = filteredChallans.map(c => [c.id, `${c.client} / ${c.project}`, c.dispatchDate, c.receivedDate, c.shipVia, c.itemsQty, c.estWeight, c.signedCopy, c.status]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `delivery_challans_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleCreateSave = () => {
    const newId = `DEL-${new Date().getFullYear()}-${String(challans.length + 1).padStart(3, '0')}`;
    const newChallan = {
      id: newId,
      client: createForm.client,
      project: createForm.project,
      transporter: createForm.transporter,
      lrGatePass: createForm.lrNo,
      dispatchDate: createForm.dispatchDate,
      materialValue: Number(createForm.materialRows.reduce((sum, row) => sum + (Number(row.rate || 0) * Number(row.qty || 0)), 0)),
      eWayBill: createForm.ewayBill,
      status: 'PENDING',
      shipVia: createForm.transporter,
      itemsQty: Number(createForm.materialRows.reduce((sum, row) => sum + (Number(row.qty || 0)), 0)),
      estWeight: '',
      signedCopy: createForm.files.length > 0 ? 'Uploaded' : 'Pending',
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
      materialRows: createForm.materialRows,
      files: createForm.files
    };
    const updatedArr = [...challans, newChallan];
    setChallans(updatedArr);
    try { localStorage.setItem('delivery_challans', JSON.stringify(updatedArr)); } catch (e) {}
    setCreateOpen(false);
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

  const handleSave = (updated) => {
    const updatedArr = challans.map(c => c.id === updated.id ? updated : c);
    setChallans(updatedArr);
    try { localStorage.setItem('delivery_challans', JSON.stringify(updatedArr)); } catch (e) {}
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#f8fafc]">
      <div className="bg-white p-4 sm:px-8 sm:py-6 rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-slate-200/30 border border-slate-100 mb-6 sm:mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">Dispatch & Delivery</p>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase tracking-tight text-slate-900">Delivery Challans</h1>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px] xl:w-[420px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challans..."
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] hover:bg-slate-800 transition">
                <Filter size={16} />
                <span className="hidden xs:inline">Filters</span>
                <span className="xs:hidden">Filter</span>
              </button>
              <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] hover:bg-slate-50 transition">
                <Download size={16} />
                <span>CSV</span>
              </button>
            </div>
            <button onClick={() => {
              setCreateForm({ ...defaultDeliveryForm });
              setCreateOpen(true);
              setModalOpen(false);
            }} className="flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-blue-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">
              <Plus size={18} />
              <span>New Challan</span>
            </button>
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
                <div className="mt-1.5 sm:mt-2 font-black text-slate-900">{selected.id}</div>
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
          <div id="delivery-receipt" className="relative bg-white w-full max-w-[1100px] shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] overflow-y-auto rounded-3xl">
            {/* Receipt Header Edit Bar */}
            <div className="bg-slate-100 border-b-2 border-slate-300 p-4 flex items-center justify-between print:hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Receipt Customization</div>
              <button onClick={() => setReceiptOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>

            <div className="relative z-0 p-6 sm:p-10 print:p-8 space-y-6 print:space-y-4 print:border-2 print:border-slate-800 print:h-[calc(100vh-10mm)] print:rounded-sm print:flex print:flex-col">
              {/* WATERMARK */}
              {receiptConfig.logoSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1] opacity-[0.1]">
                  <img src={receiptConfig.logoSrc} alt="watermark" className="w-[70%] max-h-[70%] object-contain grayscale" />
                </div>
              )}
              {/* HEADER: Logo, Company Info, Title, and Challan Details */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
                {/* Left: Logo and Company Info */}
                <div className="flex items-start gap-5 flex-[1.5] w-full sm:w-auto">
                  <label className="group w-24 h-24 rounded-2xl border-2 border-slate-200 print:border-none flex items-center justify-center overflow-hidden bg-slate-50 print:bg-transparent cursor-pointer hover:bg-slate-100 transition relative flex-shrink-0 shadow-inner">
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
                  <div className="flex-1 min-w-0">
                    <input
                      value={receiptConfig.companyName}
                      onChange={(e) => setReceiptConfig(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full text-xl font-black text-slate-900 bg-white print:bg-transparent border-2 border-transparent hover:border-slate-200 print:border-none rounded-lg px-1 outline-none transition mb-2 truncate"
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
                <div className="flex-1 text-left sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-2xl font-black text-blue-600 tracking-tight italic">DELIVERY CHALLAN</div>
                  <div className="mt-4 sm:ml-auto inline-block text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest">Number</span>
                        <span className="font-bold text-slate-900">{selected.id}</span>
                        <span className="font-black text-slate-400 uppercase tracking-widest">Date</span>
                        <span className="font-bold text-slate-900">{selected.dispatchDate || ''}</span>
                        <span className="font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <span className="font-black text-emerald-600 uppercase tracking-widest">{selected.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID: Clean format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y-2 border-slate-50">
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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5 mb-6 sm:mb-8">
        {[
          { label: 'TOTAL CHALLANS', value: totalChallans, highlight: 'text-slate-900' },
          { label: 'DELIVERED', value: deliveredCount, highlight: 'text-emerald-600' },
          { label: 'IN TRANSIT', value: transitCount, highlight: 'text-blue-600' },
          { label: 'PENDING', value: pendingCount, highlight: 'text-amber-600' },
          { label: 'ITEMS DISPATCHED', value: totalItems, highlight: 'text-slate-900' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 p-4 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.35em] text-slate-400 group-hover:text-blue-500 transition-colors">{stat.label}</span>
            <div className={`mt-3 sm:mt-4 text-2xl sm:text-3xl font-black ${stat.highlight} tracking-tighter`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
        <div className="p-5 sm:px-8 sm:py-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight italic">Delivery Ledger</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Monitor active dispatches and signed proof of delivery.</p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 w-fit">Showing {filteredChallans.length} records</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest sm:tracking-[0.35em] text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">Reference</th>
                <th className="px-6 py-5">Client / Project</th>
                <th className="px-6 py-5">Transporter</th>
                <th className="px-6 py-5 hidden md:table-cell">LR &amp; Gate Pass</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Value (₹)</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChallans.length > 0 ? filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-5 font-black text-slate-900 text-xs sm:text-sm">{challan.id}</td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800 uppercase tracking-tight text-xs sm:text-sm">{challan.client}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[200px]">{challan.project}</div>
                  </td>
                  <td className="px-6 py-5 text-slate-700 font-bold text-xs">{challan.transporter}</td>
                  <td className="px-6 py-5 text-slate-500 font-medium text-xs hidden md:table-cell italic">{challan.lrGatePass}</td>
                  <td className="px-6 py-5 text-slate-600 font-bold text-xs">{challan.dispatchDate}</td>
                  <td className="px-6 py-5 font-black text-slate-900 text-xs sm:text-sm text-right">₹{challan.materialValue.toLocaleString()}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm ${statusClasses[challan.status] || 'bg-slate-400 text-white'}`}>
                      {challan.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDetails(challan)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition shadow-sm" title="Details"><Search size={16} /></button>
                          <button onClick={() => handlePrintOpen(challan)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition shadow-sm" title="Print Receipt"><Printer size={16} /></button>
                          <button onClick={() => handleEdit(challan)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm" title="Edit Record"><Edit size={16} /></button>
                        </div>
                        <div className="group-hover:hidden">
                           <Truck size={18} className="text-slate-200 ml-auto" />
                        </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-black italic uppercase tracking-widest text-[10px]">No consignment records located</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallan;
