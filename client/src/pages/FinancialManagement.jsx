import React from 'react';
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
  PieChart as PieChartIcon
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

const statsData = [
  { label: 'Total Revenue', value: '₹1.25M', trend: '+ 12%', isUp: true, color: 'blue', icon: IndianRupee },
  { label: 'Total Expenses', value: '₹0.85M', trend: '+ 3%', isUp: false, color: 'rose', icon: TrendingDown },
  { label: 'Net Profit', value: '₹0.40M', trend: '+ 8%', isUp: true, color: 'emerald', icon: TrendingUp },
  { label: 'Cash Flow', value: '₹0.60M', trend: 'Stable', isUp: true, color: 'indigo', icon: Wallet },
  { label: 'Budget Used', value: '75%', trend: 'On track', isUp: true, color: 'amber', icon: FileText, isProgress: true },
  { label: 'Pending Invoices', value: '28', trend: '+ 4', isUp: false, color: 'orange', icon: Clock },
  { label: 'Paid Invoices', value: '115', trend: '+ 12', isUp: true, color: 'blue', icon: CheckCircle2 },
  { label: 'Outstanding Dues', value: '₹0.12M', trend: '- 5%', isUp: true, color: 'rose', icon: AlertCircle },
];

const revenueVsExpenseData = [
  { name: 'Jan', revenue: 400, expense: 300 },
  { name: 'Feb', revenue: 650, expense: 450 },
  { name: 'Mar', revenue: 550, expense: 400 },
  { name: 'Apr', revenue: 850, expense: 600 },
  { name: 'May', revenue: 700, expense: 500 },
  { name: 'Jun', revenue: 900, expense: 650 },
  { name: 'Jul', revenue: 750, expense: 550 },
  { name: 'Aug', revenue: 800, expense: 600 },
  { name: 'Sep', revenue: 650, expense: 450 },
  { name: 'Oct', revenue: 950, expense: 700 },
  { name: 'Nov', revenue: 1100, expense: 800 },
  { name: 'Dec', revenue: 1000, expense: 750 },
];

const budgetVsActualData = [
  { name: 'Tech', budget: 800, actual: 700 },
  { name: 'Marketing', budget: 500, actual: 450 },
  { name: 'Ops', budget: 700, actual: 750 },
  { name: 'Data', budget: 900, actual: 850 },
  { name: 'Sales', budget: 650, actual: 700 },
];

const categoryData = [
  { name: 'Salaries', value: 35, color: '#3b82f6' },
  { name: 'Marketing', value: 20, color: '#10b981' },
  { name: 'Infrastructure', value: 25, color: '#f59e0b' },
  { name: 'Operations', value: 20, color: '#6366f1' },
];

const invoices = [
  { id: 'INV-001', date: '05/20/22', client: 'Acme Corp', amount: '₹2,500', status: 'Paid' },
  { id: 'INV-002', date: '08/21/22', client: 'TechSolutions', amount: '₹1,200', status: 'Pending' },
  { id: 'INV-003', date: '10/20/22', client: 'Global Industries', amount: '₹3,500', status: 'Paid' },
  { id: 'INV-004', date: '12/15/22', client: 'Prime Co.', amount: '₹1,800', status: 'Overdue' },
];

const alerts = [
  { type: 'Financial Warning', message: 'Budget overspend Acme Corp.', time: '1 hour ago', color: 'rose' },
  { type: 'Financial Warning', message: 'Unusual expense spike in Marketing.', time: '2 hours ago', color: 'amber' },
  { type: 'Approval', message: 'Expense claim ₹5,000 approved.', time: '4 hours ago', color: 'emerald' },
  { type: 'Approval', message: 'New invoice generated for TechCorp.', time: '5 hours ago', color: 'blue' },
];

const FinancialManagement = () => {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track revenue, expenses, and overall financial health.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm">
            <Download size={18} />
            <span>Export Report</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
            <Plus size={18} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-4 bg-white border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500`}></div>
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon size={18} />
              </div>
              <div className={`text-[10px] font-black ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
            {stat.isProgress && (
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-${stat.color}-500 rounded-full`} style={{ width: stat.value }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Revenue vs Expense Chart - Full Width Top */}
        <div className="col-span-12 card p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Revenue vs Expense</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly financial comparison</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-200"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueVsExpenseData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expense" stroke="#cbd5e1" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3-Column Row: Budget | Categories | Payments */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full">
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Budget vs Actual</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActualData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Bar dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="actual" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full">
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Expense Categories</h3>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-900">₹8.5L</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                    <span className="font-bold text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-black text-slate-900">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 h-full">
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Payments and Dues</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming payment {i + 1}</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">Acme - 11, 2024</p>
                    </div>
                    <p className="text-sm font-black text-slate-900">₹15,000</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95">View All Dues</button>
          </div>
        </div>

        {/* Invoice Table - Full Width Bottom */}
        <div className="col-span-12 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Invoice Status Table</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Detailed log of recent financial transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-blue-400 transition-all shadow-sm">
                <Filter size={18} />
              </button>
              <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all uppercase tracking-widest">Generate Invoice</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Client</th>
                  <th className="px-8 py-4 text-center">Amount</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{inv.id}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600">{inv.date}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-800">{inv.client}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900 text-center">{inv.amount}</td>
                    <td className="px-8 py-5">
                      <div className={`w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm
                        ${inv.status === 'Paid' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                          inv.status === 'Pending' ? 'bg-blue-500 text-white shadow-blue-200' : 
                          'bg-rose-500 text-white shadow-rose-200'}`}>
                        {inv.status}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
