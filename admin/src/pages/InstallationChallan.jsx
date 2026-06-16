import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportModal from '../components/ExportModal';
import { Search, Plus, Download, Filter, Truck, Edit, Printer, XCircle, X, Trash2 } from 'lucide-react';

const mockChallans = [
  { id: 'INST-2026-001', client: 'Acme Corp.', project: 'Solar Substation', siteEngineer: 'Rajesh Sharma', installationDate: '2026-05-02', itemsQty: 43, estValuation: 12850, signedCopy: 'Uploaded', billingStatus: 'Pending Billing' },
  { id: 'INST-2026-002', client: 'Global Ltd.', project: 'Data Center Retrofit', siteEngineer: 'Amit Verma', installationDate: '2026-05-08', itemsQty: 21, estValuation: 9180, signedCopy: 'Uploaded', billingStatus: 'Invoiced' },
  { id: 'INST-2026-003', client: 'Rajasthan Govt', project: 'Smart Classroom Setup', siteEngineer: 'Sunita Meena', installationDate: '2026-05-12', itemsQty: 45, estValuation: 35250, signedCopy: 'Pending', billingStatus: 'Pending Billing' },
];

const billingClasses = {
  'Pending Billing': 'bg-amber-400 text-slate-900',
  Invoiced: 'bg-emerald-500 text-white',
  Draft: 'bg-slate-400 text-white'
};

const defaultInstallationForm = {
  client: '',
  project: '',
  installationDate: '',
  siteEngineer: '',
  installationType: '',
  siteAddress: '',
  supervisorName: '',
  contactPerson: '',
  contactPhone: '',
  invoiceRef: '',
  poRef: '',
  poDate: '',
  materialRows: [{ description: '', itemCode: '', hsnCode: '', qty: '', unit: 'pcs', rate: '', remarks: '' }],
  files: []
};

