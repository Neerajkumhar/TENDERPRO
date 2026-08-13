import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Crown, 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Upload, 
  Eye, 
  Edit3, 
  MoreVertical, 
  CheckCircle2, 
  PauseCircle, 
  X, 
  Mail, 
  Phone, 
  User,
  FileSpreadsheet,
  Trash2,
  ShieldCheck,
  Check,
  ChevronDown,
  Calendar,
  Shield,
  Activity,
  FileText,
  ExternalLink,
  Lock,
  CheckSquare,
  Settings,
  Key,
  DollarSign,
  Clock,
  AlertTriangle,
  Layers,
  Globe,
  MapPin,
  ArrowLeft,
  Save,
  CheckCircle
} from 'lucide-react';

const initialOrganizations = [
  {
    id: 1,
    name: 'BuildTech Pvt. Ltd.',
    domain: 'buildtech.com',
    email: 'contact@buildtech.com',
    logoBg: 'bg-blue-600 text-white',
    logoText: 'B',
    plan: 'Business',
    planBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    module: 'Finance',
    activeUsers: 32,
    totalUsers: 50,
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    renewalDate: '15 Oct 2025',
    renewalDays: 'in 62 days',
    renewalStyle: 'text-blue-600',
    revenue: '₹1,24,999',
    createdOn: '12 Jan 2024',
    phone: '+91 98765 43210',
    contactPerson: 'Ramesh Sharma',
    address: '402, Trade Tower, MG Road, Bengaluru, Karnataka - 560001',
    gstin: '29AAACB1234C1Z5',
    billingCycle: 'Annual',
    storageQuota: '250 GB',
    storageUsed: '68 GB',
    enabledModules: ['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace', 'Delivery Challans'],
    primaryAdminRole: 'Organization Admin'
  },
  {
    id: 2,
    name: 'Raj Construction',
    domain: 'rajconstructions.in',
    email: 'info@rajconstructions.in',
    logoBg: 'bg-purple-600 text-white',
    logoText: 'R',
    plan: 'Professional',
    planBadge: 'bg-purple-50 text-purple-600 border-purple-100',
    module: 'Tenders',
    activeUsers: 28,
    totalUsers: 30,
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    renewalDate: '28 Aug 2025',
    renewalDays: 'in 14 days',
    renewalStyle: 'text-amber-600',
    revenue: '₹1,12,499',
    createdOn: '05 Mar 2024',
    phone: '+91 98123 45678',
    contactPerson: 'Vikram Singh',
    address: '12, Industrial Area Phase II, Jaipur, Rajasthan - 302013',
    gstin: '08ABCPR9876D1Z2',
    billingCycle: 'Annual',
    storageQuota: '100 GB',
    storageUsed: '42 GB',
    enabledModules: ['Tenders & Bids', 'Project Workspace', 'Team Attendance'],
    primaryAdminRole: 'Organization Admin'
  },
  {
    id: 3,
    name: 'Green Infra',
    domain: 'greeninfra.org',
    email: 'admin@greeninfra.org',
    logoBg: 'bg-blue-600 text-white',
    logoText: 'G',
    plan: 'Business',
    planBadge: 'bg-blue-50 text-blue-600 border-blue-100',
    module: 'Projects',
    activeUsers: 24,
    totalUsers: 25,
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    renewalDate: '02 Dec 2025',
    renewalDays: 'in 110 days',
    renewalStyle: 'text-blue-600',
    revenue: '₹99,999',
    createdOn: '20 Apr 2024',
    phone: '+91 99887 76655',
    contactPerson: 'Ananya Gupta',
    address: '88, Eco Complex, Sector 62, Noida, Uttar Pradesh - 201309',
    gstin: '09AAACG5544K1Z9',
    billingCycle: 'Annual',
    storageQuota: '250 GB',
    storageUsed: '115 GB',
    enabledModules: ['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace'],
    primaryAdminRole: 'Organization Admin'
  },
  {
    id: 4,
    name: 'Infra Projects',
    domain: 'infraprojects.com',
    email: 'support@infraprojects.com',
    logoBg: 'bg-amber-600 text-white',
    logoText: 'I',
    plan: 'Enterprise',
    planBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    module: 'Core',
    activeUsers: 85,
    totalUsers: 100,
    status: 'Active',
    statusStyle: 'text-blue-600 bg-blue-50 border-blue-200',
    renewalDate: '10 Jan 2026',
    renewalDays: 'in 149 days',
    renewalStyle: 'text-blue-600',
    revenue: '₹2,49,999',
    createdOn: '10 Nov 2023',
    phone: '+91 97654 32109',
    contactPerson: 'Suresh Reddy',
    address: 'Hitech City Phase 2, Hyderabad, Telangana - 500081',
    gstin: '36AAACI9988H1Z1',
    billingCycle: 'Annual',
    storageQuota: '1 TB',
    storageUsed: '380 GB',
    enabledModules: ['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace', 'Delivery Challans', 'Attendance & Payroll'],
    primaryAdminRole: 'Super Admin / Org Admin'
  },
  {
    id: 5,
    name: 'TechBuild Solutions',
    domain: 'techbuild.io',
    email: 'hello@techbuild.io',
    logoBg: 'bg-cyan-600 text-white',
    logoText: 'T',
    plan: 'Starter',
    planBadge: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    module: 'Core',
    activeUsers: 18,
    totalUsers: 20,
    status: 'Trial',
    statusStyle: 'text-amber-600 bg-amber-50 border-amber-200',
    renewalDate: '25 Aug 2025',
    renewalDays: 'in 11 days',
    renewalStyle: 'text-amber-600',
    revenue: '₹49,999',
    createdOn: '01 Aug 2025',
    phone: '+91 92109 87654',
    contactPerson: 'Arjun Mehta',
    address: 'Plot 45, IT Park, Pune, Maharashtra - 411057',
    gstin: '27AAACT1122M1Z0',
    billingCycle: 'Monthly',
    storageQuota: '50 GB',
    storageUsed: '12 GB',
    enabledModules: ['Tenders & Bids'],
    primaryAdminRole: 'Organization Admin'
  }
];

