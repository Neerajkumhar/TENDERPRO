import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Check,
  Coffee,
  X,
  User as UserIcon,
  Calendar,
  PieChart as PieChartIcon,
  UploadCloud,
  Loader2
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

const FinancialManagement = ({ onInvoiceClick, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const filterRef = useRef(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    project: '',
    tenderId: '',
    tenderValue: '',
    attachment: ''
  });

  const [invoicesList, setInvoicesList] = useState([]);
  const [revenueVsExpenseData, setRevenueVsExpenseData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgetsList, setBudgetsList] = useState([]);
  const [clients, setClients] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      const expRes = await fetch('/api/expenses');
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }

      const budgetsRes = await fetch('/api/budgets');
      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        setBudgetsList(budgetsData);
      }

      const clientsRes = await fetch('/api/clients');
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }

      const tendersRes = await fetch('/api/tenders');
      if (tendersRes.ok) {
        const tendersData = await tendersRes.json();
        setTenders(tendersData);
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
    }
  };

  useEffect(() => {
    fetchInvoicesAndStats();
  }, []);

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
          date: formData.date || new Date().toISOString().split('T')[0],
          status: formData.status || 'Pending',
          project: formData.project,
          tenderId: formData.tenderId,
          attachments: formData.attachment ? [{ name: 'Invoice Document', url: formData.attachment }] : []
        })
      });
      
      if (response.ok) {
        setFormData({
          client: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          project: '',
          tenderId: '',
          tenderValue: '',
          attachment: ''
        });
        setIsModalOpen(false);
        fetchInvoicesAndStats();
      } else {
        alert('Failed to generate invoice');
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
      doc.setFontSize(16);
      doc.text("TenderPro Financial Summary", 14, 20);
      doc.setFontSize(9);
      doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')}`, 14, 26);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 32);
      
      const invoiceData = filteredData.map(inv => [
        inv.invoiceNumber || inv.id,
        inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : 'N/A',
        inv.client,
        `Rs. ${parseFloat(inv.amount || 0).toLocaleString('en-IN')}`,
        inv.status
      ]);

      autoTable(doc, {
        startY: 38,
        head: [["Invoice ID", "Date", "Client", "Amount", "Status"]],
        body: invoiceData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 }
      });

      doc.save(`${filename}.pdf`);
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  const filteredInvoices = invoicesList.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (inv.invoiceNumber || inv.id).toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getBudgetUsed = () => {
    try {
      const totalAllocated = budgetsList.reduce((sum, b) => sum + Number(b.allocated || 0), 0);
      const totalSpent = budgetsList.reduce((sum, budget) => {
        const budgetExpenses = expenses.filter(e => e.category === budget.name && e.status !== 'REJECTED');
        const computedSpent = budgetExpenses.reduce((s, e) => s + Number(e.amount), 0);
        return sum + computedSpent;
      }, 0);
      
      if (totalAllocated === 0) return '0%';
      return `${Math.round((totalSpent / totalAllocated) * 100)}%`;
    } catch (e) {
      return '0%';
    }
  };

  const statsData = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'blue', icon: IndianRupee },
    { label: 'Total Expenses', value: `₹${stats.totalExpenses.toLocaleString('en-IN')}`, trend: 'Live', isUp: false, color: 'rose', icon: TrendingDown },
    { label: 'Net Profit', value: `₹${stats.netProfit.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'blue', icon: TrendingUp },
    { label: 'Cash Flow', value: `₹${stats.cashFlow.toLocaleString('en-IN')}`, trend: 'Stable', isUp: true, color: 'indigo', icon: Wallet },
    { label: 'Budget Used', value: getBudgetUsed(), trend: 'Live', isUp: true, color: 'amber', icon: FileText },
    { label: 'Pending Invoices', value: String(stats.pendingCount), trend: 'Real', isUp: false, color: 'orange', icon: Clock },
    { label: 'Paid Invoices', value: String(stats.paidCount), trend: 'Real', isUp: true, color: 'blue', icon: CheckCircle2 },
    { label: 'Outstanding Dues', value: `₹${stats.outstandingDues.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'rose', icon: AlertCircle },
  ];

  function renderLeaveModal() {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowLeaveModal(false)}></div>
        <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col text-left">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <Coffee size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">Team Leave Requests</h2>
                <p className="text-[10px] text-slate-500 font-medium italic">Review and manage time-off applications</p>
              </div>
            </div>
            <button onClick={() => setShowLeaveModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loadingLeaves ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-[9px] uppercase tracking-wider">Fetching applications...</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2 opacity-60">
                <Coffee size={40} strokeWidth={1.5} />
                <p className="font-bold text-[9px] uppercase tracking-wider">No pending leave requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:border-blue-200 transition-all group relative overflow-hidden">
                    <div className="absolute top-3.5 right-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${request.status === 'Pending' ? 'bg-amber-500 text-white' : request.status === 'Approved' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>{request.status}</span>
                    </div>
                    <div className="flex items-start gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 overflow-hidden shrink-0">
                        {request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-14">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{request.User?.name}</h4>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{request.User?.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <Calendar size={13} className="text-blue-500 shrink-0" />
                        <p className="text-[11px] font-medium text-slate-700">{new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-600"><span className="text-slate-900 font-bold">{request.leaveType}: </span>"{request.reason || 'No reason provided'}"</p>
                      </div>
                    </div>
                    {request.status === 'Pending' && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleLeaveStatusUpdate(request.id, 'Approved')} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-all active:scale-95 shadow-2xs">
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button onClick={() => handleLeaveStatusUpdate(request.id, 'Rejected')} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-rose-200 text-rose-500 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-all active:scale-95">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/40 flex justify-between items-center px-5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{leaveRequests.filter(r => r.status === 'Pending').length} Pending Reviews</p>
            <button onClick={() => setShowLeaveModal(false)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-[9px] text-slate-500 font-medium">Track revenue, expenses, and overall financial health.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(user?.role === 'Admin' || user?.role?.includes('Manager')) && (
            <button onClick={() => setShowLeaveModal(true)} className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-amber-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-amber-600 transition-all shadow-2xs active:scale-95">
              <Coffee size={13} />
              <span>Leaves</span>
            </button>
          )}
          <button onClick={() => setIsExportModalOpen(true)} className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-2xs active:scale-95">
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Top 8 KPI Mini-Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-2.5">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200 relative overflow-hidden">
            <div className="flex justify-between items-center mb-1.5 w-full">
              <div className="w-6 h-6 rounded-md bg-blue-50/80 border border-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                <stat.icon size={13} />
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                {stat.trend}
              </div>
            </div>
            <div className="w-full">
              <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate w-full">{stat.label}</p>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate w-full">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts and Table Grid */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 text-left">
        {/* Revenue vs Expense Chart */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col justify-between items-start gap-2 mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Revenue vs Expense</h3>
              <p className="text-[10px] text-slate-500 font-medium">Monthly performance comparison</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[200px] sm:h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueVsExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 600}} 
                  dy={5} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    padding: '8px 12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="payment" 
                  stroke="#60a5fa" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorPay)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={1.5} 
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Table Card */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between text-left">
          <div className="p-3 sm:p-3.5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50/40 gap-2.5 text-left">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Invoice Status Table</h3>
              <p className="text-[10px] text-slate-500 font-medium">Recent transactions and billing logs</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative group flex-1 sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Search client or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs" 
                />
              </div>
              
              <div className="relative flex items-center gap-1.5" ref={filterRef}>
                <button 
                  onClick={() => setShowFilterPopover(!showFilterPopover)}
                  className={`p-1.5 rounded-lg border transition-all shadow-2xs active:scale-95 flex items-center justify-center ${showFilterPopover || filterStatus !== 'All' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  <Filter size={14} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-xs hover:bg-blue-600 transition-all uppercase tracking-wider text-center active:scale-95"
                >
                  Generate Invoice
                </button>

                {showFilterPopover && (
                  <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Filter Status</p>
                    {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterPopover(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span>{status}</span>
                        {filterStatus === status && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-3.5 py-2">ID</th>
                  <th className="px-3.5 py-2">Date</th>
                  <th className="px-3.5 py-2">Client</th>
                  <th className="px-3.5 py-2 text-center">Amount</th>
                  <th className="px-3.5 py-2">Status</th>
                  <th className="px-3.5 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-3.5 py-2 text-[10px] font-bold text-slate-400">{inv.invoiceNumber || inv.id.slice(0,8)}</td>
                    <td className="px-3.5 py-2 text-[10.5px] font-medium text-slate-600 whitespace-nowrap">{inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td className="px-3.5 py-2 text-[11px] font-bold text-slate-800">{inv.client}</td>
                    <td className="px-3.5 py-2 text-[11px] font-bold text-slate-900 text-center whitespace-nowrap">₹{parseFloat(inv.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3.5 py-2">
                      <div className={`w-fit px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-2xs whitespace-nowrap ${inv.status === 'Paid' ? 'bg-blue-500 text-white' : inv.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>{inv.status}</div>
                    </td>
                    <td className="px-3.5 py-2 text-center">
                      <button 
                        onClick={() => onInvoiceClick && onInvoiceClick(inv.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="View Details"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400 italic text-xs font-medium">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Generate New Invoice</h2>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Add billing & transaction logging</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
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
                        const invoicesForTender = invoicesList.filter(inv => inv.tenderId === e.target.value);
                        const invoicedSum = invoicesForTender.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
                        suggestedAmount = String(Math.max(0, Number(t.budget || 0) - invoicedSum));
                      }
                      setFormData({
                        ...formData, 
                        tenderId: e.target.value, 
                        project: t ? t.title : '',
                        client: t && t.client ? t.client.name : formData.client,
                        tenderValue: t ? (t.budget || '') : '',
                        amount: t ? suggestedAmount : formData.amount
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
                      <>
                        <CheckCircle2 className="text-blue-500" size={20} />
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Document Uploaded</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="text-slate-400" size={20} />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Click or drag to upload</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 sticky bottom-0 bg-white pb-1">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={isUploading} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs active:scale-95 disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Generate Invoice'}
                  </button>
                </div>
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
