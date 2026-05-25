import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info,
  BarChart3,
  Filter,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const FinanceReports = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    'ALL', 'OPERATIONS & LOGISTICS', 'MARKETING & GROWTH', 'IT INFRASTRUCTURE', 
    'RESEARCH & DEVELOPMENT', 'FINANCE & ACCOUNTS', 'HR & ADMIN'
  ];

  const stats = [
    { label: 'REVENUE', value: '$60,347.00', change: '+15%', up: true },
    { label: 'EXPENSES', value: '$15,048.30', change: '+15%', up: true },
    { label: 'PROFIT', value: '$17,007.70', change: '+32%', up: true },
    { label: 'LOSS', value: '-$3,271.50', change: '-8%', up: false },
    { label: 'BUDGET USED', value: '8.60% used', progress: 8.6 },
    { label: 'OUTSTANDING', value: '$17,320', change: '+11%', up: true },
  ];

  const chartData = [
    { name: 'JAN 1', revenue: 10000, expenses: 7000 },
    { name: 'SEP 1', revenue: 12000, expenses: 5000 },
    { name: 'DEC 1', revenue: 11000, expenses: 8000 },
    { name: 'JAN 2', revenue: 14000, expenses: 10000 },
    { name: 'JAN 1', revenue: 13000, expenses: 9000 },
    { name: 'MAR 3', revenue: 12500, expenses: 7500 },
    { name: 'APR 3', revenue: 16000, expenses: 9500 },
    { name: 'OCT 3', revenue: 18000, expenses: 12000 },
  ];

  const alerts = [
    { type: 'warning', text: 'MARKETING BUDGET NEAR LIMIT TO A VAMCULATED PRINACIAL POINTS' },
    { type: 'warning', text: 'REVENUE INCREASED BY 15% Q/Q ON ANPORT GRADER COMPARTION.' },
    { type: 'warning', text: 'REVENUE INCREASED BY 15% 15% Q/Q.' },
    { type: 'info', text: 'OUSSANTING BUDGET ARE IMPORTANT TO SSKURE FROM THE CHANGES.' },
  ];

  const reportDetails = [
    { date: 'Jan 1, 2026', category: 'FINANCE', desc: 'MARKETING BUDGET NEAR LIMIT', planned: '$1,050,000', actual: '$1,050,000', variance: '+1,205.00', status: 'ON TRACK' },
    { date: 'Jan 1, 2026', category: 'RESEARCH & COV.', desc: 'IT INFRASTRUCTUNI ANALYSIS', planned: '$125,000', actual: '$125,000', variance: '-1,484.00', status: 'REVIEW NEEDED' },
    { date: 'Oct 1, 2026', category: 'FINANCE', desc: 'REVENUE INCREASED BY 15% Q/Q', planned: '$725,000', actual: '$725,000', variance: '+1,259.00', status: 'ON TRACK' },
    { date: 'Oct 1, 2026', category: 'SHOOTINGS', desc: 'RESEARCH DEVELOPMENT', planned: '$540,000', actual: '$540,000', variance: '+3,200.00', status: 'ON TRACK' },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search reports..."
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/5 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[1.5rem] border border-slate-50 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
             <Calendar size={18} className="text-slate-300" />
             <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Jan 1, 2026 - Mar 31, 2026</span>
             <ChevronDown size={16} className="text-slate-300" />
          </div>

          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[1.5rem] border border-slate-50 shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
             <span className="text-xs font-black text-slate-600 uppercase tracking-widest">All Departments</span>
             <ChevronDown size={16} className="text-slate-300" />
          </div>

          <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
             <Download size={18} />
             <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 gap-10 pb-4">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all relative pb-4
              ${activeCategory === cat ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {cat}
            {activeCategory === cat && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
             <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{stat.value}</h3>
             {stat.change && (
               <div className={`flex items-center gap-1 text-[9px] font-black uppercase
                 ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{stat.change} change</span>
               </div>
             )}
             {stat.progress && (
                <div className="space-y-3 mt-4">
                   <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stat.progress}%` }}></div>
                   </div>
                </div>
             )}
          </div>
        ))}
      </div>

      {/* Charts & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Chart Card */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50"></div>
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">REVENUE VS. EXPENSES (QUARTERLY)</h3>
              <button className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                 <MoreVertical size={20} />
              </button>
           </div>

           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                 <BarChart data={chartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }}
                      tickFormatter={(val) => `$${val/1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="expenses" fill="#f97316" radius={[4, 4, 0, 0]} barSize={12} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm">
           <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic mb-8">ALERTS</h3>
           <div className="space-y-6">
              {alerts.map((alert, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-300 group">
                   <div className={`shrink-0 p-2 rounded-xl h-fit
                     ${alert.type === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                      {alert.type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-tight group-hover:text-slate-800 transition-colors">
                      {alert.text}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Report Details Table */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm pb-6">
         <div className="flex justify-between items-center mb-10 px-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">REPORT DETAILS</h3>
            <div className="w-3 h-3 rounded-full bg-rose-400 shadow-lg shadow-rose-100"></div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">DATE</th>
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">CATEGORY</th>
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">DESCRIPTION</th>
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">PLANNED</th>
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">ACTUAL</th>
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">VARIANCE</th>
                     <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">STATUS</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {reportDetails.map((row, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="py-7 text-[11px] font-black text-slate-400 uppercase tracking-tight">{row.date}</td>
                       <td className="py-7 text-[11px] font-black text-slate-900 uppercase tracking-tight">{row.category}</td>
                       <td className="py-7 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic leading-tight max-w-[200px]">"{row.desc}"</td>
                       <td className="py-7 text-sm font-black text-slate-900">{row.planned}</td>
                       <td className="py-7 text-sm font-black text-slate-900">{row.actual}</td>
                       <td className={`py-7 text-[11px] font-black tracking-tight ${row.variance.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {row.variance}
                       </td>
                       <td className="py-7">
                          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] shadow-sm
                            ${row.status === 'ON TRACK' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {row.status}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default FinanceReports;
