import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  Shield, 
  Star, 
  ChevronLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Edit,
  Trash2,
  Award,
  UploadCloud,
  X,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

const MemberDetails = ({ memberId, onBack, departments }) => {
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    departmentId: '',
    phone: '',
    image: '',
    status: '',
    password: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/members`);
      if (response.ok) {
        const data = await response.json();
        const found = data.find(m => m.id === memberId);
        setMember(found);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching member details:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  if (isLoading) return <div className="p-20 text-center font-black text-slate-400">Loading Member Profile...</div>;
  if (!member) return <div className="p-20 text-center font-black text-rose-500">Member Not Found</div>;

  const getDeptName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Unassigned';
  };

  const handleEditClick = () => {
    setUpdateError('');
    setEditFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      departmentId: member.departmentId || '',
      phone: member.phone || '',
      image: member.image || '',
      status: member.status || 'Active',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setEditFormData({ ...editFormData, image: data.url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    try {
      const response = await fetch(`http://localhost:5000/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        fetchMemberDetails();
        setIsEditModalOpen(false);
      } else {
        const errData = await response.json();
        setUpdateError(errData.message || 'Failed to update member');
      }
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateError('Network error occurred during update');
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all group"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-all">
            <ChevronLeft size={16} />
          </div>
          Back to Directory
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-blue-500 transition-all shadow-sm"
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
            <Trash2 size={16} />
            <span>Terminate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar - Profile Card */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="card bg-white border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[3rem]">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-2 bg-white rounded-[2.5rem] shadow-xl">
                {member.image ? (
                  <img 
                    src={member.image || null} 
                    className="w-32 h-32 rounded-[2rem] object-cover" 
                    alt={member.name} 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
                    <User size={64} />
                  </div>
                )}
              </div>
            </div>
            <div className="pt-20 pb-8 px-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{member.name}</h2>
              <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] mt-1">{member.role}</p>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  member.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-amber-500 text-white shadow-amber-200'
                }`}>
                  {member.status}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="text-amber-500 fill-amber-500" size={14} />
                    <span className="text-lg font-black text-slate-900">4.8</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reliability</p>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="text-emerald-500" size={14} />
                    <span className="text-lg font-black text-slate-900">98%</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                    <Mail size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-xs font-bold text-slate-700">{member.phone || '+91 00000 00000'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="text-xs font-bold text-slate-700">{getDeptName(member.departmentId)}</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content - Activity & Skills */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Role Responsibilities */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Role & Permissions</h3>
                <p className="text-xs text-slate-500 font-medium italic">Administrative access and core responsibilities.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Permissions</h4>
                <div className="space-y-3">
                  {['Manage Tender Flow', 'Internal Approval Rights', 'Financial Review Access', 'Member Recruitment'].map((perm, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-bold text-slate-600">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Metadata</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Joined Date</span>
                    <span className="text-xs font-black text-slate-700">12 Oct 2023</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">System ID</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">USR-{member.id.substring(0,8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Last Login</span>
                    <span className="text-xs font-black text-slate-700">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                  <p className="text-xs text-slate-500 font-medium italic">Tracking system-wide contributions.</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                View Full Log <ExternalLink size={12} />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { type: 'Tender', action: 'Approved financial bid for', target: 'Smart City Project', time: '1 hour ago', color: 'blue' },
                { type: 'Member', action: 'Created account for new joiner', target: 'Sorubh Solanki', time: '5 hours ago', color: 'emerald' },
                { type: 'Client', action: 'Updated contact details for', target: 'Rajasthan Govt', time: 'Yesterday', color: 'indigo' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-6 top-10 bottom-0 w-px bg-slate-100"></div>}
                  <div className={`w-12 h-12 rounded-2xl bg-${act.color}-50 flex items-center justify-center text-${act.color}-600 flex-shrink-0 shadow-sm border border-${act.color}-100`}>
                    <Award size={20} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-slate-700">
                      <span className="text-slate-400 font-medium">{act.action}</span> {act.target}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl text-white shadow-lg bg-blue-600 shadow-blue-100">
                  <Edit size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
                  <p className="text-xs text-slate-500 font-medium">Update member information and photo</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            {updateError && (
              <div className="mx-8 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in duration-300">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0"></div>
                <span className="text-xs font-black uppercase tracking-wider">{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-12 gap-8">
                {/* Photo Upload Section */}
                <div className="col-span-12 md:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-center md:text-left">Profile Photo</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      handleFileUpload(file);
                    }}
                    className={`relative w-40 h-40 mx-auto md:mx-0 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group
                      ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}
                    `}
                  >
                    {editFormData.image ? (
                      <>
                        <img src={editFormData.image || null} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <UploadCloud className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <UploadCloud className={`mx-auto mb-2 ${isUploading ? 'animate-bounce text-blue-500' : 'text-slate-400'}`} size={24} />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Drop Photo Here'}</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Form Fields Section */}
                <div className="col-span-12 md:col-span-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        required 
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input 
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email"
                      required 
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Password (Leave blank to keep current)</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-all"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                      <select 
                        required 
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-sm"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Tender Manager">Tender Manager</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Core Team">Core Team</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                      <select 
                        required 
                        value={editFormData.departmentId}
                        onChange={(e) => setEditFormData({...editFormData, departmentId: e.target.value})}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-sm"
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Status</label>
                    <div className="flex gap-4">
                      {['Active', 'On Leave', 'Inactive'].map(s => (
                        <label key={s} className="flex-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="status" 
                            value={s} 
                            checked={editFormData.status === s}
                            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            className="sr-only peer" 
                          />
                          <div className={`py-3 text-center rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 border-slate-100 bg-slate-50 hover:bg-white`}>
                            {s}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="flex-1 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetails;
