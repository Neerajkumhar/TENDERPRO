import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Briefcase, 
  DollarSign, 
  Users2, 
  BarChart3, 
  ChevronRight,
  ChevronDown,
  Calendar,
  ClipboardList,
  Receipt,
  CreditCard,
  Wallet,
  PieChart,
  MessageSquare,
  Clock,
  Truck,
  X,
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  Building2,
  RefreshCw,
  Sliders,
  Bell,
  Headphones,
  History,
  Grid,
  LogOut,
  TrendingUp
} from 'lucide-react';

const standardMenuItems = [
  // Super Admin
  { icon: ShieldCheck, label: 'Super Admin Dashboard', activeTab: 'Super Admin Dashboard', roles: ['Super Admin'] },

  // Admin
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Dashboard', roles: ['Admin'] },
  { icon: FileText, label: 'Tender Management', activeTab: 'Tender Management', roles: ['Admin'] },
  { icon: CheckCircle2, label: 'Completed Tenders', activeTab: 'Completed Tenders', roles: ['Admin'] },
  { icon: Users, label: 'Client Management', activeTab: 'Client Management', roles: ['Admin'] },
  { icon: Briefcase, label: 'Project Management', activeTab: 'Project Management', roles: ['Admin'] },
  { icon: DollarSign, label: 'Finance Management', activeTab: 'Financial Management', roles: ['Admin'] },
  { icon: Users2, label: 'Team Management', activeTab: 'Team Management', roles: ['Admin'] },
  { icon: ClipboardCheck, label: 'Approvals', activeTab: 'Approvals', roles: ['Admin'] },

  // Tender Manager
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Tender Dashboard', roles: ['Tender Manager'] },
  { icon: FileText, label: 'Tenders', activeTab: 'Tender Management', roles: ['Tender Manager'] },
  { icon: Briefcase, label: 'Projects', activeTab: 'Projects', roles: ['Tender Manager'] },
  { icon: Users, label: 'Clients', activeTab: 'Client Management', roles: ['Tender Manager'] },
  { icon: Calendar, label: 'Calendar', activeTab: 'Calendar', roles: ['Tender Manager'] },
  { icon: ClipboardCheck, label: 'Approvals', activeTab: 'Approvals', roles: ['Tender Manager'] },

  // Project Manager
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Dashboard', roles: ['Project Manager'] },
  { icon: Briefcase, label: 'Projects', activeTab: 'Projects', roles: ['Project Manager'] },
  { icon: ClipboardList, label: 'Tasks', activeTab: 'Tasks', roles: ['Project Manager'] },
  { icon: Users2, label: 'Team', activeTab: 'Team Management', roles: ['Project Manager'] },
  { icon: Clock, label: 'Team Attendance', activeTab: 'Team Attendance', roles: ['Project Manager'] },
  { icon: ClipboardCheck, label: 'Approvals', activeTab: 'Approvals', roles: ['Project Manager'] },

  // Finance Manager
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Financial Management', roles: ['Finance Manager'] },
  { icon: Receipt, label: 'Invoices', activeTab: 'Invoices', roles: ['Finance Manager'] },
  { icon: CreditCard, label: 'Payments', activeTab: 'Payments', roles: ['Finance Manager'] },
  { icon: Wallet, label: 'Expenses', activeTab: 'Expenses', roles: ['Finance Manager'] },
  { icon: Truck, label: 'Challan Management', activeTab: 'Challan Management', roles: ['Finance Manager'] },
  { icon: PieChart, label: 'Budget', activeTab: 'Budget', roles: ['Finance Manager'] },
  { icon: ClipboardCheck, label: 'Approvals', activeTab: 'Approvals', roles: ['Finance Manager'] },

  // Team Member
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Member Dashboard', roles: ['Core Team'] },
  { icon: ClipboardList, label: 'My Tasks', activeTab: 'Tasks', roles: ['Core Team'] },
  { icon: Clock, label: 'Attendance', activeTab: 'Attendance', roles: ['Core Team'] },
  { icon: Users2, label: 'My Team', activeTab: 'Team Management', roles: ['Core Team'] },
  { icon: Calendar, label: 'Calendar', activeTab: 'Calendar', roles: ['Core Team'] },
];

