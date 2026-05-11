import React from 'react';
import {
  FileText,
  HelpCircle,
  Clock,
  Trophy,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  X
} from 'lucide-react';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell
} from 'recharts';

const stats = [
  { label: 'Tenders in Submission', value: '18', trend: '+5%', icon: FileText, color: 'blue' },
  { label: 'Clarification Questions Open', value: '24', trend: 'High', icon: HelpCircle, color: 'rose', isAlert: true },
  { label: 'Avg. Response Time (Clarifications)', value: '2.5 days', trend: 'Optimal', icon: Clock, color: 'amber' },
  { label: 'Won Tenders (Last 30 Days)', value: '15', trend: '+12%', icon: Trophy, color: 'emerald' },
];

const funnelData = [
  { name: 'Pre-Qualification', value: 12500 },
  { name: 'Clarification', value: 10000 },
  { name: 'Final Proposal', value: 7500 },
  { name: 'Evaluation', value: 5000 },
  { name: 'Awarded/Lost', value: 2000 },
];

const clarificationData = [
  { month: 'Jan', received: 5, responded: 3 },
  { month: 'Feb', received: 8, responded: 6 },
  { month: 'Mar', received: 12, responded: 10 },
  { month: 'Apr', received: 7, responded: 7 },
  { month: 'May', received: 15, responded: 12 },
  { month: 'Jun', received: 20, responded: 15 },
  { month: 'Jul', received: 18, responded: 16 },
  { month: 'Aug', received: 25, responded: 22 },
];

const workQueue = [
  { task: 'Clarification questions: New five questions here is that tender clarification?', date: 'Due today', resp: 'Team', status: 'Awarded' },
  { task: 'Clarification questions: High priority learn! Final Proposal clarification question?', date: 'Due today', resp: 'Team', status: 'Submitted' },
  { task: 'Clarification posted to sent or clarification question?', date: 'Due tomorrow', resp: 'Team', status: 'Awarded' },
];

const TenderManagement = ({ onView, onEdit, onCreate, tenders, setTenders }) => {
  const [selectedTender, setSelectedTender] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tender? This action cannot be undone.')) {
      setTenders(tenders.filter(t => t.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Tender Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track and manage your ongoing tender lifecycles.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={18} className="text-blue-500" />
            <span>Select Period</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 bg-white shadow-xl shadow-slate-200/50 border-none group cursor-pointer relative overflow-hidden">
            {stat.isAlert && <div className="absolute top-0 right-0 p-2"><HelpCircle size={14} className="text-rose-500 animate-pulse" /></div>}
            <div className={`p-3 w-fit rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tender Funnel Stage */}
        <div className="card p-8 bg-white shadow-xl shadow-slate-200/40 border-none">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase tracking-[0.1em]">Tender Funnel Stage</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><MoreVertical size={20} className="text-slate-400" /></button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} width={120} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clarification Question Volume */}
        <div className="card p-8 bg-white shadow-xl shadow-slate-200/40 border-none">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase tracking-[0.1em]">Clarification Question Volume</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-[10px] font-bold text-slate-500">Received</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-400 rounded-full"></div><span className="text-[10px] font-bold text-slate-500">Responded</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clarificationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="received" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="responded" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Work Queue */}
      {/* <div className="card bg-white shadow-xl shadow-slate-200/40 border-none overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase tracking-[0.1em]">Work Queue</h3>
          <p className="text-xs text-slate-500 font-bold">Tender Clarifications & Action Items</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4 w-10"><input type="checkbox" className="rounded" /></th>
                <th className="px-8 py-4">Tender Clarifications & Action Items</th>
                <th className="px-8 py-4">Due Date</th>
                <th className="px-8 py-4">Responsible</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {workQueue.map((item, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <td className="px-8 py-5"><input type="checkbox" className="rounded" /></td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">{item.task}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{item.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">JS</div>
                      <span className="text-xs font-bold text-slate-600">{item.resp}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`mx-auto w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                      ${item.status === 'Awarded' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Tables - Active Tenders Master List */}
      <div className="card bg-white shadow-xl shadow-slate-200/40 border-none overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase tracking-[0.1em]">Active Tenders Master List</h3>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
              <Filter size={16} />
              <span>Filters</span>
            </button>
            <button 
              onClick={onCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
            >
              Add New
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">ID</th>
                <th className="px-8 py-4">Tender Title</th>
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Primary Contact</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Due Date</th>
                <th className="px-8 py-4">Value (₹)</th>
                <th className="px-8 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenders.map((tender, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{tender.id}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">{tender.title}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{tender.client}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{tender.contact}</td>
                  <td className="px-8 py-5">
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit
                      ${tender.status === 'Submission in Progress' ? 'bg-blue-100 text-blue-600' :
                        tender.status === 'Under Evaluation' ? 'bg-amber-100 text-amber-600' :
                          tender.status === 'Awarded' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-rose-100 text-rose-600'}`}>
                      {tender.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{tender.due}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{tender.value}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onView(tender.id)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Eye size={16} /></button>
                      <button onClick={() => onEdit(tender)} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(tender.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Tender Modal removed - using detailed CreateTender instead */}
    </div>
  );
};

export default TenderManagement;
