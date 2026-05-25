import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Briefcase, 
  DollarSign, 
  Users2, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  Calendar,
  ClipboardList,
  Receipt,
  CreditCard,
  Wallet,
  PieChart,
  MessageSquare,
  Clock,
  Truck,
  X
} from 'lucide-react';

const menuItems = [
  // Admin
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Dashboard', roles: ['Admin'] },
  { icon: FileText, label: 'Tender Management', activeTab: 'Tender Management', roles: ['Admin'] },
  { icon: Users, label: 'Client Management', activeTab: 'Client Management', roles: ['Admin'] },
  { icon: Briefcase, label: 'Project Management', activeTab: 'Project Management', roles: ['Admin'] },
  { icon: DollarSign, label: 'Finance Management', activeTab: 'Financial Management', roles: ['Admin'] },
  { icon: Users2, label: 'Team Management', activeTab: 'Team Management', roles: ['Admin'] },
  { icon: BarChart3, label: 'Reports', activeTab: 'Reports', roles: ['Admin'] },
  { icon: Settings, label: 'Settings', activeTab: 'Settings', roles: ['Admin'] },

  // Tender Manager
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Tender Dashboard', roles: ['Tender Manager'] },
  { icon: FileText, label: 'Tenders', activeTab: 'Tender Management', roles: ['Tender Manager'] },
  { icon: Briefcase, label: 'Projects', activeTab: 'Projects', roles: ['Tender Manager'] },
  { icon: Users, label: 'Clients', activeTab: 'Client Management', roles: ['Tender Manager'] },
  { icon: BarChart3, label: 'Reports', activeTab: 'Reports', roles: ['Tender Manager'] },
  { icon: Calendar, label: 'Calendar', activeTab: 'Calendar', roles: ['Tender Manager'] },

  // Project Manager
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Dashboard', roles: ['Project Manager'] },
  { icon: Briefcase, label: 'Projects', activeTab: 'Projects', roles: ['Project Manager'] },
  { icon: ClipboardList, label: 'Tasks', activeTab: 'Tasks', roles: ['Project Manager'] },
  { icon: Users2, label: 'Team', activeTab: 'Team Management', roles: ['Project Manager'] },
  { icon: Clock, label: 'Team Attendance', activeTab: 'Team Attendance', roles: ['Project Manager'] },
  { icon: BarChart3, label: 'Reports', activeTab: 'Reports', roles: ['Project Manager'] },

  // Finance Manager
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Financial Management', roles: ['Finance Manager'] },
  { icon: Receipt, label: 'Invoices', activeTab: 'Invoices', roles: ['Finance Manager'] },
  { icon: CreditCard, label: 'Payments', activeTab: 'Payments', roles: ['Finance Manager'] },
  { icon: Wallet, label: 'Expenses', activeTab: 'Expenses', roles: ['Finance Manager'] },
  { icon: Truck, label: 'Challan Management', activeTab: 'Challan Management', roles: ['Finance Manager'] },
  { icon: PieChart, label: 'Budget', activeTab: 'Budget', roles: ['Finance Manager'] },
  { icon: BarChart3, label: 'Reports', activeTab: 'Reports', roles: ['Finance Manager'] },
  { icon: MessageSquare, label: 'Messages', activeTab: 'Messages', roles: ['Admin', 'Tender Manager', 'Project Manager', 'Finance Manager', 'Core Team'] },

  // Team Member
  { icon: LayoutDashboard, label: 'Dashboard', activeTab: 'Member Dashboard', roles: ['Core Team'] },
  { icon: ClipboardList, label: 'My Tasks', activeTab: 'Tasks', roles: ['Core Team'] },
  { icon: Clock, label: 'Attendance', activeTab: 'Attendance', roles: ['Core Team'] },
  { icon: Users2, label: 'My Team', activeTab: 'Team Management', roles: ['Core Team'] },
  { icon: Calendar, label: 'Calendar', activeTab: 'Calendar', roles: ['Core Team'] },
  { icon: MessageSquare, label: 'Messages', activeTab: 'Messages', roles: ['Core Team'] },
];

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, isOpen, setIsOpen, userRole = 'Admin' }) => {
  // Filter menu items by role and remove duplicates for the same role
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={`
      print:hidden bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 ease-in-out
      ${isOpen 
        ? 'translate-x-0 w-[280px] sm:w-64 z-[100] fixed shadow-2xl' 
        : '-translate-x-full w-[280px] sm:w-64 fixed lg:relative lg:translate-x-0 lg:sticky lg:z-40'}
      ${isCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-none' : 'lg:w-64'}
      top-0 left-0
    `}>
      <div className="p-6 flex items-center justify-between gap-3 min-w-[256px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
            TENDERPRO
          </span>
        </div>
        
        {/* Mobile Close Button */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[256px]">
        {filteredMenuItems.map((item, index) => {
          const isActive = activeTab === item.activeTab;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(item.activeTab)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="ml-3 text-sm font-bold truncate animate-in fade-in slide-in-from-left-2 duration-300">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 min-w-[256px]">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-blue-600 rounded-xl transition-all"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          <span className="text-sm font-bold">Collapse Sidebar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
