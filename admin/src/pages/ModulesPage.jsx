import React, { useState, useMemo } from 'react';
import { 
  Grid, 
  CheckCircle2, 
  PauseCircle, 
  Puzzle, 
  Code, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  ArrowUpDown, 
  ArrowUp,
  ArrowDown,
  ShieldCheck, 
  Users, 
  X, 
  AlertTriangle,
  Layers,
  Crown,
  Building2,
  CreditCard,
  Settings,
  HelpCircle,
  Bell,
  Trash2,
  MoreVertical,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
  Power
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialModulesList = [
  {
    id: 1,
    name: 'Dashboard Analytics',
    description: 'Overview KPIs, charts, system health metrics, and revenue summary.',
    key: 'dashboard',
    type: 'System',
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    accessLevel: 'All Users',
    accessBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'Active',
    usage: '1,248 Active Users',
    sortOrder: 1,
    icon: Grid,
    iconBg: 'bg-blue-600 text-white'
  },
  {
    id: 2,
    name: 'Organization Management',
    description: 'Manage tenant accounts, organization onboarding, verification, and subscription tracking.',
    key: 'organizations',
    type: 'System',
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    accessLevel: 'Super Admin',
    accessBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Active',
    usage: '42 Organizations',
    sortOrder: 2,
    icon: Building2,
    iconBg: 'bg-purple-600 text-white'
  },
  {
    id: 3,
    name: 'User Accounts & Roles',
    description: 'User registration, role assignments, system permissions, and authentication controls.',
    key: 'users_and_roles',
    type: 'System',
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    accessLevel: 'Super Admin',
    accessBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Active',
    usage: '603 Accounts',
    sortOrder: 3,
    icon: Users,
    iconBg: 'bg-blue-600 text-white'
  },
  {
    id: 4,
    name: 'Tenders & Bidding Engine',
    description: 'Tender discovery, bid preparation, document vault, and submission tracking.',
    key: 'tenders',
    type: 'Custom',
    typeBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    accessLevel: 'All Users',
    accessBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'Active',
    usage: '1,248 Active Users',
    sortOrder: 4,
    icon: Layers,
    iconBg: 'bg-amber-600 text-white'
  },
  {
    id: 5,
    name: 'Financials & Invoicing',
    description: 'Billing cycles, automated invoices, payment gateway webhooks, and MRR accounting.',
    key: 'financials',
    type: 'Custom',
    typeBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    accessLevel: 'Super Admin',
    accessBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Active',
    usage: '212 Subscriptions',
    sortOrder: 5,
    icon: CreditCard,
    iconBg: 'bg-cyan-600 text-white'
  },
  {
    id: 6,
    name: 'Support & Ticketing',
    description: 'Customer helpdesk tickets, live chat routing, issue resolution tracking, and SLAs.',
    key: 'support_tickets',
    type: 'Custom',
    typeBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    accessLevel: 'Support Team',
    accessBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    status: 'Active',
    usage: '14 Active Staff',
    sortOrder: 6,
    icon: HelpCircle,
    iconBg: 'bg-rose-600 text-white'
  },
  {
    id: 7,
    name: 'System Notifications',
    description: 'Broadcast alerts, email triggers, SMS gateway webhooks, and push notifications.',
    key: 'notifications',
    type: 'System',
    typeBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    accessLevel: 'All Users',
    accessBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'Active',
    usage: 'System Wide',
    sortOrder: 7,
    icon: Bell,
    iconBg: 'bg-indigo-600 text-white'
  },
  {
    id: 8,
    name: 'AI Document Parsing (Beta)',
    description: 'Experimental AI model for extracting tender specifications automatically from PDF documents.',
    key: 'ai_doc_parser',
    type: 'Custom',
    typeBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    accessLevel: 'Super Admin',
    accessBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    status: 'Inactive',
    usage: 'Beta Test Only',
    sortOrder: 8,
    icon: Code,
    iconBg: 'bg-slate-700 text-white'
  }
];

const ModulesPage = () => {
  const [modulesList, setModulesList] = useState(initialModulesList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Type');
  const [accessFilter, setAccessFilter] = useState('All Access Level');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection & Sorting
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: '',
    type: 'Custom',
    accessLevel: 'Super Admin',
    sortOrder: 9,
    status: 'Active'
  });

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Dynamic KPI Calculations
  const stats = useMemo(() => {
    const totalCount = modulesList.length;
    const activeCount = modulesList.filter(m => m.status === 'Active').length;
    const inactiveCount = modulesList.filter(m => m.status === 'Inactive').length;
    const systemCount = modulesList.filter(m => m.type === 'System').length;
    const customCount = modulesList.filter(m => m.type === 'Custom').length;

    return {
      totalCount,
      activeCount,
      inactiveCount,
      systemCount,
      customCount
    };
  }, [modulesList]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setTypeFilter('All Type');
    setAccessFilter('All Access Level');
    setSortColumn(null);
    setCurrentPage(1);
    triggerToast('Module filters reset to default', 'info');
  };

  // Toggle Module Active/Inactive Status
  const handleToggleStatus = (id) => {
    let toggledName = '';
    let nextStatus = '';
    const updated = modulesList.map(m => {
      if (m.id === id) {
        nextStatus = m.status === 'Active' ? 'Inactive' : 'Active';
        toggledName = m.name;
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setModulesList(updated);
    setActiveDropdownId(null);
    triggerToast(`Module ${toggledName} status set to ${nextStatus}`, 'info');
  };

  // Add New Module
  const handleAddModule = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.key.trim()) return;

    const formattedKey = formData.key.trim().toLowerCase().replace(/\s+/g, '_');

    const newMod = {
      id: Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim() || 'Custom platform feature module',
      key: formattedKey,
      type: formData.type,
      typeBadge: formData.type === 'System' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100',
      accessLevel: formData.accessLevel,
      accessBadge: formData.accessLevel === 'Super Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                   formData.accessLevel === 'Support Team' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-700 border-slate-200',
      status: formData.status,
      usage: '0 Active Users',
      sortOrder: parseInt(formData.sortOrder) || (modulesList.length + 1),
      icon: Layers,
      iconBg: 'bg-blue-600 text-white'
    };

    setModulesList([...modulesList, newMod]);
    setShowAddModal(false);
    triggerToast(`Added module "${newMod.name}" (${newMod.key})`, 'success');
  };

  // Update Existing Module
  const handleUpdateModule = (e) => {
    e.preventDefault();
    if (!selectedModule) return;

    const updated = modulesList.map(m => {
      if (m.id === selectedModule.id) {
        return {
          ...m,
          name: formData.name.trim(),
          description: formData.description.trim(),
          type: formData.type,
          typeBadge: formData.type === 'System' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100',
          accessLevel: formData.accessLevel,
          accessBadge: formData.accessLevel === 'Super Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                       formData.accessLevel === 'Support Team' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-700 border-slate-200',
          sortOrder: parseInt(formData.sortOrder) || m.sortOrder,
          status: formData.status
        };
      }
      return m;
    });

    setModulesList(updated);
    setShowEditModal(false);
    triggerToast(`Updated configuration for ${formData.name}`, 'success');
  };

  // Delete Module Confirm
  const handleDeleteModuleConfirm = () => {
    if (!selectedModule) return;
    setModulesList(modulesList.filter(m => m.id !== selectedModule.id));
    setShowDeleteModal(false);
    setSelectedModule(null);
    setActiveDropdownId(null);
    triggerToast('Module removed from platform configuration', 'warning');
  };

  // Bulk Operations
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredModules.map(m => m.id));
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

  const handleBulkActivate = () => {
    setModulesList(modulesList.map(m => selectedRowIds.includes(m.id) ? { ...m, status: 'Active' } : m));
    setSelectedRowIds([]);
    triggerToast(`Activated ${selectedRowIds.length} modules`, 'success');
  };

  const handleBulkDeactivate = () => {
    setModulesList(modulesList.map(m => selectedRowIds.includes(m.id) ? { ...m, status: 'Inactive' } : m));
    setSelectedRowIds([]);
    triggerToast(`Deactivated ${selectedRowIds.length} modules`, 'info');
  };

  const handleBulkDelete = () => {
    setModulesList(modulesList.filter(m => !selectedRowIds.includes(m.id)));
    setSelectedRowIds([]);
    triggerToast(`Deleted ${selectedRowIds.length} modules`, 'warning');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Module Name', 'Module Key', 'Type', 'Access Level', 'Status', 'Usage', 'Sort Order', 'Description'];
    const rows = filteredModules.map(m => [
      m.id,
      `"${m.name}"`,
      m.key,
      m.type,
      `"${m.accessLevel}"`,
      m.status,
      `"${m.usage}"`,
      m.sortOrder,
      `"${m.description}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Platform_Modules_Config_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    triggerToast('Exported platform module matrix to CSV!', 'success');
  };

  // Export PDF Report
  const handleExportPDFReport = () => {
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Module Name', 'Key', 'Type', 'Access Level', 'Status', 'Order']],
        body: filteredModules.map(m => [
          m.name,
          m.key,
          m.type,
          m.accessLevel,
          m.status,
          m.sortOrder
        ])
      });
      doc.save(`Platform_Modules_Audit_${new Date().toISOString().slice(0, 10)}.pdf`);
      setShowExportModal(false);
      triggerToast('Exported Platform Modules Audit (PDF)', 'success');
    } catch (err) {
      console.error(err);
      handleExportCSV();
    }
  };

  // Sort Handler
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted dataset
  const filteredModules = useMemo(() => {
    return modulesList.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || m.status === statusFilter;
      const matchesType = typeFilter === 'All Type' || m.type === typeFilter;
      const matchesAccess = accessFilter === 'All Access Level' || m.accessLevel === accessFilter;
      return matchesSearch && matchesStatus && matchesType && matchesAccess;
    }).sort((a, b) => {
      if (!sortColumn) return 0;
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'sortOrder') {
        valA = Number(a.sortOrder);
        valB = Number(b.sortOrder);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [modulesList, searchQuery, statusFilter, typeFilter, accessFilter, sortColumn, sortDirection]);

  // Paginated List
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage) || 1;
  const paginatedModules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredModules.slice(start, start + itemsPerPage);
  }, [filteredModules, currentPage, itemsPerPage]);

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'warning' ? 'bg-rose-900 text-rose-100 border-rose-700' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Grid size={16} className="text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid className="text-blue-600 shrink-0" size={24} />
            System & Feature Modules
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure system capabilities, control feature access levels, and toggle modular platform components.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            title="Export module configuration"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Matrix</span>
          </button>

          <button 
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                key: '',
                type: 'Custom',
                accessLevel: 'Super Admin',
                sortOrder: modulesList.length + 1,
                status: 'Active'
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Module</span>
          </button>
        </div>
      </div>

      {/* Dynamic KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Modules */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Grid size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {stats.totalCount} Configured
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Modules</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalCount}</h3>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Total system features</p>
        </div>

        {/* Card 2: Active Modules */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
              {Math.round((stats.activeCount / (stats.totalCount || 1)) * 100)}% Live
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Modules</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.activeCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span>Enabled features</span>
          </div>
        </div>

        {/* Card 3: Inactive Modules */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <PauseCircle size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
              Disabled
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactive Modules</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.inactiveCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <span>Paused / In Beta</span>
          </div>
        </div>

        {/* Card 4: System Modules */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Puzzle size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
              Core Kernel
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Modules</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.systemCount}</h3>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Core architecture</p>
        </div>

        {/* Card 5: Custom Modules */}
        <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1.5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Code size={16} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full">
              Add-Ons
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Custom Add-Ons</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.customCount}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <span>Modular plugins</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text"
              placeholder="Search modules by name, key, or description..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Right: Dropdowns & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Type Filter */}
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Type">All Types</option>
              <option value="System">System</option>
              <option value="Custom">Custom</option>
            </select>

            {/* Access Level Filter */}
            <select 
              value={accessFilter}
              onChange={(e) => { setAccessFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition"
            >
              <option value="All Access Level">All Access Levels</option>
              <option value="All Users">All Users</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Support Team">Support Team</option>
            </select>

            {/* Reset button */}
            <button 
              onClick={handleResetFilters}
              title="Reset module filters"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Grid Cards View"
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={15} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Bulk Action Bar (When rows selected) */}
      {selectedRowIds.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span className="px-2 py-0.5 bg-white/20 rounded-lg">{selectedRowIds.length} Selected</span>
            <span>Bulk actions for selected system modules:</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkActivate}
              className="px-3 py-1.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition cursor-pointer"
            >
              Activate Modules
            </button>
            <button 
              onClick={handleBulkDeactivate}
              className="px-3 py-1.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition cursor-pointer"
            >
              Deactivate
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
            >
              Delete Modules
            </button>
          </div>
        </div>
      )}

      {/* Main Content View: Table Mode OR Cards Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 select-none">
                  
                  {/* Select All Checkbox */}
                  <th className="py-2.5 px-3.5 w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedRowIds.length === filteredModules.length && filteredModules.length > 0}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                  </th>

                  {/* Module Name Column */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>Module Name</span>
                      {sortColumn === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Module Key */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('key')}>
                    <div className="flex items-center gap-1">
                      <span>Module Key</span>
                      {sortColumn === 'key' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Type */}
                  <th className="py-2.5 px-3.5">Type</th>

                  {/* Access Level */}
                  <th className="py-2.5 px-3.5">Access Level</th>

                  {/* Status */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Usage */}
                  <th className="py-2.5 px-3.5">Usage</th>

                  {/* Sort Order */}
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('sortOrder')}>
                    <div className="flex items-center gap-1">
                      <span>Sort Order</span>
                      {sortColumn === 'sortOrder' ? (
                        sortDirection === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>

                  {/* Actions */}
                  <th className="py-2.5 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedModules.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Grid size={32} className="text-slate-300" />
                        <p className="font-bold text-slate-600 text-sm">No modules found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search query or filter keywords.</p>
                        <button 
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedModules.map(mod => {
                    const IconComponent = mod.icon || Layers;
                    const isSelected = selectedRowIds.includes(mod.id);

                    return (
                      <tr key={mod.id} className={`hover:bg-slate-50/80 transition relative ${isSelected ? 'bg-blue-50/30' : ''}`}>
                        
                        {/* Checkbox */}
                        <td className="py-3 px-3.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleRowSelect(mod.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                        </td>

                        {/* Module Name & Icon */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl ${mod.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                              <IconComponent size={16} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{mod.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium max-w-xs truncate">{mod.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Key */}
                        <td className="py-3 px-3.5 font-mono text-slate-700 font-bold">
                          {mod.key}
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${mod.typeBadge}`}>
                            {mod.type}
                          </span>
                        </td>

                        {/* Access Level Badge */}
                        <td className="py-3 px-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${mod.accessBadge || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {mod.accessLevel}
                          </span>
                        </td>

                        {/* Status Toggle Badge */}
                        <td className="py-3 px-3.5">
                          <button
                            onClick={() => handleToggleStatus(mod.id)}
                            title="Click to toggle module status"
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                              mod.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                              'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              mod.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}></div>
                            <span>{mod.status}</span>
                          </button>
                        </td>

                        {/* Usage */}
                        <td className="py-3 px-3.5 text-slate-600 font-bold">
                          {mod.usage}
                        </td>

                        {/* Sort Order */}
                        <td className="py-3 px-3.5 font-mono font-extrabold text-slate-800">
                          #{mod.sortOrder}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-center relative">
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* Toggle Active/Inactive */}
                            <button 
                              onClick={() => handleToggleStatus(mod.id)}
                              title={`Toggle ${mod.name} Status`}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                mod.status === 'Active' 
                                  ? 'text-blue-600 hover:bg-blue-50' 
                                  : 'text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              {mod.status === 'Active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>

                            {/* Edit Module */}
                            <button 
                              onClick={() => {
                                setSelectedModule(mod);
                                setFormData({
                                  name: mod.name,
                                  description: mod.description,
                                  key: mod.key,
                                  type: mod.type,
                                  accessLevel: mod.accessLevel,
                                  sortOrder: mod.sortOrder,
                                  status: mod.status
                                });
                                setShowEditModal(true);
                              }}
                              title="Edit Module Configuration"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>

                            {/* More Options Dropdown Trigger */}
                            <div className="relative">
                              <button 
                                onClick={() => setActiveDropdownId(activeDropdownId === mod.id ? null : mod.id)}
                                title="More Options Menu"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                <MoreVertical size={15} />
                              </button>

                              {activeDropdownId === mod.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                                  <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 text-left text-xs font-semibold animate-in zoom-in-95 duration-150 space-y-0.5">
                                    <button 
                                      onClick={() => {
                                        setSelectedModule(mod);
                                        setFormData({
                                          name: mod.name,
                                          description: mod.description,
                                          key: mod.key,
                                          type: mod.type,
                                          accessLevel: mod.accessLevel,
                                          sortOrder: mod.sortOrder,
                                          status: mod.status
                                        });
                                        setShowEditModal(true);
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Edit3 size={14} className="text-blue-600" />
                                      <span>Edit Settings</span>
                                    </button>

                                    <button 
                                      onClick={() => handleToggleStatus(mod.id)}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Power size={14} className="text-amber-600" />
                                      <span>Toggle Status ({mod.status})</span>
                                    </button>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    <button 
                                      onClick={() => { setSelectedModule(mod); setShowDeleteModal(true); setActiveDropdownId(null); }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete Module</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedModules.map(mod => {
            const IconComponent = mod.icon || Layers;

            return (
              <div key={mod.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-4 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${mod.iconBg} font-black flex items-center justify-center shrink-0 shadow-xs`}>
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs">{mod.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{mod.key}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      mod.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {mod.status}
                    </span>
                  </div>

                  <div className="pt-3 pb-1">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{mod.description}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100 text-xs my-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Type:</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${mod.typeBadge}`}>{mod.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Access Level:</span>
                      <span className="font-bold text-slate-800">{mod.accessLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Active Usage:</span>
                      <span className="font-bold text-slate-800">{mod.usage}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleStatus(mod.id)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Toggle Status
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedModule(mod);
                      setFormData({
                        name: mod.name,
                        description: mod.description,
                        key: mod.key,
                        type: mod.type,
                        accessLevel: mod.accessLevel,
                        sortOrder: mod.sortOrder,
                        status: mod.status
                      });
                      setShowEditModal(true);
                    }}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit3 size={14} />
                    <span>Edit Config</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shadow-xs">
        <div>
          Showing <span className="font-bold text-slate-800">{filteredModules.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredModules.length)}</span> of <span className="font-bold text-slate-800">{filteredModules.length}</span> modules
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Rows per page</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1 font-bold">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === page ? 'bg-[#1E56F0] text-white shadow-xs' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD MODULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Grid size={20} className="text-blue-600" />
                Add New System Module
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Audit Logs"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Key *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="audit_logs"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Module features and operational scope..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Custom">Custom</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Access Level</label>
                  <select 
                    value={formData.accessLevel}
                    onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="All Users">All Users</option>
                    <option value="Support Team">Support Team</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Sort Order</label>
                  <input 
                    type="number" 
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODULE MODAL */}
      {showEditModal && selectedModule && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-600" />
                Edit Module Configuration
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateModule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Key</label>
                  <input 
                    type="text" 
                    disabled
                    value={formData.key}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Custom">Custom</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Access Level</label>
                  <select 
                    value={formData.accessLevel}
                    onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="All Users">All Users</option>
                    <option value="Support Team">Support Team</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none focus:border-blue-500 cursor-pointer transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Export Modules Matrix</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button 
                onClick={handleExportCSV}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  <span>Export Modules List (CSV)</span>
                </span>
                <Download size={16} />
              </button>

              <button 
                onClick={handleExportPDFReport}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Export Architecture Matrix (PDF)</span>
                </span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedModule && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Remove Platform Module?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-mono font-bold text-slate-800">{selectedModule.name}</span> ({selectedModule.key})?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteModuleConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModulesPage;
