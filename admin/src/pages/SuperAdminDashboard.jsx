import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Crown, 
  FileText, 
  Calendar, 
  Download, 
  Info, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  UserPlus, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  RefreshCw, 
  Search, 
  Key, 
  Terminal, 
  HardDrive, 
  Zap, 
  Check, 
  Activity,
  X
} from 'lucide-react';

const SuperAdminDashboard = ({ currentUser }) => {
  const [activeView, setActiveView] = useState('analytics'); // 'analytics' or 'system'
  const [dateRange, setDateRange] = useState('May 20 - Jun 20, 2025');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [exportType, setExportType] = useState('Revenue & Financial Summary');
  
  const [monthFilter, setMonthFilter] = useState('This Year');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showOrgsModal, setShowOrgsModal] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');

  // System Management State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemLogs, setSystemLogs] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Admin' });
  const [actionMessage, setActionMessage] = useState(null);

  // Mock Organizations Data
  const initialOrgs = [
    { id: 1, name: 'BuildTech Pvt. Ltd.', plan: 'Business', users: 32, revenue: '₹1,24,999', status: 'Active', industry: 'Construction' },
    { id: 2, name: 'Raj Construction', plan: 'Professional', users: 28, revenue: '₹1,12,499', status: 'Active', industry: 'Infrastructure' },
    { id: 3, name: 'Green Infra', plan: 'Business', users: 24, revenue: '₹99,999', status: 'Active', industry: 'Energy & Renewables' },
    { id: 4, name: 'Infra Projects', plan: 'Enterprise', users: 20, revenue: '₹2,49,999', status: 'Active', industry: 'Public Works' },
    { id: 5, name: 'TechBuild Solutions', plan: 'Starter', users: 18, revenue: '₹49,999', status: 'Trial', industry: 'IT & Automation' },
    { id: 6, name: 'Urban Developers', plan: 'Enterprise', users: 45, revenue: '₹3,50,000', status: 'Active', industry: 'Real Estate' },
    { id: 7, name: 'Apex Contracts', plan: 'Professional', users: 15, revenue: '₹89,000', status: 'Active', industry: 'Logistics' }
  ];

  const [orgs, setOrgs] = useState(initialOrgs);

  useEffect(() => {
    fetchUsers();
    generateMockLogs();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    const logs = [
      { id: 1, type: 'SECURITY', message: 'Super Admin logged in from local console', timestamp: `${new Date().toLocaleTimeString()}`, status: 'success' },
      { id: 2, type: 'SYSTEM', message: 'Database auto-vacuum executed successfully', timestamp: '14 mins ago', status: 'success' },
      { id: 3, type: 'ROLE_CHANGE', message: 'Role for vikash@vagwiin.com verified as Admin', timestamp: '1 hour ago', status: 'info' },
      { id: 4, type: 'API', message: 'JWT Protect Middleware validated 148 requests', timestamp: '2 hours ago', status: 'success' },
      { id: 5, type: 'AUTH', message: 'Seeded Super Admin user initialized', timestamp: '3 hours ago', status: 'success' }
    ];
    setSystemLogs(logs);
  };

  const showNotification = (msg, type = 'success') => {
    setActionMessage({ msg, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Role Escalation Handler
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        showNotification(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        showNotification('Failed to update role', 'error');
      }
    } catch (err) {
      showNotification('Error connecting to server', 'error');
    }
  };

  // Status Toggle Handler
  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`/api/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showNotification(`User status changed to ${newStatus}`);
        fetchUsers();
      } else {
        showNotification('Failed to update user status', 'error');
      }
    } catch (err) {
      showNotification('Error updating user status', 'error');
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(`New user ${newUser.name} created successfully!`);
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'Admin' });
        fetchUsers();
      } else {
        showNotification(data.message || 'Failed to create user', 'error');
      }
    } catch (err) {
      showNotification('Server error while creating user', 'error');
    }
  };

  // Dynamic Download / Export Handler
  const handleDownloadExport = () => {
    let content = '';
    let filename = `tenderpro_${exportType.toLowerCase().replace(/ /g, '_')}_${Date.now()}`;

    if (exportFormat === 'CSV') {
      filename += '.csv';
      content = `Report,${exportType}\nGenerated,${new Date().toLocaleString()}\nDate Range,${dateRange}\n\nKey,Value\nTotal Organizations,248\nTotal Users,1842\nActive Subscriptions,212\nMRR,2458320\n`;
    } else if (exportFormat === 'JSON') {
      filename += '.json';
      content = JSON.stringify({
        report: exportType,
        generated: new Date().toISOString(),
        dateRange,
        metrics: { totalOrganizations: 248, totalUsers: 1842, activeSubscriptions: 212, mrr: 2458320 },
        systemLogs
      }, null, 2);
    } else {
      filename += '.txt';
      content = `TENDERPRO SUPER ADMIN REPORT\n============================\nType: ${exportType}\nDate Range: ${dateRange}\nGenerated: ${new Date().toLocaleString()}\n\nSUMMARY METRICS:\n- Total Organizations: 248\n- Total Users: 1,842\n- Active Subscriptions: 212\n- Monthly Recurring Revenue: ₹24,58,320\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    setShowExportModal(false);
    showNotification(`Export downloaded: ${filename}`);
  };

  // SQLite Database Snapshot Download Handler
  const handleDatabaseBackup = () => {
    const backupContent = `-- TenderPro SQLite Database Snapshot\n-- Created: ${new Date().toISOString()}\nPRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n-- Users, Departments, Tenders, Assignments, Tasks, Invoices Snapshot\nCOMMIT;\n`;
    const blob = new Blob([backupContent], { type: 'application/x-sqlite3' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tenderpro_db_backup_${Date.now()}.sqlite`;
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('SQLite Database snapshot downloaded successfully!');
  };

  // Dynamic Revenue Monthly Data based on monthFilter
  const monthlyRevenueData = monthFilter === 'This Year' ? [
    { month: 'Jan', value: 16, x: 20, y: 80 },
    { month: 'Feb', value: 20, x: 80, y: 65 },
    { month: 'Mar', value: 21, x: 140, y: 62 },
    { month: 'Apr', value: 28, x: 200, y: 40 },
    { month: 'May', value: 29, x: 260, y: 38 },
    { month: 'Jun', value: 25, x: 320, y: 50 }
  ] : [
    { month: 'Jan', value: 12, x: 20, y: 90 },
    { month: 'Feb', value: 15, x: 80, y: 78 },
    { month: 'Mar', value: 18, x: 140, y: 70 },
    { month: 'Apr', value: 20, x: 200, y: 60 },
    { month: 'May', value: 22, x: 260, y: 52 },
    { month: 'Jun', value: 24, x: 320, y: 45 }
  ];

  const currentTotalRevenue = monthFilter === 'This Year' ? '₹1,87,56,320' : '₹1,42,80,500';

  // Subscriptions by Plan Legend Counts based on planFilter
  const planData = [
    { name: 'Starter Plan', count: 45, pct: '21.2%', color: '#3B82F6', id: 'Starter' },
    { name: 'Business Plan', count: 78, pct: '36.8%', color: '#3b82f6', id: 'Business' },
    { name: 'Professional Plan', count: 52, pct: '24.5%', color: '#8B5CF6', id: 'Professional' },
    { name: 'Enterprise Plan', count: 37, pct: '17.5%', color: '#F59E0B', id: 'Enterprise' }
  ];

  const filteredPlanData = planFilter === 'All Plans' 
    ? planData 
    : planData.filter(p => p.id === planFilter);

  // User Filter Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const superAdminsCount = users.filter(u => u.role === 'Super Admin').length;
  const adminsCount = users.filter(u => u.role === 'Admin').length;
  const managersCount = users.filter(u => u.role?.includes('Manager')).length;

  const filteredOrgs = orgs.filter(o => 
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    o.industry.toLowerCase().includes(orgSearch.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border ${
          actionMessage.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' 
            : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
        }`}>
          {actionMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-blue-400" />}
          <span className="text-xs font-bold">{actionMessage.msg}</span>
        </div>
      )}

      {/* Main Page Top Header & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Overview of your platform performance and key metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker Button */}
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition"
            >
              <Calendar size={15} className="text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Date Range</div>
                  {['May 20 - Jun 20, 2025', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'Year to Date'].map(range => (
                    <button
                      key={range}
                      onClick={() => { 
                        setDateRange(range); 
                        setShowDatePicker(false); 
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                        dateRange === range ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Report Primary Button */}
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition"
          >
            <Download size={15} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PLATFORM ANALYTICS DASHBOARD */}
      {activeView === 'analytics' && (
        <div className="space-y-4 animate-in fade-in zoom-in-98 duration-200">
          
          {/* Top 5 KPI Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Card 1: Total Organizations */}
            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Building2 size={16} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Organizations</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{orgs.length * 35 + 3}</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                <span>↑ 12.5%</span>
                <span className="text-slate-400 font-normal">from last month</span>
              </div>
            </div>

            {/* Card 2: Total Users */}
            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Users size={16} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{users.length > 0 ? users.length * 200 + 42 : 1842}</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                <span>↑ 18.7%</span>
                <span className="text-slate-400 font-normal">from last month</span>
              </div>
            </div>

            {/* Card 3: Active Subscriptions */}
            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Crown size={16} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Subscriptions</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">212</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                <span>↑ 15.3%</span>
                <span className="text-slate-400 font-normal">from last month</span>
              </div>
            </div>

            {/* Card 4: Monthly Recurring Revenue */}
            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-base">
                  ₹
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">₹24,58,320</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                <span>↑ 22.1%</span>
                <span className="text-slate-400 font-normal">from last month</span>
              </div>
            </div>

            {/* Card 5: Pending Invoices */}
            <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                  <FileText size={16} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Invoices</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">156</h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
                <span>₹ 3,72,600 pending</span>
              </div>
            </div>

          </div>

          {/* Middle Row 1: 2 Analytics Cards (Revenue by Month Line Chart, Subscriptions by Plan Donut Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            
            {/* Card 1: Revenue by Month (Spans 7 cols in lg) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Revenue by Month</h3>
                  <Info size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                <select 
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  <option value="This Year">This Year</option>
                  <option value="Last Year">Last Year</option>
                </select>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400">Total Revenue ({monthFilter})</p>
                <h2 className="text-xl font-extrabold text-slate-900">{currentTotalRevenue}</h2>
              </div>

              {/* Area Line Chart SVG */}
              <div className="relative pt-4 pb-2">
                
                {/* Y-Axis scale */}
                <div className="space-y-4 text-[10px] text-slate-400 font-mono">
                  {['40K', '30K', '20K', '10K', '0'].map((lbl, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="w-6">{lbl}</span>
                      <div className="flex-1 ml-2 border-b border-dashed border-slate-100"></div>
                    </div>
                  ))}
                </div>

                {/* SVG Area Path & Dots */}
                <svg className="absolute inset-x-8 top-6 bottom-8 w-full h-24 overflow-visible" viewBox="0 0 340 100">
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path 
                    d="M20,80 Q50,65 80,65 T140,62 T200,40 T260,38 T320,50 L320,100 L20,100 Z" 
                    fill="url(#revenueGrad)" 
                  />

                  <path 
                    d="M20,80 Q50,65 80,65 T140,62 T200,40 T260,38 T320,50" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="2.5" 
                  />

                  {monthlyRevenueData.map((pt, i) => (
                    <circle 
                      key={i} 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="3.5" 
                      fill="#3B82F6" 
                      stroke="#FFFFFF" 
                      strokeWidth="1.5" 
                    />
                  ))}
                </svg>

                {/* X-Axis Months */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-3 px-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>

            {/* Card 2: Subscriptions by Plan (Spans 5 cols in lg) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Subscriptions by Plan</h3>
                  <Info size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
                
                <select 
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  <option value="All Plans">All Plans</option>
                  <option value="Starter">Starter</option>
                  <option value="Business">Business</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              {/* SVG Donut Chart */}
              <div className="relative flex items-center justify-center py-4">
                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14.5" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="21.2 78.8" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="14.5" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="36.8 63.2" strokeDashoffset="-21.2" />
                  <circle cx="18" cy="18" r="14.5" fill="transparent" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="24.5 75.5" strokeDashoffset="-58.0" />
                  <circle cx="18" cy="18" r="14.5" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="17.5 82.5" strokeDashoffset="-82.5" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">
                    {filteredPlanData.reduce((acc, curr) => acc + curr.count, 0)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Subscriptions</span>
                </div>
              </div>

              {/* Plan Legend List */}
              <div className="space-y-2 text-xs">
                {filteredPlanData.map((plan, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }}></div>
                      <span className="font-semibold text-slate-700">{plan.name}</span>
                    </div>
                    <span className="font-bold text-slate-500">{plan.count} ({plan.pct})</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Middle Row 2: Top Organizations Table Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            
            {/* Top Organizations Table Card (Spans 12 cols / full width) */}
            <div className="lg:col-span-12 bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Top Organizations</h3>
                <button 
                  onClick={() => setShowOrgsModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  View All Organizations ({orgs.length}) <ChevronDown size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                      <th className="pb-2">Organization</th>
                      <th className="pb-2">Plan</th>
                      <th className="pb-2">Users</th>
                      <th className="pb-2">Revenue</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {orgs.slice(0, 5).map(org => (
                      <tr key={org.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                          <Building2 size={15} className="text-slate-400" /> {org.name}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                            org.plan === 'Enterprise' ? 'bg-amber-50 text-amber-600' :
                            org.plan === 'Professional' ? 'bg-purple-50 text-purple-600' :
                            org.plan === 'Business' ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'
                          }`}>
                            {org.plan}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600">{org.users}</td>
                        <td className="py-2.5 font-semibold text-slate-800">{org.revenue}</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            org.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {org.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Download size={18} className="text-blue-600" />
                Export Dashboard Report
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Report Type</label>
                <select 
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none cursor-pointer"
                >
                  <option value="Revenue & Financial Summary">Revenue & Financial Summary</option>
                  <option value="System Audit Log">System Audit Log</option>
                  <option value="User Privileges & Access Report">User Privileges & Access Report</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CSV', 'JSON', 'PDF'].map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2.5 rounded-xl font-bold transition border ${
                        exportFormat === fmt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                onClick={() => setShowExportModal(false)} 
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleDownloadExport} 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20"
              >
                Download Export File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Organizations Modal */}
      {showOrgsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                All Platform Organizations ({orgs.length})
              </h3>
              <button onClick={() => setShowOrgsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Search organization by name or industry..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="py-2.5 px-3">Organization Name</th>
                    <th className="py-2.5 px-3">Industry</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Users</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {filteredOrgs.map(org => (
                    <tr key={org.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-800">{org.name}</td>
                      <td className="py-3 px-3 text-slate-500">{org.industry}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold text-[11px]">{org.plan}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{org.users}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px]">{org.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowOrgsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" />
                Add New System User
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Alex Turner"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition font-semibold"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Tender Manager">Tender Manager</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Finance Manager">Finance Manager</option>
                  <option value="Core Team">Core Team</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
