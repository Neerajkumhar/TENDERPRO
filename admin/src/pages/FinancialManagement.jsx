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

const budgetVsExpenseData = [
  { name: 'Tech', budget: 800, expense: 700 },
  { name: 'Marketing', budget: 500, expense: 450 },
  { name: 'Ops', budget: 700, expense: 750 },
  { name: 'Data', budget: 900, expense: 850 },
  { name: 'Sales', budget: 650, expense: 700 },
];

const categoryData = [
  { name: 'Salaries', value: 35, color: '#3b82f6' },
  { name: 'Marketing', value: 20, color: '#10b981' },
  { name: 'Infrastructure', value: 25, color: '#f59e0b' },
  { name: 'Operations', value: 20, color: '#6366f1' },
];

const alerts = [
  { type: 'Financial Warning', message: 'Budget overspend Acme Corp.', time: '1 hour ago', color: 'rose' },
  { type: 'Financial Warning', message: 'Unusual expense spike in Marketing.', time: '2 hours ago', color: 'amber' },
  { type: 'Approval', message: 'Expense claim ₹5,000 approved.', time: '4 hours ago', color: 'emerald' },
  { type: 'Approval', message: 'New invoice generated for TechCorp.', time: '5 hours ago', color: 'blue' },
];

const FinancialManagement = ({ onInvoiceClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [isAlertsCleared, setIsAlertsCleared] = useState(() => {
    return localStorage.getItem('financeAlertsCleared') === 'true';
  });
  const filterRef = useRef(null);

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
      alert('Network error saving invoice');
    }
  };

  const handleExportReport = ({ format, startDate, endDate }) => {
    if (!invoicesList || invoicesList.length === 0) {
      alert("No data available to export.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const filteredData = invoicesList.filter(inv => {
      if (!inv.date) return false;
      const invDate = new Date(inv.date);
      return invDate >= start && invDate <= end;
    });

    if (filteredData.length === 0) {
      alert("No transactions found for the selected period.");
      return;
    }

    const filename = `Financial_Report_${startDate}_to_${endDate}`;

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("TenderPro Financial Summary Report", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
      
      const invoiceData = filteredData.map(inv => {
        let displayDate = 'N/A';
        if (inv.date) {
          const d = new Date(inv.date);
          if (!isNaN(d.getTime())) {
            displayDate = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
          }
        }

        return [
          inv.invoiceNumber || inv.id,
          displayDate,
          inv.client,
          `Rs. ${typeof inv.amount === 'number' || !isNaN(inv.amount) ? parseFloat(inv.amount).toLocaleString('en-IN') : inv.amount}`,
          inv.status
        ];
      });

      autoTable(doc, {
        startY: 40,
        head: [["Invoice ID", "Date", "Client", "Amount", "Status"]],
        body: invoiceData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 }
      });

      doc.save(`${filename}.pdf`);
    } else if (format === 'xlsx') {
      const exportRows = filteredData.map(inv => ({
        "Invoice ID": inv.invoiceNumber || inv.id,
        "Date": inv.date,
        "Client": inv.client,
        "Amount": inv.amount,
        "Status": inv.status
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'csv') {
      const headers = ['Invoice ID', 'Date', 'Client', 'Amount', 'Status'];
      const rows = filteredData.map(inv => [
        inv.invoiceNumber || inv.id,
        inv.date,
        inv.client,
        inv.amount,
        inv.status
      ]);
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, trend: 'Updated', isUp: true, color: 'blue', icon: IndianRupee },
    { label: 'Total Expenses', value: `₹${stats.totalExpenses.toLocaleString('en-IN')}`, trend: 'Live', isUp: false, color: 'rose', icon: TrendingDown },
    { label: 'Net Profit', value: `₹${stats.netProfit.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'emerald', icon: TrendingUp },
    { label: 'Cash Flow', value: `₹${stats.cashFlow.toLocaleString('en-IN')}`, trend: 'Stable', isUp: true, color: 'indigo', icon: Wallet },
    { label: 'Budget Used', value: getBudgetUsed(), trend: 'On track', isUp: true, color: 'amber', icon: FileText, isProgress: true },
    { label: 'Pending Invoices', value: String(stats.pendingCount), trend: 'Real', isUp: false, color: 'orange', icon: Clock },
    { label: 'Paid Invoices', value: String(stats.paidCount), trend: 'Real', isUp: true, color: 'blue', icon: CheckCircle2 },
    { label: 'Outstanding Dues', value: `₹${stats.outstandingDues.toLocaleString('en-IN')}`, trend: 'Live', isUp: true, color: 'rose', icon: AlertCircle },
  ];

  const dynamicAlerts = [...invoicesList]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 4)
    .map(inv => {
      let color = 'blue';
      let type = 'Pending Action';
      let message = `New pending invoice generated for ${inv.client}.`;
      
      if (inv.status === 'Overdue') {
        color = 'rose';
        type = 'Financial Warning';
        message = `Invoice for ${inv.client} is Overdue!`;
      } else if (inv.status === 'Paid') {
        color = 'emerald';
        type = 'Approval';
        message = `Payment of ₹${parseFloat(inv.amount || 0).toLocaleString('en-IN')} received from ${inv.client}.`;
      }

      const dateStr = inv.date ? new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';

      return { type, message, time: dateStr, color };
    });

  const displayAlerts = isAlertsCleared ? [] : (dynamicAlerts.length > 0 ? dynamicAlerts : alerts);

  return (
    <div className="p-4 sm:p-6 lg:p-7 bg-[#f8fafc] text-left space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium italic uppercase tracking-widest">Track revenue, expenses, and overall financial health.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-100 flex flex-col items-start group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500`}></div>
            <div className="flex justify-between items-start w-full mb-2">
              <div className={`p-2 sm:p-2.5 rounded-xl bg-${stat.color}-50/50 text-${stat.color}-600 mb-2 sm:mb-3`}>
                <stat.icon size={16} />
              </div>
              <div className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                {stat.trend}
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 truncate w-full">{stat.label}</p>
            <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 leading-none truncate w-full">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        <div className="col-span-12 xl:col-span-8 card p-4 sm:p-6 lg:p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">Revenue vs Expense</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly performance comparison</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></span>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue (Billed)</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></span>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment (Cash)</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] sm:h-[350px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueVsExpenseData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="payment" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPay)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={2} 
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 card p-4 sm:p-6 lg:p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight uppercase">Recent Alerts</h3>
              <p className="text-xs text-slate-500 font-medium">Automatic system monitors</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-all"><MoreHorizontal size={20} className="text-slate-400" /></button>
          </div>
          <div className="space-y-4">
            {displayAlerts.length > 0 ? (
              displayAlerts.map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-${alert.color}-50 border border-${alert.color}-100/50 group hover:border-${alert.color}-200 transition-all`}>
                  <div className={`p-2 rounded-xl bg-white text-${alert.color}-600 shadow-sm shadow-${alert.color}-100 group-hover:scale-110 transition-transform shrink-0`}>
                    <AlertCircle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-[10px] font-black text-${alert.color}-600 uppercase tracking-widest`}>{alert.type}</p>
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{alert.time}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs italic font-medium">No recent alerts.</div>
            )}
          </div>
          {displayAlerts.length > 0 && (
            <button 
              onClick={() => {
                setIsAlertsCleared(true);
                localStorage.setItem('financeAlertsCleared', 'true');
              }}
              className="w-full mt-6 py-4 border-2 border-slate-100 border-dashed rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 transition-all"
            >
              Clear
            </button>
          )}
        </div>

        <div className="col-span-12 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-50 flex flex-col lg:flex-row gap-4 justify-between lg:items-center bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">Invoice Status Table</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Detailed log of recent financial transactions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search client or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm" 
                />
              </div>
              
              <div className="relative flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto" ref={filterRef}>
                <button 
                  onClick={() => setShowFilterPopover(!showFilterPopover)}
                  className={`p-2.5 rounded-xl border transition-all shadow-sm active:scale-95 flex items-center justify-center ${showFilterPopover || filterStatus !== 'All' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                >
                  <Filter size={18} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 sm:flex-initial bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all uppercase tracking-widest text-center"
                >
                  Generate Invoice
                </button>

                {showFilterPopover && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Filter Status</p>
                    {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterPopover(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span>{status}</span>
                        {filterStatus === status && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">ID</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">Date</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">Client</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 text-center">Amount</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">Status</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 text-xs font-bold text-slate-400">{inv.invoiceNumber || inv.id}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 text-xs font-bold text-slate-600 whitespace-nowrap">
                      {inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 text-sm font-black text-slate-800">{inv.client}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 text-sm font-black text-slate-900 text-center italic whitespace-nowrap">
                      ₹{parseFloat(inv.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
                      <div className={`w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap ${inv.status === 'Paid' ? 'bg-emerald-500 text-white' : inv.status === 'Pending' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>{inv.status}</div>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onInvoiceClick && onInvoiceClick(inv.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic font-medium">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Generate New Invoice</h2><p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">Add billing & transaction logging</p></div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleCreateInvoice} className="space-y-6 text-left">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Client</label>
                  <select 
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" 
                    value={formData.client} 
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Tender</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" 
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tender Value (₹)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                      <input 
                        type="text" 
                        disabled
                        placeholder="0.00" 
                        className="w-full pl-10 pr-5 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-sm font-black opacity-70" 
                        value={formData.tenderValue} 
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                      <input 
                        type="number" 
                        required
                        placeholder="0.00" 
                        className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" 
                        value={formData.amount} 
                        onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Invoice Document</label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${formData.attachment ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200'}`}>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                    {isUploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                    ) : formData.attachment ? (
                      <>
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Document Uploaded</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="text-slate-400" size={24} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click or drag to upload</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sticky bottom-0 bg-white pb-2 text-left">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={isUploading} className="order-1 sm:order-2 flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Generate Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportReport} title="Export Financial Report" />
    </div>
  );
};

export default FinancialManagement;
