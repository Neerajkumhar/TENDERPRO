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

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, isOpen, setIsOpen }) => {
  return (
    <aside className={`
      bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 ease-in-out overflow-hidden
      ${isOpen ? 'translate-x-0 w-64 z-[100] fixed shadow-2xl' : '-translate-x-full w-0 lg:w-auto lg:translate-x-0 lg:sticky lg:z-40'}
      ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      top-0 left-0
    `}>
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <div className="w-4 h-4 border-2 border-white rotate-45"></div>
        </div>
        {!isCollapsed && <span className="font-bold text-xl text-slate-800 tracking-tight animate-in fade-in slide-in-from-left-2">TENDERPRO</span>}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(item.label)}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all group relative ${
              activeTab === item.label 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={`shrink-0 ${activeTab === item.label ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2">{item.label}</span>}
            </div>
            {!isCollapsed && item.hasSubmenu && <ChevronRight size={14} className={activeTab === item.label ? 'text-white' : 'text-slate-300'} />}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 uppercase tracking-widest z-[60] whitespace-nowrap">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all hover:shadow-sm border border-transparent hover:border-slate-100 ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span className="text-sm font-bold">Collapse</span>}
        </button>
        
        {!isCollapsed && (
          <div className="mt-6 px-3 animate-in fade-in duration-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">TENDERPRO v1.0.0</p>
            <p className="text-[9px] text-slate-400 mt-1 font-medium italic">© 2024 Enterprise Logic</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
