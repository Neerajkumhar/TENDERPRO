import React, { useState } from 'react';
import { 
  Shield, 
  Crown, 
  UserCheck, 
  CreditCard, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  MinusCircle, 
  BarChart3, 
  Edit3, 
  MoreVertical, 
  Check, 
  X, 
  Expand, 
  Minimize2, 
  AlertTriangle,
  Building2,
  Users,
  Layers,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Trash2,
  RotateCcw,
  Download,
  FileText,
  Clock,
  Info
} from 'lucide-react';

const initialRoles = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    type: 'System Role',
    isSystem: true,
    typeBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    icon: Crown,
    iconBg: 'bg-purple-50 text-purple-600',
    usersCount: 1,
    description: 'Full platform system root access with complete authorization across all organizations and system settings.',
    totalPermissions: 30,
    granted: 30,
    denied: 0,
    restricted: 0,
    grantedPct: '100%',
    deniedPct: '0%',
    restrictedPct: '0%'
  },
  {
    id: 'org-admin',
    name: 'Organization Admin',
    type: 'Custom Role',
    isSystem: false,
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: ShieldCheck,
    iconBg: 'bg-blue-50 text-blue-600',
    usersCount: 42,
    description: 'Full administrative access restricted to their assigned organization account, users, and billing.',
    totalPermissions: 30,
    granted: 24,
    denied: 4,
    restricted: 2,
    grantedPct: '80%',
    deniedPct: '13%',
    restrictedPct: '7%'
  },
  {
    id: 'tender-manager',
    name: 'Tender Manager',
    type: 'Custom Role',
    isSystem: false,
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Layers,
    iconBg: 'bg-blue-50 text-blue-600',
    usersCount: 128,
    description: 'Manages tender discovery, bid preparation, document uploads, and submission workflows.',
    totalPermissions: 30,
    granted: 18,
    denied: 8,
    restricted: 4,
    grantedPct: '60%',
    deniedPct: '27%',
    restrictedPct: '13%'
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    type: 'Custom Role',
    isSystem: false,
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Building2,
    iconBg: 'bg-amber-50 text-amber-600',
    usersCount: 86,
    description: 'Oversees won projects, milestone tracking, resource allocation, and project timelines.',
    totalPermissions: 30,
    granted: 15,
    denied: 10,
    restricted: 5,
    grantedPct: '50%',
    deniedPct: '33%',
    restrictedPct: '17%'
  },
  {
    id: 'finance-manager',
    name: 'Finance Manager',
    type: 'Custom Role',
    isSystem: false,
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: CreditCard,
    iconBg: 'bg-cyan-50 text-cyan-600',
    usersCount: 34,
    description: 'Manages invoices, subscription payments, expense approvals, and financial reporting.',
    totalPermissions: 30,
    granted: 14,
    denied: 12,
    restricted: 4,
    grantedPct: '47%',
    deniedPct: '40%',
    restrictedPct: '13%'
  },
  {
    id: 'core-team',
    name: 'Core Team Member',
    type: 'Standard Role',
    isSystem: false,
    typeBadge: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: UserCheck,
    iconBg: 'bg-slate-100 text-slate-600',
    usersCount: 312,
    description: 'Standard read-only and task update access for core operational staff and team members.',
    totalPermissions: 30,
    granted: 8,
    denied: 18,
    restricted: 4,
    grantedPct: '27%',
    deniedPct: '60%',
    restrictedPct: '13%'
  }
];

