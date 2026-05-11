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
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Tender Management', hasSubmenu: true },
  { icon: Users, label: 'Client Management' },
  { icon: Briefcase, label: 'Project Management' },
  { icon: DollarSign, label: 'Financial Management' },
  { icon: Users2, label: 'Team Management' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rotate-45"></div>
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">TENDERPRO</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(item.label)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              activeTab === item.label 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
            {item.hasSubmenu && <ChevronRight size={16} className="text-slate-400" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <ChevronLeft size={20} />
          <span>Collapse</span>
        </button>
        
        <div className="mt-4 px-3">
          <p className="text-xs font-semibold text-slate-400">TENDERPRO v1.0.0</p>
          <p className="text-[10px] text-slate-400">© 2024 All rights reserved</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
