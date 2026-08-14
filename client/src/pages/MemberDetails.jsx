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
  EyeOff, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

const MemberDetails = ({ memberId, onBack, departments = [], user = {}, onSendMessage }) => {
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

  // Attendance and Leave state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    totalWorkingDays: 0,
    percentage: 0
  });

  const fetchMemberDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/members/${String(memberId)}`);
      if (response.ok) {
        const data = await response.json();
        setMember(data);
        fetchAttendanceAndLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceAndLeaves = async (memberData) => {
    try {
      const [attRes, leaveRes] = await Promise.all([
        fetch(`/api/auth/attendance/${memberData.id}`),
        fetch(`/api/leave-requests/user/${memberData.id}`)
      ]);

      let attData = [];
      let leaveData = [];

      if (attRes.ok) attData = await attRes.json();
      if (leaveRes.ok) leaveData = await leaveRes.json();

      setAttendanceRecords(attData);
      setLeaveRequests(leaveData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(memberData.createdAt || '2026-05-01');
      start.setHours(0, 0, 0, 0);

      const presentDates = new Set(attData.map(r => r.date));
      const approvedLeaveDates = new Set();
      
      leaveData.filter(l => l.status === 'Approved').forEach(leave => {
        const lStart = new Date(leave.startDate);
        const lEnd = new Date(leave.endDate);
        let currDate = new Date(lStart);
        while (currDate <= lEnd) {
          const year = currDate.getFullYear();
          const month = String(currDate.getMonth() + 1).padStart(2, '0');
          const day = String(currDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          approvedLeaveDates.add(dateStr);
          currDate.setDate(currDate.getDate() + 1);
        }
      });

      let presentDaysCount = 0;
      let leaveDaysCount = 0;
      let absentDaysCount = 0;
      let totalWorkingDays = 0;

      let currDate = new Date(start);
      while (currDate <= today) {
        const year = currDate.getFullYear();
        const month = String(currDate.getMonth() + 1).padStart(2, '0');
        const day = String(currDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const isSunday = currDate.getDay() === 0;

        if (presentDates.has(dateStr)) {
          presentDaysCount++;
          totalWorkingDays++;
        } else if (!isSunday) {
          totalWorkingDays++;
          if (approvedLeaveDates.has(dateStr)) {
            leaveDaysCount++;
          } else {
            absentDaysCount++;
          }
        }

        currDate.setDate(currDate.getDate() + 1);
      }

      const effectiveTotal = Math.max(totalWorkingDays, 1);
      const percentage = Math.round((presentDaysCount / effectiveTotal) * 100);

      setAttendanceStats({
        present: presentDaysCount,
        absent: absentDaysCount,
        onLeave: leaveDaysCount,
        totalWorkingDays: effectiveTotal,
        percentage
      });

    } catch (err) {
      console.error("Failed to fetch attendance stats:", err);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  if (isLoading) return <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Loading Member Profile...</div>;
  if (!member) return <div className="p-12 text-center text-xs font-bold uppercase tracking-wider text-rose-500">Member Not Found</div>;

  const getDeptName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Unassigned';
  };

  const handleEditClick = () => {
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
      const response = await fetch('/api/upload', {
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
    try {
      const response = await fetch(`/api/members/${String(memberId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        fetchMemberDetails();
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const pieData = [
    { name: 'Present', value: attendanceStats.present, color: '#3b82f6' },
    { name: 'Absent', value: attendanceStats.absent, color: '#f43f5e' },
    { name: 'On Leave', value: attendanceStats.onLeave, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const displayPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-bold text-[10px] uppercase tracking-wider transition-all"
        >
          <div className="p-1 bg-white rounded-md shadow-2xs border border-slate-200">
            <ChevronLeft size={13} />
          </div>
          <span>Back to Directory</span>
        </button>
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button 
            onClick={handleEditClick}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:border-blue-500 shadow-2xs transition-all cursor-pointer"
          >
            <Edit size={12} />
            <span>Edit Profile</span>
          </button>
          <button className="flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all shadow-2xs cursor-pointer">
            <Trash2 size={12} />
            <span>Terminate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Left Sidebar - Profile Card */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="h-14 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 p-1 bg-white rounded-xl shadow-md">
                {member.image ? (
                  <img 
                    src={member.image} 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover" 
                    alt={member.name} 
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-extrabold text-base">
                    {member.name ? member.name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-10 pb-3.5 px-3.5 text-center">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{member.name}</h2>
              <p className="text-blue-600 font-bold uppercase text-[8px] sm:text-[8.5px] tracking-wider mt-0.5">{member.role}</p>
              
              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider ${
                  member.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {member.status || 'Active'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Performance</span>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="text-amber-500 fill-amber-500" size={11} />
                    <span className="text-xs font-extrabold text-slate-900">4.8</span>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Reliability</span>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="text-blue-500" size={11} />
                    <span className="text-xs font-extrabold text-slate-900">98%</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-left text-xs">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="p-1 bg-white rounded text-blue-600 shadow-2xs shrink-0">
                    <Mail size={12} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Email Address</span>
                    <p className="text-[10.5px] font-semibold text-slate-700 truncate">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="p-1 bg-white rounded text-blue-600 shadow-2xs shrink-0">
                    <Phone size={12} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Phone Number</span>
                    <p className="text-[10.5px] font-semibold text-slate-700 truncate">{member.phone || '+91 00000 00000'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="p-1 bg-white rounded text-indigo-600 shadow-2xs shrink-0">
                    <Building2 size={12} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Department</span>
                    <p className="text-[10.5px] font-semibold text-slate-700 truncate">{getDeptName(member.departmentId)}</p>
                  </div>
                </div>
              </div>

              {member.id !== user?.id && (
                <button 
                  type="button"
                  onClick={() => onSendMessage && onSendMessage(member.id)}
                  className="w-full mt-3 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare size={13} />
                  <span>Send Message</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Analytics & Requests */}
        <div className="col-span-12 lg:col-span-8 space-y-3">
          
          {/* Attendance Overview Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
             <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 text-blue-600 rounded">
                <TrendingUp size={14} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Attendance Analytics</h3>
                <p className="text-[8.5px] text-slate-500 font-medium">Performance-based attendance logging and ratio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Circular Graph */}
              <div className="md:col-span-5 flex flex-col items-center min-w-0 w-full">
                <div className="relative w-full h-[140px]">
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={800}
                      >
                        {displayPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">{attendanceStats.percentage}%</span>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5">Ratio</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:col-span-7 grid grid-cols-2 gap-2">
                 <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-[8px] font-bold text-blue-600 uppercase block mb-0.5">Present</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-sm sm:text-base font-extrabold text-slate-900">{attendanceStats.present}</span>
                       <span className="text-[7.5px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                 </div>
                 <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100">
                    <span className="text-[8px] font-bold text-rose-600 uppercase block mb-0.5">Absent</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-sm sm:text-base font-extrabold text-slate-900">{attendanceStats.absent}</span>
                       <span className="text-[7.5px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                 </div>
                 <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="text-[8px] font-bold text-amber-600 uppercase block mb-0.5">On Leave</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-sm sm:text-base font-extrabold text-slate-900">{attendanceStats.onLeave}</span>
                       <span className="text-[7.5px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                 </div>
                 <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Total Days</span>
                    <div className="flex items-baseline gap-1">
                       <span className="text-sm sm:text-base font-extrabold text-slate-900">{attendanceStats.totalWorkingDays}</span>
                       <span className="text-[7.5px] font-bold text-slate-400 uppercase">Workable</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-amber-50 text-amber-600 rounded">
                  <Clock size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Pending Requests</h3>
                  <p className="text-[8.5px] text-slate-500 font-medium">Unapproved leave or time-off submissions</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[8px] font-bold uppercase">
                {leaveRequests.filter(l => l.status === 'Pending').length} Pending
              </span>
            </div>

            <div className="space-y-1.5">
              {leaveRequests.filter(l => l.status === 'Pending').length === 0 ? (
                <div className="py-4 text-center border border-dashed border-slate-200 rounded-lg">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">No unapproved requests found</p>
                </div>
              ) : (
                leaveRequests.filter(l => l.status === 'Pending').map((leave, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded shadow-2xs text-blue-600">
                        <Calendar size={12} />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold text-slate-800 uppercase">{leave.leaveType}</p>
                        <p className="text-[8px] text-slate-400 font-medium">
                          {new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-400 uppercase block">Reason</span>
                      <span className="text-[9.5px] font-semibold text-slate-600 italic">"{leave.reason || 'No reason'}"</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Role & Permissions Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-50 text-amber-600 rounded">
                <Shield size={14} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Role & Permissions</h3>
                <p className="text-[8.5px] text-slate-500 font-medium">Administrative access and unit responsibilities</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Core Permissions</span>
                <div className="space-y-1">
                  {['Manage Tender Flow', 'Internal Approval Rights', 'Task Execution Access', 'Attendance Logging'].map((perm, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-medium text-slate-700">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Account Metadata</span>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Joined Date</span>
                    <span className="font-bold text-slate-700">12 Oct 2023</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">System ID</span>
                    <span className="font-bold text-blue-600">USR-{String(member.id).substring(0,8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-slate-700">{member.status || 'Active'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg text-white bg-blue-600 shadow-2xs">
                  <Edit size={13} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Edit Profile</h2>
                  <p className="text-[8px] text-slate-400 font-medium">Update member info & photo</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
              <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Photo Upload Section */}
                  <div className="shrink-0 flex flex-col items-center">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Profile Photo</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        handleFileUpload(file);
                      }}
                      className={`relative w-20 h-20 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400'}
                      `}
                    >
                      {editFormData.image ? (
                        <>
                          <img src={editFormData.image} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                            <UploadCloud className="text-white" size={16} />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-1">
                          <UploadCloud className={`mx-auto mb-1 ${isUploading ? 'animate-bounce text-blue-500' : 'text-slate-400'}`} size={16} />
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase">{isUploading ? 'Uploading...' : 'Drop Photo'}</span>
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
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Full Name</label>
                        <input 
                          required 
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone Number</label>
                        <input 
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address</label>
                      <input 
                        type="email"
                        required 
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Role</label>
                        <select 
                          required 
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Tender Manager">Tender Manager</option>
                          <option value="Project Manager">Project Manager</option>
                          <option value="Finance Manager">Finance Manager</option>
                          <option value="Core Team">Core Team</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Department</label>
                        <select 
                          required 
                          value={editFormData.departmentId}
                          onChange={(e) => setEditFormData({...editFormData, departmentId: e.target.value})}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="">Select Department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="px-3 py-1.5 text-slate-500 text-[9.5px] font-bold uppercase tracking-wider hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isUploading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider shadow-2xs hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetails;
