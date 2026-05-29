import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Video, 
  Phone, 
  Smile, 
  Paperclip, 
  Mic, 
  Check, 
  CheckCheck,
  Send,
  User,
  Plus,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import * as XLSX from 'xlsx';

const Messages = ({ user, members = [], isPopup, onClose }) => {
  const [activeChat, setActiveChat] = useState(() => localStorage.getItem('activeChat') || null);
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChat', activeChat);
      if (window.innerWidth < 1024) {
        setShowChatList(false);
      }
    }
  }, [activeChat]);

  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentChatMessages, setCurrentChatMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [chatFilter, setChatFilter] = useState('All');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Filter members based on role access
  const teamMembers = members.filter(m => m.id !== user?.id);

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/messages/${user.id}/unread`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId || !user?.id) return;
    try {
      const response = await fetch(`/api/messages/${user.id}/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(msg => ({
          id: msg.id,
          text: msg.text || '',
          attachmentUrl: msg.attachmentUrl,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: msg.senderId === user.id,
          read: msg.read
        }));
        setCurrentChatMessages(formatted);
        setError(null);
      } else {
         const errData = await response.json();
         console.error('Fetch messages error:', errData);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const markAsRead = async (chatId) => {
    if (!chatId || !user?.id) return;
    try {
      await fetch(`/api/messages/${chatId}/${user.id}/read`, { method: 'PUT' });
      fetchUnreadCounts();
    } catch (err) {}
  };

 // Mark active chat as read whenever messages update
  useEffect(() => {
    if (activeChat && currentChatMessages.length > 0) {
      const hasUnread = currentChatMessages.some(m => !m.sent && !m.read);
      if (hasUnread) {
        markAsRead(activeChat);
      }
    }
  }, [currentChatMessages, activeChat]);

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (selectedDocument) {
      if (selectedDocument.match(/\.(txt|csv|json|md|js|jsx|html|css|xml)$/i)) {
        fetch(selectedDocument)
          .then(res => res.text())
          .then(text => {
            setDocumentContent(text);
            setExcelData(null);
          })
          .catch(err => console.error('Error loading text:', err));
      } else if (selectedDocument.match(/\.(xlsx|xls)$/i)) {
        fetch(selectedDocument)
          .then(res => res.arrayBuffer())
          .then(buffer => {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);
            setExcelData(html);
            setDocumentContent(null);
          })
          .catch(err => console.error('Error loading excel:', err));
      } else {
        setDocumentContent(null);
        setExcelData(null);
      }
    } else {
      setDocumentContent(null);
      setExcelData(null);
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      markAsRead(activeChat);
      const interval = setInterval(() => {
        fetchMessages(activeChat);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setCurrentChatMessages([]);
    }
  }, [activeChat, user?.id]);

  const chats = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    lastMsg: '', 
    time: '',
    unread: unreadCounts[m.id] || 0,
    online: Math.random() > 0.5 
  }));

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = chatFilter === 'Unread' ? chat.unread > 0 : true;
    return matchesSearch && matchesFilter;
  });

  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, curr) => acc + curr, 0);

  useEffect(() => {
    if (filteredChats.length > 0 && !activeChat) {
      setActiveChat(filteredChats[0].id);
    }
  }, [filteredChats, activeChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat || !user?.id || isSending) return;

    setIsSending(true);
    const textToSend = message;
    setMessage('');
    setShowEmojiPicker(false);
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: activeChat,
          text: textToSend
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to send message');
      }
      
      fetchMessages(activeChat);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Message failed to send. Please try again.');
      setMessage(textToSend); 
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat || !user?.id || isSending) return;
    
    setIsSending(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) throw new Error('File upload failed');
      
      const uploadData = await uploadRes.json();
      const uploadedUrl = uploadData.url;

      const msgRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: activeChat,
          text: `📎 Attachment: ${file.name}`,
          attachmentUrl: uploadedUrl
        })
      });

      if (!msgRes.ok) throw new Error('Failed to send file information');
      
      fetchMessages(activeChat);
    } catch (err) {
      console.error('Failed to upload/send file:', err);
      setError('File failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const activeChatInfo = chats.find(c => c.id === activeChat);
  const activeChatMember = teamMembers.find(m => m.id === activeChat);

  return (
    <>
      <div className={`flex bg-white overflow-hidden animate-in fade-in duration-300 ${isPopup ? 'fixed inset-0 lg:inset-auto lg:top-[80px] lg:right-[40px] z-[100] lg:w-[850px] xl:w-[1000px] lg:h-[650px] xl:h-[750px] rounded-none lg:rounded-[2.5rem] border-none lg:border lg:border-slate-100 lg:shadow-2xl lg:zoom-in-95 lg:origin-top-right' : 'h-[calc(100vh-64px)] w-full rounded-none lg:rounded-[3rem] lg:m-6 lg:h-[calc(100vh-140px)] lg:w-[calc(100%-3rem)] border-slate-100 lg:border lg:shadow-2xl zoom-in-95'}`}>
      
      {/* Sidebar - Chat List */}
      <div className={`${showChatList ? 'flex' : 'hidden lg:flex'} w-full lg:w-[320px] xl:w-[380px] border-r border-slate-50 flex flex-col bg-slate-50/20`}>
        <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase italic">TEAM MESSAGES</h2>
                {totalUnreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-blue-100 animate-bounce">
                    {totalUnreadCount}
                  </span>
                )}
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-slate-600 transition-all shadow-sm">
                   <MoreVertical size={20} />
                </button>
                {(isPopup || !showChatList) && (
                  <button onClick={isPopup ? onClose : () => setShowChatList(false)} className="lg:hidden p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
                     <Plus className="rotate-45" size={20} />
                  </button>
                )}
             </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search teammates"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-3 sm:py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 sm:px-8 pb-4">
          {['All', 'Unread'].map(f => (
            <button 
              key={f}
              onClick={() => setChatFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chatFilter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-4 pb-8 space-y-1.5 sm:space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center text-slate-400 p-4 text-xs font-bold mt-10">No teammates found.</div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 group relative
                  ${activeChat === chat.id ? 'bg-white shadow-xl shadow-slate-200/50' : 'hover:bg-white/50'}`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                   <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-white shadow-sm overflow-hidden transition-all group-hover:scale-105 font-bold">
                         {chat.name.charAt(0).toUpperCase()}
                      </div>
                      {chat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                         <h4 className={`text-xs sm:text-sm truncate uppercase tracking-tight ${chat.unread > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{chat.name}</h4>
                         <span className="text-[9px] sm:text-[10px] font-black text-slate-300">{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className={`text-[11px] sm:text-xs truncate tracking-tight italic ${chat.unread > 0 ? 'font-black text-blue-600' : 'font-bold text-slate-400'}`}>
                           {chat.lastMsg || (chat.unread > 0 ? `${chat.unread} new messages` : 'Start chatting')}
                         </p>
                         {chat.unread > 0 && (
                           <span className="w-5 h-5 rounded-lg bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-blue-100 animate-in zoom-in duration-300">
                             {chat.unread}
                           </span>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      {activeChatInfo ? (
        <div className={`${!showChatList ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-[#F8F9F3]/40 relative overflow-hidden`}>
          
          {/* Chat Header */}
          <div className="p-4 sm:p-6 bg-white border-b border-slate-50 flex justify-between items-center px-5 sm:px-10 relative z-10">
             <div className="flex items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => setShowChatList(true)}
                  className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronRight className="rotate-180" size={24} />
                </button>
                <div 
                  onClick={() => setShowProfileDetails(!showProfileDetails)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-50 shadow-sm overflow-hidden font-bold text-lg sm:text-xl cursor-pointer hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                   {activeChatInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight leading-none mb-1 sm:mb-1.5">{activeChatInfo.name}</h3>
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${activeChatInfo.online ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${activeChatInfo.online ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {activeChatInfo.online ? 'online' : 'offline'}
                      </span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-1 sm:gap-4">
                <button className="hidden xs:block p-2 sm:p-3.5 hover:bg-slate-50 rounded-xl sm:rounded-2xl text-slate-300 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                   <Video size={20} />
                </button>
                <button className="hidden xs:block p-2 sm:p-3.5 hover:bg-slate-50 rounded-xl sm:rounded-2xl text-slate-300 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                   <Phone size={20} />
                </button>
                <div className="hidden xs:block h-6 sm:h-8 w-[1px] bg-slate-100 mx-1 sm:mx-2"></div>
                <button className="p-2 sm:p-3.5 hover:bg-slate-50 rounded-xl sm:rounded-2xl text-slate-300 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100">
                   <MoreVertical size={20} />
                </button>
                {isPopup && (
                  <button onClick={onClose} className="p-2 sm:p-3.5 hover:bg-rose-50 rounded-xl sm:rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-slate-50 hover:border-rose-100 bg-white shadow-sm ml-1 sm:ml-2">
                     <Plus className="rotate-45" size={20} />
                  </button>
                )}
             </div>
          </div>

          {/* Messages Display Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-5 sm:p-10 space-y-6 sm:space-y-8 bg-[#f5f7fb]/30 relative">
             <div className="flex justify-center mb-6 sm:mb-10">
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                   TODAY
                </span>
             </div>

             {currentChatMessages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] relative group ${msg.sent ? 'items-end' : 'items-start'}`}>
                     <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/20 relative
                       ${msg.sent ? 'bg-[#D9FDD3] rounded-tr-none text-slate-800' : 'bg-white rounded-tl-none text-slate-800'}`}>
                        <p className="text-xs sm:text-sm font-bold leading-relaxed tracking-tight break-words">{msg.text}</p>
                        
                        {msg.attachmentUrl && (
                          <button 
                            onClick={() => setSelectedDocument(msg.attachmentUrl)} 
                            className={`inline-flex items-center gap-2 mt-3 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${msg.sent ? 'bg-white/50 hover:bg-white text-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                          >
                             <Paperclip size={14} /> Open Document
                          </button>
                        )}
                        
                        <div className={`flex items-center gap-2 mt-2 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                           <span className="text-[8px] sm:text-[9px] font-black text-slate-400/80 uppercase">{msg.time}</span>
                           {msg.sent && (
                             <div className="text-blue-500">
                                {msg.read ? <CheckCheck size={12} className="sm:w-3.5 sm:h-3.5" /> : <Check size={12} className="sm:w-3.5 sm:h-3.5" />}
                             </div>
                           )}
                        </div>
                     </div>
                     
                     {/* Small Bubble Tail */}
                     <div className={`absolute top-0 w-3 h-3 sm:w-4 sm:h-4 
                       ${msg.sent ? '-right-1.5 sm:-right-2 bg-[#D9FDD3]' : '-left-1.5 sm:-left-2 bg-white'} 
                       [clip-path:polygon(100%_0,0_0,0_100%)] ${msg.sent ? 'rotate-90' : ''}`}>
                     </div>
                  </div>
               </div>
             ))}

             {error && (
               <div className="flex justify-center">
                 <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold animate-pulse">
                   <AlertTriangle size={14} />
                   {error}
                 </div>
               </div>
             )}
          </div>

          {/* Message Input Area */}
          <div className="p-4 sm:p-8 bg-white border-t border-slate-50 flex items-center gap-3 sm:gap-6 px-5 sm:px-10 relative">
             <div className="flex items-center gap-1 sm:gap-2 relative">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all ${showEmojiPicker ? 'bg-amber-50 text-amber-500' : 'hover:bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                >
                   <Smile size={22} className="sm:w-6 sm:h-6" />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-4 z-50 animate-in fade-in slide-in-from-bottom-2 shadow-2xl rounded-2xl sm:rounded-[2rem] overflow-hidden border border-slate-100">
                    <EmojiPicker 
                      onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject.emoji)}
                      autoFocusSearch={false}
                      skinTonesDisabled
                      searchPlaceHolder="Search emojis..."
                      width={window.innerWidth < 640 ? 280 : 320}
                      height={350}
                    />
                  </div>
                )}

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  className="p-2.5 sm:p-3.5 hover:bg-slate-50 rounded-xl sm:rounded-2xl text-slate-300 hover:text-blue-600 transition-all disabled:opacity-50"
                >
                   <Paperclip size={22} className="sm:w-6 sm:h-6" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
             </div>
             
             <div className="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder={isSending ? "Sending..." : "Type a message"}
                  disabled={isSending}
                  className="w-full pl-5 sm:pl-8 pr-12 sm:pr-14 py-4 sm:py-6 bg-slate-50 border border-transparent rounded-2xl sm:rounded-[2.5rem] text-sm sm:text-base font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 focus:shadow-xl focus:shadow-blue-500/5 transition-all disabled:opacity-70"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-blue-600 text-white rounded-lg sm:rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-90 disabled:bg-slate-300 disabled:shadow-none"
                >
                   <Send size={18} className="sm:w-5 sm:h-5" />
                </button>
             </div>

             <button className="hidden xs:block p-4 sm:p-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 group">
                <Mic size={22} className="sm:w-6.5 sm:h-6.5 group-hover:scale-110 transition-transform" />
             </button>
          </div>

          {/* Profile Details Sidebar */}
          {showProfileDetails && (
            <div className="absolute inset-0 lg:inset-auto lg:top-0 lg:right-0 lg:w-80 h-full bg-white border-l border-slate-100 shadow-2xl z-[60] animate-in slide-in-from-right duration-300 flex flex-col">
               <div className="p-5 sm:p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">Contact Info</h3>
                  <button 
                    onClick={() => setShowProfileDetails(false)} 
                    className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                  >
                     <Plus className="rotate-45" size={20} />
                  </button>
               </div>
               <div className="p-8 flex flex-col items-center border-b border-slate-50">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner font-black text-3xl sm:text-4xl mb-4">
                     {activeChatInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight text-center">{activeChatInfo.name}</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{activeChatMember?.role || 'Team Member'}</p>
               </div>
               <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                  <div>
                     <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                     <p className="text-xs sm:text-sm font-bold text-slate-700 break-words">{activeChatMember?.email || 'Not provided'}</p>
                  </div>
                  <div>
                     <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                     <p className="text-xs sm:text-sm font-bold text-slate-700">{activeChatMember?.phone || 'Not provided'}</p>
                  </div>
                  {activeChatMember?.status && (
                    <div>
                       <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <span className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${activeChatMember.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                         {activeChatMember.status}
                       </span>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#F8F9F3]/40 text-slate-400 relative">
          {isPopup && (
            <button onClick={onClose} className="absolute top-6 right-6 p-3.5 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-slate-50 hover:border-rose-100 bg-white shadow-sm z-10">
               <Plus className="rotate-45" size={20} />
            </button>
          )}
          <User size={64} className="opacity-20 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Select a teammate to start chatting</p>
        </div>
      )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 text-white">
              <h3 className="text-sm font-bold tracking-widest uppercase">Document Viewer</h3>
              <button 
                onClick={() => setSelectedDocument(null)} 
                className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="flex-1 w-full flex items-center justify-center overflow-auto bg-slate-800/50 p-4 md:p-8">
              {selectedDocument.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={selectedDocument} alt="Attachment Document" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
              ) : excelData ? (
                <div className="bg-white w-full h-full p-8 overflow-auto rounded-xl shadow-2xl">
                   <div className="prose max-w-none w-full" dangerouslySetInnerHTML={{ __html: excelData }} />
                </div>
              ) : documentContent !== null ? (
                <div className="bg-white w-full h-full p-8 overflow-auto rounded-xl shadow-2xl text-left">
                  <pre className="text-sm text-slate-800 font-mono whitespace-pre-wrap">{documentContent}</pre>
                </div>
              ) : (
                <iframe src={selectedDocument} className="w-full h-full border-none bg-white rounded-xl shadow-2xl" title="Document Viewer" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pointer Tail for popup - Hidden on mobile/tablet */}
      {isPopup && (
        <div className="hidden lg:block fixed top-[74px] right-[100px] w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 z-[101] animate-in fade-in duration-300 origin-bottom-left"></div>
      )}
    </>
  );
};

export default Messages;