const InstallationChallan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallans = async () => {
    try {
      const response = await fetch('/api/installation-challans');
      if (response.ok) {
        const data = await response.json();
        setChallans(data);
      }
    } catch (error) {
      console.error('Error fetching installation challans:', error);
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
  const [createForm, setCreateForm] = useState(() => ({ ...defaultInstallationForm }));
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptConfig, setReceiptConfig] = useState({
    companyName: 'TENDERPRO SOLUTIONS PVT. LTD.',
    logoSrc: '',
    address: 'B-501, Corporate Heights, Sector 62, Noida, Uttar Pradesh - 201309, India',
    phone: '+91 120 456 7890',
    email: 'info@tenderpro.com',
    gstin: '09AABCT1234A1Z5',
    pan: 'AABCT1234A'
  });

  const filteredChallans = challans.filter(challan => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = [challan.challanNumber || challan.id, challan.client, challan.project, challan.siteEngineer, challan.billingStatus]
      .some(field => String(field).toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'ALL' || challan.billingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalChallans = challans.length;
  const invoicedCount = challans.filter(c => c.billingStatus === 'Invoiced').length;
  const pendingBillingCount = challans.filter(c => c.billingStatus === 'Pending Billing').length;
  const draftCount = challans.filter(c => c.billingStatus === 'Draft').length;
  const totalInstalledValue = challans.reduce((sum, c) => sum + (c.estValuation || 0), 0);

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const exportData = filteredChallans.filter(challan => {
      const date = new Date(challan.installationDate);
      return date >= start && date <= end;
    });

    if (exportData.length === 0) {
      alert('No challans matched the selected time period.');
      return;
    }

    const filename = `Installation_Challans_${startDate}_to_${endDate}`;

    if (format === 'xlsx') {
      const exportRows = exportData.map(c => ({
        "Challan No.": c.id,
        "Client": c.client,
        "Project": c.project,
        "Site Engineer": c.siteEngineer,
        "Installation Date": c.installationDate,
        "Items Qty": c.itemsQty,
        "Est. Valuation": c.estValuation,
        "Billing Status": c.billingStatus
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Challans");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Installation Challans Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
      
      const rows = exportData.map(c => [
        c.id, 
        `${c.client} / ${c.project}`, 
        c.siteEngineer, 
        c.installationDate, 
        c.itemsQty, 
        `₹${c.estValuation}`, 
        c.billingStatus
      ]);
      
      autoTable(doc, {
        startY: 35,
        head: [["Challan No.", "Client / Project", "Site Engineer", "Date", "Qty", "Valuation", "Status"]],
        body: rows,
      });
      doc.save(`${filename}.pdf`);
    } else if (format === 'csv') {
      const headers = ['Challan No.', 'Client / Project', 'Site Engineer', 'Installation Date', 'Items Qty', 'Est. Valuation', 'Billing Status'];
      const rows = exportData.map(c => [c.id, `${c.client} / ${c.project}`, c.siteEngineer, c.installationDate, c.itemsQty, `₹${c.estValuation}`, c.billingStatus]);
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
      client: createForm.client,
      project: createForm.project,
      installationDate: createForm.installationDate,
      siteEngineer: createForm.siteEngineer,
      installationType: createForm.installationType,
      siteAddress: createForm.siteAddress,
      supervisorName: createForm.supervisorName,
      contactPerson: createForm.contactPerson,
      contactPhone: createForm.contactPhone,
      invoiceRef: createForm.invoiceRef,
      poRef: createForm.poRef,
      poDate: createForm.poDate,
      materialRows: createForm.materialRows,
      billingStatus: 'Draft'
    };

    try {
      const response = await fetch('/api/installation-challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchChallans();
        setCreateOpen(false);
      } else {
        alert('Failed to register installation challan');
      }
    } catch (error) {
      console.error('Error creating installation challan:', error);
      alert('Network error registering installation challan');
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
      const response = await fetch(`/api/installation-challans/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        fetchChallans();
        setModalOpen(false);
      } else {
        alert('Failed to update installation challan');
      }
    } catch (error) {
      console.error('Error updating installation challan:', error);
      alert('Network error updating installation challan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this installation challan?')) {
      try {
        const response = await fetch(`/api/installation-challans/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchChallans();
        } else {
          alert('Failed to delete installation challan');
        }
      } catch (error) {
        console.error('Error deleting installation challan:', error);
        alert('Network error deleting installation challan');
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

  return (
    <div className="p-8 min-h-screen bg-[#f8fafc]">
      <div className="bg-white px-8 py-6 rounded-[2rem] shadow-2xl shadow-slate-200/30 border border-slate-100 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-2">Field Audits & Inventory</p>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tight text-slate-900">Installation Challans</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[420px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challans, projects..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition"
              >
                <Filter size={16} />
                <span>{statusFilter === 'ALL' ? 'Filters' : statusFilter}</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  {['ALL', 'Draft', 'Pending Billing', 'Invoiced'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
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
            <button onClick={() => setIsExportModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition">
              <Download size={16} />
              Export Report
            </button>
            <button onClick={() => {
              setCreateForm({ ...defaultInstallationForm });
              setCreateOpen(true);
              setModalOpen(false);
            }} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition">
              <Plus size={16} />
              New Challan
            </button>
          </div>
        </div>
      </div>
      {modalOpen && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[1.5rem] shadow-2xl z-70">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xl font-black text-slate-900">{isEditing ? 'Edit Challan' : 'Challan Details'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Client</label>
                {isEditing ? (
                  <input value={selected.client} onChange={e => setSelected({...selected, client: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2 font-black text-slate-900">{selected.client}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Project</label>
                {isEditing ? (
                  <input value={selected.project} onChange={e => setSelected({...selected, project: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2 font-black text-slate-900">{selected.project}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Site Engineer</label>
                {isEditing ? (
                  <input value={selected.siteEngineer} onChange={e => setSelected({...selected, siteEngineer: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.siteEngineer}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Installation Date</label>
                {isEditing ? (
                  <input type="date" value={selected.installationDate} onChange={e => setSelected({...selected, installationDate: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.installationDate}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Items Qty</label>
                {isEditing ? (
                  <input type="number" value={selected.itemsQty} onChange={e => setSelected({...selected, itemsQty: Number(e.target.value)})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.itemsQty} units</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Est. Valuation</label>
                {isEditing ? (
                  <input type="number" value={selected.estValuation} onChange={e => setSelected({...selected, estValuation: Number(e.target.value)})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2 font-black">₹{selected.estValuation.toLocaleString()}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Billing Status</label>
                {isEditing ? (
                  <input value={selected.billingStatus} onChange={e => setSelected({...selected, billingStatus: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.billingStatus}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Signed Copy</label>
                {isEditing ? (
                  <input value={selected.signedCopy} onChange={e => setSelected({...selected, signedCopy: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.signedCopy}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Installation Type</label>
                {isEditing ? (
                  <input value={selected.installationType} onChange={e => setSelected({...selected, installationType: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.installationType}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Site Address</label>
                {isEditing ? (
                  <input value={selected.siteAddress} onChange={e => setSelected({...selected, siteAddress: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.siteAddress}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Supervisor Name</label>
                {isEditing ? (
                  <input value={selected.supervisorName} onChange={e => setSelected({...selected, supervisorName: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.supervisorName}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Contact Person</label>
                {isEditing ? (
                  <input value={selected.contactPerson} onChange={e => setSelected({...selected, contactPerson: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.contactPerson}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Contact Phone</label>
                {isEditing ? (
                  <input value={selected.contactPhone} onChange={e => setSelected({...selected, contactPhone: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.contactPhone}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Invoice Ref</label>
                {isEditing ? (
                  <input value={selected.invoiceRef} onChange={e => setSelected({...selected, invoiceRef: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.invoiceRef}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">PO Ref</label>
                {isEditing ? (
                  <input value={selected.poRef} onChange={e => setSelected({...selected, poRef: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.poRef}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">PO Date</label>
                {isEditing ? (
                  <input type="date" value={selected.poDate} onChange={e => setSelected({...selected, poDate: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.poDate}</div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                {isEditing ? (
                  <input value={selected.status} onChange={e => setSelected({...selected, status: e.target.value})} className="w-full mt-2 p-3 border rounded-2xl" />
                ) : (
                  <div className="mt-2">{selected.status}</div>
                )}
              </div>
            </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-slate-50 rounded-b-[1.5rem]">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition">Close</button>
              {isEditing && (
                <button onClick={() => handleSave(selected)} className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Save Changes</button>
              )}
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCreateOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[1120px] rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-500 mb-2">New Site Installation</p>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">Create Installation Challan</h2>
                </div>
                <button onClick={() => setCreateOpen(false)} className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Consignee Client Name</label>
                  <input value={createForm.client} onChange={(e) => setCreateForm(prev => ({ ...prev, client: e.target.value }))} placeholder="Enter client organisation" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Installation Date</label>
                  <input type="date" value={createForm.installationDate} onChange={(e) => setCreateForm(prev => ({ ...prev, installationDate: e.target.value }))} className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Site Engineer</label>
                  <input value={createForm.siteEngineer} onChange={(e) => setCreateForm(prev => ({ ...prev, siteEngineer: e.target.value }))} placeholder="Enter site engineer name" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Supervisor Name</label>
                  <input value={createForm.supervisorName} onChange={(e) => setCreateForm(prev => ({ ...prev, supervisorName: e.target.value }))} placeholder="Enter supervisor name" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Invoice Reference</label>
                  <input value={createForm.invoiceRef} onChange={(e) => setCreateForm(prev => ({ ...prev, invoiceRef: e.target.value }))} placeholder="E.g., INV/2025/0456" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Tender / Project Name</label>
                  <input value={createForm.project} onChange={(e) => setCreateForm(prev => ({ ...prev, project: e.target.value }))} placeholder="Enter associated project/tender" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Site Address</label>
                  <input value={createForm.siteAddress} onChange={(e) => setCreateForm(prev => ({ ...prev, siteAddress: e.target.value }))} placeholder="E.g., Site A, Phase 2, Gurugram" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Contact Person Name</label>
                  <input value={createForm.contactPerson} onChange={(e) => setCreateForm(prev => ({ ...prev, contactPerson: e.target.value }))} placeholder="E.g., Mr. Rakesh Sharma" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">PO / Reference No</label>
                  <input value={createForm.poRef} onChange={(e) => setCreateForm(prev => ({ ...prev, poRef: e.target.value }))} placeholder="E.g., PO/2025/01234" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Contact Phone</label>
                  <input value={createForm.contactPhone} onChange={(e) => setCreateForm(prev => ({ ...prev, contactPhone: e.target.value }))} placeholder="E.g., +91 98765 43210" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">PO Date</label>
                  <input type="date" value={createForm.poDate} onChange={(e) => setCreateForm(prev => ({ ...prev, poDate: e.target.value }))} className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />

                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Installation Type</label>
                  <input value={createForm.installationType || ''} onChange={(e) => setCreateForm(prev => ({ ...prev, installationType: e.target.value }))} placeholder="E.g., Equipment Fixing, Commissioning" className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition" />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Installation Site Supervisor</label>
                  <input hidden />
                </div>
              </div>

              <div className="mt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">Materials Checklist</h3>
                  <button type="button" onClick={handleAddMaterialRow} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition">+ Add Material Row</button>
                </div>

                <div className="space-y-3">
                  {createForm.materialRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-12 gap-3 bg-slate-50 rounded-[1.5rem] p-4">
                      <input value={row.description} onChange={(e) => handleCreateMaterialChange(rowIndex, 'description', e.target.value)} placeholder="E.g., Cable Tray" className="col-span-12 lg:col-span-4 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                      <input value={row.itemCode} onChange={(e) => handleCreateMaterialChange(rowIndex, 'itemCode', e.target.value)} placeholder="E.g., CT-01" className="col-span-6 lg:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                      <input value={row.hsnCode} onChange={(e) => handleCreateMaterialChange(rowIndex, 'hsnCode', e.target.value)} placeholder="8415" className="col-span-6 lg:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                      <input value={row.qty} onChange={(e) => handleCreateMaterialChange(rowIndex, 'qty', e.target.value)} placeholder="0" className="col-span-6 lg:col-span-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                      <input value={row.unit} onChange={(e) => handleCreateMaterialChange(rowIndex, 'unit', e.target.value)} placeholder="pcs" className="col-span-6 lg:col-span-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                      <input value={row.rate} onChange={(e) => handleCreateMaterialChange(rowIndex, 'rate', e.target.value)} placeholder="0" className="col-span-6 lg:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                      <input value={row.remarks} onChange={(e) => handleCreateMaterialChange(rowIndex, 'remarks', e.target.value)} placeholder="--" className="col-span-6 lg:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-3">Installation Documentation (Optional)</div>
                <div className="relative rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <input type="file" multiple onChange={handleCreateFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="mx-auto inline-flex flex-col items-center justify-center gap-3 text-slate-500">
                    <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600">+</div>
                    <div className="text-sm font-black">Drag & drop or click to upload</div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Supports PDF, PNG, JPG (Max 10MB)</div>
                  </div>
                </div>
                {createForm.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {createForm.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white">
                        <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                        <span className="text-[11px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={() => setCreateOpen(false)} className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-200 text-slate-700 font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition">Cancel</button>
                <button type="button" onClick={handleCreateSave} className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition">Register Installation</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8">
        {[
          { label: 'TOTAL CHALLANS', value: totalChallans, highlight: 'text-slate-900' },
          { label: 'INVOICED', value: invoicedCount, highlight: 'text-emerald-600' },
          { label: 'PENDING BILLING', value: pendingBillingCount, highlight: 'text-amber-600' },
          { label: 'DRAFT MODE', value: draftCount, highlight: 'text-slate-500' },
          { label: 'TOTAL INSTALLED VALUE', value: `₹${totalInstalledValue.toLocaleString()}`, highlight: 'text-slate-900' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">{stat.label}</span>
            <div className={`mt-4 text-3xl font-black ${stat.highlight}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Installation Challans Ledger</h2>
            <p className="text-sm text-slate-500 mt-1">Tracking installation challans across active projects.</p>
          </div>
          <div className="text-sm uppercase tracking-[0.35em] text-slate-400">Showing {filteredChallans.length} records</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">Challan No.</th>
                <th className="px-6 py-5">Client / Project</th>
                <th className="px-6 py-5">Site Engineer</th>
                <th className="px-6 py-5">Installation Date</th>
                <th className="px-6 py-5">Items Qty</th>
                <th className="px-6 py-5">Est. Valuation</th>
                <th className="px-6 py-5">Billing Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChallans.length > 0 ? filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-black text-slate-900">{challan.challanNumber || challan.id}</td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900">{challan.client}</div>
                    <div className="text-xs text-slate-500 mt-1">{challan.project}</div>
                  </td>
                  <td className="px-6 py-5 text-slate-700">{challan.siteEngineer}</td>
                  <td className="px-6 py-5 text-slate-700">{challan.installationDate}</td>
                  <td className="px-6 py-5 text-slate-700">{challan.itemsQty} units</td>
                  <td className="px-6 py-5 font-black text-slate-900">₹{challan.estValuation.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${billingClasses[challan.billingStatus] || 'bg-slate-400 text-white'}`}>
                      {challan.billingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => handlePrintOpen(challan)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-50 transition">
                      <Printer size={14} />
                      <span>Print</span>
                    </button>
                    <button onClick={() => handleDetails(challan)} className="px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-50 transition">Details</button>
                    <button onClick={() => handleEdit(challan)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-slate-50 transition">
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button onClick={() => handleDelete(challan.id)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 hover:bg-slate-50 transition">
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center text-slate-400 font-bold italic">No installation challans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {receiptOpen && selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-2 py-4">
          <style>{`
            @media print { 
              @page { size: A4 portrait; margin: 0; }
              html, body { height: 100vh !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; }
              body * { visibility: hidden; } 
              #install-receipt, #install-receipt * { visibility: visible; } 
              #install-receipt { 
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
          <div id="install-receipt" className="relative bg-white w-full sm:max-w-[1100px] sm:w-[95vw] shadow-2xl overflow-hidden border-x sm:border border-slate-300 h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto rounded-none sm:rounded-[2.5rem]">
            {/* Receipt Header Edit Bar */}
            <div className="bg-slate-100 border-b-2 border-slate-300 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 print:hidden sticky top-0 z-[100]">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">Receipt Customization</div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">🖨️ Print Receipt</button>
                <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                  <span>📤 Change Logo</span>
                  <input type="file" accept="image/*" onChange={handleReceiptLogoSelect} className="hidden" />
                </label>
                <button onClick={() => setReceiptOpen(false)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition border border-slate-200 shadow-sm"><XCircle size={20} /></button>
              </div>
            </div>

            <div className="relative z-0 p-4 sm:p-10 print:p-8 space-y-6 print:space-y-4 font-sans print:border-2 print:border-slate-800 print:h-[calc(100vh-10mm)] print:rounded-sm print:flex print:flex-col">
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
                          <span className="text-xs font-black text-white">Change</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-400 text-center px-1 print:hidden">Add Logo</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleReceiptLogoSelect} className="hidden" />
                  </label>
                  <div className="flex-1 w-full sm:min-w-0">
                    <textarea
                      value={receiptConfig.companyName}
                      onChange={(e) => setReceiptConfig(prev => ({ ...prev, companyName: e.target.value }))}
                      rows="2"
                      className="w-full text-lg sm:text-xl font-black text-slate-900 bg-white print:bg-transparent border-2 border-slate-300 print:border-none print:p-0 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition mb-2 resize-none overflow-hidden leading-tight"
                    />
                    <div className="text-[10px] sm:text-[11px] text-slate-700 leading-tight space-y-1">
                      <textarea
                        value={receiptConfig.address}
                        onChange={(e) => setReceiptConfig(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full font-bold resize-none bg-transparent outline-none border border-transparent hover:border-slate-300 print:border-none rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-1 -ml-1"
                        rows="2"
                      />
                      <div className="flex items-center"><span className="font-black w-14 text-slate-400 uppercase tracking-tighter">Phone:</span> <input type="text" value={receiptConfig.phone} onChange={e => setReceiptConfig(prev => ({...prev, phone: e.target.value}))} className="flex-1 bg-transparent outline-none border border-transparent hover:border-slate-300 print:border-none rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 px-1 ml-1" /></div>
                      <div className="flex items-center"><span className="font-black w-14 text-slate-400 uppercase tracking-tighter">Email:</span> <input type="text" value={receiptConfig.email} onChange={e => setReceiptConfig(prev => ({...prev, email: e.target.value}))} className="flex-1 bg-transparent outline-none border border-transparent hover:border-slate-300 print:border-none rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 px-1 ml-1" /></div>
                      <div className="flex items-center"><span className="font-black w-14 text-slate-400 uppercase tracking-tighter">GSTIN:</span> <input type="text" value={receiptConfig.gstin} onChange={e => setReceiptConfig(prev => ({...prev, gstin: e.target.value}))} className="flex-1 bg-transparent outline-none border border-transparent hover:border-slate-300 print:border-none rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 px-1 ml-1" /></div>
                    </div>
                  </div>
                </div>

                {/* Right: Challan Info */}
                <div className="flex-1 text-left lg:text-right w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight italic">INSTALLATION CHALLAN</div>
                  <table className="mt-4 lg:ml-auto text-sm text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full sm:w-auto">
                    <tbody>
                      <tr>
                        <td className="font-black text-slate-400 uppercase tracking-widest text-[10px] pr-6 py-1">Challan No</td>
                        <td className="font-bold text-slate-900 py-1">{selected.challanNumber || selected.id}</td>
                      </tr>
                      <tr>
                        <td className="font-black text-slate-400 uppercase tracking-widest text-[10px] pr-6 py-1">Date</td>
                        <td className="font-bold text-slate-900 py-1">{selected.installationDate || ''}</td>
                      </tr>
                      <tr>
                        <td className="font-black text-slate-400 uppercase tracking-widest text-[10px] pr-6 py-1">Reference</td>
                        <td className="font-bold text-slate-900 py-1">{selected.poRef || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETAILS GRID: Clean format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-6 border-y border-slate-100">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.client}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender / Project</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.project}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Place of Supply</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.placeOfSupply || 'Haryana (06)'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Address</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.siteAddress || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.contactPerson || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Engineer</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.siteEngineer}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Manager</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">{selected.supervisorName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">09:30 AM</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</span>
                    <span className="text-sm font-bold text-slate-800 flex-1 sm:border-l sm:pl-4 border-slate-100">04:45 PM</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-32 flex-shrink-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="text-sm font-bold text-emerald-600 flex-1 sm:border-l sm:pl-4 border-slate-100">Completed</span>
                  </div>
                </div>
              </div>

              {/* MATERIALS TABLE */}
              <div className="py-2">
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="py-2 px-3 text-xs font-black text-slate-800 w-[5%] text-center border-r border-slate-300">#</th>
                      <th className="py-2 px-3 text-xs font-black text-slate-800 w-[35%] border-r border-slate-300">Item Description</th>
                      <th className="py-2 px-3 text-xs font-black text-slate-800 w-[20%] border-r border-slate-300">Model / Serial No</th>
                      <th className="py-2 px-3 text-xs font-black text-slate-800 w-[10%] text-center border-r border-slate-300">Qty</th>
                      <th className="py-2 px-3 text-xs font-black text-slate-800 w-[15%] text-center border-r border-slate-300">Status</th>
                      <th className="py-2 px-3 text-xs font-black text-slate-800 w-[15%]">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.materialRows?.length ? selected.materialRows : [
                      { description: 'Indoor Unit', itemCode: 'IDU-18K-X1', qty: 2, unit: 'Nos', condition: 'Good', status: 'Installed', remarks: 'Installed in Conf. Room 1' },
                      { description: 'Outdoor Unit', itemCode: 'ODU-18K-X1', qty: 1, unit: 'Nos', condition: 'Good', status: 'Installed', remarks: 'Installed on Terrace' },
                      { description: 'Control Panel', itemCode: 'CP-HVAC-01', qty: 1, unit: 'Nos', condition: 'Good', status: 'Installed', remarks: 'Near Electrical Room' }
                    ]).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-300 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-1.5 px-3 text-sm text-slate-600 font-medium text-center border-r border-slate-300">{idx + 1}</td>
                        <td className="py-1.5 px-3 text-sm border-r border-slate-300">
                          <div className="font-bold text-slate-800">{row.description}</div>
                        </td>
                        <td className="py-1.5 px-3 text-sm text-slate-600 border-r border-slate-300">
                          <div>{row.itemCode || ''}</div>
                          <div className="text-xs text-slate-400">SN1234500{idx + 1}</div>
                        </td>
                        <td className="py-1.5 px-3 text-sm font-medium text-slate-700 text-center border-r border-slate-300">
                          {row.qty} <span className="text-xs text-slate-400 ml-1">{row.unit}</span>
                        </td>
                        <td className="py-1.5 px-3 text-sm font-medium text-emerald-600 text-center border-r border-slate-300">{row.status || 'Installed'}</td>
                        <td className="py-1.5 px-3 text-sm text-slate-600">{row.remarks || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center py-4 border-t border-slate-200 mt-2 px-4">
                  <div className="text-sm font-bold text-slate-800">Total Quantity Installed: <span className="text-slate-600 font-medium ml-2">{selected.itemsQty || 4} units</span></div>
                  <div className="text-sm font-bold text-slate-800">Remark: <span className="text-slate-600 font-medium ml-2">All items installed, tested and working fine.</span></div>
                </div>
              </div>


              {/* FOOTER: Transport & Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-8 pt-8 border-t border-slate-200 print:mt-auto">
                {/* Handover Details */}
                <div className="md:col-span-1 flex flex-col space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Handover Info</span>
                  <div className="flex flex-col text-xs space-y-1 text-slate-600">
                    <div><span className="font-bold text-slate-700">Date:</span> {selected.installationDate || ''}</div>
                    <div><span className="font-bold text-slate-700">Time:</span> 05:00 PM</div>
                    <div><span className="font-bold text-slate-700">Warranty:</span> 1 Year Comp.</div>
                  </div>
                </div>

                {/* Site Engineer */}
                <div className="md:col-span-1 flex flex-col justify-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Site Engineer</span>
                  <div className="h-16 border-b border-slate-300 w-full mb-2 flex items-end">
                    {/* Signature Space */}
                  </div>
                  <div className="text-xs font-bold text-slate-800">{selected.siteEngineer}</div>
                  <div className="text-xs text-slate-500">Site Engineer</div>
                </div>

                {/* Client Representative */}
                <div className="md:col-span-1 flex flex-col justify-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Client Representative</span>
                  <div className="h-16 border-b border-slate-300 w-full mb-2 flex items-end">
                    {/* Signature Space */}
                  </div>
                  <div className="text-xs font-bold text-slate-800">{selected.contactPerson || 'Authorized Signatory'}</div>
                  <div className="text-xs text-slate-500">Client Rep.</div>
                </div>

                {/* Company Stamp */}
                <div className="md:col-span-1 flex flex-col items-center justify-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Company Stamp</span>
                  <div className="w-24 h-24 rounded-lg flex items-center justify-center">
                    {/* Stamp Space */}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs font-medium text-slate-500 pt-6">
                We confirm that the installation has been completed as per the scope and satisfaction of the client.<br/>
                <span className="font-bold">Thank you for your business!</span>
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
        title="Export Installation Challans"
      />
    </div>
  );
};

export default InstallationChallan;
