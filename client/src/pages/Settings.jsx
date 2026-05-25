import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Users, 
  ShieldCheck, 
  Mail, 
  Bell, 
  CreditCard, 
  FileText, 
  Lock, 
  Share2, 
  Database, 
  Activity,
  Globe,
  Clock,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCcw,
  Plus,
  Search,
  Edit2,
  Trash2
} from 'lucide-react';

const menuItems = [
  { id: 'general', label: 'General Settings', desc: 'Basic system configuration', icon: SettingsIcon },
  { id: 'company', label: 'Company Profile', desc: 'Manage company information', icon: Building2 },
  { id: 'users', label: 'User Management', desc: 'Manage users and permissions', icon: Users },
  { id: 'roles', label: 'Role & Permissions', desc: 'Configure roles and access', icon: ShieldCheck },
  { id: 'email', label: 'Email Settings', desc: 'Configure email preferences', icon: Mail },
  { id: 'notifications', label: 'Notification Settings', desc: 'Manage system notifications', icon: Bell },
  { id: 'financial', label: 'Financial Settings', desc: 'Configure financial preferences', icon: CreditCard },
  { id: 'documents', label: 'Document Settings', desc: 'Manage document preferences', icon: FileText },
  { id: 'security', label: 'Security Settings', desc: 'Manage security options', icon: Lock },
  { id: 'integrations', label: 'Integrations', desc: 'Third party integrations', icon: Share2 },
  { id: 'backup', label: 'Backup & Restore', desc: 'Backup and restore data', icon: Database },
  { id: 'logs', label: 'System Logs', desc: 'View system activity logs', icon: Activity },
];

