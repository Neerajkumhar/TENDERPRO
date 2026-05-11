import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUpRight,
  Phone,
  Mail,
  Video,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2
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
  Area
} from 'recharts';

const statsData = [
  { label: 'Total Clients', value: '1,245', trend: '+ 3%', isUp: true, color: 'blue', icon: Users },
  { label: 'Active Clients', value: '1,080', trend: '+ 1%', isUp: true, color: 'emerald', icon: UserCheck },
  { label: 'New Leads', value: '250', trend: '+ 12%', isUp: true, color: 'indigo', icon: UserPlus },
  { label: 'Pending Follow-ups', value: '45', trend: '- 5%', isUp: false, color: 'amber', icon: Clock },
  { label: 'Open Tasks', value: '12', trend: '+ 2', isUp: true, color: 'blue', icon: CheckCircle2 },
  { label: 'Overdue Items', value: '3', trend: '!', isUp: false, color: 'rose', icon: AlertCircle },
  { label: 'Contracts Pending', value: '8', trend: '!', isUp: false, color: 'orange', icon: FileText },
  { label: 'Meetings Today', value: '6', trend: '!', isUp: true, color: 'purple', icon: Calendar },
];

const growthData = [
  { name: 'Jan', value: 20 },
  { name: 'Feb', value: 35 },
  { name: 'Mar', value: 30 },
  { name: 'Apr', value: 45 },
  { name: 'May', value: 50 },
  { name: 'Jun', value: 40 },
  { name: 'Jul', value: 55 },
  { name: 'Aug', value: 60 },
  { name: 'Sep', value: 50 },
  { name: 'Oct', value: 75 },
  { name: 'Nov', value: 85 },
  { name: 'Dec', value: 80 },
];

const interactions = [
  { date: '07/7/2021', client: 'Acme Corp', type: 'Call', subject: 'Meeting to preveneced project', user: 'John Doe' },
  { date: '07/9/2021', client: 'TechSolutions', type: 'Email', subject: 'Acmre deadline cremi: list to...', user: 'John Doe' },
];

const clientList = [
  { id: '1001', name: 'Acme Corp', industry: 'Industry', status: 'Active', manager: 'John Doe', date: '12/3/2023', value: '$1000.00' },
  { id: '1002', name: 'Acme Corp', industry: 'Lead Processes', status: 'Lead', manager: 'John Dove', date: '12/3/2023', value: '$1000.00' },
  { id: '1003', name: 'Acme Corp', industry: 'Industry', status: 'Lead', manager: 'John Doe', date: '12/3/2023', value: '$350.00' },
  { id: '1004', name: 'Acme Corp', industry: 'Technology', status: 'Pending', manager: 'John Doe', date: '12/3/2023', value: '$200.00' },
  { id: '1005', name: 'TechSolutions', industry: 'Technology', status: 'Pending', manager: 'John Done', date: '12/3/2023', value: '$500.00' },
];

const ClientManagement = () => {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Client Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Monitor and manage your client relationships and growth.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="client-search"
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button 
            id="add-client-btn" 
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus size={18} />
            <span>Add Client</span>
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Growth Chart - Full Width */}
        <div className="col-span-12 card p-8 bg-white border-none shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Client Growth & Engagement</h3>
              <p className="text-xs text-slate-500 font-medium">Monthly acquisition and activity trends</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Users</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Calendar (4) | Recent Interactions (8) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Meetings Calendar</h3>
              <MoreHorizontal className="text-slate-400 cursor-pointer" size={20} />
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['M', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                  <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    i === 17 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 
                    [14, 21, 28].includes(i) ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Recent Interactions</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Export Log</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {interactions.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">{item.client}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          item.type === 'Call' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FileText size={16} />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 size={16} />
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

        {/* Row 3: Client List - Full Width */}
        <div className="col-span-12 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Client List</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Detailed overview of all registered clients</p>
            </div>
            <div className="flex items-center gap-3">
              <button id="filter-clients-btn" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-blue-400 transition-all shadow-sm">
                <Filter size={18} />
              </button>
              <button id="export-clients-btn" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all uppercase tracking-widest active:scale-95">Export CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Client Name</th>
                  <th className="px-8 py-4">Industry</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Assigned Manager</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clientList.map((client, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{client.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${i % 2 === 0 ? 'blue' : 'indigo'}-100 flex items-center justify-center text-xs font-black text-${i % 2 === 0 ? 'blue' : 'indigo'}-600`}>
                          {client.name.charAt(0)}
                        </div>
                        <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{client.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600">{client.industry}</td>
                    <td className="px-8 py-5">
                      <div className={`w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm
                        ${client.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                          client.status === 'Lead' ? 'bg-blue-500 text-white shadow-blue-200' : 
                          'bg-amber-500 text-white shadow-amber-200'}`}>
                        {client.status}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <img src={`https://i.pravatar.cc/150?u=${client.manager}`} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="" />
                        <span className="text-xs font-bold text-slate-700">{client.manager}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Details">
                          <ExternalLink size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Client</h2>
                <p className="text-xs text-slate-500 font-medium italic mt-1">Register a new client into the management system.</p>
              </div>
              <button 
                onClick={() => setIsAddClientOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddClientOpen(false); }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                  <input type="text" placeholder="Enter company name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                  <input type="text" placeholder="e.g. Technology" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer">
                    <option>Active</option>
                    <option>Lead</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firm Type</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all">
                      <input type="radio" name="firmType" value="Private" className="w-4 h-4 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="text-sm font-bold text-slate-700">Private Firm</span>
                    </label>
                    <label className="flex-1 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all">
                      <input type="radio" name="firmType" value="Govt" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-bold text-slate-700">Government</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Manager</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search manager..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="flex-1 py-3 px-6 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default ClientManagement;
