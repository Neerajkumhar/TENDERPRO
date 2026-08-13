import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Shield, 
  UserPlus, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Edit3, 
  MoreVertical, 
  X, 
  Mail, 
  Building2, 
  FileSpreadsheet
} from 'lucide-react';

const initialUsersList = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@buildtech.com',
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
    initials: 'JD',
    organization: 'BuildTech Pvt. Ltd.',
    role: 'Organization Admin',
    roleBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '20 Jun 2025',
    lastLoginTime: '10:30 AM',
    joinedOn: '20 May 2024',
    phone: '+91 98765 43210'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@rajconstruction.in',
    avatarBg: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white',
    initials: 'PS',
    organization: 'Raj Construction',
    role: 'Manager',
    roleBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '19 Jun 2025',
    lastLoginTime: '04:15 PM',
    joinedOn: '18 Apr 2024',
    phone: '+91 98123 45678'
  },
  {
    id: 3,
    name: 'Michael Johnson',
    email: 'michael.j@greeninfra.com',
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-teal-600 text-white',
    initials: 'MJ',
    organization: 'Green Infra',
    role: 'User',
    roleBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '18 Jun 2025',
    lastLoginTime: '11:20 AM',
    joinedOn: '15 Mar 2024',
    phone: '+91 97111 22334'
  },
  {
    id: 4,
    name: 'Amit Patel',
    email: 'amit.patel@infraprojects.com',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white',
    initials: 'AP',
    organization: 'Infra Projects',
    role: 'Manager',
    roleBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '17 Jun 2025',
    lastLoginTime: '09:45 AM',
    joinedOn: '10 Feb 2024',
    phone: '+91 96543 21098'
  },
  {
    id: 5,
    name: 'Sneha Iyer',
    email: 'sneha.iyer@techbuild.com',
    avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white',
    initials: 'SI',
    organization: 'TechBuild Solutions',
    role: 'Billing Admin',
    roleBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '16 Jun 2025',
    lastLoginTime: '02:30 PM',
    joinedOn: '28 Jan 2024',
    phone: '+91 95432 10987'
  },
  {
    id: 6,
    name: 'David Wilson',
    email: 'david.wilson@urbandev.com',
    avatarBg: 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white',
    initials: 'DW',
    organization: 'Urban Developers',
    role: 'Organization Admin',
    roleBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '15 Jun 2025',
    lastLoginTime: '05:10 PM',
    joinedOn: '05 May 2024',
    phone: '+91 94321 09876'
  },
  {
    id: 7,
    name: 'Neha Verma',
    email: 'neha.verma@futurecon.com',
    avatarBg: 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white',
    initials: 'NV',
    organization: 'Future Constructions',
    role: 'User',
    roleBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    status: 'Inactive',
    statusStyle: 'text-rose-600 bg-rose-50 border-rose-200',
    lastLoginDate: '—',
    lastLoginTime: '',
    joinedOn: '12 Nov 2023',
    phone: '+91 93210 98765'
  },
  {
    id: 8,
    name: 'Robert Brown',
    email: 'robert.b@megainfra.com',
    avatarBg: 'bg-gradient-to-tr from-blue-700 to-indigo-800 text-white',
    initials: 'RB',
    organization: 'Mega Infra Ltd.',
    role: 'Manager',
    roleBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    lastLoginDate: '14 Jun 2025',
    lastLoginTime: '08:25 AM',
    joinedOn: '22 Oct 2023',
    phone: '+91 92109 87654'
  }
];