const initialModulesList = [
  {
    id: 'mod-1',
    name: 'Dashboard Analytics',
    icon: Layers,
    expanded: true,
    permissions: { view: 'granted', create: 'denied', edit: 'denied', delete: 'denied', export: 'granted', manage: 'denied' }
  },
  {
    id: 'mod-2',
    name: 'Organization Management',
    icon: Building2,
    expanded: true,
    permissions: { view: 'granted', create: 'granted', edit: 'granted', delete: 'restricted', export: 'granted', manage: 'granted' }
  },
  {
    id: 'mod-3',
    name: 'User Accounts & Roles',
    icon: Users,
    expanded: true,
    permissions: { view: 'granted', create: 'granted', edit: 'granted', delete: 'restricted', export: 'granted', manage: 'granted' }
  },
  {
    id: 'mod-4',
    name: 'Tenders & Bidding Engine',
    icon: Layers,
    expanded: true,
    permissions: { view: 'granted', create: 'granted', edit: 'granted', delete: 'denied', export: 'granted', manage: 'denied' }
  },
  {
    id: 'mod-5',
    name: 'Financials & Invoicing',
    icon: CreditCard,
    expanded: true,
    permissions: { view: 'granted', create: 'granted', edit: 'granted', delete: 'denied', export: 'granted', manage: 'restricted' }
  }
];

const mockRoleUsers = {
  'super-admin': [
    { id: 1, name: 'Khushi Rajawat', email: 'khushi@tenderpro.com', status: 'Active', avatar: 'KR', department: 'System Root' }
  ],
  'org-admin': [
    { id: 2, name: 'Neeraj Kumar', email: 'neeraj@tenderpro.com', status: 'Active', avatar: 'NK', department: 'Management' },
    { id: 3, name: 'Sarah Jenkins', email: 'sarah.j@infra.com', status: 'Active', avatar: 'SJ', department: 'Operations' },
    { id: 4, name: 'David Miller', email: 'd.miller@buildtech.org', status: 'Active', avatar: 'DM', department: 'Administration' }
  ],
  'tender-manager': [
    { id: 5, name: 'Vikram Singh', email: 'vikram@tenderpro.com', status: 'Active', avatar: 'VS', department: 'Tender Bidding' },
    { id: 6, name: 'Priya Sharma', email: 'priya.s@gemtenders.com', status: 'Active', avatar: 'PS', department: 'Public Procurement' },
    { id: 7, name: 'Alex Johnson', email: 'alex.j@govbids.org', status: 'Inactive', avatar: 'AJ', department: 'Documentation' }
  ],
  'project-manager': [
    { id: 8, name: 'Rajesh Verma', email: 'rajesh.v@constructions.com', status: 'Active', avatar: 'RV', department: 'Site Operations' },
    { id: 9, name: 'Amit Patel', email: 'amit.p@infraprojects.in', status: 'Active', avatar: 'AP', department: 'Engineering' }
  ],
  'finance-manager': [
    { id: 10, name: 'Ananya Gupta', email: 'ananya.g@greeninfra.org', status: 'Active', avatar: 'AG', department: 'Accounts & Finance' },
    { id: 11, name: 'Michael Scott', email: 'michael.s@financecore.io', status: 'Active', avatar: 'MS', department: 'Billing' }
  ],
  'core-team': [
    { id: 12, name: 'Rohan Mehta', email: 'rohan.m@tenderpro.com', status: 'Active', avatar: 'RM', department: 'Execution' },
    { id: 13, name: 'Kavita Roy', email: 'kavita.r@tenderpro.com', status: 'Active', avatar: 'KR', department: 'Support' }
  ]
};

const mockActivityLogs = [
  { id: 1, action: 'Permission Modified', detail: 'Tenders & Bidding Engine -> Delete permission set to Denied', user: 'Khushi Rajawat', timestamp: '2 hours ago' },
  { id: 2, action: 'Role Updated', detail: 'Role description and scope modified', user: 'Neeraj Kumar', timestamp: 'Yesterday, 4:15 PM' },
  { id: 3, action: 'User Assigned', detail: 'Assigned Sarah Jenkins to Organization Admin role', user: 'Khushi Rajawat', timestamp: '3 days ago' },
  { id: 4, action: 'Role Created', detail: 'Custom Role initial policy template provisioned', user: 'System Auto', timestamp: '1 week ago' }
];

