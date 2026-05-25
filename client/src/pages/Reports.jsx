import React, { useState, useEffect } from 'react';
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
  Tooltip
} from 'recharts';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [deadlineType, setDeadlineType] = useState('tenders');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All Time');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // Premium Toast Notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch('/api/tenders/reports');
        if (!response.ok) {
          throw new Error('Failed to load dynamic reports database.');
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Reports Fetch Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider">Reports Database Error</h3>
          <p className="text-xs font-bold text-rose-700/80 leading-relaxed">{error}</p>
          <button 
             onClick={() => window.location.reload()}
             className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 mx-auto"
          >
             Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const tenderData = reportData?.tenderData || [];

  // Filter master table dynamically
  const filteredTenders = tenderData.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      item.category === selectedCategory;
      
    let matchesTimeframe = true;
    if (selectedTimeframe !== 'All Time') {
      const yearStr = selectedTimeframe.replace(/[^0-9]/g, '');
      const year = parseInt(yearStr);
      if (item.date !== 'N/A') {
        const itemYear = new Date(item.date).getFullYear();
        matchesTimeframe = itemYear === year;
      } else {
        matchesTimeframe = false;
      }
    }
      
    return matchesSearch && matchesCategory && matchesTimeframe;
  });

  const getAmountValue = (valStr) => {
    if (!valStr) return 0;
    const clean = valStr.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const totalTendersCount = filteredTenders.length;
  const completedTendersCount = filteredTenders.filter(t => t.status === 'Won' || t.status === 'Lost').length;
  const pendingTendersCount = totalTendersCount - completedTendersCount;

  const stats = [
    { label: 'Total Tenders', value: totalTendersCount.toLocaleString() },
    { label: 'Completed Tenders', value: completedTendersCount.toLocaleString() },
    { label: 'Pending Tenders', value: pendingTendersCount.toLocaleString() },
    { label: 'Total Projects', value: reportData?.stats?.[3]?.value || '0' },
    { label: 'Completed Projects', value: reportData?.stats?.[4]?.value || '0' },
    { label: 'Pending Projects', value: reportData?.stats?.[5]?.value || '0' }
  ];

  const categoryTotals = {
    'Government': { count: 0, budget: 0, color: '#3b82f6' },
    'Private': { count: 0, budget: 0, color: '#f59e0b' },
    'PSU': { count: 0, budget: 0, color: '#10b981' },
    'Non-Profit': { count: 0, budget: 0, color: '#8b5cf6' }
  };

  filteredTenders.forEach(t => {
    const cat = t.category || 'Private';
    const budgetVal = getAmountValue(t.value);
    if (categoryTotals[cat]) {
      categoryTotals[cat].count += 1;
      categoryTotals[cat].budget += budgetVal;
    }
  });

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat].budget,
    count: categoryTotals[cat].count,
    color: categoryTotals[cat].color
  }));

  const totalCategoryValue = pieData.reduce((sum, item) => sum + item.value, 0);

  let metCount = 0;
  let imminentCount = 0;
  let missedCount = 0;
  const todayDate = new Date();

  filteredTenders.forEach(t => {
    const subDateStr = t.date;
    const subDate = subDateStr && subDateStr !== 'N/A' ? new Date(subDateStr) : null;
    if (['Won', 'Lost', 'Active'].includes(t.status)) {
      metCount += 1;
    } else if (subDate && subDate > todayDate) {
      imminentCount += 1;
    } else if (subDate && subDate < todayDate) {
      missedCount += 1;
    } else {
      imminentCount += 1;
    }
  });

  const barData = [
    { name: 'Met', value: metCount, color: '#10b981' },
    { name: 'Imminent', value: imminentCount, color: '#3b82f6' },
    { name: 'Missed', value: missedCount, color: '#f87171' }
  ];

  const upcomingDeadlinesList = reportData?.upcomingDeadlines?.[deadlineType] || [];

  const topCategories = pieData
    .slice()
    .sort((a, b) => b.value - a.value)
    .map(item => ({
      name: item.name,
      value: item.count.toLocaleString()
    }));



  const handleExportExcel = () => {
    if (filteredTenders.length === 0) {
      alert("No data matched your criteria to export.");
      return;
    }

    const exportRows = filteredTenders.map(t => ({
      "Tender ID": t.id,
      "Tender Title": t.title,
      "Client": t.client,
      "Budget Value": t.value,
      "Status": t.status,
      "Win/Loss": t.winLoss,
      "Deadline": t.date,
      "Category": t.category
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tenders Report");
    XLSX.writeFile(workbook, `Tenders_Analytics_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    triggerToast("Excel analytics report downloaded successfully!");
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd]">
      {/* Header Area - Matching Image 8 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Global Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition-all shadow-sm" 
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              <Calendar size={16} />
              {selectedTimeframe === 'All Time' ? 'Timeframe' : selectedTimeframe}
              <ChevronDown size={14} />
            </button>
            {showTimeframeDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                 {['All Time', 'This Year (2026)', '2025', '2024'].map((tf) => (
                   <button
                     key={tf}
                     onClick={() => {
                       setSelectedTimeframe(tf);
                       setShowTimeframeDropdown(false);
                     }}
                     className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 ${
                       selectedTimeframe === tf ? 'text-indigo-500 bg-indigo-50/40 font-black' : 'text-slate-600'
                     }`}
                   >
                     {tf}
                   </button>
                 ))}
              </div>
            )}
          </div>
          
          {/* Dynamic Categories Dropdown Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              Category: {selectedCategory}
              <ChevronDown size={14} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                 {['All', 'Government', 'Private', 'PSU', 'Non-Profit'].map((cat) => (
                   <button
                     key={cat}
                     onClick={() => {
                       setSelectedCategory(cat);
                       setShowCategoryDropdown(false);
                     }}
                     className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 ${
                       selectedCategory === cat ? 'text-indigo-500 bg-indigo-50/40 font-black' : 'text-slate-600'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#1e293b] hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-slate-100 active:scale-95"
        >
          <Download size={16} />
          Export Report
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
                               data={pieData.filter(d => d.value > 0)}
                               innerRadius={65}
                               outerRadius={85}
                               paddingAngle={5}
                               dataKey="value"
                            >
                               {pieData.filter(d => d.value > 0).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Pie>
                            <Tooltip formatter={(val) => `₹${parseFloat(val).toLocaleString('en-IN')}`} />
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-base font-black text-slate-800">₹{totalCategoryValue >= 100000 ? `${(totalCategoryValue / 100000).toFixed(1)}L` : totalCategoryValue.toLocaleString('en-IN')}</span>
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
                           <span className="text-[11px] font-black text-slate-800">₹{item.value >= 100000 ? `${(item.value / 100000).toFixed(1)}L` : item.value.toLocaleString('en-IN')}</span>
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
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredTenders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            No tenders match your active search or category filters.
                          </td>
                        </tr>
                      ) : (
                        filteredTenders.map((tender, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                             <td className="px-10 py-6 text-xs font-black text-slate-800">{tender.id}</td>
                             <td className="px-10 py-6 text-xs font-bold text-slate-500">{tender.title}</td>
                             <td className="px-10 py-6 text-xs font-bold text-slate-400">{tender.client}</td>
                             <td className="px-10 py-6 text-xs font-black text-slate-900">{tender.value}</td>
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${
                                     tender.status === 'Won' ? 'bg-emerald-500' : (tender.status === 'Lost' ? 'bg-rose-500' : 'bg-blue-500')
                                   }`}></div>
                                   <span className="text-xs font-bold text-slate-500">{tender.status}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${tender.winLoss === 'Won' ? 'bg-emerald-500' : (tender.winLoss === 'Lost' ? 'bg-rose-500' : 'bg-amber-500')}`}></div>
                                   <span className="text-xs font-bold text-slate-500">{tender.winLoss}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6 text-xs font-bold text-slate-400">{tender.date}</td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Sidebar Panel - Matching Image 8 */}
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
               <div className="flex justify-between items-center gap-2">
                  <h3 className="text-[11px] font-black text-slate-900 tracking-[0.15em] uppercase">Upcoming Deadlines</h3>
                  <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
                     <button 
                        onClick={() => setDeadlineType('tenders')}
                        className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                           deadlineType === 'tenders' 
                              ? 'bg-white text-indigo-600 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-700'
                        }`}
                     >
                        Tenders
                     </button>
                     <button 
                        onClick={() => setDeadlineType('projects')}
                        className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                           deadlineType === 'projects' 
                              ? 'bg-white text-indigo-600 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-700'
                        }`}
                     >
                        Projects
                     </button>
                  </div>
               </div>
               <div className="space-y-6">
                  {upcomingDeadlinesList.length === 0 ? (
                    <p className="text-slate-400 text-xs font-bold leading-relaxed">No upcoming deadlines.</p>
                  ) : (
                    upcomingDeadlinesList.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-3 group cursor-pointer">
                         <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-wider truncate max-w-[120px]" title={item.label}>
                            {item.label}
                         </span>
                         <span className="text-[11px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">{item.date}</span>
                      </div>
                    ))
                  )}
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
      {/* Floating Toast Message */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[200] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
          <span className="text-xs font-black uppercase tracking-widest">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Reports;
