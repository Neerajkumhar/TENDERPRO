import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  FileText,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';

const mockExpenses = [
  { id: 'EXP-2024-001', category: 'INFRASTRUCTURE', vendor: 'AWS', date: '2024-05-10', description: 'Server Hosting Fees', amount: 12500.00, status: 'APPROVED' },
  { id: 'EXP-2024-002', category: 'MARKETING', vendor: 'AdSense', date: '2024-05-12', description: 'Social Media Campaign', amount: 8400.00, status: 'PENDING' },
  { id: 'EXP-2024-003', category: 'OFFICE', vendor: 'Dell', date: '2024-05-15', description: 'New Workstations', amount: 15600.00, status: 'APPROVED' },
  { id: 'EXP-2024-004', category: 'TRAVEL', vendor: 'British Airways', date: '2024-05-18', description: 'Client Meeting - London', amount: 2300.00, status: 'REJECTED' },
  { id: 'EXP-2024-005', category: 'SOFTWARE', vendor: 'Adobe', date: '2024-05-20', description: 'Creative Cloud Subscription', amount: 1200.00, status: 'APPROVED' },
];

const ExpenseDetails = ({ expenseId, onBack }) => {
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      if (!expenseId) {
        onBack();
        return;
      }
      try {
        const response = await fetch(`/api/expenses/${expenseId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.document && typeof data.document === 'string') {
            try {
              data.document = JSON.parse(data.document);
            } catch (e) {
              console.error('Failed to parse document JSON');
            }
          }
          setExpense(data);
        } else {
          console.error('Failed to fetch expense details');
        }
      } catch (error) {
        console.error('Error fetching expense:', error);
      }
    };

    fetchExpense();
  }, [expenseId]);

  if (!expense) {
    return null;
  }

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'REJECTED') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!expense?.document?.data) return;
    const win = window.open();
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Document Preview - ${expense.document.name}</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#0f172a;height:100vh;overflow:hidden;">
          ${expense.document.type === 'application/pdf' 
            ? `<iframe src="${expense.document.data}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>`
            : `<img src="${expense.document.data}" style="max-width:100%;max-height:100%;object-fit:contain;" />`
          }
        </body>
        </html>
      `);
      win.document.close();
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (status === 'REJECTED') return <XCircle size={16} className="text-rose-500" />;
    return <Clock size={16} className="text-amber-500" />;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
                {expense.id}
              </h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusBadge(expense.status)}`}>
                {getStatusIcon(expense.status)}
                {expense.status}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1 uppercase">
              Recorded on {expense.date}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 p-8">
            <h2 className="text-lg font-black text-slate-800 tracking-tight italic uppercase mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              Expenditure Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                  <Building2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Vendor / Payee</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{expense.vendor}</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                  <Tag size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Category</span>
                </div>
                <div className="text-lg font-bold text-slate-900 uppercase">{expense.category}</div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 md:col-span-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2 text-blue-400">
                    <DollarSign size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                  </div>
                  <div className="text-4xl font-black text-blue-600 tracking-tight">
                    ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Transaction Date</div>
                  <div className="text-lg font-bold text-slate-700 flex items-center gap-2 justify-end">
                    <Calendar size={16} className="text-slate-400" />
                    {expense.date}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">Purpose / Description</h3>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {expense.description || 'No detailed description provided for this transaction.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 p-8 sticky top-8">
            <h2 className="text-lg font-black text-slate-800 tracking-tight italic uppercase mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              Supporting Document
            </h2>

            {expense.document ? (
              <div className="space-y-4">
                <div className="aspect-[3/4] w-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative group flex flex-col items-center justify-center shadow-inner">
                  {expense.document.type === 'application/pdf' ? (
                    <iframe 
                      src={`${expense.document.data}#toolbar=0`} 
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  ) : expense.document.type && expense.document.type.startsWith('image/') ? (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <img 
                        src={expense.document.data} 
                        alt="Receipt Preview" 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400">
                      <FileText size={64} className="mb-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-600 mb-1">{expense.document.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest">Document Preview Unavailable</p>
                    </div>
                  )}
                  
                  {/* Hover Overlay for Preview (Only for images/unknown) */}
                  {expense.document.type !== 'application/pdf' && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <button 
                        onClick={handlePreview}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                      >
                        <Eye size={16} /> Preview
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 truncate mr-4">
                    <p className="text-xs font-bold text-slate-700 truncate">{expense.document.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{expense.document.type}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={handlePreview}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-200 hover:bg-blue-50 transition-colors"
                      title="Preview Document"
                    >
                      <Eye size={16} />
                    </button>
                    <a 
                      href={expense.document.data}
                      download={expense.document.name}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-200 hover:bg-blue-50 transition-colors"
                      title="Download Document"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                <FileText size={48} className="text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-500 mb-2">No Document Attached</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This expense record does not have a supporting receipt or invoice.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