const RolesAndPermissions = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState('super-admin');
  const [activeTab, setActiveTab] = useState('Permissions');
  const [searchRoleQuery, setSearchRoleQuery] = useState('');
  const [searchPermQuery, setSearchPermQuery] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [modulesList, setModulesList] = useState(initialModulesList);
  
  // Mobile Navigation State
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'details'

  // Modals & Menus State
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // New & Edit Role Form State
  const [newRoleData, setNewRoleData] = useState({
    name: '',
    type: 'Custom Role',
    description: ''
  });

  const [editRoleData, setEditRoleData] = useState({
    name: '',
    description: ''
  });

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  // Recalculate permissions stats for selected role dynamically
  const calculateRoleStats = () => {
    let granted = 0;
    let denied = 0;
    let restricted = 0;
    let total = 0;

    modulesList.forEach(mod => {
      Object.values(mod.permissions).forEach(val => {
        total++;
        if (val === 'granted') granted++;
        else if (val === 'denied') denied++;
        else if (val === 'restricted') restricted++;
      });
    });

    return {
      total,
      granted,
      denied,
      restricted,
      grantedPct: Math.round((granted / (total || 1)) * 100) + '%',
      deniedPct: Math.round((denied / (total || 1)) * 100) + '%',
      restrictedPct: Math.round((restricted / (total || 1)) * 100) + '%'
    };
  };

  const currentStats = calculateRoleStats();

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    setMobileView('details');
    setShowMoreMenu(false);
  };

  const handleExpandAll = () => {
    setModulesList(modulesList.map(m => ({ ...m, expanded: true })));
  };

  const handleCollapseAll = () => {
    setModulesList(modulesList.map(m => ({ ...m, expanded: false })));
  };

  const toggleModuleExpand = (id) => {
    setModulesList(modulesList.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleData.name.trim()) return;

    const createdRole = {
      id: `role-${Date.now()}`,
      name: newRoleData.name.trim(),
      type: newRoleData.type,
      isSystem: false,
      typeBadge: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
      icon: Shield,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      usersCount: 0,
      description: newRoleData.description.trim() || 'Custom defined role with specific module access permissions.',
      totalPermissions: 30,
      granted: 15,
      denied: 10,
      restricted: 5,
      grantedPct: '50%',
      deniedPct: '33%',
      restrictedPct: '17%'
    };

    setRoles([...roles, createdRole]);
    setSelectedRoleId(createdRole.id);
    setShowCreateRoleModal(false);
    setNewRoleData({ name: '', type: 'Custom Role', description: '' });
    setMobileView('details');
  };

  const handleOpenEditModal = () => {
    setEditRoleData({
      name: selectedRole.name,
      description: selectedRole.description
    });
    setShowEditRoleModal(true);
    setShowMoreMenu(false);
  };

  const handleSaveEditRole = (e) => {
    e.preventDefault();
    if (!editRoleData.name.trim()) return;

    setRoles(roles.map(r => r.id === selectedRole.id ? {
      ...r,
      name: editRoleData.name.trim(),
      description: editRoleData.description.trim()
    } : r));

    setShowEditRoleModal(false);
  };

  const handleDuplicateRole = () => {
    const duplicatedRole = {
      ...selectedRole,
      id: `role-${Date.now()}`,
      name: `${selectedRole.name} (Copy)`,
      isSystem: false,
      type: 'Custom Role',
      typeBadge: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
      usersCount: 0
    };

    setRoles([...roles, duplicatedRole]);
    setSelectedRoleId(duplicatedRole.id);
    setShowMoreMenu(false);
  };

  const handleDeleteRole = () => {
    if (selectedRole.isSystem) return;
    if (confirm(`Are you sure you want to delete the role "${selectedRole.name}"?`)) {
      const remainingRoles = roles.filter(r => r.id !== selectedRole.id);
      setRoles(remainingRoles);
      setSelectedRoleId(remainingRoles[0]?.id || 'super-admin');
      setShowMoreMenu(false);
    }
  };

  const handleResetPermissions = () => {
    if (confirm(`Reset all module permissions to default template for "${selectedRole.name}"?`)) {
      setModulesList(initialModulesList);
      setShowMoreMenu(false);
    }
  };

  const handlePermissionToggle = (moduleId, permKey) => {
    if (selectedRole.isSystem) return; // System roles are read-only root permissions

    setModulesList(modulesList.map(m => {
      if (m.id === moduleId) {
        const current = m.permissions[permKey];
        // Cycle between: granted -> denied -> restricted -> granted
        const next = current === 'granted' ? 'denied' : current === 'denied' ? 'restricted' : 'granted';
        return {
          ...m,
          permissions: {
            ...m.permissions,
            [permKey]: next
          }
        };
      }
      return m;
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Module', 'View', 'Create', 'Edit', 'Delete', 'Export', 'Manage'];
    const rows = modulesList.map(m => [
      `"${m.name}"`,
      m.permissions.view,
      m.permissions.create,
      m.permissions.edit,
      m.permissions.delete,
      m.permissions.export,
      m.permissions.manage
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedRole.name.replace(/\s+/g, '_')}_Permissions_Matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowReportModal(false);
  };

  const handleExportPDF = () => {
    window.print();
    setShowReportModal(false);
  };

  // Filtered Roles List
  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchRoleQuery.toLowerCase())
  );

  // Filtered Modules List
  const filteredModules = modulesList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchPermQuery.toLowerCase());
    const matchesModule = moduleFilter === 'All Modules' || m.name === moduleFilter;
    return matchesSearch && matchesModule;
  });

  // Users assigned to current selected role
  const roleUsersList = (mockRoleUsers[selectedRole.id] || []).filter(u => 
    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure access control, module privileges, and organizational security policies.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <BarChart3 size={15} className="text-[#2563EB]" />
            <span>Permission Reports</span>
          </button>

          <button 
            onClick={() => setShowCreateRoleModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Main Master-Detail Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: Roles List Master Panel */}
        <div className={`lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs space-y-3 ${
          mobileView === 'details' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900">Roles Registry</h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">
                {roles.length}
              </span>
            </div>

            <button 
              onClick={() => setShowCreateRoleModal(true)}
              className="w-7 h-7 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-xs transition cursor-pointer"
              title="Add New Role"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Role Search */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search roles..."
              value={searchRoleQuery}
              onChange={(e) => setSearchRoleQuery(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Roles Cards List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-0.5 custom-scrollbar">
            {filteredRoles.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                No roles match your search.
              </div>
            ) : (
              filteredRoles.map(roleItem => {
                const isSelected = selectedRoleId === roleItem.id;
                const IconComp = roleItem.icon;

                return (
                  <div
                    key={roleItem.id}
                    onClick={() => handleSelectRole(roleItem.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-[#EFF6FF] border-[#2563EB] shadow-xs' 
                        : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-8 h-8 rounded-xl ${roleItem.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                        <IconComp size={16} />
                      </div>
                      <div className="truncate">
                        <p className="font-extrabold text-xs text-slate-900 truncate leading-tight">{roleItem.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{roleItem.usersCount} User{roleItem.usersCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${roleItem.typeBadge}`}>
                        {roleItem.type}
                      </span>
                      <ChevronRight size={15} className={`transition-transform ${isSelected ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Showing {filteredRoles.length} of {roles.length} roles</span>
            {selectedRole.isSystem && (
              <span className="text-purple-600 font-bold flex items-center gap-1">
                <Lock size={11} /> System Root
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Role Details & Matrix Panel */}
        <div className={`lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4 ${
          mobileView === 'list' ? 'hidden lg:block' : 'block'
        }`}>
          
          {/* Mobile Back Button */}
          <div className="block lg:hidden pb-1">
            <button 
              onClick={() => setMobileView('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Roles List</span>
            </button>
          </div>

          {/* Header of Selected Role */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 border border-slate-200/70 p-3.5 rounded-xl relative">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs border border-purple-200">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{selectedRole.name}</h2>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${selectedRole.typeBadge}`}>
                    {selectedRole.type}
                  </span>
                  {selectedRole.isSystem && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                      <Lock size={10} /> Protected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                  {selectedRole.description}
                </p>
              </div>
            </div>

            {/* Action Buttons for Selected Role */}
            <div className="flex items-center gap-2 self-end sm:self-auto relative">
              {!selectedRole.isSystem && (
                <button 
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <Edit3 size={14} className="text-[#2563EB]" />
                  <span>Edit Role</span>
                </button>
              )}

              {/* 3-Dots Dropdown Options Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  title="More Options"
                >
                  <MoreVertical size={16} />
                </button>

                {showMoreMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 space-y-1 animate-in zoom-in-95 duration-150">
                      <button 
                        onClick={handleDuplicateRole}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Copy size={14} className="text-[#2563EB]" />
                        <span>Duplicate Role</span>
                      </button>

                      {!selectedRole.isSystem && (
                        <button 
                          onClick={handleResetPermissions}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 transition flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw size={14} />
                          <span>Reset Permissions</span>
                        </button>
                      )}

                      {!selectedRole.isSystem && (
                        <button 
                          onClick={handleDeleteRole}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer border-t border-slate-100 pt-2"
                        >
                          <Trash2 size={14} />
                          <span>Delete Role</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs (Horizontal Scrollable on Mobile) */}
          <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold overflow-x-auto whitespace-nowrap custom-scrollbar pb-0.5">
            {['Permissions', `Users (${selectedRole.usersCount})`, 'Role Details', 'Activity Log'].map(tabName => {
              const isActive = activeTab === tabName || (tabName.startsWith('Users') && activeTab.startsWith('Users'));
              return (
                <button
                  key={tabName}
                  onClick={() => setActiveTab(tabName)}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    isActive ? 'text-[#2563EB] font-extrabold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tabName}
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2563EB] rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: PERMISSIONS MATRIX */}
          {activeTab === 'Permissions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* 4 Summary Stat Cards for Selected Role */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* Total Permissions */}
                <div className="bg-slate-50/70 border border-slate-200/70 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                      <CheckCircle2 size={13} />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{currentStats.total}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Module Actions</p>
                </div>

                {/* Granted */}
                <div className="bg-slate-50/70 border border-slate-200/70 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Granted</span>
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                      <Check size={13} />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{currentStats.granted}</h3>
                  <p className="text-[10px] font-bold text-[#2563EB]">{currentStats.grantedPct}</p>
                </div>

                {/* Denied */}
                <div className="bg-slate-50/70 border border-slate-200/70 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Denied</span>
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px]">
                      <Lock size={13} />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{currentStats.denied}</h3>
                  <p className="text-[10px] font-bold text-rose-600">{currentStats.deniedPct}</p>
                </div>

                {/* Restricted */}
                <div className="bg-slate-50/70 border border-slate-200/70 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Restricted</span>
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">
                      <MinusCircle size={13} />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{currentStats.restricted}</h3>
                  <p className="text-[10px] font-bold text-amber-600">{currentStats.restrictedPct}</p>
                </div>

              </div>

              {/* Permission Matrix Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                
                {/* Search & Module filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      placeholder="Search permissions..."
                      value={searchPermQuery}
                      onChange={(e) => setSearchPermQuery(e.target.value)}
                      className="w-full pl-3.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition"
                    />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>

                  <select 
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition"
                  >
                    <option>All Modules</option>
                    <option>Dashboard Analytics</option>
                    <option>Organization Management</option>
                    <option>User Accounts & Roles</option>
                    <option>Tenders & Bidding Engine</option>
                    <option>Financials & Invoicing</option>
                  </select>
                </div>

                {/* Expand / Collapse All buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button 
                    onClick={handleExpandAll}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Expand size={13} />
                    <span>Expand All</span>
                  </button>

                  <button 
                    onClick={handleCollapseAll}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Minimize2 size={13} />
                    <span>Collapse All</span>
                  </button>
                </div>

              </div>

              {/* System Role Read-Only Banner */}
              {selectedRole.isSystem && (
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-2.5 text-xs text-purple-800">
                  <Lock size={16} className="shrink-0 text-purple-600" />
                  <span>
                    <strong>System Root Role:</strong> Permissions are locked to 100% full access to ensure platform security stability.
                  </span>
                </div>
              )}

              {/* Permissions Matrix Table (Fully Responsive with horizontal scroll) */}
              <div className="border border-slate-200/80 rounded-2xl overflow-x-auto shadow-xs custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Module / Permission</th>
                      <th className="py-3 px-3 text-center">View</th>
                      <th className="py-3 px-3 text-center">Create</th>
                      <th className="py-3 px-3 text-center">Edit</th>
                      <th className="py-3 px-3 text-center">Delete</th>
                      <th className="py-3 px-3 text-center">Export</th>
                      <th className="py-3 px-3 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredModules.map(moduleItem => {
                      const IconComponent = moduleItem.icon;
                      return (
                        <React.Fragment key={moduleItem.id}>
                          <tr className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4 font-extrabold text-slate-900 flex items-center gap-2.5">
                              <button 
                                onClick={() => toggleModuleExpand(moduleItem.id)}
                                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              >
                                {moduleItem.expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                              </button>
                              <IconComponent size={16} className="text-[#2563EB]" />
                              <span>{moduleItem.name}</span>
                            </td>

                            {/* View */}
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => handlePermissionToggle(moduleItem.id, 'view')}
                                disabled={selectedRole.isSystem}
                                className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition border ${
                                  moduleItem.permissions.view === 'granted'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:scale-110'
                                    : moduleItem.permissions.view === 'denied'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:scale-110'
                                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:scale-110'
                                } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`Toggle View permission (${moduleItem.permissions.view})`}
                              >
                                {moduleItem.permissions.view === 'granted' ? <Check size={14} /> : moduleItem.permissions.view === 'denied' ? <Lock size={13} /> : <MinusCircle size={13} />}
                              </button>
                            </td>

                            {/* Create */}
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => handlePermissionToggle(moduleItem.id, 'create')}
                                disabled={selectedRole.isSystem}
                                className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition border ${
                                  moduleItem.permissions.create === 'granted'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:scale-110'
                                    : moduleItem.permissions.create === 'denied'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:scale-110'
                                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:scale-110'
                                } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`Toggle Create permission (${moduleItem.permissions.create})`}
                              >
                                {moduleItem.permissions.create === 'granted' ? <Check size={14} /> : moduleItem.permissions.create === 'denied' ? <Lock size={13} /> : <MinusCircle size={13} />}
                              </button>
                            </td>

                            {/* Edit */}
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => handlePermissionToggle(moduleItem.id, 'edit')}
                                disabled={selectedRole.isSystem}
                                className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition border ${
                                  moduleItem.permissions.edit === 'granted'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:scale-110'
                                    : moduleItem.permissions.edit === 'denied'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:scale-110'
                                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:scale-110'
                                } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`Toggle Edit permission (${moduleItem.permissions.edit})`}
                              >
                                {moduleItem.permissions.edit === 'granted' ? <Check size={14} /> : moduleItem.permissions.edit === 'denied' ? <Lock size={13} /> : <MinusCircle size={13} />}
                              </button>
                            </td>

                            {/* Delete */}
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => handlePermissionToggle(moduleItem.id, 'delete')}
                                disabled={selectedRole.isSystem}
                                className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition border ${
                                  moduleItem.permissions.delete === 'granted'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:scale-110'
                                    : moduleItem.permissions.delete === 'denied'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:scale-110'
                                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:scale-110'
                                } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`Toggle Delete permission (${moduleItem.permissions.delete})`}
                              >
                                {moduleItem.permissions.delete === 'granted' ? <Check size={14} /> : moduleItem.permissions.delete === 'denied' ? <Lock size={13} /> : <MinusCircle size={13} />}
                              </button>
                            </td>

                            {/* Export */}
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => handlePermissionToggle(moduleItem.id, 'export')}
                                disabled={selectedRole.isSystem}
                                className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition border ${
                                  moduleItem.permissions.export === 'granted'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:scale-110'
                                    : moduleItem.permissions.export === 'denied'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:scale-110'
                                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:scale-110'
                                } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`Toggle Export permission (${moduleItem.permissions.export})`}
                              >
                                {moduleItem.permissions.export === 'granted' ? <Check size={14} /> : moduleItem.permissions.export === 'denied' ? <Lock size={13} /> : <MinusCircle size={13} />}
                              </button>
                            </td>

                            {/* Manage */}
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => handlePermissionToggle(moduleItem.id, 'manage')}
                                disabled={selectedRole.isSystem}
                                className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition border ${
                                  moduleItem.permissions.manage === 'granted'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:scale-110'
                                    : moduleItem.permissions.manage === 'denied'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:scale-110'
                                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:scale-110'
                                } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`Toggle Manage permission (${moduleItem.permissions.manage})`}
                              >
                                {moduleItem.permissions.manage === 'granted' ? <Check size={14} /> : moduleItem.permissions.manage === 'denied' ? <Lock size={13} /> : <MinusCircle size={13} />}
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: USERS LIST FOR SELECTED ROLE */}
          {activeTab.startsWith('Users') && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Users Assigned to {selectedRole.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing all users currently operating under this security role.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <input 
                    type="text"
                    placeholder="Search assigned user..."
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {roleUsersList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <Users size={32} className="mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">No users found for this role</p>
                  <p className="text-[11px] text-slate-500">You can assign users to this role from the Users Management console.</p>
                </div>
              ) : (
                <div className="border border-slate-200/80 rounded-2xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">User</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {roleUsersList.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                {user.avatar}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">{user.department}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200">
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => alert(`Managing permissions for ${user.name}`)}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold rounded-lg transition cursor-pointer"
                            >
                              Manage User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ROLE DETAILS */}
          {activeTab === 'Role Details' && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Info size={16} className="text-[#2563EB]" />
                  Role Metadata & Authorization Scope
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Role Name</span>
                    <span className="font-extrabold text-slate-900">{selectedRole.name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Role Type</span>
                    <span className="font-bold text-blue-600">{selectedRole.type}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Description</span>
                    <p className="font-medium text-slate-700 leading-relaxed">{selectedRole.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOG */}
          {activeTab === 'Activity Log' && (
            <div className="space-y-3 animate-in fade-in duration-200 text-xs">
              {mockActivityLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{log.action}</p>
                      <p className="text-slate-600 font-medium">{log.detail}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">By {log.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* CREATE ROLE MODAL */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-[#2563EB]" />
                Create New Custom Role
              </h3>
              <button onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Role Name *</label>
                <input 
                  type="text" 
                  required
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                  placeholder="e.g. Audit Manager"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Role Type</label>
                <select 
                  value={newRoleData.type}
                  onChange={(e) => setNewRoleData({ ...newRoleData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer font-semibold transition"
                >
                  <option value="Custom Role">Custom Role</option>
                  <option value="Standard Role">Standard Role</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  placeholder="Describe the scope and responsibilities of this role..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {showEditRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-[#2563EB]" />
                Edit Role Settings
              </h3>
              <button onClick={() => setShowEditRoleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Role Name *</label>
                <input 
                  type="text" 
                  required
                  value={editRoleData.name}
                  onChange={(e) => setEditRoleData({ ...editRoleData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={editRoleData.description}
                  onChange={(e) => setEditRoleData({ ...editRoleData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMISSION REPORT EXPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#2563EB]" />
                Permission Reports
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button 
                onClick={handleExportCSV}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download size={16} />
                  Export Permission Matrix (CSV)
                </span>
                <ChevronRight size={16} />
              </button>

              <button 
                onClick={handleExportPDF}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  Print / Save Security Audit (PDF)
                </span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RolesAndPermissions;
