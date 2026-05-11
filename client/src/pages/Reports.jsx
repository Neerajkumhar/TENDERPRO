import React from 'react';
import { 
  FileText, 
  Briefcase, 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  Plus, 
  Filter, 
  RotateCcw,
  Search,
  Download,
  Mail,
  Eye,
  MoreVertical,
  Star,
  ChevronRight,
  LayoutGrid,
  List,
  ChevronLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const sparkData = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 35 }, { value: 20 }, { value: 45 }, { value: 30 }
];

const statsData = [
  { label: 'Total Tenders', value: '248', trend: '12.5%', isUp: true, color: 'blue', icon: FileText },
  { label: 'Total Projects', value: '132', trend: '8.4%', isUp: true, color: 'emerald', icon: Briefcase },
  { label: 'Total Revenue', value: '₹12.45Cr', trend: '15.3%', isUp: true, color: 'purple', icon: IndianRupee },
  { label: 'Total Profit', value: '₹2.45Cr', trend: '10.2%', isUp: true, color: 'orange', icon: TrendingUp },
];

const revenueOverviewData = [
  { name: 'Apr 24', revenue: 8, cost: 5, profit: 3 },
  { name: 'May 24', revenue: 11, cost: 7, profit: 4 },
  { name: 'Jun 24', revenue: 13, cost: 8, profit: 5 },
  { name: 'Jul 24', revenue: 14, cost: 9, profit: 5 },
  { name: 'Aug 24', revenue: 17, cost: 11, profit: 6 },
  { name: 'Sep 24', revenue: 23, cost: 15, profit: 8 },
  { name: 'Oct 24', revenue: 19, cost: 13, profit: 6 },
  { name: 'Nov 24', revenue: 16, cost: 11, profit: 5 },
  { name: 'Dec 24', revenue: 12, cost: 8, profit: 4 },
  { name: 'Jan 25', revenue: 15, cost: 10, profit: 5 },
  { name: 'Feb 25', revenue: 16, cost: 10, profit: 6 },
  { name: 'Mar 25', revenue: 18, cost: 12, profit: 6 },
];

const statusData = [
  { name: 'Completed', value: 42, color: '#10b981', percentage: '31.8%' },
  { name: 'In Progress', value: 48, color: '#3b82f6', percentage: '36.4%' },
  { name: 'On Hold', value: 12, color: '#f59e0b', percentage: '9.1%' },
  { name: 'Cancelled', value: 8, color: '#ef4444', percentage: '6.1%' },
  { name: 'Not Started', value: 22, color: '#94a3b8', percentage: '16.6%' },
];

const reportsTable = [
  { name: 'Financial Summary Report', type: 'Financial', range: '01 Apr 2024 - 31 May 2024', generated: '20 May 2024, 11:30 AM', user: 'Admin User', starred: true },
  { name: 'Project Progress Report', type: 'Project', range: '01 Apr 2024 - 31 May 2024', generated: '20 May 2024, 10:15 AM', user: 'Admin User', starred: false },
  { name: 'Client Performance Report', type: 'Client', range: '01 Apr 2024 - 31 May 2024', generated: '19 May 2024, 05:45 PM', user: 'Admin User', starred: false },
  { name: 'Team Productivity Report', type: 'Team', range: '01 Apr 2024 - 31 May 2024', generated: '19 May 2024, 04:20 PM', user: 'Admin User', starred: false },
  { name: 'Tender Analysis Report', type: 'Tender', range: '01 Apr 2024 - 31 May 2024', generated: '18 May 2024, 03:10 PM', user: 'Admin User', starred: false },
];

