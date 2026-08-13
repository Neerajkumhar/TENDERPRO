import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Check
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
  { label: 'Active Now', value: '38', trend: '92%', isUp: true, color: 'blue', icon: UserCheck },
  { label: 'Departments', value: '6', trend: 'Global', isUp: true, color: 'indigo', icon: Building2 },
  { label: 'On Leave', value: '4', trend: '- 1', isUp: false, color: 'amber', icon: Clock },
];

const TeamManagement = ({ onMemberClick, departments, fetchDepartments }) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const filterRef = useRef(null);

  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Core Team',
    departmentId: '',
    phone: '',
    panDoc: '',
    cvDoc: '',
    adharDoc: '',
    bankFrontDoc: '',
    cancelCheckDoc: ''
  });
  const [uploadingDoc, setUploadingDoc] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [unreadCounts, setUnreadCounts] = useState({});
  const [sentUnreadCounts, setSentUnreadCounts] = useState({});

  const fetchUnreadCounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;
      // Received
      const resReceived = await fetch(`/api/messages/${user.id}/unread`);
      if (resReceived.ok) {
        const data = await resReceived.json();
        setUnreadCounts(data);
      }
      // Sent
      const resSent = await fetch(`/api/messages/${user.id}/sent-unread`);
      if (resSent.ok) {
        const data = await resSent.json();
        setSentUnreadCounts(data);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 3000);
    return () => clearInterval(interval);
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
          phone: '',
          panDoc: '',
          cvDoc: '',
          adharDoc: '',
          bankFrontDoc: '',
          cancelCheckDoc: ''
        });
      } else {
        const err = await response.json();
        alert(err.message || 'Error creating member');
      }
    } catch (error) {
      console.error('Error creating member:', error);
    }
  };

  const handleDocumentUpload = async (field, file) => {
    if (!file) return;
    setUploadingDoc(field);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setMemberFormData(prev => ({ ...prev, [field]: data.url }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingDoc(null);
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
      description: formData.get('description') || 'Department managed through Team Management'
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

  const filteredMembers = teamMembers.filter(m => {
    const matchesDept = selectedDept === 'All' || getDeptName(m.departmentId) === selectedDept;
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getDeptName(m.departmentId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium italic">Manage departments, roles, and member performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all w-full shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 w-full sm:w-auto"
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Team', value: teamMembers.length, trend: '+ 2', isUp: true, color: 'blue', icon: Users },
          { label: 'Active Now', value: teamMembers.filter(m => m.status === 'Active').length, trend: '92%', isUp: true, color: 'blue', icon: UserCheck },
          { label: 'Departments', value: departments.length, trend: 'Global', isUp: true, color: 'indigo', icon: Building2 },
          { label: 'On Leave', value: teamMembers.filter(m => m.status === 'On Leave').length, trend: '- 1', isUp: false, color: 'amber', icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl shadow-xs border border-slate-100/90 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 relative overflow-hidden w-full">
            <div className="flex justify-between items-center mb-2 w-full">
              <div className={`w-8 h-8 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 shrink-0`}>
                <stat.icon size={16} />
              </div>
              <div className={`text-[10px] font-bold ${stat.isUp ? 'text-blue-600' : 'text-rose-600'} uppercase tracking-wider`}>
                {stat.trend}
              </div>
            </div>
            <div className="w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate w-full">{stat.label}</p>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight truncate w-full">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Team Directory (Left 8) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex flex-wrap justify-between items-center gap-3 bg-slate-50/20">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Team Directory</h3>
              <div className="flex items-center gap-3">
                <div className="relative" ref={filterRef}>
                  <button 
                    onClick={() => setShowFilterPopover(!showFilterPopover)}
                    className={`p-2 rounded-lg border transition-all shadow-sm active:scale-95 ${
                      showFilterPopover || selectedDept !== 'All' 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600'
                    }`}
                  >
                    <Filter size={18} />
                  </button>

                  {showFilterPopover && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-1">Filter by Dept.</p>
                      {['All', ...departments.map(d => d.name)].map((dept) => (
                        <button
                          key={dept}
                          onClick={() => {
                            setSelectedDept(dept);
                            setShowFilterPopover(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedDept === dept ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{dept}</span>
                          {selectedDept === dept && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3">Member</th>
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3">Department</th>
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3">Status</th>
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3">Last Active Login</th>
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3">Workload</th>
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3">Performance</th>
                    <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMembers.map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => onMemberClick(member.id)}
                      className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                    >
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            {member.image ? (
                              <img src={member.image || null} className="w-8 h-8 rounded-lg border-2 border-white shadow-sm object-cover" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                                <User size={16} />
                              </div>
                            )}
                            
                            {/* Dual Unread Badges */}
                            <div className="absolute -top-2 -right-2 flex flex-col gap-0.5 z-10">
                              {unreadCounts[member.id] > 0 && (
                                <div className="min-w-[16px] h-[16px] px-1 bg-blue-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce" title="New messages received">
                                  {unreadCounts[member.id]}
                                </div>
                              )}
                              {sentUnreadCounts[member.id] > 0 && (
                                <div className="min-w-[16px] h-[16px] px-1 bg-amber-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg" title="Your sent messages (unread by them)">
                                  {sentUnreadCounts[member.id]}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="whitespace-nowrap">
                            <p className="text-xs font-black text-slate-800">{member.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-600">{getDeptName(member.departmentId)}</span>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                          member.status === 'Active' ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                          {member.status}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                        {member.lastLoginTime ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800">
                              {new Date(member.lastLoginTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                              {new Date(member.lastLoginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">Never logged in</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3 w-28">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-blue-500`}
                              style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-400 fill-amber-400" size={12} />
                          <span className="text-xs font-black text-slate-800">4.5</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if(window.confirm('Remove this member?')) {
                              await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
                              fetchMembers();
                              fetchDepartments();
                            }
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                        >
                          <Plus size={16} className="rotate-45" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-xs italic font-bold uppercase tracking-widest">No members matching search or filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Right 4) */}
        <div className="col-span-12 lg:col-span-4">
          {/* Departments Card with embedded Distribution Graph */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Building2 size={16} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">Departments</h3>
              </div>
              <button 
                onClick={() => setIsCreateDeptOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
              >
                <Plus size={12} />
                <span>Add New Dept</span>
              </button>
            </div>

            {/* Department Distribution Graph */}
            <div className="p-3.5 border-b border-slate-50 bg-slate-50/10">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 text-center">Distribution Overview</p>
              <div className="h-[140px] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">{teamMembers.length}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Members</span>
                </div>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie
                      data={departments}
                      innerRadius={42}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="memberCount"
                      stroke="none"
                    >
                      {departments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Departments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2 text-center">Members</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: dept.color }}></div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{dept.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">{dept.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-slate-600">
                          {dept.memberCount || 0}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button 
                          onClick={async () => {
                            if(window.confirm('Delete this department?')) {
                              await fetch(`/api/departments/${dept.id}`, { method: 'DELETE' });
                              fetchDepartments();
                            }
                          }}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                        >
                          <Plus size={14} className="rotate-45" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Create Department Modal */}
      {isCreateDeptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateDeptOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-5 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
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

            <form onSubmit={handleCreateDept} className="p-5 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. Finance" 
                  className="w-full px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  name="description" 
                  placeholder="Describe the department's purpose..." 
                  className="w-full px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all h-24 resize-none shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {['#3b82f6', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e'].map(color => (
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

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreateDeptOpen(false)} 
                  className="flex-1 py-3.5 sm:py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3.5 sm:py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
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
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl text-white shadow-md bg-blue-600 shadow-blue-100">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Add Member</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Create credentials for a new team member</p>
                </div>
              </div>
              <button onClick={() => setIsAddMemberOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-400 transition-all">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-4 sm:p-6 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required 
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({...memberFormData, name: e.target.value})}
                    placeholder="e.g. John Smith" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({...memberFormData, phone: e.target.value})}
                    placeholder="+91 00000 00000" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Login ID)</label>
                <input 
                  type="email"
                  required 
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                  placeholder="john@company.com" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password"
                  required 
                  value={memberFormData.password}
                  onChange={(e) => setMemberFormData({...memberFormData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    required 
                    value={memberFormData.role}
                    onChange={(e) => setMemberFormData({...memberFormData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="Core Team">Core Team</option>
                    <option value="Admin">Admin</option>
                    <option value="Tender Manager">Tender Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    required 
                    value={memberFormData.departmentId}
                    onChange={(e) => setMemberFormData({...memberFormData, departmentId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 tracking-tight mb-2.5">Required Documents</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'panDoc', label: 'PAN Card' },
                    { key: 'cvDoc', label: 'CV / Resume' },
                    { key: 'adharDoc', label: 'Aadhar Card' },
                    { key: 'bankFrontDoc', label: 'Bank Front Page' },
                    { key: 'cancelCheckDoc', label: 'Cancel Check' }
                  ].map(doc => (
                    <div key={doc.key} className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{doc.label}</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          onChange={(e) => handleDocumentUpload(doc.key, e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full px-3 py-2 bg-slate-50 border ${memberFormData[doc.key] ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'} rounded-xl text-[10px] font-bold outline-none flex items-center justify-between transition-all shadow-sm`}>
                          <span className="truncate mr-1">
                            {uploadingDoc === doc.key ? 'Uploading...' : memberFormData[doc.key] ? 'Uploaded' : 'Select File'}
                          </span>
                          {memberFormData[doc.key] ? (
                            <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />
                          ) : (
                            <Plus size={14} className="text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)} 
                  className="flex-1 py-2.5 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingDoc !== null}
                  className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
                >
                  {uploadingDoc !== null ? 'Uploading Document...' : 'Create Member'}
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
