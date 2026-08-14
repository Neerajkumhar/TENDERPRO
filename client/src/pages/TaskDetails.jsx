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
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);

  const mockTasksFallback = [
    { id: 'm1', title: 'FIX BUGS IN TASK MODULE', desc: 'RESOLVE REPORTED ISSUES', priority: 'HIGH', project: 'WEB APP', deadline: 'Tomorrow', status: 'To Do', pColor: 'text-rose-500' },
    { id: 'm2', title: 'PREPARE MONTHLY REPORT', desc: 'COMPILE AND ANALYZE DATA', priority: 'LOW', project: 'REPORTING', deadline: 'May 20', status: 'To Do', pColor: 'text-blue-500' },
    { id: 'm3', title: 'DESIGN NEW DASHBOARD LAYOUT', desc: 'CREATE WIREFRAMES AND MOCKUPS', priority: 'HIGH', project: 'WEBSITE REDESIGN', deadline: 'Today', status: 'In Progress', pColor: 'text-rose-500' },
    { id: 'm4', title: 'UPDATE USER DOCUMENTATION', desc: 'ADD NEW FEATURES AND EXAMPLES', priority: 'MEDIUM', project: 'DOCUMENTATION', deadline: 'Today', status: 'In Progress', pColor: 'text-orange-500' },
    { id: 'm5', title: 'REVIEW API INTEGRATION', desc: 'CHECK ENDPOINTS AND RESPONSES', priority: 'MEDIUM', project: 'MOBILE APP', deadline: 'Today', status: 'Review', pColor: 'text-orange-500' },
    { id: 'm6', title: 'UI/UX REVIEW', desc: 'REVIEW NEW USER FLOWS', priority: 'MEDIUM', project: 'WEBSITE REDESIGN', deadline: 'May 17', status: 'Review', pColor: 'text-orange-500' },
    { id: 'm7', title: 'TEAM MEETING', desc: 'WEEKLY SYNC WITH THE TEAM', priority: 'LOW', project: 'GENERAL', deadline: 'Tomorrow', status: 'Completed', pColor: 'text-blue-500' },
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

  const toggleSubtask = async (subtaskId) => {
    const updatedSubtasks = subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, done: !sub.done };
      }
      return sub;
    });
    setSubtasks(updatedSubtasks);

    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtasks: JSON.stringify(updatedSubtasks) })
        });
      } catch (error) {
        console.error('Failed to update subtasks on server:', error);
      }
    }
  };

  const handleAddSubtask = async (e) => {
    if (e) e.preventDefault();
    if (!newSubtaskText.trim()) return;

    const newSub = {
      id: 'sub-' + Date.now(),
      text: newSubtaskText.trim(),
      done: false
    };

    const updatedSubtasks = [...subtasks, newSub];
    setSubtasks(updatedSubtasks);
    setNewSubtaskText('');
    setShowAddSubtaskInput(false);

    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtasks: JSON.stringify(updatedSubtasks) })
        });
      } catch (error) {
        console.error('Failed to add subtask on server:', error);
      }
    }
  };

  const deleteSubtask = async (subtaskId) => {
    const updatedSubtasks = subtasks.filter(sub => sub.id !== subtaskId);
    setSubtasks(updatedSubtasks);

    if (!String(taskId).startsWith('m') && !String(taskId).startsWith('sidebar')) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtasks: JSON.stringify(updatedSubtasks) })
        });
      } catch (error) {
        console.error('Failed to delete subtask on server:', error);
      }
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      if (String(taskId).startsWith('m') || String(taskId).startsWith('sidebar')) {
        const cleanedId = String(taskId).replace('sidebar-', '');
        const foundTask = mockTasksFallback.find(t => String(t.id) === cleanedId);
        if (foundTask) {
          setTask(foundTask);
          setAttachments([
            { id: 'att-1', name: 'Task_Requirements_v2.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '18 May 2024', size: '1.24 MB' },
            { id: 'att-2', name: 'Design_Feedback_Notes.png', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', uploadedAt: '19 May 2024', size: '3.45 MB' }
          ]);
          setSubtasks([
            { id: 'sub-1', text: 'Review initial requirements doc', done: true },
            { id: 'sub-2', text: 'Draft technical specifications', done: false },
            { id: 'sub-3', text: 'Get approval from lead engineer', done: false }
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

          if (data.subtasks) {
            try {
              setSubtasks(JSON.parse(data.subtasks));
            } catch (e) {
              setSubtasks([]);
            }
          } else {
            setSubtasks([]);
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
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Loading Task Details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
          <AlertCircle size={20} />
        </div>
        <h2 className="text-sm font-bold text-slate-900">Task Not Found</h2>
        <button onClick={onBack} className="mt-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all">Go Back</button>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'LOW': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': 
      case 'Done': return 'bg-blue-600 text-white';
      case 'In Progress': return 'bg-amber-500 text-white';
      case 'Review': 
      case 'In Review': return 'bg-indigo-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const assignee = task?.assigneeId ? members.find(m => String(m.id) === String(task.assigneeId)) : null;

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="flex items-start gap-2.5">
          <button 
            onClick={onBack}
            className="mt-0.5 w-7 h-7 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg flex items-center justify-center shadow-2xs border border-slate-200 transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                <Flag size={8} className="inline mr-0.5" /> {task.priority || 'NORMAL'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className="text-[8.5px] font-semibold text-slate-400">#{String(task.id).substring(0, 8)}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug uppercase">{task.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.status === 'Completed' || task.status === 'Done' ? (
            <button disabled className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-not-allowed">
              <CheckCircle2 size={12} /> Completed
            </button>
          ) : user.role === 'Project Manager' ? (
            <button 
              onClick={() => updateTaskStatus('Completed')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 size={12} /> Mark Complete
            </button>
          ) : (
            task.status === 'Review' || task.status === 'In Review' ? (
              <button disabled className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-not-allowed">
                <Clock size={12} /> Under Review
              </button>
            ) : (
              <button 
                onClick={() => updateTaskStatus('Review')}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Clock size={12} /> Submit Review
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Main Left Content */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Description Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo size={12} className="text-blue-500" /> Task Description
            </h3>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {task.desc || task.description || 'No detailed description provided for this task.'}
              </p>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-blue-500" /> Subtasks & Checklist
              </h3>
              <span className="text-[8px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                {subtasks.length > 0 ? `${subtasks.filter(s => s.done).length}/${subtasks.length} Completed` : '0 Subtasks'}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {subtasks.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-all group">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={item.done}
                      onChange={() => toggleSubtask(item.id)}
                    />
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 ${item.done ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300'}`}>
                      {item.done && <CheckCircle2 size={11} />}
                    </div>
                    <span className={`text-xs font-medium truncate ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(item.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Subtask"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              
              {subtasks.length === 0 && !showAddSubtaskInput && (
                <div className="text-center py-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">No subtasks created yet</p>
                </div>
              )}
            </div>
            
            {showAddSubtaskInput ? (
              <form onSubmit={handleAddSubtask} className="pt-1 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Enter new subtask..."
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  autoFocus
                />
                <button type="submit" className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase hover:bg-blue-700 transition-all shadow-2xs">
                  Save
                </button>
                <button type="button" onClick={() => { setShowAddSubtaskInput(false); setNewSubtaskText(''); }} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9.5px] font-bold uppercase hover:bg-slate-200 transition-all">
                  Cancel
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddSubtaskInput(true)} 
                className="text-[9px] font-bold text-blue-600 uppercase tracking-wider hover:underline block pt-1"
              >
                + Add Subtask
              </button>
            )}
          </div>

          {/* Task Attachments Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={12} className="text-indigo-500" /> Attachments & Documents
              </h3>
              <span className="text-[8px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
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
              className={`py-3 px-3 rounded-lg border border-dashed transition-all flex flex-col items-center justify-center cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <UploadCloud className={`mb-1 ${isUploading ? 'animate-bounce text-blue-500' : 'text-slate-400'}`} size={18} />
              <p className="text-[10px] font-bold text-slate-700 uppercase">
                {isUploading ? 'Uploading...' : 'Drop File or Click to Upload'}
              </p>
              <p className="text-[7.5px] text-slate-400 uppercase">Supports PDF, PNG, JPG, DOC</p>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {attachments.map((att) => (
                  <div 
                    key={att.id} 
                    className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between group hover:bg-white hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-white shadow-2xs border border-slate-100 text-indigo-500 rounded shrink-0">
                        <Paperclip size={12} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10.5px] font-bold text-slate-800 truncate" title={att.name}>{att.name}</p>
                        <div className="flex items-center gap-1.5 text-[7.5px] font-semibold text-slate-400 uppercase">
                          <span>{att.size}</span>
                          <span>•</span>
                          <span>{att.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewFile(att); }}
                        className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded"
                        title="Preview"
                      >
                        <Eye size={11} />
                      </button>
                      <a 
                        href={att.url} 
                        download={att.name}
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded flex items-center justify-center"
                        title="Download"
                      >
                        <Download size={11} />
                      </a>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAttachmentDelete(att.id); }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments & Activity */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={12} className="text-purple-500" /> Comments & Activity
            </h3>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 text-[10px] font-bold">
                  <User size={12} />
                </div>
                <div className="flex-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10.5px] font-bold text-slate-800">Team Member</span>
                    <span className="text-[8px] font-semibold text-slate-400">2h ago</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 font-medium">Started review on this task delivery.</p>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 text-[10px] font-bold">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type an update..." 
                  className="w-full pl-3 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-2xs">
                  <Send size={10} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={12} className="text-amber-500" /> Task Details
            </h3>
            
            <div className="space-y-2">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Project / Tender</span>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <ListTodo size={12} className="text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">{task.project || 'General Workflow'}</span>
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Assignee</span>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                    {assignee ? assignee.name.charAt(0) : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {assignee ? assignee.name : 'Unassigned'}
                    </p>
                    <p className="text-[7.5px] text-slate-400 uppercase truncate">{assignee ? assignee.role : 'Core Team'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Due Date</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} className="text-slate-400" />
                    <span className="text-xs font-bold text-rose-600">{task.deadline || 'No Due Date'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Priority</span>
                  <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase inline-block ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History size={12} className="text-slate-400" /> History
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2 text-xs">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <p className="text-[10.5px] font-medium text-slate-700">Status updated to <span className="font-bold text-slate-900">{task.status}</span></p>
                  <p className="text-[7.5px] text-slate-400 uppercase">Recent Update</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip size={13} className="text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate pr-2">{previewFile.name}</span>
              </div>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Preview Body */}
            <div className="p-3 max-h-[70vh] overflow-y-auto flex flex-col items-center justify-center bg-slate-50/20">
              {previewFile.name.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img 
                  src={previewFile.url} 
                  className="max-w-full max-h-[55vh] rounded-lg object-contain border border-slate-200 shadow-2xs" 
                  alt={previewFile.name} 
                />
              ) : previewFile.name.match(/\.(pdf)/i) ? (
                <iframe 
                  src={previewFile.url} 
                  className="w-full h-[55vh] rounded-lg border border-slate-200 shadow-2xs bg-white"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Paperclip size={24} className="mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-800">Preview not supported for this file format</p>
                  <a 
                    href={previewFile.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase inline-flex items-center gap-1 shadow-2xs"
                  >
                    Open Document <ExternalLink size={10} />
                  </a>
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
