import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  MoreVertical, 
  MessageSquare, 
  Video, 
  Filter,
  UserPlus,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

const MyTeam = ({ user, members = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'TOTAL MEMBERS', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'ACTIVE NOW', value: '08', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'ON LEAVE', value: '02', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'NEW REQUESTS', value: '04', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Mock team members for high-fidelity UI
  const myTeamMembers = [
    { id: 1, name: 'Sarah Jensen', role: 'Lead UI Designer', status: 'Online', dept: 'Design', email: 'sarah.j@tenderpro.com', projects: 4, initial: 'SJ' },
    { id: 2, name: 'Jana Cone', role: 'Senior Developer', status: 'Busy', dept: 'Engineering', email: 'jana.c@tenderpro.com', projects: 6, initial: 'JC' },
    { id: 3, name: 'Mark Kreeks', role: 'Project Manager', status: 'Offline', dept: 'Management', email: 'mark.k@tenderpro.com', projects: 3, initial: 'MK' },
    { id: 4, name: 'Alex Rivera', role: 'Backend Engineer', status: 'Online', dept: 'Engineering', email: 'alex.r@tenderpro.com', projects: 5, initial: 'AR' },
    { id: 5, name: 'Elena Vance', role: 'Marketing Lead', status: 'On Leave', dept: 'Marketing', email: 'elena.v@tenderpro.com', projects: 2, initial: 'EV' },
    { id: 6, name: 'David Chen', role: 'Security Expert', status: 'Online', dept: 'IT Ops', email: 'david.c@tenderpro.com', projects: 4, initial: 'DC' },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">MY CORE TEAM</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Manage and collaborate with your immediate team</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 lg:min-w-[350px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search team members..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
             <Filter size={20} />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95">
             <UserPlus size={18} />
             <span>INVITE MEMBER</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace('text', 'bg')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
             <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                   <stat.icon size={22} />
                </div>
                <MoreVertical size={16} className="text-slate-200" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
             <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Team Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {myTeamMembers.map((member) => (
          <div key={member.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50 group-hover:bg-blue-600 transition-colors"></div>
             
             <div className="flex justify-between items-start mb-8">
                <div className="relative">
                   <div className="w-20 h-20 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-2xl font-black text-slate-400 transition-all group-hover:scale-105 group-hover:rotate-3">
                      {member.initial}
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full
                     ${member.status === 'Online' ? 'bg-emerald-500' : 
                       member.status === 'Busy' ? 'bg-rose-500' : 
                       member.status === 'On Leave' ? 'bg-amber-500' : 'bg-slate-300'}`}>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-3 bg-slate-50 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><MessageSquare size={18} /></button>
                   <button className="p-3 bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Video size={18} /></button>
                </div>
             </div>

             <div className="space-y-1 mb-8">
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">{member.name}</h4>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">{member.role}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-50 transition-all group-hover:border-slate-100 group-hover:bg-white">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                   <p className="text-xs font-black text-slate-700 uppercase">{member.dept}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-50 transition-all group-hover:border-slate-100 group-hover:bg-white">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Projects</p>
                   <p className="text-xs font-black text-slate-700 uppercase">{member.projects} Active</p>
                </div>
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Work Email</p>
                   <p className="text-[10px] font-bold text-slate-500 lowercase truncate max-w-[150px]">{member.email}</p>
                </div>
                <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all active:scale-90 group/btn">
                   <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        ))}

        {/* Add Member Placeholder */}
        <div className="bg-slate-50/50 p-8 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white hover:border-blue-100 transition-all duration-500">
           <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-6">
              <UserPlus size={40} />
           </div>
           <h4 className="text-base font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-900 transition-colors">Add New Member</h4>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 px-10 leading-relaxed italic">Expand your core team to accelerate project delivery.</p>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