const Settings = () => {
  const [activeMenu, setActiveMenu] = useState('general');
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage your system preferences and configurations</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Menu Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4">Settings Menu</h3>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                activeMenu === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                  : 'text-slate-500 hover:bg-white hover:shadow-md hover:text-slate-900'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-all ${
                activeMenu === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
              }`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">{item.label}</p>
                <p className={`text-[10px] font-bold italic ${activeMenu === item.id ? 'text-blue-400' : 'text-slate-400'}`}>
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {activeMenu === 'general' && (
            <>
              {/* General Settings Card */}
              <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl tracking-tight">General Settings</h3>
                      <p className="text-xs text-slate-500 font-medium">Configure basic system settings and preferences.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Name</label>
                        <input type="text" defaultValue="Tender Management System" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Language</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none">
                            <option>English (UK)</option>
                            <option>English (US)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Format</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" defaultValue="DD MMM YYYY" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Zone</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none">
                            <option>(UTC +05:30) Asia/Kolkata</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                        <input type="text" defaultValue="INR (₹) - Indian Rupee" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiscal Year Start</label>
                        <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none">
                          <option>April</option>
                          <option>January</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-900">Maintenance Mode</p>
                        <p className="text-[10px] font-medium text-slate-500">System will be unavailable for users.</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* System Info Sidebar */}
                  <div className="col-span-12 lg:col-span-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">System Information</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Current Version', value: 'v2.4.0' },
                        { label: 'Last Updated', value: '20 May 2024' },
                        { label: 'Database Status', value: 'Connected', status: 'emerald' },
                        { label: 'Server Status', value: 'Online', status: 'emerald' },
                      ].map((info, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">{info.label}</span>
                          <div className="flex items-center gap-2">
                            {info.status && <div className={`w-2 h-2 rounded-full bg-${info.status}-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>}
                            <span className="text-xs font-black text-slate-900">{info.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'company' && (
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 max-w-2xl">
              <h3 className="font-black text-slate-900 text-lg tracking-tight mb-2">Company Profile</h3>
              <p className="text-[10px] text-slate-500 font-medium mb-6">Update your company details and branding.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Change Logo</button>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1">Company Name</label>
                  <input type="text" defaultValue="Jama Project Pvt. Ltd." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1">Email</label>
                  <input type="email" defaultValue="info@jamaproject.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'users' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* User Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: '48', color: 'purple', icon: Users },
                  { label: 'Active Now', value: '12', color: 'emerald', icon: Activity },
                  { label: 'Role Types', value: '6', color: 'blue', icon: ShieldCheck },
                  { label: 'Pending', value: '3', color: 'amber', icon: Clock },
                ].map((stat, i) => (
                  <div key={i} className="card p-4 bg-white border-none shadow-lg shadow-slate-200/40">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                        <stat.icon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                        <h3 className="text-lg font-black text-slate-900 mt-0.5">{stat.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* User Directory Table */}
              <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">User Directory</h3>
                    <p className="text-xs text-slate-500 font-medium">Manage and monitor all system users and their access levels.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 w-48 transition-all" />
                    </div>
                    <button 
                      onClick={handleAddUser}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                    >
                      <Plus size={14} />
                      <span>Add User</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="px-8 py-4">User Details</th>
                        <th className="px-8 py-4">Role</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Last Login</th>
                        <th className="px-8 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { name: 'John Doe', email: 'john@example.com', role: 'Administrator', status: 'Active', lastLogin: '2 mins ago', avatar: 'https://i.pravatar.cc/150?u=john' },
                        { name: 'Sarah Smith', email: 'sarah@example.com', role: 'Project Manager', status: 'Active', lastLogin: '1 hour ago', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                        { name: 'Mike Johnson', email: 'mike@example.com', role: 'Financial Analyst', status: 'Inactive', lastLogin: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=mike' },
                        { name: 'Emma Wilson', email: 'emma@example.com', role: 'Team Lead', status: 'Active', lastLogin: '5 mins ago', avatar: 'https://i.pravatar.cc/150?u=emma' },
                      ].map((user, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <img src={user.avatar} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" alt="" />
                              <div>
                                <p className="text-sm font-black text-slate-800">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold italic">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-slate-600">{user.role}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className={`w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                              user.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-300 text-white shadow-slate-100'
                            }`}>
                              {user.status}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-500 italic">
                            {user.lastLogin}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'security' && (
            <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 max-w-2xl">
              <h3 className="font-black text-slate-900 text-lg tracking-tight mb-2">Security Settings</h3>
              <p className="text-[10px] text-slate-500 font-medium mb-6">Configure security and access controls.</p>
              
              <div className="space-y-6">
                {[
                  { label: 'Two Factor Authentication (2FA)', desc: 'Add extra security to user accounts.', checked: true },
                  { label: 'Password Policy', desc: 'Enforce strong password policy.', checked: true },
                  { label: 'Login Activity', desc: 'Track and log user login activities.', checked: true },
                ].map((sec, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">{sec.label}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">{sec.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer ${sec.checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${sec.checked ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'roles' && (
            <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Role Selection Sidebar */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Roles</h3>
                  <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">+ New Role</button>
                </div>
                {[
                  { name: 'Administrator', users: 3, desc: 'Full system access and configuration' },
                  { name: 'Project Manager', users: 12, desc: 'Manage projects, tenders and teams' },
                  { name: 'Financial Analyst', users: 5, desc: 'Access to financial reports and billing' },
                  { name: 'Team Member', users: 28, desc: 'View projects and manage assigned tasks' },
                ].map((role) => (
                  <button
                    key={role.name}
                    onClick={() => setSelectedRole(role.name)}
                    className={`w-full p-4 rounded-2xl text-left transition-all border ${
                      selectedRole === role.name 
                        ? 'bg-white border-blue-500 shadow-xl shadow-blue-100 ring-4 ring-blue-50' 
                        : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-slate-900 tracking-tight">{role.name}</h4>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[8px] font-black uppercase tracking-widest">
                        {role.users} Users
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 italic">{role.desc}</p>
                  </button>
                ))}
              </div>

              {/* Permissions Matrix */}
              <div className="col-span-12 lg:col-span-8 card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Permissions Matrix</h3>
                    <p className="text-xs text-slate-500 font-medium italic mt-1">Configure granular access for {selectedRole} role.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">Reset to Default</button>
                </div>

                <div className="p-8 space-y-8">
                  {[
                    {
                      category: 'Project Management',
                      perms: [
                        { label: 'View Projects', desc: 'Can see the list of projects and their high-level status.' },
                        { label: 'Create Projects', desc: 'Can initialize new projects in the system.' },
                        { label: 'Edit Project Details', desc: 'Can modify project metadata, timelines and assignments.' },
                        { label: 'Delete Projects', desc: 'Can permanently remove projects from the database.' },
                      ]
                    },
                    {
                      category: 'Tender Management',
                      perms: [
                        { label: 'Manage Tenders', desc: 'Can create, edit and track tender submissions.' },
                        { label: 'View Tender Financials', desc: 'Access to sensitive pricing and bid data.' },
                        { label: 'Approve Submissions', desc: 'Can mark tenders as ready for submission.' },
                      ]
                    },
                    {
                      category: 'Financial Control',
                      perms: [
                        { label: 'View Billing', desc: 'Can see invoices and payment statuses.' },
                        { label: 'Manage Expenses', desc: 'Can track and approve project-related costs.' },
                        { label: 'Financial Reporting', desc: 'Can generate and export profit/loss statements.' },
                      ]
                    }
                  ].map((group, idx) => (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">{group.category}</h4>
                      <div className="space-y-4">
                        {group.perms.map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center justify-between group">
                            <div className="max-w-[80%]">
                              <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{p.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{p.desc}</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={selectedRole === 'Administrator' || pIdx === 0} />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeMenu === 'email' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* SMTP Configuration Card */}
              <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">SMTP Configuration</h3>
                    <p className="text-xs text-slate-500 font-medium italic">Configure your outgoing mail server settings.</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Send Test Email</button>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Server Connected</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mail Driver</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer">
                      <option>SMTP (Recommended)</option>
                      <option>Mailgun</option>
                      <option>SES (Amazon)</option>
                    </select>
                  </div>
                  <div className="col-span-12 lg:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                    <input type="text" defaultValue="smtp.gmail.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div className="col-span-12 lg:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Port</label>
                    <input type="text" defaultValue="587" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div className="col-span-12 lg:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encryption</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer">
                      <option>TLS</option>
                      <option>SSL</option>
                      <option>None</option>
                    </select>
                  </div>
                  <div className="col-span-12 lg:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authentication</label>
                    <div className="w-full h-10 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center px-4 gap-2">
                      <CheckCircle2 className="text-emerald-500" size={16} />
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sender Information Card */}
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-6 card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
                  <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Sender Identity</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Name</label>
                      <input type="text" defaultValue="Tender Management System" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Email Address</label>
                      <input type="email" defaultValue="noreply@jamaproject.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-6 card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
                  <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Email Templates</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'New Tender Alert', lastEdited: '2 days ago' },
                      { name: 'Welcome Email', lastEdited: '1 week ago' },
                      { name: 'Password Reset', lastEdited: '3 days ago' },
                    ].map((temp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{temp.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Edited {temp.lastEdited}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-all" size={16} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {!['general', 'company', 'users', 'security', 'roles', 'email'].includes(activeMenu) && (
            <div className="card p-12 bg-white border-none shadow-xl shadow-slate-200/40 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                <SettingsIcon size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900">{menuItems.find(m => m.id === activeMenu)?.label}</h3>
              <p className="text-slate-500 mt-2">This configuration module is coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Edit/Add Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-xs text-slate-500 font-medium italic mt-1">
                  {selectedUser ? `Updating permissions for ${selectedUser.name}` : 'Create a new system user account.'}
                </p>
              </div>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsUserModalOpen(false); }}>
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <img 
                    src={selectedUser?.avatar || 'https://i.pravatar.cc/150?u=new'} 
                    className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 shadow-xl object-cover" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Upload className="text-white" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={selectedUser?.name || ''} 
                    placeholder="e.g. John Doe" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                    required 
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={selectedUser?.email || ''} 
                    placeholder="john@example.com" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    defaultValue={selectedUser?.role || 'Project Manager'} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option>Administrator</option>
                    <option>Project Manager</option>
                    <option>Financial Analyst</option>
                    <option>Team Lead</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    defaultValue={selectedUser?.status || 'Active'} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-3 px-6 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                  {selectedUser ? 'Update User' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
