import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, ChevronDown, Command, Menu, LogOut, User, MessageSquare, Sun, Moon } from 'lucide-react';

const Header = ({ onCreateTender, toggleMobileMenu, onProfileClick, user, onLogout, onOpenMessages, onNotificationClick, onSimulateTrialExpiry, isSubscriptionActive, isTrialExpired }) => {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalSentUnread, setTotalSentUnread] = useState(0);
  const [lastTotalUnread, setLastTotalUnread] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user?.id) return;
      try {
        const resReceived = await fetch('/api/messages/' + user.id + '/unread');
        let receivedTotal = 0;
        if (resReceived.ok) {
          const data = await resReceived.json();
          receivedTotal = Object.values(data).reduce((acc, curr) => acc + curr, 0);
          
          if (receivedTotal > lastTotalUnread && lastTotalUnread !== 0) {
            setToastMessage('You have ' + (receivedTotal - lastTotalUnread) + ' new message(s)');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }
          
          setTotalUnread(receivedTotal);
          setLastTotalUnread(receivedTotal);
        }

        const resSent = await fetch('/api/messages/' + user.id + '/sent-unread');
        if (resSent.ok) {
          const data = await resSent.json();
          const sentTotal = Object.values(data).reduce((acc, curr) => acc + curr, 0);
          setTotalSentUnread(sentTotal);
        }

        if (receivedTotal > 0) {
          document.title = '(' + receivedTotal + ') Messages - TenderPro';
        } else {
          document.title = 'TenderPro';
        }
      } catch (err) {
        console.error('Error fetching unread counts in header:', err);
      }
    };
    
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/notifications/${user.id}?panel=admin`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.filter(n => !n.isRead));
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchUnread();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchUnread();
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id, lastTotalUnread]);

  const markNotificationAsRead = async (notif) => {
    try {
      await fetch(`/api/notifications/${notif.id}/read`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      
      let redirectUrl = notif.actionUrl;
      
      if (!redirectUrl && notif.type) {
        if (notif.type.includes('LEAVE') || notif.type.includes('TENDER_COMPLETION_SUBMITTED')) redirectUrl = 'Approvals';
        else if (notif.type.includes('TENDER_ASSIGNED')) redirectUrl = 'Project Management';
        else if (notif.type.includes('TENDER')) redirectUrl = 'Tender Management';
        else if (notif.type.includes('TASK')) redirectUrl = 'Tasks';
        else if (notif.type.includes('INVOICE') || notif.type.includes('EXPENSE')) redirectUrl = 'Financial Management';
        else if (notif.type.includes('CLIENT')) redirectUrl = 'Client Management';
        else if (notif.type.includes('CHALLAN')) redirectUrl = 'Challan Management';
      }

      if (redirectUrl && onNotificationClick) {
        onNotificationClick(redirectUrl);
        setShowNotificationsDropdown(false);
      }
    } catch (error) {
      console.error('Error marking notification read', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications', error);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length || 6;
  const displayTotal = totalUnread;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-[40]">
      {/* Left side: Hamburger menu & Global Search input with shortcut badge */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          title="Toggle Menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-200/70 border border-slate-300/50 rounded text-[10px] font-mono text-slate-500">
            Ctrl + /
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* New Tender Action Button */}
        {user?.role !== 'Super Admin' && (
          <button 
            onClick={onCreateTender}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={16} />
            <span className="hidden lg:block">New Tender</span>
            <div className="hidden lg:block w-px h-4 bg-white/20 mx-1"></div>
            <ChevronDown size={14} className="hidden lg:block" />
          </button>
        )}

        {/* Theme Toggle Button */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          title="Toggle Theme"
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Messages Button */}
        <button 
          onClick={onOpenMessages}
          className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          title="Messages"
        >
          <MessageSquare size={18} />
          {displayTotal > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce ${totalUnread > 0 ? 'bg-blue-500' : 'bg-amber-500'}`}>
              {displayTotal > 99 ? '99+' : displayTotal}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Button */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotificationsDropdown(!showNotificationsDropdown); setShowDropdownMenu(false); }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full border border-white shadow-xs">
              {unreadNotificationsCount}
            </span>
          </button>

          {showNotificationsDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)}></div>
              <div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-auto mt-2 w-auto sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[80vh] sm:max-h-none flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{unreadNotificationsCount} new</span>
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-[60vh] sm:max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markNotificationAsRead(notif)}
                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                      >
                        <p className="text-xs text-slate-700 font-medium mb-1 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Account Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdownMenu(!showDropdownMenu)}
            className="flex items-center gap-3 p-1 hover:bg-slate-100 rounded-xl transition-all group"
            title="Account Menu"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {(user?.name ? user.name[0] : 'S')}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {user?.role || 'Super Admin'}
              </p>
            </div>
            <ChevronDown size={14} className={'text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ' + (showDropdownMenu ? 'rotate-180' : '')} />
          </button>

          {showDropdownMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdownMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200 space-y-1">
                <button 
                  onClick={() => { onProfileClick(); setShowDropdownMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-left text-xs font-bold text-slate-700"
                >
                  <User size={16} className="text-blue-600" />
                  <span>Profile Settings</span>
                </button>

                <div className="h-px bg-slate-100 my-2"></div>
                
                <button 
                  onClick={onLogout} 
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-all text-left text-xs font-bold"
                >
                  <LogOut size={16} />
                  <span>Logout Session</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed top-20 right-8 z-[100] animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-xl bg-opacity-95">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">New Message</p>
                <p className="text-sm font-bold tracking-tight">{toastMessage}</p>
             </div>
             <button onClick={() => setShowToast(false)} className="ml-4 p-1 hover:bg-white/10 rounded-lg transition-all">
                <Plus className="rotate-45" size={18} />
             </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