const Reports = () => {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track performance, analyze trends and make data-driven decisions.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95">
            <Calendar size={18} className="text-blue-500" />
            <span>Scheduled Reports</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
            <Plus size={18} />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Stats Sparkline Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="card p-6 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <ChevronRight size={12} className={stat.isUp ? '-rotate-90' : 'rotate-90'} />
                    {stat.trend}
                    <span className="text-slate-400 font-bold ml-1 italic capitalize">vs last 30 days</span>
                  </div>
                </div>
              </div>
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <Area type="monotone" dataKey="value" stroke={stat.color === 'blue' ? '#3b82f6' : stat.color === 'emerald' ? '#10b981' : stat.color === 'purple' ? '#8b5cf6' : '#f59e0b'} fillOpacity={0.1} fill={stat.color === 'blue' ? '#3b82f6' : stat.color === 'emerald' ? '#10b981' : stat.color === 'purple' ? '#8b5cf6' : '#f59e0b'} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <span>Date Range</span>
          <ChevronRight size={14} className="rotate-90" />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-700">
          <Calendar size={14} className="text-blue-500" />
          <span>01 Apr 2024 - 31 May 2024</span>
        </div>
        <div className="w-[1px] h-6 bg-slate-200 mx-2"></div>
        {['Report Type', 'Project', 'Client'].map(filter => (
          <div key={filter} className="flex-1 min-w-[150px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{filter}</p>
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <span>All {filter === 'Report Type' ? '' : filter + 's'}</span>
              <ChevronRight size={14} className="rotate-90 text-slate-400" />
            </div>
          </div>
        ))}
        <div className="flex gap-2 ml-auto">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-blue-400 transition-all shadow-sm">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="p-2.5 text-slate-400 hover:text-blue-600 transition-all">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-12 gap-8">
        {/* Revenue Overview */}
        <div className="col-span-12 lg:col-span-7 card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Revenue Overview</h3>
              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">i</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                {['Revenue', 'Cost', 'Profit'].map((type, idx) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-2.5 h-1 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{type}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer">
                <span>This Year</span>
                <ChevronRight size={12} className="rotate-90" />
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueOverviewData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            {[
              { label: 'Total Revenue', value: '₹12,45,80,000' },
              { label: 'Total Cost', value: '₹10,00,50,000' },
              { label: 'Total Profit', value: '₹2,45,30,000' },
              { label: 'Profit Margin', value: '19.71%', isPercent: true }
            ].map((metric, i) => (
              <div key={i} className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                <div className="flex items-center gap-2">
                  {metric.isPercent && <div className="p-1 rounded-lg bg-blue-100 text-blue-600"><TrendingUp size={12} /></div>}
                  <span className="text-sm font-black text-slate-900">{metric.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="col-span-12 lg:col-span-5 card p-8 bg-white border-none shadow-xl shadow-slate-200/40 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Project Status Distribution</h3>
              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">i</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer">
              <span>This Year</span>
              <ChevronRight size={12} className="rotate-90" />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-8">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">132</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Projects</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: item.color}}></div>
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-black text-slate-900">{item.value}</span>
                    <span className="text-slate-400 font-medium">({item.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-8 py-3 border-t border-slate-50 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
            View Project Report <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* All Reports Table */}
      <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4 bg-slate-50/30">
          <h3 className="font-black text-slate-900 text-xl tracking-tight">All Reports</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search reports..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 w-64 shadow-sm" />
            </div>
            <button className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-blue-400 transition-all shadow-sm">
              <Download size={16} />
              <span>Export</span>
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="p-2 text-slate-400 hover:text-slate-600"><List size={16} /></button>
              <button className="p-2 bg-white text-blue-600 rounded-lg shadow-sm"><LayoutGrid size={16} /></button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Report Name</th>
                <th className="px-8 py-4">Report Type</th>
                <th className="px-8 py-4">Date Range</th>
                <th className="px-8 py-4">Generated On</th>
                <th className="px-8 py-4">Generated By</th>
                <th className="px-8 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportsTable.map((report, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <Star size={16} className={report.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                      <span className="text-sm font-black text-blue-600 hover:underline cursor-pointer">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      report.type === 'Financial' ? 'bg-emerald-100 text-emerald-600' :
                      report.type === 'Project' ? 'bg-blue-100 text-blue-600' :
                      report.type === 'Client' ? 'bg-purple-100 text-purple-600' :
                      report.type === 'Team' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{report.range}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{report.generated}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">A</div>
                      <span className="text-xs font-bold text-slate-700">{report.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Download size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"><Mail size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-50 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-400">Showing 1 to 5 of 15 reports</p>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50"><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-xs font-black shadow-lg shadow-blue-200">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600">2</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600">3</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600">...</button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 rotate-180"><ChevronLeft size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