// Super Admin Navigation Structure from Reference Image
const superAdminMenuGroups = [
  {
    title: '',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Super Admin Dashboard' }
    ]
  },
  {
    title: 'MANAGE',
    items: [
      { icon: Building2, label: 'Organizations', activeTab: 'Organizations' },
      { icon: Users, label: 'Users', activeTab: 'Users' },
      { icon: ShieldCheck, label: 'Roles & Permissions', activeTab: 'Roles & Permissions' }
    ]
  },
  {
    title: 'SUBSCRIPTIONS',
    items: [
      { icon: CreditCard, label: 'Subscription Plans', activeTab: 'Subscription Plans' },
      { icon: RefreshCw, label: 'Subscriptions', activeTab: 'Subscriptions' }
    ]
  },
  {
    title: 'BILLING',
    items: [
      { icon: Wallet, label: 'Payments', activeTab: 'Payments' },
      { icon: FileText, label: 'Invoices', activeTab: 'Invoices' },
      { icon: TrendingUp, label: 'Revenue', activeTab: 'Financial Management' }
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { icon: Grid, label: 'Modules', activeTab: 'Modules' },
      { icon: Sliders, label: 'Settings', activeTab: 'Settings' },
      { icon: Bell, label: 'Notifications', activeTab: 'Notifications' }
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { icon: Headphones, label: 'Support Tickets', activeTab: 'Support Tickets' },
      { icon: History, label: 'Activity Log', activeTab: 'Activity Log' }
    ]
  }
];

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, isOpen, setIsOpen, userRole = 'Admin', user }) => {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/messages/${user.id}/unread`);
        if (response.ok) {
          const data = await response.json();
          const total = Object.values(data).reduce((acc, curr) => acc + curr, 0);
          setTotalUnread(total);
        }
      } catch (err) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const isSuperAdmin = userRole === 'Super Admin' || activeTab === 'Super Admin Dashboard';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (isSuperAdmin) {
    return (
      <aside className={`
        print:hidden bg-[#0A101D] text-slate-300 flex flex-col h-screen transition-all duration-300 ease-in-out border-r border-slate-800/80
        ${isOpen 
          ? 'translate-x-0 w-[280px] sm:w-64 z-[100] fixed shadow-2xl' 
          : '-translate-x-full w-[280px] sm:w-64 fixed lg:relative lg:translate-x-0 lg:sticky lg:z-40'}
        ${isCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-none' : 'lg:w-64'}
        top-0 left-0
      `}>
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-800/60 min-w-[256px]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
              <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-wider block leading-tight">
                TENDER PRO
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block tracking-tight">
                Super Admin Panel
              </span>
            </div>
          </div>
          
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections - Fixed No Scrollbar & Tight Spacing */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-hidden min-w-[256px]">
          {superAdminMenuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              {group.title && (
                <div className="px-3 pt-1 pb-0.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {group.title}
                </div>
              )}
              {group.items.map((item, itemIdx) => {
                const isActive = activeTab === item.activeTab || (item.activeTab === 'Super Admin Dashboard' && activeTab === 'Super Admin Dashboard');
                const IconComponent = item.icon;

                return (
                  <button
                    key={itemIdx}
                    onClick={() => setActiveTab(item.activeTab)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all group ${
                      isActive 
                        ? 'bg-[#1E56F0] text-white shadow-md shadow-blue-600/30 font-bold' 
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent size={15} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>
                    {group.title !== '' && (
                      <ChevronRight size={13} className={`shrink-0 transition-transform ${isActive ? 'text-white/80' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile Card & Logout Footer */}
        <div className="p-2.5 border-t border-slate-800/80 space-y-1.5 bg-[#080D18]">
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-[#1E56F0] text-white font-bold flex items-center justify-center text-[11px] shrink-0 shadow-sm">
                SA
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-white truncate leading-tight">Super Admin</p>
                <p className="text-[9px] text-slate-400 truncate">superadmin@vagwiin.com</p>
              </div>
            </div>
            <ChevronDown size={13} className="text-slate-400 shrink-0 cursor-pointer hover:text-white" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  }

  // Standard Non-Super-Admin Sidebar
  const filteredMenuItems = standardMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={`
      print:hidden bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 ease-in-out
      ${isOpen 
        ? 'translate-x-0 w-[260px] sm:w-56 z-[100] fixed shadow-2xl' 
        : '-translate-x-full w-[260px] sm:w-56 fixed lg:relative lg:translate-x-0 lg:sticky lg:z-40'}
      ${isCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-none' : 'lg:w-56'}
      top-0 left-0
    `}>
      <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-100 min-w-[224px]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
            <div className="w-3.5 h-3.5 border-2 border-white rotate-45"></div>
          </div>
          <span className="font-extrabold text-sm text-slate-800 tracking-wider block">
            TENDERPRO
          </span>
        </div>
        
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 pr-2.5 pl-0 py-3 space-y-0.5 overflow-y-auto custom-scrollbar min-w-[224px]">
        {filteredMenuItems.map((item, index) => {
          const isActive = activeTab === item.activeTab;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(item.activeTab)}
              className={`w-full flex items-center pl-4 pr-2.5 py-2 rounded-r-xl transition-all group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={15} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="ml-2.5 text-[11px] font-extrabold tracking-wide truncate">
                {item.label}
              </span>
              {item.isMessaging && totalUnread > 0 && (
                <span className={`ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white shadow-sm shadow-blue-100 animate-bounce'}`}>
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
};

export default Sidebar;
