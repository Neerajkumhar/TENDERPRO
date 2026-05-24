import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  FileText,
  Activity,
  Printer,
  Download,
  Edit,
  MoreHorizontal,
  Paperclip,
  Clock,
  CheckCircle,
  
} from 'lucide-react';

const InvoiceDetails = ({ invoiceId, onBack }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createForm, setCreateForm] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });
  const [editForm, setEditForm] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    billingAddress: '',
    gstDetails: '',
    reference: '',
    poNumber: '',
    poAddress: '',
    dueDate: '',
    amount_due: '',
    paid_amount: '',
    bankName: '',
    accountNumber: '',
    paidAt: '',
    sentAt: '',
    items: [],
    attachments: [],
    project: '',
    invoiceRef: '',
    poRef: '',
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
    notes: ''
  });

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const formatAmount = (v) => toNumber(v).toFixed(2);

  useEffect(() => {
    setLoading(true);
    setInvoice(null);

    const fetchInvoice = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`);
        if (response.ok) {
          const data = await response.json();
          setInvoice(data);
        } else {
          // Fallback to localStorage if backend fetch fails
          const saved = localStorage.getItem('tender_invoices');
          if (saved) {
            const invoices = JSON.parse(saved);
            const found = invoices.find(inv => inv.id === invoiceId);
            if (found) {
              setInvoice(found);
            } else {
              console.error('Invoice not found in localStorage');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('tender_invoices');
        if (saved) {
          const invoices = JSON.parse(saved);
          const found = invoices.find(inv => inv.id === invoiceId);
          if (found) {
            setInvoice(found);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    } else {
      setLoading(false);
    }
  }, [invoiceId]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Invoice Details...</div>;
  if (!invoice) return <div className="p-8 text-center text-slate-500 font-bold">Invoice not found.</div>;

  let items = invoice.items && invoice.items.length ? invoice.items : [
    { id: 1, name: 'Website Design', description: 'Custom website design and UI/UX', qty: 1, rate: 2500, tax: 0.1 },
    { id: 2, name: 'Development', description: 'Frontend & backend development', qty: 1, rate: 2000, tax: 0.1 }
  ];
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch (e) { items = []; }
  }

  let invoiceAttachments = invoice.attachments;
  if (typeof invoiceAttachments === 'string') {
    try { invoiceAttachments = JSON.parse(invoiceAttachments); } catch (e) { invoiceAttachments = []; }
  }
  const currentItems = Array.isArray(items) ? items : [];
  const attachments = Array.isArray(invoiceAttachments) ? invoiceAttachments : [];
  const subtotal = currentItems.reduce((s, it) => s + (toNumber(it.qty) * toNumber(it.rate)), 0);
  const tax = currentItems.reduce((s, it) => s + (toNumber(it.qty) * toNumber(it.rate) * (toNumber(it.tax) || 0)), 0);
  const total = subtotal + tax;

  const handlePrint = () => window.print();

  const openCreate = () => {
    setCreateForm({
      client: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setShowCreateModal(true);
  };
  const closeCreate = () => setShowCreateModal(false);



  const openEdit = () => {
    setEditForm({
      client: invoice.client || '',
      amount: invoice.amount ? String(invoice.amount) : '',
      date: invoice.date ? invoice.date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: invoice.status || 'Pending',
      billingAddress: invoice.billingAddress || invoice.address || '',
      gstDetails: invoice.gstDetails || invoice.gstNumber || invoice.gst || invoice.gstin || invoice.taxDetails || '',
      reference: invoice.reference || invoice.ref || '',
      poNumber: invoice.poNumber || invoice.po || '',
      poAddress: invoice.poAddress || invoice.po_address || '',
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : invoice.due_date ? invoice.due_date.split('T')[0] : invoice.date || '',
      amount_due: invoice.amount_due != null ? String(invoice.amount_due) : '',
      paid_amount: invoice.paid_amount != null ? String(invoice.paid_amount) : '',
      bankName: invoice.bankName || '',
      accountNumber: invoice.accountNumber || '',
      paidAt: invoice.paidAt ? invoice.paidAt.split('T')[0] : '',
      sentAt: invoice.sentAt ? invoice.sentAt.split('T')[0] : '',
      items: Array.isArray(items) && items.length ? items : [],
      attachments: Array.isArray(invoiceAttachments) ? invoiceAttachments : [],
      attachmentsString: JSON.stringify(Array.isArray(invoiceAttachments) ? invoiceAttachments : [], null, 2),
      companyName: invoice.companyName || '',
      companyAddress: invoice.companyAddress || '',
      companyPhone: invoice.companyPhone || '',
      companyEmail: invoice.companyEmail || '',
      companyGSTIN: invoice.companyGSTIN || '',
      companyPAN: invoice.companyPAN || '',
      companyWebsite: invoice.companyWebsite || '',
      companyLogo: invoice.companyLogo || '',
      bankIFSC: invoice.bankIFSC || '',
      bankBranch: invoice.bankBranch || '',
      authorizedSignature: invoice.authorizedSignature || '',
      project: invoice.project || '',
      invoiceRef: invoice.invoiceRef || '',
      poRef: invoice.poRef || '',
      poDate: invoice.poDate ? invoice.poDate.split('T')[0] : '',
      ewayBill: invoice.ewayBill || '',
      dispatchDate: invoice.dispatchDate ? invoice.dispatchDate.split('T')[0] : '',
      deliveryDate: invoice.deliveryDate ? invoice.deliveryDate.split('T')[0] : '',
      transporter: invoice.transporter || '',
      vehicleNumber: invoice.vehicleNumber || '',
      lrNo: invoice.lrNo || '',
      driverName: invoice.driverName || '',
      clientGstin: invoice.clientGstin || invoice.companyGSTIN || '',
      contactPerson: invoice.contactPerson || '',
      contactPhone: invoice.contactPhone || '',
      placeOfSupply: invoice.placeOfSupply || '',
      dispatchFrom: invoice.dispatchFrom || '',
      dispatchTo: invoice.dispatchTo || '',
      shippingAddress: invoice.shippingAddress || '',
      notes: invoice.notes || ''
    });
    setIsEditing(true);
  };
  const closeEdit = () => setIsEditing(false);

  const handleCreateChange = (e) => setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...editForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditForm({ ...editForm, items: newItems });
  };

  const handleAddLineItem = () => {
    setEditForm({
      ...editForm,
      items: [
        ...editForm.items,
        { id: Date.now(), name: '', description: '', qty: 1, rate: 0, tax: 0 }
      ]
    });
  };

  const handleRemoveLineItem = (index) => {
    setEditForm({
      ...editForm,
      items: editForm.items.filter((_, i) => i !== index)
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: createForm.client,
          amount: createForm.amount,
          date: createForm.date,
          status: createForm.status
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
        closeCreate();
        alert('Invoice created: ' + (data.invoiceNumber || data.id));
      } else {
        const err = await res.json();
        alert('Failed to create invoice: ' + (err.message || JSON.stringify(err)));
      }
    } catch (err) {
      console.error(err);
      alert('Network error creating invoice');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: editForm.client,
          amount: editForm.amount,
          date: editForm.date,
          dueDate: editForm.dueDate,
          status: editForm.status,
          billingAddress: editForm.billingAddress,
          gstDetails: editForm.gstDetails,
          reference: editForm.reference,
          poNumber: editForm.poNumber,
          poAddress: editForm.poAddress,
          amount_due: editForm.amount_due,
          paid_amount: editForm.paid_amount,
          bankName: editForm.bankName,
          accountNumber: editForm.accountNumber,
          paidAt: editForm.paidAt,
          sentAt: editForm.sentAt,
          items: editForm.items,
          attachments: editForm.attachmentsString != null ? editForm.attachmentsString : JSON.stringify(editForm.attachments || []),
          companyName: editForm.companyName,
          companyAddress: editForm.companyAddress,
          companyPhone: editForm.companyPhone,
          companyEmail: editForm.companyEmail,
          companyGSTIN: editForm.companyGSTIN,
          companyPAN: editForm.companyPAN,
          companyWebsite: editForm.companyWebsite,
          companyLogo: editForm.companyLogo,
          bankIFSC: editForm.bankIFSC,
          bankBranch: editForm.bankBranch,
          authorizedSignature: editForm.authorizedSignature,
          project: editForm.project,
          invoiceRef: editForm.invoiceRef,
          poRef: editForm.poRef,
          poDate: editForm.poDate,
          ewayBill: editForm.ewayBill,
          dispatchDate: editForm.dispatchDate,
          deliveryDate: editForm.deliveryDate,
          transporter: editForm.transporter,
          vehicleNumber: editForm.vehicleNumber,
          lrNo: editForm.lrNo,
          driverName: editForm.driverName,
          clientGstin: editForm.clientGstin,
          contactPerson: editForm.contactPerson,
          contactPhone: editForm.contactPhone,
          placeOfSupply: editForm.placeOfSupply,
          dispatchFrom: editForm.dispatchFrom,
          dispatchTo: editForm.dispatchTo,
          shippingAddress: editForm.shippingAddress,
          notes: editForm.notes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
        closeEdit();
        alert('Invoice updated successfully');
      } else {
        const err = await res.json();
        alert('Failed to update invoice: ' + (err.message || JSON.stringify(err)));
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating invoice');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditForm({ ...editForm, companyLogo: data.url });
      } else {
        alert('Failed to upload logo');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during upload');
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditForm({ ...editForm, authorizedSignature: data.url });
      } else {
        alert('Failed to upload signature');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during upload');
    }
  };



  return (
    <div className="p-8 print:p-0 max-w-[1200px] mx-auto space-y-6 print:space-y-0 print:max-w-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-black">Invoice Details</h2>
            <div className="mt-2 flex items-center gap-3">
              <h3 className="text-lg font-black">{invoice.invoiceNumber || invoice.id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{invoice.status}</span>
            </div>
          </div>
        </div>

          <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="px-4 py-2 bg-white border border-slate-200 rounded-lg"> <Printer size={16} /> Print</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-white border border-slate-200 rounded-lg"> <Download size={16} /> Download PDF</button>
          <button onClick={openEdit} className="px-4 py-2 bg-white border border-slate-200 rounded-lg"> <Edit size={16} /> Edit</button>

          <button className="p-2 bg-white border border-slate-200 rounded-lg"><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase">Amount Due</p>
          <p className="text-lg font-extrabold text-slate-800 mt-2">${formatAmount(invoice.amount_due ?? 0)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase">Paid Amount</p>
          <p className="text-lg font-extrabold text-slate-800 mt-2">${formatAmount(invoice.paid_amount ?? invoice.amount ?? 0)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase">Balance</p>
          <p className="text-lg font-extrabold text-slate-800 mt-2">${formatAmount((toNumber(invoice.amount ?? total) - toNumber(invoice.paid_amount ?? 0)))}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase">Due Date</p>
          <p className="text-lg font-extrabold text-slate-800 mt-2">{invoice.dueDate || invoice.due_date || invoice.date}</p>
          <p className="text-xs text-slate-500 mt-1">Payment Status: <span className={`font-bold ${invoice.status === 'Paid' ? 'text-emerald-600' : 'text-slate-700'}`}>{invoice.status}</span></p>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeCreate}></div>
          <form onSubmit={handleCreateSubmit} className="relative bg-white w-full max-w-xl rounded-2xl p-6 z-50">
            <h3 className="text-lg font-black mb-4">Create Invoice</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase">Client</label>
                <input name="client" value={createForm.client} onChange={handleCreateChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase">Amount</label>
                <input name="amount" value={createForm.amount} onChange={handleCreateChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase">Date</label>
                  <input name="date" type="date" value={createForm.date} onChange={handleCreateChange} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase">Status</label>
                  <select name="status" value={createForm.status} onChange={handleCreateChange} className="w-full px-3 py-2 border rounded">
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeCreate} className="px-4 py-2 bg-white border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6 print:space-y-0 print:w-full">

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:border-none print:shadow-none print:p-0 mb-6">
<div className="flex justify-between items-start border-b pb-6">
                <div className="flex gap-4 items-center">
                  {invoice.companyLogo ? (
                    <img src={invoice.companyLogo} alt="Company Logo" className="w-16 h-16 object-contain rounded-lg shadow-sm bg-white" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-white font-black text-4xl shadow-md">
                      C
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">{invoice.companyName || '[YOUR COMPANY NAME]'}</h1>
                    <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{invoice.companyAddress || '[Your Company Address Line 1],\n[City, State, Zip Code]'}</p>
                    <p className="text-xs text-slate-500 mt-1">Phone: {invoice.companyPhone || '[Your Phone Number]'}  |  Email: {invoice.companyEmail || '[Your Email Address]'}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">GSTIN: {invoice.companyGSTIN || '[Your GSTIN]'}  |  PAN: {invoice.companyPAN || '[Your PAN]'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-black text-blue-900 tracking-tight">INVOICE RECEIPT</h2>
                  <div className="mt-4 flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-slate-700">Receipt #: <span className="font-medium text-slate-600">{invoice.invoiceNumber || invoice.id}</span></p>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      Status: 
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-6 border-b border-slate-100">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Billing Details</span>
                    <span className="text-sm font-bold text-slate-800">Client Name: {invoice.client || invoice.clientName || '—'}</span>
                    <span className="text-xs font-bold text-slate-500 mt-1">GSTIN: {invoice.clientGstin || '—'}</span>
                    <span className="text-xs font-bold text-slate-500 mt-1">Address: {invoice.billingAddress || invoice.address || '—'}</span>
                    <span className="text-xs font-bold text-slate-500 mt-2">Project: <span className="text-slate-800">{invoice.project || '—'}</span></span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Dates & Ref</span>
                    <span className="text-xs font-bold text-slate-500">Invoice Date: <span className="text-slate-800">{invoice.date || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-1">Due Date: <span className="text-slate-800">{invoice.dueDate || invoice.due_date || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-2">Invoice Ref: <span className="text-slate-800">{invoice.invoiceRef || invoice.reference || invoice.ref || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-1">PO Number: <span className="text-slate-800">{invoice.poNumber || invoice.poRef || '—'}</span></span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Dispatch Info</span>
                    <span className="text-xs font-bold text-slate-500">Dispatch: <span className="text-slate-800">{invoice.dispatchDate || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-1">Delivery: <span className="text-slate-800">{invoice.deliveryDate || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-2">Transporter: <span className="text-slate-800">{invoice.transporter || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-1">LR No: <span className="text-slate-800">{invoice.lrNo || '—'}</span></span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Transport Details</span>
                    <span className="text-xs font-bold text-slate-500">E-Way Bill: <span className="text-slate-800">{invoice.ewayBill || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-1">Vehicle No: <span className="text-slate-800">{invoice.vehicleNumber || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-2">Driver: <span className="text-slate-800">{invoice.driverName || '—'}</span></span>
                    <span className="text-xs font-bold text-slate-500 mt-1">Supply Place: <span className="text-slate-800">{invoice.placeOfSupply || '—'}</span></span>
                  </div>
                </div>
              </div>

        </div>

          {isEditing ? (
            <React.Fragment>
              <div className="flex justify-end gap-2 mb-4">
                <button type="button" onClick={closeEdit} className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleEditSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm font-bold hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-black mb-4">Line Items</h4>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase text-[10px]">
                      <th className="pb-3">Item</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Rate</th>
                      <th className="pb-3 text-right">Tax</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((it, index) => (
                      <tr key={it.id ?? index} className="border-t">
                        <td className="py-3 font-bold text-slate-700">
                          <input value={it.name} onChange={(e) => handleLineItemChange(index, 'name', e.target.value)} className="w-full px-2 py-1 border rounded" />
                        </td>
                        <td className="py-3 text-slate-500 text-sm">
                          <input value={it.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} className="w-full px-2 py-1 border rounded" />
                        </td>
                        <td className="py-3 text-right font-bold">
                          <input value={it.qty} onChange={(e) => handleLineItemChange(index, 'qty', e.target.value)} className="w-full px-2 py-1 border rounded text-right" type="number" min="0" />
                        </td>
                        <td className="py-3 text-right">
                          <input value={it.rate} onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)} className="w-full px-2 py-1 border rounded text-right" type="number" step="0.01" min="0" />
                        </td>
                        <td className="py-3 text-right">
                          <input value={it.tax} onChange={(e) => handleLineItemChange(index, 'tax', e.target.value)} className="w-full px-2 py-1 border rounded text-right" type="number" step="0.01" min="0" />
                        </td>
                        <td className="py-3 text-right font-black">
                          ${((toNumber(it.qty) * toNumber(it.rate)) * (1 + (toNumber(it.tax) || 0))).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button type="button" onClick={() => handleRemoveLineItem(index)} className="text-red-500">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3">
                  <button type="button" onClick={handleAddLineItem} className="px-4 py-2 bg-slate-100 rounded-lg border">Add Line Item</button>
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="w-full md:w-1/2">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-slate-500">Subtotal</span>
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-slate-500">Tax</span>
                      <span className="font-bold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t pt-3">
                      <span className="text-sm font-black">Total</span>
                      <span className="text-xl font-extrabold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-black mb-2">Payment Instructions</h4>
                <p className="text-sm text-slate-600">Please transfer payment to the following bank account:</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-xs font-black text-slate-400 uppercase">Bank Name</p>
                    <input name="bankName" value={editForm.bankName} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" />
                    <p className="text-xs text-slate-500 mt-3">Account:</p>
                    <input name="accountNumber" value={editForm.accountNumber} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" />
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-xs font-black text-slate-400 uppercase">IFSC Code</p>
                    <input name="bankIFSC" value={editForm.bankIFSC} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" />
                    <p className="text-xs text-slate-500 mt-3">Branch:</p>
                    <input name="bankBranch" value={editForm.bankBranch} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
                <h4 className="font-black mb-2">Company Letterhead</h4>
                <p className="text-sm text-slate-600 mb-4">Customize your company details for the invoice receipt.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center gap-4 border p-4 rounded-lg bg-slate-50">
                    {editForm.companyLogo ? (
                      <img src={editForm.companyLogo} alt="Logo" className="h-16 w-auto object-contain bg-white border rounded p-1" />
                    ) : (
                      <div className="h-16 w-16 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs text-center border">No Logo</div>
                    )}
                    <div className="flex-1">
                      <label className="text-xs font-black text-slate-500 uppercase">Upload Company Logo</label>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase">Company Name</label>
                    <input name="companyName" value={editForm.companyName} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" placeholder="Your Company Name" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase">Website</label>
                    <input name="companyWebsite" value={editForm.companyWebsite} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" placeholder="www.example.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Company Address</label>
                    <textarea name="companyAddress" value={editForm.companyAddress} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded h-20" placeholder="123 Business Park, Sector 62&#10;Noida, Uttar Pradesh - 201309, India" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase">Phone</label>
                    <input name="companyPhone" value={editForm.companyPhone} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" placeholder="+91 120 456 7890" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase">Email</label>
                    <input name="companyEmail" value={editForm.companyEmail} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" placeholder="info@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase">GSTIN</label>
                    <input name="companyGSTIN" value={editForm.companyGSTIN} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" placeholder="09AABCS1234A1Z5" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase">PAN</label>
                    <input name="companyPAN" value={editForm.companyPAN} onChange={handleEditChange} className="w-full mt-2 px-3 py-2 border rounded" placeholder="AABCS1234A" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
                <h4 className="font-black mb-2">Authorized Signature</h4>
                <p className="text-sm text-slate-600 mb-4">Upload the authorized signature for this invoice.</p>
                <div className="flex items-center gap-4 border p-4 rounded-lg bg-slate-50">
                  {editForm.authorizedSignature ? (
                    <img src={editForm.authorizedSignature} alt="Signature" className="h-16 w-32 object-contain bg-white border rounded p-1" />
                  ) : (
                    <div className="h-16 w-32 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs text-center border">No Signature</div>
                  )}
                  <div className="flex-1">
                    <label className="text-xs font-black text-slate-500 uppercase">Upload Signature Image</label>
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:border-none print:shadow-none print:p-0">
              <div className="py-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-y border-slate-200">
                      <th className="py-3 px-4 text-xs font-black text-slate-700 w-12">#</th>
                      <th className="py-3 px-4 text-xs font-black text-slate-700">Item</th>
                      <th className="py-3 px-4 text-xs font-black text-slate-700">Description</th>
                      <th className="py-3 px-4 text-xs font-black text-slate-700 text-center">Qty</th>
                      <th className="py-3 px-4 text-xs font-black text-slate-700 text-right">Rate (₹)</th>
                      <th className="py-3 px-4 text-xs font-black text-slate-700 text-right">Tax (%)</th>
                      <th className="py-3 px-4 text-xs font-black text-slate-700 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((it, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-slate-200">
                        <td className="py-3 px-4 text-sm text-slate-500">{i + 1}</td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800">{it.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{it.description}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-700 text-center">{it.qty}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-700 text-right">{toNumber(it.rate).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-700 text-right">{(toNumber(it.tax) * 100).toFixed(0)}%</td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800 text-right">{((toNumber(it.qty) * toNumber(it.rate)) * (1 + toNumber(it.tax))).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-4 gap-4 py-4 border border-slate-200 rounded-lg bg-slate-50/50 mb-8">
                <div className="text-center border-r border-slate-200">
                  <p className="text-xs font-bold text-slate-500">Subtotal (₹)</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="text-center border-r border-slate-200">
                  <p className="text-xs font-bold text-slate-500">Total Tax (₹)</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{tax.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="text-center border-r border-slate-200">
                  <p className="text-xs font-bold text-slate-500">Discount (₹)</p>
                  <p className="text-lg font-black text-slate-800 mt-1">0.00</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-red-500">Amount Due (₹)</p>
                  <p className="text-xl font-black text-red-600 mt-1">{toNumber(invoice.amount_due ?? total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                <div className="col-span-1">
                  <h3 className="text-[11px] font-black tracking-wider text-slate-800 mb-3">PAYMENT INFORMATION</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex"><span className="w-24 text-slate-500 font-medium">Bank Name</span><span className="font-bold text-slate-700">: {invoice.bankName || '[Bank Name]'}</span></div>
                    <div className="flex"><span className="w-24 text-slate-500 font-medium">Account Name</span><span className="font-bold text-slate-700">: {invoice.companyName || '[Your Company Name]'}</span></div>
                    <div className="flex"><span className="w-24 text-slate-500 font-medium">Account No.</span><span className="font-bold text-slate-700">: {invoice.accountNumber || '[Account Number]'}</span></div>
                    <div className="flex"><span className="w-24 text-slate-500 font-medium">IFSC Code</span><span className="font-bold text-slate-700">: {invoice.bankIFSC || '[IFSC Code]'}</span></div>
                    <div className="flex"><span className="w-24 text-slate-500 font-medium">Branch</span><span className="font-bold text-slate-700">: {invoice.bankBranch || '[Branch Name]'}</span></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 italic leading-relaxed">Please make the payment to the above bank account.<br/>Share payment proof to <span className="text-slate-700 font-medium not-italic">{invoice.companyEmail || '[Your Email Address]'}</span></p>
                </div>
                
                <div className="col-span-1 px-6 flex flex-col items-center text-center">
                  <h3 className="text-[11px] font-black tracking-wider text-slate-800 w-full text-left mb-6">AUTHORIZED SIGNATURE</h3>
                  <div className="relative mt-2 border-b border-slate-300 w-40 h-16 flex items-end justify-center">
                    {invoice.authorizedSignature ? (
                      <img src={invoice.authorizedSignature} alt="Authorized Signature" className="h-16 w-auto object-contain" />
                    ) : (
                      <span className="text-transparent">Signature</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-3">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-500">{invoice.companyName || '[Your Company Name]'}</p>
                </div>

                <div className="col-span-1 pl-4">
                  <h3 className="text-[11px] font-black tracking-wider text-slate-800 mb-3">NOTES</h3>
                  <ul className="text-[10px] text-slate-600 space-y-2 list-disc pl-4 leading-relaxed marker:text-slate-300">
                    <li>This is a computer generated invoice.</li>
                    <li>Kindly pay the due amount before the due date to avoid any late fees.</li>
                    <li>For any queries, contact us at <span className="font-bold text-slate-800">{invoice.companyEmail || '[Your Email Address]'}</span> or {invoice.companyPhone || '[Your Phone Number]'}.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center border-t border-slate-200 pt-6">
                <p className="text-sm font-black text-blue-600">Thank you for your business!</p>
                <p className="text-xs font-medium text-slate-400 mt-1">{invoice.companyWebsite || '[Your Website URL]'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 print:hidden">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h5 className="font-black">Payment Timeline</h5>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500"><CheckCircle size={16} /></span>
                <div>
                  <div className="font-bold">Invoice Paid</div>
                  {isEditing ? (
                    <input
                      name="paidAt"
                      type="date"
                      value={editForm.paidAt}
                      onChange={handleEditChange}
                      className="w-full mt-2 px-3 py-2 border rounded"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">{invoice.paidAt || invoice.updatedAt || ''}</div>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-400"><Clock size={16} /></span>
                <div>
                  <div className="font-bold">Invoice Sent</div>
                  {isEditing ? (
                    <input
                      name="sentAt"
                      type="date"
                      value={editForm.sentAt}
                      onChange={handleEditChange}
                      className="w-full mt-2 px-3 py-2 border rounded"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">{invoice.sentAt || invoice.createdAt || ''}</div>
                  )}
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h5 className="font-black">Activity Log</h5>
            <div className="mt-3 text-sm text-slate-600">
              <div className="py-2 border-b">
                <div className="font-bold">Invoice created</div>
                <div className="text-xs text-slate-400">{invoice.createdAt}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h5 className="font-black">Attachments</h5>
            <div className="mt-3 space-y-2">
              {isEditing ? (
                <textarea
                  name="attachments"
                  value={editForm.attachmentsString != null ? editForm.attachmentsString : JSON.stringify(editForm.attachments || [], null, 2)}
                  onChange={(e) => setEditForm({ ...editForm, attachmentsString: e.target.value })}
                  className="w-full h-32 px-3 py-2 border rounded"
                />
              ) : (invoice.attachments || []).length === 0 ? (
                <div className="text-sm text-slate-500">No attachments</div>
              ) : (
                attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip size={14} />
                      <div className="text-sm">{att.name}</div>
                    </div>
                    <a href={att.url} className="text-sm text-blue-600">Download</a>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InvoiceDetails;
