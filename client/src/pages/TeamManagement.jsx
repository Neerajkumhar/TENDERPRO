import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User,
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

const TeamManagement = ({ onMemberClick, departments, fetchDepartments }) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Core Team',
    departmentId: '',
    phone: ''
  });

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberFormData)
      });

      if (response.ok) {
        fetchMembers();
        fetchDepartments();
        
        setIsAddMemberOpen(false);
        setMemberFormData({
          name: '',
          email: '',
          password: '',
          role: 'Core Team',
          departmentId: '',
          phone: ''
        });
      } else {
        const err = await response.json();
        alert(err.message || 'Error creating member');
      }
    } catch (error) {
      console.error('Error creating member:', error);
    }
  };

  const getDeptName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Unassigned';
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const deptData = {
      name: formData.get('name'),
      color: formData.get('color') || '#3b82f6',
      description: 'Department managed through Team Management'
    };

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData)
      });

      if (response.ok) {
        fetchDepartments();
        setIsCreateDeptOpen(false);
      }
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

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
          <button 
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Team', value: teamMembers.length, trend: '+ 2', isUp: true, color: 'blue', icon: Users },
          { label: 'Active Now', value: teamMembers.filter(m => m.status === 'Active').length, trend: '92%', isUp: true, color: 'emerald', icon: UserCheck },
          { label: 'Departments', value: departments.length, trend: 'Global', isUp: true, color: 'indigo', icon: Building2 },
          { label: 'On Leave', value: teamMembers.filter(m => m.status === 'On Leave').length, trend: '- 1', isUp: false, color: 'amber', icon: Clock },
        ].map((stat, i) => (
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
                  {['All', ...departments.map(d => d.name)].map(dept => (
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
                  {teamMembers
                    .filter(m => selectedDept === 'All' || getDeptName(m.departmentId) === selectedDept)
                    .map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => onMemberClick(member.id)}
                      className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.image ? (
                            <img src={member.image || null} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                              <User size={20} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-800">{member.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{getDeptName(member.departmentId)}</span>
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
                              className={`h-full rounded-full bg-blue-500`}
                              style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-400 fill-amber-400" size={12} />
                          <span className="text-xs font-black text-slate-800">4.5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={async () => {
                            if(window.confirm('Remove this member?')) {
                              await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
                              fetchMembers();
                              fetchDepartments();
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                        >
                          <Plus size={18} className="rotate-45" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department List Section */}
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Building2 size={18} />
                </div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Departments</h3>
              </div>
              <button 
                onClick={() => setIsCreateDeptOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                <Plus size={14} />
                <span>Add New Dept</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Department Name</th>
                    <th className="px-6 py-4 text-center">Members</th>
                    <th className="px-6 py-4">Theme</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">{dept.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{dept.description || 'No description'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                          {dept.memberCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: dept.color }}></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dept.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={async () => {
                            if(window.confirm('Delete this department?')) {
                              await fetch(`/api/departments/${dept.id}`, { method: 'DELETE' });
                              fetchDepartments();
                            }
                          }}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Plus size={16} className="rotate-45" />
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
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={departments}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="memberCount"
                  >
                    {departments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {departments.map((dept, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <span className="text-xs font-bold text-slate-600">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{dept.memberCount || 0} Members</span>
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
                      {member.image ? (
                        <img src={member.image || null} className="w-10 h-10 rounded-xl shadow-sm object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <User size={20} />
                        </div>
                      )}
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
      {/* Create Department Modal */}
      {isCreateDeptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateDeptOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl text-white shadow-lg bg-indigo-600 shadow-indigo-100">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Dept.</h2>
                  <p className="text-xs text-slate-500 font-medium">Add a business unit</p>
                </div>
              </div>
              <button onClick={() => setIsCreateDeptOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. Finance" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
                <div className="flex gap-3">
                  {['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e'].map(color => (
                    <label key={color} className="relative cursor-pointer group">
                      <input type="radio" name="color" value={color} className="sr-only peer" defaultChecked={color === '#3b82f6'} />
                      <div className="w-8 h-8 rounded-lg transition-all peer-checked:ring-4 ring-offset-2 ring-slate-200" style={{ backgroundColor: color }}></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreateDeptOpen(false)} 
                  className="flex-1 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddMemberOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl text-white shadow-lg bg-blue-600 shadow-blue-100">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Member</h2>
                  <p className="text-xs text-slate-500 font-medium">Create credentials for a new team member</p>
                </div>
              </div>
              <button onClick={() => setIsAddMemberOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required 
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({...memberFormData, name: e.target.value})}
                    placeholder="e.g. John Smith" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({...memberFormData, phone: e.target.value})}
                    placeholder="+91 00000 00000" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Login ID)</label>
                <input 
                  type="email"
                  required 
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                  placeholder="john@company.com" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password"
                  required 
                  value={memberFormData.password}
                  onChange={(e) => setMemberFormData({...memberFormData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    required 
                    value={memberFormData.role}
                    onChange={(e) => setMemberFormData({...memberFormData, role: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="Core Team">Core Team</option>
                    <option value="Admin">Admin</option>
                    <option value="Tender Manager">Tender Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    required 
                    value={memberFormData.departmentId}
                    onChange={(e) => setMemberFormData({...memberFormData, departmentId: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)} 
                  className="flex-1 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
