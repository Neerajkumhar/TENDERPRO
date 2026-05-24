import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Briefcase, 
  User, 
  MessageSquare,
  FileText,
  Save,
  Edit3,
  X
} from 'lucide-react';

const AssignmentDetails = ({ assignmentId, onBack, tenders, departments, members, fetchAssignments }) => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    tenderId: '',
    departmentId: '',
    assigneeId: '',
    description: '',
    priority: 'Medium',
    deadline: ''
  });

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data);
        setEditData({
          tenderId: data.tenderId,
          departmentId: data.departmentId,
          assigneeId: data.assigneeId || '',
          description: data.description,
          priority: data.priority,
          deadline: data.deadline ? data.deadline.split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) fetchAssignment();
  }, [assignmentId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchAssignment();
        if (fetchAssignments) fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (response.ok) {
        setShowEditModal(false);
        fetchAssignment();
        if (fetchAssignments) fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Assignment Details...</div>;
  if (!assignment) return <div className="p-8 text-center">Assignment not found.</div>;

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          <span>Back to Management</span>
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <Edit3 size={14} />
            Edit Task
          </button>
          {['Pending', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              disabled={updating}
              onClick={() => handleStatusUpdate(status)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                assignment.status === status 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="card bg-white p-10 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Work Assignment</p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{assignment.tender?.title}</h1>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare size={20} className="text-slate-400" />
                Work Description
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
                "{assignment.description}"
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="card bg-white p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2rem]">
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Assignment Metadata</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Department</span>
                </div>
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{assignment.department?.name}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Priority</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  assignment.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {assignment.priority}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Deadline</span>
                </div>
                <span className="text-xs font-black text-slate-900 italic">
                  {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No Deadline'}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Last Updated</span>
                </div>
                <span className="text-[10px] font-black text-slate-400">
                  {new Date(assignment.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Assignee Section */}
          <div className="card bg-white p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2rem]">
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-8">Task Assignee</h3>
            {assignment.assignee ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden">
                    {assignment.assignee.image ? (
                      <img 
                        src={(assignment.assignee.image.startsWith('http') ? assignment.assignee.image : `${assignment.assignee.image}`) || null} 
                        alt={assignment.assignee.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{assignment.assignee.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignment.assignee.role || 'Team Member'}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                   <div className="flex items-center gap-2 text-slate-500">
                      <MessageSquare size={14} />
                      <span className="text-xs font-medium">{assignment.assignee.email}</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 italic">No specific assignee assigned.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Work Assignment</h2>
                  <p className="text-xs text-slate-500 font-medium">Modify task details and assignee.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Tender</label>
                  <select 
                    value={editData.tenderId}
                    onChange={(e) => setEditData({...editData, tenderId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {tenders.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Team</label>
                  <select 
                    value={editData.departmentId}
                    onChange={(e) => setEditData({...editData, departmentId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Member</label>
                  <select 
                    value={editData.assigneeId}
                    onChange={(e) => setEditData({...editData, assigneeId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    value={editData.priority}
                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {['Low', 'Medium', 'High'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Deadline</label>
                  <input 
                    type="date" 
                    value={editData.deadline}
                    onChange={(e) => setEditData({...editData, deadline: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Description</label>
                  <textarea 
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={4} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/80 flex justify-end gap-4 border-t border-slate-100">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-8 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateAssignment}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
