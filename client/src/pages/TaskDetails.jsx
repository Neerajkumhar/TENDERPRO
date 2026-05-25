import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Paperclip,
  User,
  MoreVertical,
  Flag,
  ListTodo,
  History,
  Send,
  UploadCloud,
  Trash2,
  Eye,
  Download,
  X,
  ExternalLink
} from 'lucide-react';

const TaskDetails = ({ taskId, onBack, user = {}, members = [] }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const mockTasksFallback = [
    { id: 'm1', title: 'FIX BUGS IN TASK MODULE', desc: 'RESOLVE REPORTED ISSUES', priority: 'HIGH', project: 'WEB APP', deadline: 'Tomorrow', status: 'To Do', pColor: 'text-rose-500' },
    { id: 'm2', title: 'PREPARE MONTHLY REPORT', desc: 'COMPILE AND ANALYZE DATA', priority: 'LOW', project: 'REPORTING', deadline: 'May 20', status: 'To Do', pColor: 'text-emerald-500' },
    { id: 'm3', title: 'DESIGN NEW DASHBOARD LAYOUT', desc: 'CREATE WIREFRAMES AND MOCKUPS', priority: 'HIGH', project: 'WEBSITE REDESIGN', deadline: 'Today', status: 'In Progress', pColor: 'text-rose-500' },
    { id: 'm4', title: 'UPDATE USER DOCUMENTATION', desc: 'ADD NEW FEATURES AND EXAMPLES', priority: 'MEDIUM', project: 'DOCUMENTATION', deadline: 'Today', status: 'In Progress', pColor: 'text-orange-500' },
    { id: 'm5', title: 'REVIEW API INTEGRATION', desc: 'CHECK ENDPOINTS AND RESPONSES', priority: 'MEDIUM', project: 'MOBILE APP', deadline: 'Today', status: 'Review', pColor: 'text-orange-500' },
    { id: 'm6', title: 'UI/UX REVIEW', desc: 'REVIEW NEW USER FLOWS', priority: 'MEDIUM', project: 'WEBSITE REDESIGN', deadline: 'May 17', status: 'Review', pColor: 'text-orange-500' },
    { id: 'm7', title: 'TEAM MEETING', desc: 'WEEKLY SYNC WITH THE TEAM', priority: 'LOW', project: 'GENERAL', deadline: 'Tomorrow', status: 'Completed', pColor: 'text-emerald-500' },
  ];

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        
        const newAttachment = {
          id: 'att-' + Date.now(),
          name: file.name,
          url: data.url,
          uploadedAt: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        };
        
        const updatedAttachments = [...attachments, newAttachment];
        setAttachments(updatedAttachments);
        
        // Save to DB if it's a database task (UUID format)
        if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
          await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attachments: JSON.stringify(updatedAttachments) })
          });
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentDelete = async (attachmentId) => {
    const updatedAttachments = attachments.filter(att => att.id !== attachmentId);
    setAttachments(updatedAttachments);
    
    // Save to DB if it's a database task
    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attachments: JSON.stringify(updatedAttachments) })
        });
      } catch (error) {
        console.error('Failed to delete attachment from server:', error);
      }
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      // Try to find mock tasks first
      if (String(taskId).startsWith('m') || String(taskId).startsWith('sidebar')) {
        const cleanedId = String(taskId).replace('sidebar-', '');
        const foundTask = mockTasksFallback.find(t => String(t.id) === cleanedId);
        if (foundTask) {
          setTask(foundTask);
          setAttachments([
            { id: 'att-1', name: 'Task_Requirements_v2.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '18 May 2024', size: '1.24 MB' },
            { id: 'att-2', name: 'Design_Feedback_Notes.png', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', uploadedAt: '19 May 2024', size: '3.45 MB' }
          ]);
          setLoading(false);
          return;
        }
      }
      
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (response.ok) {
          const data = await response.json();
          setTask(data);
          if (data.attachments) {
            try {
              setAttachments(JSON.parse(data.attachments));
            } catch (e) {
              setAttachments([]);
            }
          } else {
            setAttachments([]);
          }
        }
      } catch (err) {
        console.error('Error fetching task details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (taskId) fetchTask();
  }, [taskId]);

  const updateTaskStatus = async (newStatus) => {
    if (user.role === 'Core Team' && newStatus === 'Completed') {
      alert("Access Denied: Core Team members can submit tasks for 'Review', but only Project Managers can transition them to 'Completed'.");
      return;
    }

    setTask(prev => ({ ...prev, status: newStatus }));

    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Loading Task Details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900">Task Not Found</h2>
        <button onClick={onBack} className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all">Go Back</button>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-rose-50 text-rose-500 border-rose-200';
      case 'MEDIUM': return 'bg-orange-50 text-orange-500 border-orange-200';
      case 'LOW': return 'bg-emerald-50 text-emerald-500 border-emerald-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': 
      case 'Done': return 'bg-emerald-500 text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'Review': 
      case 'In Review': return 'bg-purple-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={onBack}
            className="mt-1 w-10 h-10 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                <Flag size={10} className="inline mr-1" /> {task.priority || 'NORMAL'} PRIORITY
              </span>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className="text-[10px] font-bold text-slate-400">ID: #{String(task.id).substring(0, 8)}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">{task.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {task.status === 'Completed' || task.status === 'Done' ? (
            <button disabled className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm cursor-not-allowed">
              <CheckCircle2 size={16} /> Completed
            </button>
          ) : user.role === 'Project Manager' ? (
            <button 
              onClick={() => updateTaskStatus('Completed')}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} /> Mark Complete
            </button>
          ) : (
            // Core Team / General Members
            task.status === 'Review' || task.status === 'In Review' ? (
              <button disabled className="flex items-center gap-2 px-6 py-2.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm cursor-not-allowed">
                <Clock size={16} /> Submitted for Review
              </button>
            ) : (
              <button 
                onClick={() => updateTaskStatus('Review')}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Clock size={16} /> Submit for Review
              </button>
            )
          )}
          <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Left Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Description Card */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <ListTodo size={16} className="text-blue-500" /> Task Description
            </h3>
            <div className="p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
              <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {task.desc || task.description || 'No detailed description provided for this task.'}
              </p>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Subtasks & Checklist
              </h3>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">1/3 Completed</span>
            </div>
            
            <div className="space-y-3">
              {[
                { text: 'Review initial requirements doc', done: true },
                { text: 'Draft technical specifications', done: false },
                { text: 'Get approval from lead engineer', done: false }
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-transparent group-hover:bg-slate-200'}`}>
                    <CheckCircle2 size={14} />
                  </div>
                  <span className={`text-sm font-bold ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                </label>
              ))}
            </div>
            <button className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline ml-1">+ ADD SUBTASK</button>
          </div>

          {/* Task Attachments Card */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Paperclip size={16} className="text-indigo-500" /> Attachments & Documents
              </h3>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">
                {attachments.length} {attachments.length === 1 ? 'File' : 'Files'}
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative py-8 px-6 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group
                ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <UploadCloud className={`mb-3 transition-transform duration-300 group-hover:scale-110 ${isUploading ? 'animate-bounce text-blue-500' : 'text-slate-400'}`} size={32} />
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider text-center">
                {isUploading ? 'Uploading Document...' : 'Drag & Drop Document or Click to Upload'}
              </p>
              <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Supports PDF, PNG, JPG, JPEG, and Word docs</p>
            </div>

            {/* Attachments List */}
            {attachments.length === 0 ? (
              <div className="text-center py-6 bg-slate-50/30 rounded-2xl border border-dashed border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((att) => (
                  <div 
                    key={att.id} 
                    className="p-4 bg-slate-50/50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-3 bg-white shadow-sm border border-slate-100 text-indigo-500 rounded-2xl flex-shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                        <Paperclip size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-slate-800 truncate pr-2 group-hover:text-blue-600 transition-colors" title={att.name}>{att.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{att.size}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{att.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Doc Preview */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewFile(att); }}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                        title="Preview Document"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Download */}
                      <a 
                        href={att.url} 
                        download={att.name}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all shadow-sm bg-white border border-slate-100 flex items-center justify-center"
                        title="Download Document"
                      >
                        <Download size={14} />
                      </a>

                      {/* Delete */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAttachmentDelete(att.id); }}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments / Activity */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <MessageSquare size={16} className="text-purple-500" /> Comments & Activity
            </h3>
            
            <div className="space-y-6 mb-8">
              {/* Mock Comments */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-800">Sarah Wilson</span>
                    <span className="text-[9px] font-bold text-slate-400">2 HOURS AGO</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">I've started looking into this. The initial requirements are a bit vague, could we clarify step 2?</p>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                 {user?.name ? user.name.charAt(0) : <User size={16} />}
               </div>
               <div className="flex-1 relative">
                 <input 
                   type="text" 
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="Type a comment or update..." 
                   className="w-full pl-6 pr-24 py-4 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-400 shadow-sm"
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-full hover:bg-slate-50">
                     <Paperclip size={18} />
                   </button>
                   <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95">
                     <Send size={16} className="-ml-0.5 mt-0.5" />
                   </button>
                 </div>
               </div>
            </div>
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-orange-500" /> Task Meta
            </h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project / Tender</p>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <ListTodo size={12} />
                  </div>
                  <span className="text-xs font-black text-slate-800">{task.project || 'General Workflow'}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assignee</p>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                    {task.assigneeId ? 'ID' : 'UN'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">{task.assigneeId ? 'Assigned Member' : 'Unassigned'}</p>
                    <p className="text-[9px] font-bold text-slate-400">Engineering</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-rose-600">{task.deadline || 'No Date'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Time</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-800">4 Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Activity Log */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <History size={16} className="text-slate-400" /> History
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-xs font-bold text-slate-600">Task status changed to <span className="text-slate-900 font-black">In Progress</span></p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">YESTERDAY, 4:30 PM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-xs font-bold text-slate-600">Task created by <span className="text-slate-900 font-black">Admin</span></p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">OCT 14, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Full-Screen Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewFile(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
                  <Paperclip size={18} />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight truncate pr-4">{previewFile.name}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Uploaded {previewFile.uploadedAt} • {previewFile.size}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Preview Body */}
            <div className="p-8 max-h-[80vh] overflow-y-auto bg-slate-50/50 flex flex-col justify-center">
              {previewFile.name.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img 
                  src={previewFile.url} 
                  className="max-w-full max-h-[65vh] rounded-2xl object-contain mx-auto shadow-md border border-slate-100 bg-white" 
                  alt={previewFile.name} 
                />
              ) : previewFile.name.match(/\.(pdf)/i) ? (
                <iframe 
                  src={previewFile.url} 
                  className="w-full h-[65vh] rounded-2xl border border-slate-200 shadow-sm bg-white"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
                    <Paperclip size={28} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">No Live Preview Available</h4>
                  <p className="text-xs text-slate-400 font-medium mb-6 px-6">Direct in-browser previews are not supported for this file type. You can download or open it in a new window instead.</p>
                  <div className="flex justify-center gap-3">
                    <a 
                      href={previewFile.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md inline-flex items-center gap-2"
                    >
                      Open in New Tab <ExternalLink size={12} />
                    </a>
                    <a 
                      href={previewFile.url} 
                      download={previewFile.name}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md inline-flex items-center gap-2"
                    >
                      Download File <Download size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