const mockOrgMembers = [
  { id: 101, name: 'Khushi Rajawat', email: 'khushi@buildtech.com', role: 'Super Admin', status: 'Active', avatar: 'KR' },
  { id: 102, name: 'Neeraj Kumar', email: 'neeraj@buildtech.com', role: 'Organization Admin', status: 'Active', avatar: 'NK' },
  { id: 103, name: 'Ramesh Sharma', email: 'ramesh@buildtech.com', role: 'Tender Manager', status: 'Active', avatar: 'RS' },
  { id: 104, name: 'Priya Sharma', email: 'priya@buildtech.com', role: 'Finance Manager', status: 'Active', avatar: 'PS' },
  { id: 105, name: 'Sanjay Verma', email: 'sanjay@buildtech.com', role: 'Project Manager', status: 'Inactive', avatar: 'SV' }
];

const mockBillingHistory = [
  { id: 'INV-2025-001', date: '15 Oct 2024', amount: '₹1,24,999', plan: 'Business Annual Plan', status: 'Paid', method: 'Razorpay UPI' },
  { id: 'INV-2024-001', date: '15 Oct 2023', amount: '₹1,15,000', plan: 'Business Annual Plan', status: 'Paid', method: 'Bank Transfer' }
];

const mockOrgLogs = [
  { id: 1, action: 'User Seats Updated', details: 'Increased seat capacity from 40 to 50 users', time: '2 days ago', user: 'Super Admin' },
  { id: 2, action: 'Module Provisioned', details: 'Enabled Delivery & Installation Challan Module', time: '1 week ago', user: 'Khushi Rajawat' },
  { id: 3, action: 'Subscription Renewed', details: 'Renewed Business Plan for 1 Year', time: '15 Oct 2024', user: 'Neeraj Kumar' }
];

