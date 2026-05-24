import React from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  MoreVertical,
  Edit2,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Reports = () => {
  const stats = [
    { label: 'Total Tenders', value: '2,500' },
    { label: 'Active', value: '689' },
    { label: 'Submitted', value: '912' },
    { label: 'Won', value: '510' },
    { label: 'Lost', value: '389' },
    { label: 'Approval Pending', value: '45' },
  ];

  const pieData = [
    { name: 'IT', value: 1245, color: '#3b82f6' },
    { name: 'Construction', value: 879, color: '#f59e0b' },
    { name: 'Consulting', value: 458, color: '#10b981' },
    { name: 'Ifi service', value: 300, color: '#8b5cf6' },
    { name: 'Others', value: 163, color: '#e2e8f0' },
  ];

  const barData = [
    { name: 'Met', value: 680, color: '#3b82f6' },
    { name: 'Imminent', value: 320, color: '#93c5fd' },
    { name: 'Missed', value: 95, color: '#f87171' },
  ];

  const upcomingDeadlines = [
    { label: 'Tender Management...', date: '06/13/2023' },
    { label: 'Tender Management...', date: '06/16/2023' },
    { label: 'Tender Management...', date: '04/08/2023' },
  ];

  const topCategories = [
    { name: 'IT', value: '1,245' },
    { name: 'Construction', value: '879' },
    { name: 'Consulting', value: '458' },
    { name: 'Others', value: '163' },
  ];

  const tenderData = [
    { id: '3107001', title: 'Tender Management ...', client: 'Client or Admin', value: '$100,000', status: 'Status', winLoss: 'Priority', date: '06/13/2023' },
    { id: '3107002', title: 'Construction advicyt...', client: 'Client or Admin', value: '$55,000', status: 'Status', winLoss: 'Low', date: '06/18/2023' },
    { id: '3107003', title: 'Tender Management', client: 'Client or Admin', value: '$60,000', status: 'Primary', winLoss: 'Low', date: '06/18/2023' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] ">
      {/* Header Area - Matching Image 8 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Global Search" 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400 transition-all" 
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={16} />
            This Year
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
            Category: All
            <ChevronDown size={14} />
          </button>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Stats Grid - Matching Image 8 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Charts and Main Data Area */}
        <div className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Value by Category - Donut Chart */}
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Value by Category</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                   <div className="w-full h-[240px] relative">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                         <PieChart>
                            <Pie
                               data={pieData}
                               innerRadius={65}
                               outerRadius={85}
                               paddingAngle={5}
                               dataKey="value"
                            >
                               {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-2xl font-black text-slate-800">3,045</span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                      </div>
                   </div>
                   <div className="w-full space-y-4">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center group">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-wider">{item.name}</span>
                           </div>
                           <span className="text-[11px] font-black text-slate-800">{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Deadline Status - Bar Chart */}
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Deadline Status</h3>
                <div className="w-full h-[240px]">
                   <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                            dy={10}
                         />
                         <YAxis hide />
                         <Tooltip cursor={{fill: '#f8fafc'}} />
                         <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6">
                   {barData.map((item, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Master Table - Matching Image 8 */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                         <th className="px-10 py-5">TENDER ID</th>
                         <th className="px-10 py-5">TITLE</th>
                         <th className="px-10 py-5">CLIENT</th>
                         <th className="px-10 py-5">VALUE</th>
                         <th className="px-10 py-5">STATUS</th>
                         <th className="px-10 py-5">WIN/LOSS</th>
                         <th className="px-10 py-5">DEADLINE</th>
                         <th className="px-10 py-5 text-right">ACTION</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {tenderData.map((tender, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                           <td className="px-10 py-6 text-xs font-black text-slate-800">{tender.id}</td>
                           <td className="px-10 py-6 text-xs font-bold text-slate-500">{tender.title}</td>
                           <td className="px-10 py-6 text-xs font-bold text-slate-400">{tender.client}</td>
                           <td className="px-10 py-6 text-xs font-black text-slate-900">{tender.value}</td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                 <span className="text-xs font-bold text-slate-500">{tender.status}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${tender.winLoss === 'Priority' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                 <span className="text-xs font-bold text-slate-500">{tender.winLoss}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6 text-xs font-bold text-slate-400">{tender.date}</td>
                           <td className="px-10 py-6 text-right">
                              <button className="p-2 text-slate-200 group-hover:text-blue-500 transition-colors">
                                 <Edit2 size={16} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Sidebar Panel - Matching Image 8 */}
        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
              <h3 className="text-[11px] font-black text-slate-900 tracking-[0.15em] uppercase">Upcoming Deadlines</h3>
              <div className="space-y-6">
                 {upcomingDeadlines.map((item, i) => (
                   <div key={i} className="flex justify-between items-center group cursor-pointer">
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-wider">{item.label}</span>
                      <span className="text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors">{item.date}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
              <h3 className="text-[11px] font-black text-slate-900 tracking-[0.15em] uppercase">Top Categories</h3>
              <div className="space-y-6">
                 {topCategories.map((item, i) => (
                   <div key={i} className="flex justify-between items-center group cursor-pointer">
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-wider">{item.name}</span>
                      <span className="text-[11px] font-black text-slate-900">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
