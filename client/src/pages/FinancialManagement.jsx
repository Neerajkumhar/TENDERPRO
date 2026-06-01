import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExportModal from '../components/ExportModal';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Filter,
  Download,
  Wallet,
  XCircle,
  PieChart as PieChartIcon,
  Coffee,
  X,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const categoryData = [
  { name: 'Salaries', value: 35, color: '#3b82f6' },
  { name: 'Marketing', value: 20, color: '#10b981' },
  { name: 'Infrastructure', value: 25, color: '#f59e0b' },
  { name: 'Operations', value: 20, color: '#6366f1' },
];

const FinancialManagement = ({ onInvoiceClick, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  const [invoicesList, setInvoicesList] = useState([]);
  const [revenueVsExpenseData, setRevenueVsExpenseData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashFlow: 0,
    outstandingDues: 0,
    pendingCount: 0,
    paidCount: 0,
    overdueCount: 0
  });

  const fetchLeaveRequests = async () => {
    if (!user?.departmentId) return;
    setLoadingLeaves(true);
    try {
      const response = await fetch(`/api/leave-requests/department/${user.departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleLeaveStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approverId: user?.id })
      });
      if (response.ok) {
        fetchLeaveRequests();
      }
    } catch (err) {
      console.error('Failed to update leave status:', err);
    }
  };

  useEffect(() => {
    if (showLeaveModal) {
      fetchLeaveRequests();
    }
  }, [showLeaveModal]);

  const fetchInvoicesAndStats = async () => {
    try {
      const invRes = await fetch('/api/invoices');
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoicesList(invData);
      }
      
      const statsRes = await fetch('/api/invoices/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const chartRes = await fetch('/api/invoices/chart-data');
      if (chartRes.ok) {
        const chartData = await chartRes.json();
        setRevenueVsExpenseData(chartData);
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
    }
  };

  useEffect(() => {
    fetchInvoicesAndStats();
  }, []);

  const handleCreateInvoice = async (e) => {
    if (e) e.preventDefault();
    if (!formData.client || !formData.amount) {
      alert('Please fill in client name and billing amount');
      return;
    }

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: formData.client,
          amount: parseFloat(formData.amount),
          date: formData.date,
          status: formData.status
        })
      });
      
      if (response.ok) {
        setFormData({
          client: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
        });
        setIsModalOpen(false);
        fetchInvoicesAndStats();
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filteredData = invoicesList.filter(inv => {
      if (!inv.date) return false;
      const d = new Date(inv.date);
      return d >= start && d <= end;
    });

    if (filteredData.length === 0) {
      alert("No transactions found in the selected time period.");
      return;
    }

    const filename = `Financial_Report_${startDate}_to_${endDate}`;

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("TenderPro Financial Summary", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);
      
      const invoiceData = filteredData.map(inv => [
        inv.invoiceNumber || inv.id,
        inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : 'N/A',
        inv.client,
        `Rs. ${parseFloat(inv.amount || 0).toLocaleString('en-IN')}`,
        inv.status
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["Invoice ID", "Date", "Client", "Amount", "Status"]],
        body: invoiceData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`${filename}.pdf`);
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  const statsData = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'blue', icon: IndianRupee },
    { label: 'Total Expenses', value: `₹${stats.totalExpenses.toLocaleString('en-IN')}`, trend: 'Live', isUp: false, color: 'rose', icon: TrendingDown },
    { label: 'Net Profit', value: `₹${stats.netProfit.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'emerald', icon: TrendingUp },
    { label: 'Cash Flow', value: `₹${stats.cashFlow.toLocaleString('en-IN')}`, trend: 'Stable', isUp: true, color: 'indigo', icon: Wallet },
    { label: 'Pending Invoices', value: String(stats.pendingCount), trend: 'Real', isUp: false, color: 'orange', icon: Clock },
    { label: 'Paid Invoices', value: String(stats.paidCount), trend: 'Real', isUp: true, color: 'blue', icon: CheckCircle2 },
    { label: 'Outstanding Dues', value: `₹${stats.outstandingDues.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'rose', icon: AlertCircle },
  ];

  function renderLeaveModal() {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)}></div>
        <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col text-left">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                <Coffee size={24} />
              </div>
              <div><h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Team Leave Requests</h2><p className="text-xs text-slate-500 font-medium italic">Review and manage your department's time-off applications</p></div>
            </div>
            <button onClick={() => setShowLeaveModal(false)} className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shadow-sm"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {loadingLeaves ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-[10px] uppercase tracking-widest">Fetching applications...</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 opacity-50">
                <Coffee size={64} strokeWidth={1} />
                <p className="font-black text-[10px] uppercase tracking-widest">No pending leave requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
                    <div className="absolute top-6 right-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${request.status === 'Pending' ? 'bg-amber-500 text-white shadow-amber-100' : request.status === 'Approved' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-rose-500 text-white shadow-rose-100'}`}>{request.status}</span></div>
                    <div className="flex items-start gap-4 mb-6"><div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border-2 border-white shadow-sm overflow-hidden shrink-0">{request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0].toUpperCase()}</div><div className="min-w-0 pr-16"><h4 className="font-black text-slate-900 uppercase tracking-tight truncate">{request.User?.name}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{request.User?.role}</p></div></div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50"><div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm"><Calendar size={16} /></div><div className="flex-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p><p className="text-xs font-black text-slate-700">{new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div></div>
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50"><div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm"><AlertCircle size={16} /></div><div className="flex-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Type & Reason</p><p className="text-xs font-bold text-slate-600 italic"><span className="text-slate-900 font-black not-italic">{request.leaveType}: </span>"{request.reason || 'No reason provided'}"</p></div></div>
                    </div>
                    {request.status === 'Pending' && (
                      <div className="flex gap-3 mt-6">
                        <button onClick={() => handleLeaveStatusUpdate(request.id, 'Approved')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100"><CheckCircle2 size={14} />Approve</button>
                        <button onClick={() => handleLeaveStatusUpdate(request.id, 'Rejected')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 shadow-sm"><XCircle size={14} />Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center px-10">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-3">{[1,2,3].map(i => (<div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm overflow-hidden"><UserIcon size={14} /></div>))}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{leaveRequests.filter(r => r.status === 'Pending').length} Pending Reviews</p>
             </div>
             <button onClick={() => setShowLeaveModal(false)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">Close Panel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Financial Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium italic uppercase tracking-widest">Track revenue, expenses, and overall financial health.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {(user?.role === 'Admin' || user?.role?.includes('Manager')) && (
            <button onClick={() => setShowLeaveModal(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95">
              <Coffee size={18} />
              <span>Leave Requests</span>
            </button>
          )}
          <button onClick={() => setIsExportModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-3 sm:p-4 bg-white border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500`}></div>
            <div className="flex justify-between items-start mb-2">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon size={16} />
              </div>
              <div className={`text-[8px] sm:text-[10px] font-black ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>{stat.trend}</div>
            </div>
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            <h3 className="text-base sm:text-xl font-black text-slate-900 mt-1 tracking-tight truncate">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-8 text-left">
        <div className="col-span-12 card p-4 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 text-left">
            <div><h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase tracking-wider">Revenue vs Expense</h3><p className="text-[10px] sm:text-xs text-slate-500 font-medium">Monthly financial comparison</p></div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></span><span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue (Billed)</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></span><span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment (Cash)</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-rose-500 rounded-full"></span><span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense</span></div>
            </div>
          </div>
          <div className="h-[250px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueVsExpenseData}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient><linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} /><Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" /><Area type="monotone" dataKey="payment" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPay)" /><Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden text-left">
          <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/30 gap-4 text-left">
            <div><h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase italic">Invoice Status Table</h3><p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Detailed log of recent financial transactions</p></div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all uppercase tracking-widest active:scale-95">Generate Invoice</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><th className="px-6 sm:px-8 py-4">ID</th><th className="px-6 sm:px-8 py-4">Date</th><th className="px-6 sm:px-8 py-4">Client</th><th className="px-6 sm:px-8 py-4 text-center">Amount</th><th className="px-6 sm:px-8 py-4">Status</th><th className="px-6 sm:px-8 py-4 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoicesList.length > 0 ? invoicesList.map((inv, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all group cursor-pointer" onClick={() => onInvoiceClick && onInvoiceClick(inv.id)}>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-bold text-slate-400">{inv.invoiceNumber || inv.id.slice(0,8)}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-bold text-slate-600">{inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-black text-slate-800 uppercase">{inv.client}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-black text-slate-900 text-center italic">₹{parseFloat(inv.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5"><div className={`w-fit px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm ${inv.status === 'Paid' ? 'bg-emerald-500 text-white' : inv.status === 'Pending' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>{inv.status}</div></td>
                    <td className="px-6 sm:px-8 py-4 sm:py-5 text-center"><MoreHorizontal size={18} className="mx-auto text-slate-400 group-hover:text-blue-500" /></td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="px-6 sm:px-8 py-20 text-center text-slate-400 italic font-bold">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 p-6 overflow-y-auto text-left">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col my-auto max-h-[95vh] text-left">
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Generate New Invoice</h2><p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Add billing & transaction logging</p></div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateInvoice} className="space-y-6 text-left">
                <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label><input type="text" placeholder="Enter client name" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label><input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Status</label><select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option></select></div></div>
                <div className="space-y-2 text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Amount (₹)</label><div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span><input type="number" placeholder="0.00" className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} /></div></div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-white pb-2 text-left"><button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancel</button><button type="submit" className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">Generate Invoice</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Financial Report" />
      {renderLeaveModal()}
    </div>
  );
};

export default FinancialManagement;
