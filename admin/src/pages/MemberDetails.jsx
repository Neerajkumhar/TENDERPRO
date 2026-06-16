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
  Tooltip,
  Legend
} from 'recharts';

const MemberDetails = ({ memberId, onBack, departments, user, onSendMessage }) => {
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

      // Process Stats
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

        const isWeekend = currDate.getDay() === 0 || currDate.getDay() === 6;

        if (presentDates.has(dateStr)) {
          presentDaysCount++;
          if (!isWeekend) {
            totalWorkingDays++;
          }
        } else if (!isWeekend) {
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

  if (isLoading) return <div className="p-20 text-center font-black text-slate-400">Loading Member Profile...</div>;
  if (!member) return <div className="p-20 text-center font-black text-rose-500">Member Not Found</div>;

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
    { name: 'Present', value: attendanceStats.present, color: '#10b981' },
    { name: 'Absent', value: attendanceStats.absent, color: '#f43f5e' },
    { name: 'On Leave', value: attendanceStats.onLeave, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const displayPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all group"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-all">
            <ChevronLeft size={16} />
          </div>
          Back to Directory
        </button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleEditClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-blue-500 transition-all shadow-sm"
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
            <Trash2 size={16} />
            <span>Terminate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 sm:gap-8">
        {/* Left Sidebar - Profile Card */}
        <div className="col-span-12 lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="card bg-white border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem] sm:rounded-[3rem]">
            <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 p-1.5 sm:p-2 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl">
                {member.image ? (
                  <img 
                    src={member.image || null} 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] sm:rounded-[2rem] object-cover" 
                    alt={member.name} 
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
                    <User size={48} className="sm:w-16 sm:h-16" />
                  </div>
                )}
              </div>
            </div>
            <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-6 sm:px-8 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{member.name}</h2>
              <p className="text-blue-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] mt-1">{member.role}</p>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  member.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-amber-500 text-white shadow-amber-200'
                }`}>
                  {member.status}
                </div>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="text-amber-500 fill-amber-500" size={14} />
                    <span className="text-base sm:text-lg font-black text-slate-900">4.8</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reliability</p>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="text-emerald-500" size={14} />
                    <span className="text-base sm:text-lg font-black text-slate-900">98%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 text-left">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
                  <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm text-blue-600">
                    <Mail size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
                  <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm text-emerald-600">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-700">{member.phone || '+91 00000 00000'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
                  <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm text-indigo-600">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-700">{getDeptName(member.departmentId)}</p>
                  </div>
                </div>
              </div>

              {member.id !== user?.id && (
                <button 
                  type="button"
                  onClick={() => onSendMessage && onSendMessage(member.id)}
                  className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-[1.5rem] text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  <span>Send Message</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Stats & Activity */}
        <div className="col-span-12 lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Attendance Overview - NEW SECTION */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2rem] sm:rounded-[2.5rem]">
             <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl">
                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase italic">Attendance Analytics</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium italic">Performance-based attendance logging and ratios.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Circular Graph */}
              <div className="md:col-span-5 flex flex-col items-center min-w-0 w-full">
                <div className="relative w-full h-[220px]">
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {displayPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                        itemStyle={{fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 leading-none">{attendanceStats.percentage}%</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-50/50 border border-emerald-100/50 group hover:bg-emerald-50 transition-all">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-900">{attendanceStats.present}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                 </div>
                 <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-50/50 border border-rose-100/50 group hover:bg-rose-50 transition-all">
                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Absent</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-900">{attendanceStats.absent}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                 </div>
                 <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-50/50 border border-amber-100/50 group hover:bg-amber-50 transition-all">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">On Leave</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-900">{attendanceStats.onLeave}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Approved</span>
                    </div>
                 </div>
                 <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Days</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-slate-900">{attendanceStats.totalWorkingDays}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Workable</span>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Warning if low attendance */}
            {attendanceStats.percentage < 85 && (
              <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 animate-pulse">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest">Warning: Low attendance ratio detected. Please review system logs.</p>
              </div>
            )}
          </div>

          {/* Pending / Unapproved Requests - NEW SECTION */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl">
                  <Clock size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase italic">Pending Requests</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium italic">Unapproved leave or system applications.</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                {leaveRequests.filter(l => l.status === 'Pending').length} Pending
              </div>
            </div>

            <div className="space-y-4">
              {leaveRequests.filter(l => l.status === 'Pending').length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                  <CheckCircle2 className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No unapproved requests found</p>
                </div>
              ) : (
                leaveRequests.filter(l => l.status === 'Pending').map((leave, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{leave.leaveType}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                       <div className="flex flex-col items-start sm:items-end">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Reason</p>
                          <p className="text-[11px] font-bold text-slate-600 italic">"{leave.reason || 'No reason provided'}"</p>
                       </div>
                       <button className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all">
                          <ExternalLink size={16} />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Role Responsibilities */}
          <div className="card p-6 sm:p-8 bg-white border-none shadow-xl shadow-slate-200/40 rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl">
                <Shield size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase italic">Role & Permissions</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium italic">Administrative access and core responsibilities.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Permissions</h4>
                <div className="space-y-2.5 sm:space-y-3">
                  {['Manage Tender Flow', 'Internal Approval Rights', 'Financial Review Access', 'Member Recruitment'].map((perm, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-600">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Metadata</h4>
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-400">Joined Date</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-700">12 Oct 2023</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-400">System ID</span>
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-tighter">USR-{String(member.id).substring(0,8)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-400">Last Login</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-700">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 sm:p-3 rounded-2xl text-white shadow-lg bg-blue-600 shadow-blue-100">
                  <Edit size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase italic">Edit Profile</h2>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Update member info & photo</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleUpdate} className="p-6 sm:p-8 space-y-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Photo Upload Section */}
                  <div className="flex-shrink-0">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block text-center md:text-left">Profile Photo</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        handleFileUpload(file);
                      }}
                      className={`relative w-32 h-32 sm:w-40 sm:h-40 mx-auto md:mx-0 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group
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
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Drop Photo'}</p>
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
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          required 
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input 
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
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
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password <span className="text-[8px] opacity-60">(Optional)</span></label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={editFormData.password}
                          onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm pr-12" 
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                        <select 
                          required 
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm appearance-none"
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
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all shadow-sm appearance-none"
                        >
                          <option value="">Select Department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Active', 'On Leave', 'Inactive'].map(s => (
                          <label key={s} className="cursor-pointer">
                            <input 
                              type="radio" 
                              name="status" 
                              value={s} 
                              checked={editFormData.status === s}
                              onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                              className="sr-only peer" 
                            />
                            <div className={`py-3 text-center rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 border-slate-100 bg-slate-50 hover:bg-white shadow-sm`}>
                              {s}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-3 sm:gap-4 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="flex-1 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700 transition-colors bg-white sm:bg-transparent rounded-2xl sm:rounded-none"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isUploading}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isUploading ? 'Uploading Data...' : 'Save Member Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetails;
