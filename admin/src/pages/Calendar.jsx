import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Clock,
  Calendar as CalendarIcon,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  StickyNote
} from 'lucide-react';

const CalendarPage = () => {
  const [view, setView] = useState('Month');
  const [currentMonth, setCurrentMonth] = useState('June 2024');

  const stats = [
    { label: 'Upcoming Deadlines', value: '35' },
    { label: "Today's Events", value: '12' },
    { label: 'Pending Reviews', value: '18' },
    { label: 'Overdue Items', value: '7' },
    { label: 'Scheduled Meetings', value: '9' },
  ];

  const legend = [
    { label: 'Tender Events', color: '#3b82f6' },
    { label: 'Submission Deadlines', color: '#ef4444' },
    { label: 'Bid Reviews', color: '#f59e0b' },
    { label: 'Meetings', color: '#10b981' },
    { label: 'Reminders', color: '#a855f7' },
    { label: 'Approval Dates', color: '#93c5fd' },
  ];

  // Mock calendar grid for June 2024
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] ">
      {/* Header Area - Matching Image 9 */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Calendar</h1>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">
             <Plus size={16} />
             Add Event
           </button>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
             <MoreVertical size={20} />
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex bg-slate-50 p-1 rounded-xl">
            {['Month', 'Week', 'Day'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative group w-full md:w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Global search" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-200 transition-all" 
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-black text-slate-600 hover:bg-white hover:border-slate-200 transition-all">
              Filter
              <ChevronDown size={14} className="opacity-50" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-black text-slate-600 hover:bg-white hover:border-slate-200 transition-all">
              <Download size={16} />
              Export
            </button>
         </div>
      </div>

      {/* Stats Grid - Matching Image 9 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Calendar Area */}
        <div className="lg:col-span-9 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
           {/* Calendar Header */}
           <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
              <div className="flex items-center gap-4">
                 <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100"><ChevronLeft size={18} /></button>
                 <h2 className="text-lg font-black text-slate-800 tracking-tight">{currentMonth}</h2>
                 <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100"><ChevronRight size={18} /></button>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                 <button className="px-5 py-1.5 bg-white text-blue-600 rounded-lg text-[10px] font-black shadow-sm">Month</button>
                 <button className="px-5 py-1.5 text-slate-400 text-[10px] font-black">Today</button>
              </div>
           </div>
           
           {/* Calendar Grid */}
           <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                 <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
                    {days.map(day => (
                      <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
                    ))}
                 </div>
                 <div className="grid grid-cols-7 grid-rows-5 h-[600px]">
                    {[...Array(35)].map((_, i) => {
                       const dayNum = (i - 4) > 0 && (i - 4) <= 30 ? (i - 4) : null;
                       const isPrevMonth = i < 5;
                       const isNextMonth = i > 34;
                       
                       return (
                          <div key={i} className="border-r border-b border-slate-50 p-3 relative group hover:bg-slate-50/50 transition-colors">
                             <span className={`text-[11px] font-black ${isPrevMonth || isNextMonth ? 'text-slate-200' : 'text-slate-400'}`}>
                                {isPrevMonth ? 29 + i : isNextMonth ? i - 34 : dayNum}
                             </span>
                             
                             {/* Mock Events matching Image 9 */}
                             <div className="mt-2 space-y-1">
                                {i === 11 && (
                                   <div className="px-2 py-1 bg-blue-500 text-white rounded text-[8px] font-black truncate shadow-sm">Tender Bid Sub. - ...</div>
                                )}
                                {i === 12 && (
                                   <div className="px-2 py-1 bg-emerald-400 text-white rounded text-[8px] font-black truncate shadow-sm">Bid Review Meeting</div>
                                )}
                                {i === 15 && (
                                   <div className="px-2 py-1 bg-blue-500 text-white rounded text-[8px] font-black truncate shadow-sm">Tender Bid Sub. - ...</div>
                                )}
                                {i === 18 && (
                                   <div className="px-2 py-1 bg-blue-500 text-white rounded text-[8px] font-black truncate shadow-sm">Tender Bid Sub. - ...</div>
                                )}
                                {i === 19 && (
                                   <>
                                      <div className="px-2 py-1 bg-rose-500 text-white rounded text-[8px] font-black truncate shadow-sm mb-1">Bid Review</div>
                                      <div className="flex items-center gap-1">
                                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                         <span className="text-[8px] font-bold text-slate-500">Bid Review</span>
                                      </div>
                                   </>
                                )}
                                {i === 20 && (
                                   <div className="px-2 py-1 bg-emerald-400 text-white rounded text-[8px] font-black truncate shadow-sm">Bid Review Meeting</div>
                                )}
                                {i === 21 && (
                                   <div className="px-2 py-1 bg-purple-400 text-white rounded text-[8px] font-black truncate shadow-sm">Reminder Dates ...</div>
                                )}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           </div>
           
           {/* Legend - Matching Image 9 */}
           <div className="p-8 border-t border-slate-50 flex flex-wrap gap-6 justify-start">
              {legend.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-md shadow-sm" style={{backgroundColor: item.color}}></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar Area - Matching Image 9 */}
        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
              <div>
                 <h3 className="text-xs font-black text-slate-900 tracking-[0.2em] uppercase mb-4">Next 7 Days</h3>
                 <div className="space-y-4">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Upcoming Tenders</p>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>Tender Management</span>
                          <span className="text-slate-400">06/13/...</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>Tender Management</span>
                          <span className="text-slate-400">06/16/...</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span>Tender Management</span>
                          <span className="text-slate-400">04/08/...</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                 <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Review Meetings</h3>
                 <div className="space-y-3 text-[10px] font-bold text-slate-500">
                    <div className="flex justify-between"><span>Client Delta review</span><span>05/20</span></div>
                    <div className="flex justify-between"><span>Client Epsilon due</span><span>05/22</span></div>
                    <div className="flex justify-between"><span>Client Epsilon due</span><span>05/22</span></div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                 <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Document Reminders</h3>
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">Documents for missing or due documents.</p>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">Documents for hitting or due documents.</p>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50 space-y-4">
                 <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Notes</h3>
                 <div className="relative">
                    <textarea 
                       placeholder="Quick notes" 
                       className="w-full h-32 p-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-blue-200 transition-all resize-none"
                    ></textarea>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default CalendarPage;