const UsersPage = () => {
  const [usersList, setUsersList] = useState(initialUsersList);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('All Organizations');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: 'BuildTech Pvt. Ltd.',
    role: 'User',
    password: '',
    status: 'Active'
  });

  // No-op toast (Notification toast banner removed per request)
  const showToast = () => {};

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(usersList.map(u => u.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (id) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter(item => item !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setOrgFilter('All Organizations');
    setRoleFilter('All Roles');
    setStatusFilter('All Status');
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const newUserObj = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
      initials: initials,
      organization: formData.organization,
      role: formData.role,
      roleBadge: formData.role === 'Organization Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : formData.role === 'Billing Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100',
      status: formData.status,
      statusStyle: formData.status === 'Active' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-rose-600 bg-rose-50 border-rose-200',
      lastLoginDate: 'Just Now',
      lastLoginTime: '',
      joinedOn: 'Today',
      phone: '+91 98888 77777'
    };

    setUsersList([newUserObj, ...usersList]);
    setShowAddModal(false);
    setFormData({ name: '', email: '', organization: 'BuildTech Pvt. Ltd.', role: 'User', password: '', status: 'Active' });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated = usersList.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          role: formData.role,
          status: formData.status
        };
      }
      return u;
    });

    setUsersList(updated);
    setShowEditModal(false);
  };

  // Filtered dataset
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = orgFilter === 'All Organizations' || u.organization === orgFilter;
    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All Status' || u.status === statusFilter;
    return matchesSearch && matchesOrg && matchesRole && matchesStatus;
  });

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-3.5 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Users
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Manage all users across the platform.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>

          <button 
            onClick={() => {
              setFormData({ name: '', email: '', organization: 'BuildTech Pvt. Ltd.', role: 'User', password: '', status: 'Active' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition"
          >
            <Plus size={15} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Users */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">1,842</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 18.7%</span>
            <span className="text-slate-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserCheck size={16} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">1,623</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 16.4%</span>
            <span className="text-slate-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactive Users</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">134</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <span>↓ 5.6%</span>
            <span className="text-slate-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Card 4: Admin Users */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Shield size={16} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Users</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">236</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 12.3%</span>
            <span className="text-slate-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Card 5: New This Month */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <UserPlus size={16} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New This Month</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">98</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>↑ 22.6%</span>
            <span className="text-slate-400 font-normal">from last month</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <input 
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Right: Dropdowns & Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Organization Filter */}
          <select 
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 max-w-[150px] truncate"
          >
            <option>All Organizations</option>
            <option>BuildTech Pvt. Ltd.</option>
            <option>Raj Construction</option>
            <option>Green Infra</option>
            <option>Infra Projects</option>
            <option>TechBuild Solutions</option>
            <option>Urban Developers</option>
            <option>Future Constructions</option>
            <option>Mega Infra Ltd.</option>
          </select>

          {/* Role Filter */}
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500"
          >
            <option>All Roles</option>
            <option>Organization Admin</option>
            <option>Manager</option>
            <option>Billing Admin</option>
            <option>User</option>
            <option>Super Admin</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </select>

          {/* More Filters button */}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
            <Filter size={14} />
            <span>More Filters</span>
          </button>

          {/* Reset button */}
          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* Users Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80">
                <th className="py-2.5 px-3.5 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedRowIds.length === usersList.length && usersList.length > 0}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                  />
                </th>
                <th className="py-2.5 px-3.5">User</th>
                <th className="py-2.5 px-3.5">Organization</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Last Login</th>
                <th className="py-2.5 px-3.5">Joined On</th>
                <th className="py-2.5 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map(user => {
                const isSelected = selectedRowIds.includes(user.id);
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/30' : ''}`}>
                    
                    {/* Checkbox */}
                    <td className="py-2.5 px-3.5">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleRowSelect(user.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </td>

                    {/* User info */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${user.avatarBg} font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{user.organization}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${user.roleBadge}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'Active' ? 'bg-blue-500' : 'bg-rose-500'
                        }`}></div>
                        <span className={user.status === 'Active' ? 'text-blue-600' : 'text-rose-600'}>
                          {user.status}
                        </span>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="py-2.5 px-3.5">
                      <p className="font-bold text-slate-800">{user.lastLoginDate}</p>
                      {user.lastLoginTime && (
                        <p className="text-[10px] text-slate-400">{user.lastLoginTime}</p>
                      )}
                    </td>

                    {/* Joined On */}
                    <td className="py-2.5 px-3.5 text-slate-600 font-medium">
                      {user.joinedOn}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* View action */}
                        <button 
                          onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                          title="View User"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit action */}
                        <button 
                          onClick={() => { 
                            setSelectedUser(user); 
                            setFormData({
                              name: user.name,
                              email: user.email,
                              organization: user.organization,
                              role: user.role,
                              password: '',
                              status: user.status
                            });
                            setShowEditModal(true); 
                          }}
                          title="Edit User"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* More options menu */}
                        <button 
                          title="More Options"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <MoreVertical size={15} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">1</span> to <span className="font-bold text-slate-800">{filteredUsers.length}</span> of <span className="font-bold text-slate-800">1,842</span> users
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <select className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1 font-bold">
              <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-xs">
                «
              </button>
              <button className="w-7 h-7 rounded-lg bg-[#1E56F0] text-white flex items-center justify-center shadow-xs text-xs">
                1
              </button>
              <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-xs">
                2
              </button>
              <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-xs">
                3
              </button>
              <span className="px-0.5 text-slate-400">...</span>
              <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-xs">
                184
              </button>
              <button className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-xs">
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Add New User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization</label>
                  <select 
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition font-semibold"
                  >
                    <option value="BuildTech Pvt. Ltd.">BuildTech Pvt. Ltd.</option>
                    <option value="Raj Construction">Raj Construction</option>
                    <option value="Green Infra">Green Infra</option>
                    <option value="Infra Projects">Infra Projects</option>
                    <option value="TechBuild Solutions">TechBuild Solutions</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition font-semibold"
                  >
                    <option value="Organization Admin">Organization Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Billing Admin">Billing Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-600" />
                Edit User Account
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Organization Admin">Organization Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Billing Admin">Billing Admin</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedUser.avatarBg} font-bold flex items-center justify-center text-base shadow-xs`}>
                  {selectedUser.initials}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Organization:</span>
                  <span className="font-bold text-slate-800">{selectedUser.organization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Assigned Role:</span>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${selectedUser.roleBadge}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Account Status:</span>
                  <span className="font-bold text-blue-600">{selectedUser.status}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={15} className="text-slate-400" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={15} className="text-slate-400" />
                  <span>{selectedUser.organization}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Users</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button 
                onClick={() => setShowExportModal(false)}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 flex items-center justify-between transition"
              >
                <span>Export CSV Dataset</span>
                <Download size={16} />
              </button>

              <button 
                onClick={() => setShowExportModal(false)}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition"
              >
                <span>Export Executive PDF</span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Import Users</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50">
              <FileSpreadsheet size={36} className="mx-auto text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Upload CSV or Excel file</p>
                <p className="text-[11px] text-slate-400">Drag and drop file here, or click to browse</p>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition"
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersPage;
