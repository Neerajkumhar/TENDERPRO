import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MoreHorizontal, 
  ExternalLink,
  Clock,
  FileText,
  IndianRupee,
  Briefcase,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const statsData = [
  { label: 'Total', value: '128', trend: '+ 12%', isUp: true, color: 'blue' },
  { label: 'Active Tenders', value: '45', trend: '+ 8%', isUp: true, color: 'green' },
  { label: 'Pending Apps', value: '18', trend: '+ 5%', isUp: true, color: 'amber' },
  { label: 'Due Today', value: '7', trend: '- 13%', isUp: false, color: 'red' },
  { label: 'Payments', value: '₹245,670', trend: '+ 15%', isUp: true, color: 'emerald' },
  { label: 'Overdue Items', value: '9', trend: '- 10%', isUp: false, color: 'orange' },
];

const chartData = [
  { name: 'Dec 2023', created: 40, won: 24, lost: 16 },
  { name: 'Jan 2024', created: 65, won: 35, lost: 20 },
  { name: 'Feb 2024', created: 55, won: 42, lost: 15 },
  { name: 'Mar 2024', created: 85, won: 45, lost: 25 },
  { name: 'Apr 2024', created: 70, won: 52, lost: 18 },
  { name: 'May 2024', created: 75, won: 55, lost: 20 },
];

const tenderTable = [
  { id: 'TND-2024-128', name: 'IT Infrastructure Upgrade', client: 'TechCorp Inc.', value: '₹250,000', date: 'May 24, 2024', status: 'Active' },
  { id: 'TND-2024-127', name: 'Office Renovation', client: 'BuildWell Ltd.', value: '₹180,000', date: 'May 22, 2024', status: 'Active' },
  { id: 'TND-2024-126', name: 'Supply of Office Furniture', client: 'GreenField LLC', value: '₹75,000', date: 'May 21, 2024', status: 'Pending' },
  { id: 'TND-2024-125', name: 'Security System Installation', client: 'SecureBase Co.', value: '₹120,000', date: 'May 18, 2024', status: 'Submitted' },
  { id: 'TND-2024-124', name: 'Facility Maintenance', client: 'Prime Solutions', value: '₹90,000', date: 'May 17, 2024', status: 'Lost' },
];

const tasks = [
  { title: 'Review tender TND-2024-128', due: 'Due today', color: 'red' },
  { title: 'Prepare financial proposal', due: 'Due today', color: 'red' },
  { title: 'Client meeting with TechCorp', due: 'Tomorrow', color: 'slate' },
  { title: 'Submit tender TND-2024-127', due: 'May 22', color: 'slate' },
  { title: 'Follow up with BuildWell Ltd.', due: 'May 23', color: 'slate' },
];

const financialData = [
  { name: 'Received', value: 245670, color: '#3b82f6' },
  { name: 'Outstanding', value: 74830, color: '#fbbf24' },
  { name: 'Overdue', value: 18250, color: '#ef4444' },
  { name: 'Draft', value: 320500, color: '#10b981' },
];

const teamWorkload = [
  { name: 'Sarah Johnson', tasks: 12, workload: 80, image: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Michael Brown', tasks: 9, workload: 65, image: 'https://i.pravatar.cc/150?u=michael' },
  { name: 'Emma Wilson', tasks: 7, workload: 50, image: 'https://i.pravatar.cc/150?u=emma' },
  { name: 'David Lee', tasks: 6, workload: 40, image: 'https://i.pravatar.cc/150?u=david' },
  { name: 'James Carter', tasks: 5, workload: 35, image: 'https://i.pravatar.cc/150?u=james' },
];


const Dashboard = () => {
  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight animate-in slide-in-from-left duration-500">Welcome back, John!</h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm sm:text-base">Here's what's happening with your business today.</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95">
          <Calendar size={18} className="text-blue-500" />
          <span>May 20, 2024</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-12 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {statsData.map((stat, i) => (
              <div key={i} className="card p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden bg-white border-none shadow-lg shadow-slate-200/50">
                <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500`}></div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all duration-300 shadow-inner`}>
                    <FileText size={20} />
                  </div>
                  <div className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-black ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {stat.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Graphs Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tender Overview Chart */}
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <TrendingUp size={120} />
              </div>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Tender Overview</h3>
                  <p className="text-xs text-slate-500 font-medium">Performance tracking for last 6 months</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4 mr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-200"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Won</span>
                    </div>
                  </div>
                  <select className="text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none shadow-sm cursor-pointer hover:bg-white hover:border-blue-300 transition-all">
                    <option>Last 6 Months</option>
                  </select>
                </div>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
                    <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={5} dot={{r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
                    <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={3} strokeDasharray="6 6" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Snapshot Donut */}
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Financial Snapshot</h3>
                  <p className="text-xs text-slate-500 font-medium">Revenue and payment distribution</p>
                </div>
                <select className="text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none shadow-sm cursor-pointer hover:bg-white hover:border-blue-300 transition-all">
                  <option>This Month</option>
                </select>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10 h-auto md:h-[320px]">
                <div className="w-full md:w-1/2 h-[280px] md:h-full relative group">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialData}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        {financialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">₹245k</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Received</span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4 sm:space-y-5">
                  {financialData.map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{backgroundColor: item.color, boxShadow: `0 4px 6px ${item.color}33`}}></div>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-wider">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 tracking-tight">₹{(item.value / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{backgroundColor: item.color, width: `${(item.value / 660600 * 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Tenders Table */}
            <div className="card col-span-1 xl:col-span-2 overflow-hidden bg-white border-none shadow-xl shadow-slate-200/40">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Recent Tenders</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Manage and track your latest applications</p>
                </div>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-black shadow-sm border border-slate-100 hover:border-blue-200 transition-all uppercase tracking-widest active:scale-95">View all</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-4">ID</th>
                      <th className="px-8 py-4">Tender Name</th>
                      <th className="px-8 py-4">Client</th>
                      <th className="px-8 py-4">Value</th>
                      <th className="px-8 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tenderTable.map((tender, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <td className="px-8 py-5 text-xs font-bold text-slate-400">{tender.id}</td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{tender.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Due: {tender.date}</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-600">{tender.client}</td>
                        <td className="px-8 py-5 text-sm font-black text-slate-900">{tender.value}</td>
                        <td className="px-8 py-5">
                          <div className={`mx-auto w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm
                            ${tender.status === 'Active' ? 'bg-blue-500 text-white shadow-blue-200' : 
                              tender.status === 'Pending' ? 'bg-amber-500 text-white shadow-amber-200' : 
                              tender.status === 'Submitted' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                              'bg-rose-500 text-white shadow-rose-200'}`}>
                            {tender.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team Workload Section (Compact UI) */}
            <div className="card bg-white border-none shadow-xl shadow-slate-200/40 p-6 flex flex-col h-full max-h-[500px]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">Team Workload</h3>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Capacity</p>
                </div>
                <MoreHorizontal className="text-slate-400 cursor-pointer" size={16} />
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {teamWorkload.map((member, i) => (
                  <div key={i} className="group cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <img src={member.image} className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform" alt={member.name} />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-xs tracking-tight truncate">{member.name}</h4>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{member.tasks} Tasks</p>
                      </div>
                      <span className={`text-[10px] font-black ${member.workload > 75 ? 'text-rose-500' : 'text-slate-900'}`}>{member.workload}%</span>
                    </div>
                    
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${member.workload > 75 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : member.workload > 50 ? 'bg-blue-500' : 'bg-emerald-500'}`} 
                        style={{width: `${member.workload}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
