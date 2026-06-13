import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, ChevronDown, Command, Menu, LogOut, ShieldCheck, User, MessageSquare } from 'lucide-react';

const Header = ({ onCreateTender, toggleMobileMenu, onProfileClick, user, onLogout, onOpenMessages, onNotificationClick }) => {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalSentUnread, setTotalSentUnread] = useState(0);
  const [lastTotalUnread, setLastTotalUnread] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user?.id) return;
      try {
        // Fetch received unread
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

        // Fetch sent unread
        const resSent = await fetch('/api/messages/' + user.id + '/sent-unread');
        if (resSent.ok) {
          const data = await resSent.json();
          const sentTotalValue = Object.values(data).reduce((acc, curr) => acc + curr, 0);
          setTotalSentUnread(sentTotalValue);
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
        const res = await fetch(`/api/notifications/${user.id}?panel=client`);
        if (res.ok) {
          const data = await res.json();
          // Filter out read notifications so they don't reappear on refresh
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
      // Remove the notification entirely from the list once clicked
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

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const displayTotal = totalUnread;

  return (
    <header className="print:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[40]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {['Core Team', 'Project Manager', 'Tender Manager', 'Finance Manager'].includes(user?.role) ? (
          <button 
            onClick={onOpenMessages}
            className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <MessageSquare size={20} />
            {displayTotal > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce ${totalUnread > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {displayTotal > 99 ? '99+' : displayTotal}
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

        <div className="relative">
          <button 
            onClick={() => { setShowNotificationsDropdown(!showNotificationsDropdown); setShowDropdownMenu(false); }}
            className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotificationsDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)}></div>
              <div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-auto mt-2 w-auto sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[80vh] sm:max-h-none flex flex-col">
                <div className="px-3 py-2 sm:px-4 sm:py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{unreadNotificationsCount} new</span>
                    )}
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
                    <div className="p-3 sm:p-4 text-center text-sm text-slate-500">No notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markNotificationAsRead(notif)}
                        className={`px-3 py-2 sm:px-4 sm:py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                      >
                        <p className="text-sm text-slate-700 font-medium mb-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-400 font-mono">
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

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdownMenu(!showDropdownMenu)}
            className="flex items-center gap-3 p-1 pl-2 hover:bg-slate-50 rounded-lg transition-all group"
            title="Account Menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black line-clamp-1 max-w-[120px]">
                {user?.role || 'Role'} {user?.department ? ' • ' + user.department : ''}
              </p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-700 font-bold">
                {(user?.name ? user.name[0] : 'U')}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <ChevronDown size={16} className={'text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ' + (showDropdownMenu ? 'rotate-180' : '')} />
          </button>

          {showDropdownMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdownMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 z-50 animate-in fade-in zoom-in-95 duration-200">
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
            href={(import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174') + '/?token=' + localStorage.getItem('token') + '&user=' + encodeURIComponent(JSON.stringify(user))} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <ShieldCheck size={14} />
            <span>Admin Panel</span>
          </a>
        )}
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
