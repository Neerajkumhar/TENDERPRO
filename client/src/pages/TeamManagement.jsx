import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Briefcase, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Search, 
  Filter, 
  ChevronRight,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Zap,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
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
  { label: 'Total Team', value: '42', trend: '+ 2', isUp: true, color: 'blue', icon: Users },
  { label: 'Active Now', value: '38', trend: '92%', isUp: true, color: 'emerald', icon: UserCheck },
  { label: 'Departments', value: '6', trend: 'Global', isUp: true, color: 'indigo', icon: Building2 },
  { label: 'On Leave', value: '4', trend: '- 1', isUp: false, color: 'amber', icon: Clock },
];

const departmentData = [
  { name: 'Engineering', members: 15, workload: 85, color: '#3b82f6' },
  { name: 'Marketing', members: 8, workload: 60, color: '#10b981' },
  { name: 'Operations', members: 10, workload: 75, color: '#6366f1' },
  { name: 'Sales', members: 6, workload: 90, color: '#f59e0b' },
  { name: 'HR', members: 3, workload: 40, color: '#ec4899' },
];

const teamMembers = [
  { id: 1, name: 'Sarah Johnson', role: 'Lead Developer', dept: 'Engineering', status: 'Active', workload: 85, performance: 4.8, email: 'sarah.j@tech.com', image: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 2, name: 'Michael Brown', role: 'UI Architect', dept: 'Engineering', status: 'Active', workload: 70, performance: 4.5, email: 'm.brown@tech.com', image: 'https://i.pravatar.cc/150?u=michael' },
  { id: 3, name: 'Emma Wilson', role: 'Marketing Head', dept: 'Marketing', status: 'On Leave', workload: 0, performance: 4.9, email: 'emma.w@tech.com', image: 'https://i.pravatar.cc/150?u=emma' },
  { id: 4, name: 'David Lee', role: 'Ops Manager', dept: 'Operations', status: 'Active', workload: 92, performance: 4.2, email: 'd.lee@tech.com', image: 'https://i.pravatar.cc/150?u=david' },
  { id: 5, name: 'James Carter', role: 'Sales Lead', dept: 'Sales', status: 'Active', workload: 88, performance: 4.6, email: 'j.carter@tech.com', image: 'https://i.pravatar.cc/150?u=james' },
  { id: 6, name: 'Anna White', role: 'HR Specialist', dept: 'HR', status: 'Active', workload: 50, performance: 4.7, email: 'a.white@tech.com', image: 'https://i.pravatar.cc/150?u=anna' },
];

const TeamManagement = () => {
  const [selectedDept, setSelectedDept] = useState('All');

  const filteredMembers = selectedDept === 'All' 
    ? teamMembers 
    : teamMembers.filter(m => m.dept === selectedDept);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage departments, roles, and member performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search team..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Team Directory (Left 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4 bg-slate-50/30">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg tracking-tight mr-4">Team Directory</h3>
                <div className="flex gap-1">
                  {['All', ...departmentData.map(d => d.name)].map(dept => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        selectedDept === dept 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 transition-all shadow-sm active:scale-95">
                  <Plus size={14} className="text-blue-600" />
                  <span>Create Department</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Workload</th>
                    <th className="px-6 py-4">Performance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={member.image} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" alt="" />
                          <div>
                            <p className="text-sm font-black text-slate-800">{member.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{member.dept}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                          member.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          {member.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-32">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${member.workload > 85 ? 'bg-rose-500' : 'bg-blue-500'}`}
                              style={{ width: `${member.workload}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{member.workload}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-400 fill-amber-400" size={12} />
                          <span className="text-xs font-black text-slate-800">{member.performance}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Right 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Department Distribution */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Dept. Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="members"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {departmentData.map((dept, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <span className="text-xs font-bold text-slate-600">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{dept.members} Members</span>
                    <span className="text-xs font-black text-slate-900">{dept.workload}% Cap.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Leaders */}
          <div className="card p-6 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Top Performers</h3>
              <Zap className="text-amber-500" size={20} />
            </div>
            <div className="space-y-4">
              {teamMembers.slice(0, 3).map((member, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={member.image} className="w-10 h-10 rounded-xl shadow-sm" alt="" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-white" size={8} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{member.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{member.dept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-600">{member.performance}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">View Rankings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
