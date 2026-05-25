import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Bell,
  Edit2,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  History,
  Trophy,
  Target,
  ChevronRight
} from 'lucide-react';

const Bids = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Bids', value: '2,150' },
    { label: 'Active Bids', value: '689' },
    { label: 'Winning Bids', value: '102' },
    { label: 'Lost Bids', value: '412' },
    { label: 'Pending Review', value: '45' },
  ];

  const bidDeadlines = [
    { label: 'Total Deadline', date: '07/15' },
    { label: 'Fall Deadlines', date: '07/15' },
    { label: 'Bid Deadline', date: '08/20' },
    { label: 'Bid Deadline', date: '08/10' },
    { label: 'Bid Deadline', date: '08/15' },
  ];

  const activeBids = [
    { title: 'National Infrastructure Bid', dept: 'Transport', deadline: '07/15', status: 'Active' },
    { title: 'Smart City IT Bid', dept: 'Tech', deadline: '08/20', status: 'Active' },
    { title: 'Sound Riercuite Bid', dept: 'Tech', deadline: '08/20', status: 'Active' },
  ];

  const recentBids = [
    { title: 'Hospital Expansion', dept: 'Health', deadline: '07/15', status: 'Submitted' },
    { title: 'School Renovation', dept: 'Tech', deadline: '08/20', status: 'Active', isWinning: true },
    { title: 'Street Lighting Bid', dept: 'Infrastructure', deadline: '08/20', status: 'Active' },
  ];

  const bidHistory = [
    { title: 'Metro Phase II', client: 'LTA', value: '₹4.5Cr', status: 'Won', date: 'May 12, 2024' },
    { title: 'Cloud Migration', client: 'Digital Corp', value: '₹1.2Cr', status: 'Lost', date: 'Apr 28, 2024' },
    { title: 'Solar Farm Setup', client: 'Green Energy', value: '₹8.9Cr', status: 'Won', date: 'Mar 15, 2024' },
  ];

  return (
    <div className="px-8 pt-8 pb-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd]">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bids</h1>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Global search" 
              className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400 transition-all w-[300px]" 
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} />
            Filter
            <ChevronRight size={14} className="rotate-90" />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={16} />
            Add Bid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start group hover:shadow-xl transition-all duration-500">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Active Bids Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Active Bids</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeBids.map((bid, i) => (
                <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl relative group hover:border-blue-200 hover:shadow-lg transition-all">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Bell size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                    <Edit2 size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 mb-4 pr-10">{bid.title}</h4>
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dept: {bid.dept}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deadline: {bid.deadline}</p>
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Status: {bid.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bids Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Recent Bids</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentBids.map((bid, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden group hover:border-blue-200 hover:shadow-lg transition-all">
                  <div className="p-6 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {bid.isWinning && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Winning</span>
                      )}
                      <Bell size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                      <Edit2 size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 mb-4 pr-16">{bid.title}</h4>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dept: {bid.dept}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deadline: {bid.deadline}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status: {bid.status}</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-50 flex justify-between items-center group-hover:bg-blue-50/30 transition-all">
                     <CheckCircle2 size={16} className="text-slate-300 group-hover:text-emerald-500" />
                     <Edit2 size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bid History Section - ADDED AS REQUESTED */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <History size={18} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Bid History</h3>
                </div>
                <button className="text-[10px] font-black text-blue-600 tracking-widest uppercase hover:underline">View Full Archive</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                         <th className="px-4 py-4">BID TITLE</th>
                         <th className="px-4 py-4">CLIENT</th>
                         <th className="px-4 py-4">VALUE</th>
                         <th className="px-4 py-4">DATE</th>
                         <th className="px-4 py-4">STATUS</th>
                         <th className="px-4 py-4 text-right">ACTION</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {bidHistory.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                           <td className="px-4 py-5 text-xs font-black text-slate-800">{item.title}</td>
                           <td className="px-4 py-5 text-xs font-bold text-slate-500">{item.client}</td>
                           <td className="px-4 py-5 text-xs font-black text-slate-900">{item.value}</td>
                           <td className="px-4 py-5 text-[11px] font-bold text-slate-400">{item.date}</td>
                           <td className="px-4 py-5">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                ${item.status === 'Won' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {item.status}
                              </span>
                           </td>
                           <td className="px-4 py-5 text-right">
                              <button className="p-2 hover:bg-white hover:shadow-sm text-slate-300 hover:text-blue-600 rounded-lg transition-all">
                                 <ArrowUpRight size={16} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Sidebar Panel Area */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8 sticky top-8">
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Bid Deadlines</h3>
            <div className="space-y-6">
              {bidDeadlines.map((item, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-wider">{item.label}</span>
                  <span className="text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors">{item.date}</span>
                </div>
              ))}
            </div>
            <div className="pt-8 mt-8 border-t border-slate-50">
               <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-2">
                     <TrendingUp size={16} className="text-blue-600" />
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Performance</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed">You've won 12% more bids this quarter compared to last.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bids;
