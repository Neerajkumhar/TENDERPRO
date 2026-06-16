import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  IndianRupee,
  FileText,
  Activity,
  Printer,
  Download,
  Edit,
  MoreHorizontal,
  Paperclip,
  Clock,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';

const InvoiceDetails = ({ invoiceId, onBack }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  if (loading) return <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-black uppercase tracking-widest text-xs">Loading Invoice Details...</p></div>;
  if (!invoice) return <div className="p-20 text-center text-slate-500 font-bold">Invoice not found.</div>;

  const getItems = (inv) => {
    let items = inv.items || [];
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }
    return Array.isArray(items) ? items : [];
  };

  const currentItems = getItems(invoice);
  const subtotal = currentItems.reduce((s, it) => s + (toNumber(it.qty) * toNumber(it.rate)), 0);
  const taxAmount = currentItems.reduce((s, it) => s + (toNumber(it.qty) * toNumber(it.rate) * (toNumber(it.tax) || 0)), 0);
  const total = subtotal + taxAmount;

  const handlePrint = () => window.print();

  const openEdit = () => {
    setEditForm({
      ...invoice,
      date: invoice.date ? invoice.date.split('T')[0] : '',
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
      items: getItems(invoice)
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
        setIsEditing(false);
        alert('Invoice updated successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8 animate-in fade-in duration-500 print:p-0 print:bg-white text-left">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-all active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Invoice Details</h2>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400 tracking-widest">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={openEdit} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Edit size={16} /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:hidden">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
          <p className="text-2xl font-black text-slate-900 italic">₹{toNumber(invoice.amount).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paid Amount</p>
          <p className="text-2xl font-black text-emerald-600 italic">₹{toNumber(invoice.paid_amount).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Balance Due</p>
          <p className="text-2xl font-black text-rose-600 italic">₹{toNumber(invoice.amount_due).toLocaleString('en-IN')}</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</p>
          <p className="text-xl font-black text-slate-700">{invoice.dueDate || invoice.date || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 sm:p-8 md:p-12">
          {/* Company Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-10 gap-8">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} className="w-20 h-20 object-contain rounded-2xl bg-slate-50 p-2 shadow-inner" alt="Logo" />
              ) : (
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-xl italic">TP</div>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{invoice.companyName || 'TENDERPRO SYSTEMS'}</h1>
                <p className="text-[11px] text-slate-500 font-bold mt-1 leading-relaxed uppercase whitespace-pre-line">{invoice.companyAddress || '123 INDUSTRY PARK, SECTOR 62\nNOIDA, UP 201309'}</p>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>PH: {invoice.companyPhone || '+91 120 456 7890'}</span>
                  <span>GSTIN: {invoice.companyGSTIN || '09AABCS1234A1Z5'}</span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto">
              <h2 className="text-4xl font-black text-blue-900 tracking-tighter italic uppercase">INVOICE</h2>
              <div className="mt-6 space-y-1.5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Invoice Number</p>
                <p className="text-lg font-black text-slate-800">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</p>
                <div className="pt-2 flex flex-col items-start md:items-end gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                  <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${invoice.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-10 border-b border-slate-50">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">BILL TO</label>
              <p className="text-sm font-black text-slate-900 uppercase mb-1">{invoice.client}</p>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase whitespace-pre-line">{invoice.billingAddress || 'NO ADDRESS PROVIDED'}</p>
              <p className="text-[11px] text-slate-400 font-black mt-2 uppercase tracking-tight">GSTIN: {invoice.clientGstin || 'N/A'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">DATES</label>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Issue Date</p>
                  <p className="text-xs font-black text-slate-700">{invoice.date || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Due Date</p>
                  <p className="text-xs font-black text-slate-700">{invoice.dueDate || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">REFERENCE</label>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Project</p>
                  <p className="text-xs font-black text-slate-700 uppercase truncate">{invoice.project || 'GENERAL'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">PO Number</p>
                  <p className="text-xs font-black text-slate-700 uppercase">{invoice.poNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">SHIPPING</label>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">{invoice.shippingAddress || 'SAME AS BILLING'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-10">
            <div className="overflow-x-auto rounded-3xl border border-slate-100/80 w-full scrollbar-hide">
              <table className="w-full text-left min-w-[600px] sm:min-w-full">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4 rounded-l-2xl">Description</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Rate (₹)</th>
                    <th className="px-6 py-4 text-right rounded-r-2xl">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((it, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-6">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{it.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{it.description}</p>
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-black text-slate-600">{it.qty}</td>
                      <td className="px-6 py-6 text-right text-sm font-black text-slate-600">{toNumber(it.rate).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-6 text-right text-sm font-black text-slate-900 italic">{(toNumber(it.qty) * toNumber(it.rate)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-10 pt-10 border-t border-slate-50">
            <div className="w-full sm:w-1/2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">PAYMENT INSTRUCTIONS</label>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-slate-400">Bank</span>
                  <span className="text-slate-700">{invoice.bankName || 'HDFC BANK'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-slate-400">A/C No</span>
                  <span className="text-slate-700 tracking-widest">{invoice.accountNumber || '0000 0000 0000'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-slate-400">IFSC</span>
                  <span className="text-slate-700">{invoice.bankIFSC || 'HDFC0001234'}</span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-80 space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-black text-slate-700">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tax ({((taxAmount / subtotal) * 100).toFixed(0)}%)</span>
                <span className="text-sm font-black text-slate-700">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 flex justify-between items-center group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  <IndianRupee size={60} className="text-white" />
                </div>
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] relative z-10">Total Amount</span>
                <span className="text-2xl font-black text-white italic relative z-10">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
            <div>
              <p className="text-[11px] font-black text-slate-900 uppercase italic">Thank you for your business!</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Visit us at {invoice.companyWebsite || 'www.tenderpro.com'}</p>
            </div>
            <div className="flex flex-col items-center sm:items-end">
              <div className="w-40 border-b-2 border-slate-200 pb-2 flex justify-center">
                {invoice.authorizedSignature ? (
                  <img src={invoice.authorizedSignature} className="h-12 object-contain" alt="Signature" />
                ) : (
                  <div className="h-12 w-full"></div>
                )}
              </div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-2 italic">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 p-6 overflow-y-auto text-left">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsEditing(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col my-auto max-h-[95vh]">
            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Edit Invoice</h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Audit billing details</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                    <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={editForm.client} onChange={e => setEditForm({ ...editForm, client: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                      <option>Pending</option><option>Paid</option><option>Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Paid (₹)</label>
                    <input type="number" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={editForm.paid_amount} onChange={e => setEditForm({ ...editForm, paid_amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Balance Due (₹)</label>
                    <input type="number" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={editForm.amount_due} onChange={e => setEditForm({ ...editForm, amount_due: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
