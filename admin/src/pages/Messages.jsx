import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import * as XLSX from 'xlsx';

const Messages = ({ user, members = [], isPopup, onClose }) => {
  const [activeChat, setActiveChat] = useState(() => localStorage.getItem('activeChat') || null);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChat', activeChat);
    }
  }, [activeChat]);
  const [message, setMessage] = useState('');
  const [currentChatMessages, setCurrentChatMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [chatFilter, setChatFilter] = useState('All');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const fileInputRef = React.useRef(null);

  // Filter members based on role access
  const teamMembers = members.filter(m => {
    if (m.id === user?.id) return false;
    
    // Admins can message all Managers and other Admins
    if (user?.role === 'Admin' || user?.role === 'Super Admin') {
      return ['Project Manager', 'Finance Manager', 'Tender Manager', 'Admin', 'Super Admin'].includes(m.role);
    }
    
    // Managers can message Admins + their department peers
    if (['Project Manager', 'Finance Manager', 'Tender Manager'].includes(user?.role)) {
      return m.departmentId === user?.departmentId || m.role === 'Admin' || m.role === 'Super Admin';
    }
    
    // Core Team members can only message their department peers
    return m.departmentId === user?.departmentId;
  });

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

  // Polling for unread counts
  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch text/excel document contents when selected
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

  // Polling for active chat messages
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

  // Initialize chats based on team members
  const chats = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    lastMsg: '', 
    time: '',
    unread: unreadCounts[m.id] || 0,
    online: Math.random() > 0.5 // Mock online status
  }));

  const filteredChats = chats.filter(chat => {
    if (chatFilter === 'Unread') return chat.unread > 0;
    return true;
  });

  // Set the first chat as active by default if none is selected
  useEffect(() => {
    if (filteredChats.length > 0 && !activeChat) {
      setActiveChat(filteredChats[0].id);
    }
  }, [filteredChats, activeChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat || !user?.id) return;

    const tempMessage = {
      id: Date.now(),
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      read: false
    };
    setCurrentChatMessages(prev => [...prev, tempMessage]);
    
    const textToSend = message;
    setMessage('');
    setShowEmojiPicker(false);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: activeChat,
          text: textToSend
        })
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat || !user?.id) return;
    
    // First, upload to the server
    const formData = new FormData();
    formData.append('file', file);
    
    let uploadedUrl = null;
    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
      return;
    }

    const textToSend = `📎 Attachment: ${file.name}`;
    const tempMessage = {
      id: Date.now(),
      text: textToSend,
      attachmentUrl: uploadedUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      read: false
    };
    setCurrentChatMessages(prev => [...prev, tempMessage]);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: activeChat,
          text: textToSend,
          attachmentUrl: uploadedUrl
        })
      });
    } catch (err) {
      console.error('Failed to send file message:', err);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
  };


  const activeChatInfo = chats.find(c => c.id === activeChat);
  const activeChatMember = teamMembers.find(m => m.id === activeChat);

  return (
    <>
      <div className={`flex bg-white overflow-hidden animate-in fade-in duration-300 ${isPopup ? 'fixed top-[80px] right-[80px] z-[100] w-[1000px] h-[700px] rounded-3xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] zoom-in-95 origin-top-right' : 'h-[calc(100vh-140px)] rounded-[3rem] border border-slate-100 shadow-2xl zoom-in-95'}`}>
      
      {/* Sidebar - Chat List */}
      <div className="w-[380px] border-r border-slate-50 flex flex-col bg-slate-50/20">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">TEAM MESSAGES</h2>
             <button className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-slate-600 transition-all shadow-sm">
                <MoreVertical size={20} />
             </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search teammates"
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 px-8 pb-4">
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

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center text-slate-400 p-4 text-xs font-bold mt-10">No teammates found.</div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 group relative
                  ${activeChat === chat.id ? 'bg-white shadow-xl shadow-slate-200/50' : 'hover:bg-white/50'}`}
              >
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-white shadow-sm overflow-hidden transition-all group-hover:scale-105">
                         {chat.name.charAt(0).toUpperCase()}
                      </div>
                      {chat.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{chat.name}</h4>
                         <span className="text-[10px] font-black text-slate-300">{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-bold text-slate-400 truncate tracking-tight italic">
                           {chat.lastMsg || (chat.unread > 0 ? 'New message' : 'Start chatting')}
                         </p>
                         {chat.unread > 0 && (
                           <span className="w-5 h-5 rounded-lg bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-emerald-100">
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
        <div className="flex-1 flex flex-col bg-[#F8F9F3]/40 relative overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-6 bg-white border-b border-slate-50 flex justify-between items-center px-10 relative z-10">
             <div className="flex items-center gap-4">
                <div 
                  onClick={() => setShowProfileDetails(!showProfileDetails)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-50 shadow-sm overflow-hidden font-bold text-xl cursor-pointer hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                   {activeChatInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{activeChatInfo.name}</h3>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${activeChatInfo.online ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activeChatInfo.online ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {activeChatInfo.online ? 'online' : 'offline'}
                      </span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button className="p-3.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                   <Video size={20} />
                </button>
                <button className="p-3.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                   <Phone size={20} />
                </button>
                <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                <button className="p-3.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100">
                   <MoreVertical size={20} />
                </button>
                {isPopup && (
                  <button onClick={onClose} className="p-3.5 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all border border-slate-50 hover:border-rose-100 bg-white shadow-sm ml-2">
                     <Plus className="rotate-45" size={20} />
                  </button>
                )}
             </div>
          </div>

          {/* Messages Display Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-10 space-y-8 bg-[#f5f7fb]/30 relative">
             <div className="flex justify-center mb-10">
                <span className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                   TODAY
                </span>
             </div>

             {currentChatMessages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  <div className={`max-w-[70%] relative group ${msg.sent ? 'items-end' : 'items-start'}`}>
                     <div className={`p-6 rounded-3xl shadow-xl shadow-slate-200/20 relative
                       ${msg.sent ? 'bg-[#D9FDD3] rounded-tr-none text-slate-800' : 'bg-white rounded-tl-none text-slate-800'}`}>
                        <p className="text-sm font-bold leading-relaxed tracking-tight break-words">{msg.text}</p>
                        
                        {msg.attachmentUrl && (
                          <button 
                            onClick={() => setSelectedDocument(msg.attachmentUrl)} 
                            className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${msg.sent ? 'bg-white/50 hover:bg-white text-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                          >
                             <Paperclip size={14} /> Open Document
                          </button>
                        )}
                        
                        <div className={`flex items-center gap-2 mt-2 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                           <span className="text-[9px] font-black text-slate-400/80 uppercase">{msg.time}</span>
                           {msg.sent && (
                             <div className="text-blue-500">
                                {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                             </div>
                           )}
                        </div>
                     </div>
                     
                     {/* Small Bubble Tail */}
                     <div className={`absolute top-0 w-4 h-4 
                       ${msg.sent ? '-right-2 bg-[#D9FDD3]' : '-left-2 bg-white'} 
                       [clip-path:polygon(100%_0,0_0,0_100%)] ${msg.sent ? 'rotate-90' : ''}`}>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {/* Message Input Area */}
          <div className="p-8 bg-white border-t border-slate-50 flex items-center gap-6 px-10 relative">
             <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-3.5 rounded-2xl transition-all ${showEmojiPicker ? 'bg-amber-50 text-amber-500' : 'hover:bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                >
                   <Smile size={24} />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-4 z-50 animate-in fade-in slide-in-from-bottom-2 shadow-2xl rounded-[2rem] overflow-hidden border border-slate-100">
                    <EmojiPicker 
                      onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject.emoji)}
                      autoFocusSearch={false}
                      skinTonesDisabled
                      searchPlaceHolder="Search emojis..."
                      width={320}
                      height={400}
                    />
                  </div>
                )}

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-blue-600 transition-all"
                >
                   <Paperclip size={24} />
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
                  placeholder="Type a message"
                  className="w-full pl-8 pr-14 py-6 bg-slate-50 border border-transparent rounded-[2.5rem] text-base font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 focus:shadow-xl focus:shadow-blue-500/5 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-90"
                >
                   <Send size={20} />
                </button>
             </div>

             <button className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 group">
                <Mic size={26} className="group-hover:scale-110 transition-transform" />
             </button>
          </div>

          {/* Profile Details Sidebar */}
          {showProfileDetails && (
            <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-slate-100 shadow-2xl z-30 animate-in slide-in-from-right duration-300 flex flex-col">
               <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">Contact Info</h3>
                  <button 
                    onClick={() => setShowProfileDetails(false)} 
                    className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                  >
                     <Plus className="rotate-45" size={20} />
                  </button>
               </div>
               <div className="p-8 flex flex-col items-center border-b border-slate-50">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner font-black text-4xl mb-4">
                     {activeChatInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">{activeChatInfo.name}</h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{activeChatMember?.role || 'Team Member'}</p>
               </div>
               <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                     <p className="text-sm font-bold text-slate-700 break-words">{activeChatMember?.email || 'Not provided'}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                     <p className="text-sm font-bold text-slate-700">{activeChatMember?.phone || 'Not provided'}</p>
                  </div>
                  {activeChatMember?.status && (
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeChatMember.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                         {activeChatMember.status}
                       </span>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9F3]/40 text-slate-400 relative">
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

      {/* Pointer Tail for popup */}
      {isPopup && (
        <div className="fixed top-[74px] right-[100px] w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 z-[101] animate-in fade-in duration-300 origin-bottom-left"></div>
      )}
    </>
  );
};

export default Messages;