const Organizations = () => {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Action Menu Dropdown Open State
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Single Page View Mode State ('list', 'view', 'edit')
  const [viewMode, setViewMode] = useState('list');
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Import / Export Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State for Edit / Add
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    email: '',
    contactPerson: '',
    phone: '',
    address: '',
    gstin: '',
    plan: 'Business',
    billingCycle: 'Annual',
    totalUsers: 25,
    status: 'Active',
    storageQuota: '250 GB',
    enabledModules: ['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace']
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredOrgs.map(o => o.id));
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

  const handleOpenSinglePageView = (org) => {
    setSelectedOrg(org);
    setViewMode('view');
    setActiveMenuId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSinglePageEdit = (org) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name || '',
      domain: org.domain || '',
      email: org.email || '',
      contactPerson: org.contactPerson || '',
      phone: org.phone || '',
      address: org.address || '',
      gstin: org.gstin || '',
      plan: org.plan || 'Business',
      billingCycle: org.billingCycle || 'Annual',
      totalUsers: org.totalUsers || 25,
      status: org.status || 'Active',
      storageQuota: org.storageQuota || '250 GB',
      enabledModules: org.enabledModules || ['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace']
    });
    setViewMode('edit');
    setActiveMenuId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveOrganizationEdit = (e) => {
    e.preventDefault();
    if (!selectedOrg) return;

    const updated = organizations.map(o => {
      if (o.id === selectedOrg.id) {
        const updatedOrg = {
          ...o,
          name: formData.name,
          domain: formData.domain,
          email: formData.email,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          address: formData.address,
          gstin: formData.gstin,
          plan: formData.plan,
          billingCycle: formData.billingCycle,
          planBadge: formData.plan === 'Enterprise' ? 'bg-amber-50 text-amber-700 border-amber-200' : formData.plan === 'Professional' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100',
          totalUsers: parseInt(formData.totalUsers),
          status: formData.status,
          statusStyle: formData.status === 'Active' ? 'text-blue-600 bg-blue-50 border-blue-200' : formData.status === 'Trial' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200',
          storageQuota: formData.storageQuota,
          enabledModules: formData.enabledModules
        };

        setSelectedOrg(updatedOrg);
        return updatedOrg;
      }
      return o;
    });

    setOrganizations(updated);
    setViewMode('view');
  };

  const handleAddOrganization = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newOrg = {
      id: Date.now(),
      name: formData.name,
      domain: formData.domain || `${formData.name.toLowerCase().replace(/\s+/g, '')}.com`,
      email: formData.email,
      logoBg: 'bg-blue-600 text-white',
      logoText: formData.name.charAt(0).toUpperCase(),
      plan: formData.plan,
      planBadge: formData.plan === 'Enterprise' ? 'bg-amber-50 text-amber-700 border-amber-200' : formData.plan === 'Professional' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100',
      module: 'Core',
      activeUsers: 1,
      totalUsers: parseInt(formData.totalUsers) || 25,
      status: formData.status,
      statusStyle: formData.status === 'Active' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-amber-600 bg-amber-50 border-amber-200',
      renewalDate: '20 May 2026',
      renewalDays: 'in 365 days',
      renewalStyle: 'text-blue-600',
      revenue: '₹0',
      createdOn: 'Today',
      phone: formData.phone || '+91 99999 88888',
      contactPerson: formData.contactPerson || 'Admin',
      address: formData.address || 'India',
      gstin: formData.gstin || '29AAAAA0000A1Z5',
      billingCycle: formData.billingCycle,
      storageQuota: formData.storageQuota,
      enabledModules: formData.enabledModules
    };

    setOrganizations([newOrg, ...organizations]);
    setShowAddModal(false);
  };

  const handleToggleModuleInForm = (modName) => {
    const current = formData.enabledModules || [];
    if (current.includes(modName)) {
      setFormData({ ...formData, enabledModules: current.filter(m => m !== modName) });
    } else {
      setFormData({ ...formData, enabledModules: [...current, modName] });
    }
  };

  const handleToggleOrgStatus = (id) => {
    setOrganizations(organizations.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === 'Active' ? 'Inactive' : 'Active';
        const updatedObj = {
          ...o,
          status: nextStatus,
          statusStyle: nextStatus === 'Active' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-slate-600 bg-slate-100 border-slate-200'
        };
        if (selectedOrg && selectedOrg.id === id) setSelectedOrg(updatedObj);
        return updatedObj;
      }
      return o;
    }));
    setActiveMenuId(null);
  };

  const handleDeleteOrg = (id) => {
    if (confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(organizations.filter(o => o.id !== id));
      setSelectedRowIds(selectedRowIds.filter(itemId => itemId !== id));
      setActiveMenuId(null);
      if (selectedOrg && selectedOrg.id === id) {
        setViewMode('list');
        setSelectedOrg(null);
      }
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedRowIds.length} selected organizations?`)) {
      setOrganizations(organizations.filter(o => !selectedRowIds.includes(o.id)));
      setSelectedRowIds([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Organization Name', 'Domain', 'Contact Email', 'Contact Person', 'Phone', 'GSTIN', 'Address', 'Plan', 'Billing Cycle', 'Active Users', 'Total Seats', 'Status', 'Renewal Date', 'Lifetime Revenue', 'Created Date'];
    const rows = filteredOrgs.map(o => [
      o.id,
      `"${o.name}"`,
      `"${o.domain}"`,
      `"${o.email}"`,
      `"${o.contactPerson || ''}"`,
      `"${o.phone || ''}"`,
      `"${o.gstin || ''}"`,
      `"${o.address || ''}"`,
      `"${o.plan}"`,
      `"${o.billingCycle || 'Annual'}"`,
      o.activeUsers,
      o.totalUsers,
      `"${o.status}"`,
      `"${o.renewalDate}"`,
      `"${o.revenue}"`,
      `"${o.createdOn}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Organizations_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  // Filtered dataset
  const filteredOrgs = organizations.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.contactPerson && o.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All Status' || o.status === statusFilter;
    const matchesPlan = planFilter === 'All Plans' || o.plan === planFilter;
    const matchesModule = moduleFilter === 'All Modules' || o.module === moduleFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesModule;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrgs.length / rowsPerPage) || 1;
  const paginatedOrgs = filteredOrgs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totalOrgsCount = organizations.length;
  const activeOrgsCount = organizations.filter(o => o.status === 'Active').length;
  const inactiveOrgsCount = organizations.filter(o => o.status === 'Inactive' || o.status === 'Expired').length;
  const paidOrgsCount = organizations.filter(o => o.plan !== 'Starter' && o.status === 'Active').length;

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300">
      
      {/* PAGE MODE 1: SINGLE PAGE DETAILED VIEW */}
      {viewMode === 'view' && selectedOrg && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Breadcrumb Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode('list')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft size={16} />
                <span>Back to Organizations</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedOrg.logoBg} font-black flex items-center justify-center text-lg shrink-0 shadow-xs`}>
                  {selectedOrg.logoText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-extrabold text-slate-900">{selectedOrg.name}</h1>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${selectedOrg.planBadge}`}>
                      {selectedOrg.plan}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${selectedOrg.statusStyle}`}>
                      {selectedOrg.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    <Globe size={13} className="text-slate-400" />
                    <span className="font-mono">{selectedOrg.domain}</span>
                    <span>•</span>
                    <span>Created {selectedOrg.createdOn}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={() => handleOpenSinglePageEdit(selectedOrg)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Edit3 size={15} />
                <span>Edit Organization</span>
              </button>

              <button 
                onClick={() => handleToggleOrgStatus(selectedOrg.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <PauseCircle size={15} className="text-amber-500" />
                <span>{selectedOrg.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seat Capacity</span>
              <p className="text-lg font-extrabold text-slate-900">{selectedOrg.activeUsers} / {selectedOrg.totalUsers} Active</p>
              <p className="text-[10px] text-blue-600 font-bold">{selectedOrg.totalUsers - selectedOrg.activeUsers} available seats</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Term</span>
              <p className="text-lg font-extrabold text-blue-600">{selectedOrg.billingCycle || 'Annual'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{selectedOrg.revenue} Revenue</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Renewal</span>
              <p className="text-lg font-extrabold text-slate-900">{selectedOrg.renewalDate}</p>
              <p className={`text-[10px] font-bold ${selectedOrg.renewalStyle}`}>{selectedOrg.renewalDays}</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Storage Quota</span>
              <p className="text-lg font-extrabold text-slate-900">{selectedOrg.storageUsed || '42 GB'} / {selectedOrg.storageQuota || '250 GB'}</p>
              <p className="text-[10px] text-slate-400 font-medium">Cloud Storage</p>
            </div>
          </div>

          {/* Section 2: Two-Column Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Card: Corporate & Contact Details */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 size={16} className="text-[#2563EB]" />
                Corporate & Primary Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Contact</span>
                  <span className="font-extrabold text-slate-900">{selectedOrg.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Mail size={13} className="text-slate-400" />
                    {selectedOrg.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Phone size={13} className="text-slate-400" />
                    {selectedOrg.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GSTIN / Tax ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedOrg.gstin || '29AAACB1234C1Z5'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Corporate Address</span>
                  <span className="font-medium text-slate-700 leading-relaxed block mt-0.5">{selectedOrg.address || '402, Trade Tower, MG Road, Bengaluru, Karnataka'}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Subscription & Quota Details */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Crown size={16} className="text-amber-500" />
                Subscription Plan & Account Controls
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Plan</span>
                  <span className="font-extrabold text-[#2563EB]">{selectedOrg.plan}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Frequency</span>
                  <span className="font-bold text-slate-800">{selectedOrg.billingCycle || 'Annual'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total User Seats</span>
                  <span className="font-extrabold text-slate-900">{selectedOrg.totalUsers} Seats</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Authorization</span>
                  <span className="font-semibold text-purple-700">{selectedOrg.primaryAdminRole || 'Organization Admin'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Provisioned Modules Grid */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Layers size={16} className="text-[#2563EB]" />
              Provisioned Platform Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace', 'Delivery Challans', 'Team Attendance', 'Audit Security'].map(modName => {
                const isEnabled = (selectedOrg.enabledModules || []).includes(modName) || modName.startsWith('Tenders') || modName.startsWith('Project');
                return (
                  <div key={modName} className={`p-3 rounded-xl border flex items-center justify-between ${
                    isEnabled ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className={isEnabled ? 'text-[#2563EB]' : 'text-slate-400'} />
                      <span className="font-extrabold text-xs text-slate-800">{modName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${isEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Team Members Directory */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Users size={16} className="text-[#2563EB]" />
                Assigned Team Members ({mockOrgMembers.length})
              </h3>
              <span className="text-xs font-bold text-blue-600">{selectedOrg.totalUsers - mockOrgMembers.length} remaining seats</span>
            </div>
            
            <div className="border border-slate-200/80 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockOrgMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                            {m.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{m.name}</p>
                            <p className="text-[10px] text-slate-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{m.role}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Billing & Invoice History */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-[#2563EB]" />
              Billing & Invoice History
            </h3>
            <div className="border border-slate-200/80 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Plan Details</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockBillingHistory.map(b => (
                    <tr key={b.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB]">{b.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">{b.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{b.plan}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{b.amount}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-200 text-[10px]">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* PAGE MODE 2: SINGLE PAGE DETAILED EDIT FORM */}
      {viewMode === 'edit' && selectedOrg && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Sticky Action Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs sticky top-2 z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode('view')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft size={16} />
                <span>Cancel</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <div>
                <h1 className="text-base font-extrabold text-slate-900">Editing Organization: {selectedOrg.name}</h1>
                <p className="text-xs text-slate-400 font-mono">ID #{selectedOrg.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('view')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveOrganizationEdit}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <Save size={15} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Edit Form Body Stacked Single Page Sections */}
          <form onSubmit={handleSaveOrganizationEdit} className="space-y-4">
            
            {/* Section 1: General Organization Info */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 size={16} className="text-[#2563EB]" />
                General Organization Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Domain Name</label>
                  <input 
                    type="text" 
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">GSTIN / Tax Registration ID</label>
                  <input 
                    type="text" 
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Corporate Address</label>
                  <textarea 
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Subscription & Billing Settings */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Crown size={16} className="text-amber-500" />
                Subscription Plan & Seat Allocation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Subscription Plan</label>
                  <select 
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Business">Business</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Billing Frequency</label>
                  <select 
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Max User Seats Limit</label>
                  <input 
                    type="number" 
                    value={formData.totalUsers}
                    onChange={(e) => setFormData({ ...formData, totalUsers: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Account Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Expired">Expired</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Storage Quota</label>
                  <select 
                    value={formData.storageQuota}
                    onChange={(e) => setFormData({ ...formData, storageQuota: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="50 GB">50 GB (Starter)</option>
                    <option value="100 GB">100 GB (Professional)</option>
                    <option value="250 GB">250 GB (Business)</option>
                    <option value="1 TB">1 TB (Enterprise)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Module Privilege Toggles */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers size={16} className="text-[#2563EB]" />
                Module Privileges & Feature Toggles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace', 'Delivery Challans', 'Team Attendance', 'Audit Security'].map(modName => {
                  const isChecked = (formData.enabledModules || []).includes(modName);
                  return (
                    <label key={modName} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleModuleInForm(modName)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900">{modName}</p>
                        <p className="text-[10px] text-slate-500">Enable user workflow & API access for this module.</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setViewMode('view')}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <Save size={15} />
                <span>Save Changes</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* PAGE MODE 3: MAIN ORGANIZATIONS LIST TABLE */}
      {viewMode === 'list' && (
        <>
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Organizations Management
              </h1>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Manage organization accounts, subscriptions, seat allocations, and module privileges.
              </p>
            </div>

            {/* Action Header Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                <Download size={14} className="text-[#2563EB]" />
                <span>Export</span>
              </button>

              <button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                <Upload size={14} className="text-[#2563EB]" />
                <span>Import</span>
              </button>

              <button 
                onClick={() => {
                  setFormData({ 
                    name: '', domain: '', email: '', contactPerson: '', phone: '', address: '', gstin: '',
                    plan: 'Business', billingCycle: 'Annual', totalUsers: 25, status: 'Active', storageQuota: '250 GB',
                    enabledModules: ['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace']
                  });
                  setShowAddModal(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Organization</span>
              </button>
            </div>
          </div>

          {/* Dynamic KPI Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Orgs</span>
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 size={14} />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{totalOrgsCount}</h3>
              <p className="text-[10px] text-blue-600 font-bold">Active Platform Tenants</p>
            </div>

            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active</span>
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{activeOrgsCount}</h3>
              <p className="text-[10px] text-blue-600 font-bold">Operational Accounts</p>
            </div>

            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paid Plans</span>
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Crown size={14} />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{paidOrgsCount}</h3>
              <p className="text-[10px] text-amber-600 font-bold">Business & Enterprise</p>
            </div>

            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-1 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactive / Expired</span>
                <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <PauseCircle size={14} />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{inactiveOrgsCount}</h3>
              <p className="text-[10px] text-rose-600 font-bold">Needs Review</p>
            </div>
          </div>

          {/* Main Table Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            
            {/* Table Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text"
                  placeholder="Search by name, domain, email, contact..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition"
                />
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Expired</option>
                  <option>Inactive</option>
                </select>

                <select 
                  value={planFilter}
                  onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  <option>All Plans</option>
                  <option>Starter</option>
                  <option>Business</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>

                {selectedRowIds.length > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete Selected ({selectedRowIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Organizations Table */}
            <div className="border border-slate-200/80 rounded-2xl overflow-x-auto shadow-xs custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredOrgs.length > 0 && selectedRowIds.length === filteredOrgs.length}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-3">Contact Person</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3 text-center">Seats</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Renewal</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrgs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                        No organizations match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrgs.map(org => {
                      const isChecked = selectedRowIds.includes(org.id);
                      const isMenuOpen = activeMenuId === org.id;

                      return (
                        <tr key={org.id} className="hover:bg-slate-50/70 transition group">
                          <td className="py-3 px-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleRowSelect(org.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl ${org.logoBg} font-black flex items-center justify-center text-sm shrink-0 shadow-xs`}>
                                {org.logoText}
                              </div>
                              <div>
                                <button 
                                  onClick={() => handleOpenSinglePageView(org)}
                                  className="font-extrabold text-slate-900 hover:text-[#2563EB] text-left transition cursor-pointer"
                                >
                                  {org.name}
                                </button>
                                <p className="text-[10px] text-slate-400 font-mono">{org.domain}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-extrabold text-slate-800">{org.contactPerson}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{org.phone}</p>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${org.planBadge}`}>
                              {org.plan}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="font-extrabold text-slate-900">{org.activeUsers}</span>
                            <span className="text-slate-400 font-medium"> / {org.totalUsers}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${org.statusStyle}`}>
                              {org.status}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-700">{org.renewalDate}</p>
                            <p className={`text-[10px] font-bold ${org.renewalStyle}`}>{org.renewalDays}</p>
                          </td>

                          <td className="py-3 px-4 text-right relative">
                            <div className="flex items-center justify-end gap-1">
                              {/* VIEW SINGLE PAGE BUTTON */}
                              <button 
                                onClick={() => handleOpenSinglePageView(org)}
                                title="Single Page Detailed View"
                                className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Eye size={16} />
                              </button>

                              {/* EDIT SINGLE PAGE BUTTON */}
                              <button 
                                onClick={() => handleOpenSinglePageEdit(org)}
                                title="Single Page Detailed Edit"
                                className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit3 size={16} />
                              </button>

                              {/* MORE OPTIONS BUTTON */}
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveMenuId(isMenuOpen ? null : org.id)}
                                  title="More Options"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {isMenuOpen && (
                                  <>
                                    <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 space-y-1 text-left animate-in zoom-in-95 duration-150">
                                      <button 
                                        onClick={() => handleOpenSinglePageView(org)}
                                        className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                      >
                                        <Eye size={14} className="text-[#2563EB]" />
                                        <span>View Organization</span>
                                      </button>

                                      <button 
                                        onClick={() => handleOpenSinglePageEdit(org)}
                                        className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                      >
                                        <Edit3 size={14} className="text-[#2563EB]" />
                                        <span>Edit Settings</span>
                                      </button>

                                      <button 
                                        onClick={() => handleToggleOrgStatus(org.id)}
                                        className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-2 cursor-pointer"
                                      >
                                        <PauseCircle size={14} className="text-amber-500" />
                                        <span>{org.status === 'Active' ? 'Deactivate Org' : 'Activate Org'}</span>
                                      </button>

                                      <button 
                                        onClick={() => handleDeleteOrg(org.id)}
                                        className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2 cursor-pointer border-t border-slate-100 pt-2"
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete Org</span>
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

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-900">{filteredOrgs.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * rowsPerPage, filteredOrgs.length)}</span> of <span className="font-bold text-slate-900">{filteredOrgs.length}</span> organizations
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition cursor-pointer"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* CREATE NEW ORGANIZATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-[#2563EB]" />
                Register New Organization
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddOrganization} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Industries"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Domain Name</label>
                  <input 
                    type="text" 
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="apexind.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@apexind.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">GSTIN / Tax Registration ID</label>
                  <input 
                    type="text" 
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="29AAACB1234C1Z5"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Subscription Plan</label>
                  <select 
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Business">Business</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">User Seats Limit</label>
                  <input 
                    type="number" 
                    value={formData.totalUsers}
                    onChange={(e) => setFormData({ ...formData, totalUsers: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Initial Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer transition font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Module Privileges</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Tenders & Bids', 'Financials & Invoicing', 'Project Workspace', 'Delivery Challans'].map(modName => {
                    const isChecked = (formData.enabledModules || []).includes(modName);
                    return (
                      <label key={modName} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition text-[11px]">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleModuleInForm(modName)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="font-extrabold text-slate-800">{modName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 transition text-center cursor-pointer"
                >
                  Register Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Download size={18} className="text-[#2563EB]" />
                Export Organizations
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <button 
                onClick={handleExportCSV}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 flex items-center justify-between transition cursor-pointer"
              >
                <span>Export CSV Dataset (File Download)</span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload size={18} className="text-[#2563EB]" />
                Import Organizations
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50 relative">
              <FileSpreadsheet size={36} className="mx-auto text-[#2563EB]" />
              <div>
                <p className="text-xs font-bold text-slate-800">Upload CSV file</p>
                <p className="text-[11px] text-slate-400">Select a .csv file from your computer</p>
              </div>

              <input 
                type="file" 
                accept=".csv"
                onChange={handleImportFile}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              <button 
                type="button"
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition cursor-pointer"
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

export default Organizations;
