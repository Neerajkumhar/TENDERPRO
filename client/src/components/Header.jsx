import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, ChevronDown, Command, Menu, LogOut, ShieldCheck, User, MessageSquare } from 'lucide-react';

const Header = ({ onCreateTender, toggleMobileMenu, onProfileClick, user, onLogout, onOpenMessages }) => {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
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
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <header className="print:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[40]">
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
        {['Core Team', 'Project Manager', 'Tender Manager', 'Finance Manager'].includes(user?.role) ? (
          <button 
            onClick={onOpenMessages}
            className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <MessageSquare size={20} />
            {totalUnread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        ) : (
          <button 
            onClick={onCreateTender}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={18} />
            <span className="hidden lg:block">New Tender</span>
            <div className="hidden lg:block w-px h-4 bg-white/20 mx-1"></div>
            <ChevronDown size={14} className="hidden lg:block" />
          </button>
        )}

        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">5</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdownMenu(!showDropdownMenu)}
            className="flex items-center gap-3 p-1 pl-2 hover:bg-slate-50 rounded-lg transition-all group"
            title="Account Menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black line-clamp-1 max-w-[120px]">{user?.role || 'Role'} {user?.department ? `• ${user.department}` : ''}</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-700 font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <ChevronDown size={16} className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ${showDropdownMenu ? 'rotate-180' : ''}`} />
          </button>

          {showDropdownMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdownMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 z-50 animate-in fade-in zoom-in-95 duration-200">
                {/* Profile Link */}
                <button 
                  onClick={() => { onProfileClick(); setShowDropdownMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl transition-all text-left"
                >
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">View Profile Settings</span>
                </button>

                <div className="h-px bg-slate-100 my-6 mx-2"></div>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-500 rounded-2xl transition-all text-left group">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-white transition-all">
                    <LogOut size={16} />
                  </div>
                  <span className="text-sm font-black tracking-tight">Logout Session</span>
                </button>
              </div>
            </>
          )}
        </div>

        {user?.role === 'Admin' && (
          <a 
            href={`http://localhost:5174/?token=${localStorage.getItem('token')}&user=${encodeURIComponent(JSON.stringify(user))}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <ShieldCheck size={14} />
            <span>Admin Panel</span>
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
