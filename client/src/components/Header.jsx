import React from 'react';
import { Search, Bell, Plus, ChevronDown, Command, Menu } from 'lucide-react';

const Header = ({ onCreateTender, toggleMobileMenu }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[40]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 lg:hidden text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>

        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search tenders, clients, projects..." 
              className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onCreateTender}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={18} />
          <span className="hidden lg:block">New Tender</span>
          <div className="hidden lg:block w-px h-4 bg-white/20 mx-1"></div>
          <ChevronDown size={14} className="hidden lg:block" />
        </button>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">5</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <button className="flex items-center gap-3 p-1 pl-2 hover:bg-slate-50 rounded-lg transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">John Smith</p>
            <p className="text-[11px] text-slate-500">Admin</p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Header;
