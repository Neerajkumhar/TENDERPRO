import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  MoreHorizontal, 
  User, 
  Briefcase,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const Team = ({ user, members = [], departments = [], onMemberClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [sentUnreadCounts, setSentUnreadCounts] = useState({});

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;
    try {
      // Received
      const resReceived = await fetch(`/api/messages/${user.id}/unread`);
      if (resReceived.ok) {
        const data = await resReceived.json();
        setUnreadCounts(data);
      }
      // Sent
      const resSent = await fetch(`/api/messages/${user.id}/sent-unread`);
      if (resSent.ok) {
        const data = await resSent.json();
        setSentUnreadCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch unread counts in team:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);
  
  // Filter members by the project manager's department
  const departmentMembers = members.filter(member => 
    member.departmentId === user.departmentId
  );

  const filteredMembers = departmentMembers.filter(member =>
    (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentDeptName = departments.find(d => d.id === user.departmentId)?.name || 'General Department';

  const stats = [
    { label: 'Total Members', value: departmentMembers.length, subtext: 'In Department' },
    { label: 'Active Members', value: departmentMembers.filter(m => m.status === 'Active').length, subtext: 'Available' },
    { label: 'Core Team', value: departmentMembers.filter(m => m.role === 'Core Team').length, subtext: 'Executors' },
    { label: 'Department', value: currentDeptName, subtext: 'Assigned Unit' }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <span>Department Team Directory</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Manage members, assign roles, and monitor team availability</p>
        </div>
      </div>

      {/* Top KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none truncate">{stat.value}</span>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Team Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-2.5 sm:p-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-slate-50/40">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Team Members</h3>
            <p className="text-[8.5px] text-slate-500 font-medium">List of all personnel in {currentDeptName}</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 outline-none focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-3.5 py-2">Member</th>
                <th className="px-3.5 py-2">Role & Designation</th>
                <th className="px-3.5 py-2">Department</th>
                <th className="px-3.5 py-2">Status</th>
                <th className="px-3.5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr 
                  key={member.id} 
                  onClick={() => onMemberClick && onMemberClick(member.id)}
                  className="hover:bg-slate-50/70 transition-all group cursor-pointer"
                >
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        {member.image ? (
                          <img src={member.image} className="w-7 h-7 rounded-lg border border-slate-200 object-cover" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-[11px]">
                            {member.name ? member.name.charAt(0) : 'U'}
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-white rounded-full ${member.status === 'Active' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        
                        {/* Dual Unread Badges */}
                        <div className="absolute -top-1.5 -right-1.5 flex flex-col gap-0.5 z-10">
                          {member.id && unreadCounts[member.id] > 0 && (
                            <div className="min-w-[14px] h-[14px] px-0.5 bg-blue-600 text-white text-[7px] font-extrabold flex items-center justify-center rounded-full border border-white shadow-xs" title="New messages received">
                              {unreadCounts[member.id]}
                            </div>
                          )}
                          {member.id && sentUnreadCounts[member.id] > 0 && (
                            <div className="min-w-[14px] h-[14px] px-0.5 bg-amber-500 text-white text-[7px] font-extrabold flex items-center justify-center rounded-full border border-white shadow-xs" title="Sent messages unread">
                              {sentUnreadCounts[member.id]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors block truncate max-w-[160px]">
                          {member.name}
                        </span>
                        <span className="text-[8px] text-slate-400 truncate block">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-700">{member.role || 'Team Member'}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-600 truncate max-w-[130px]">
                        {departments.find(d => d.id === member.departmentId)?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      member.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                      {member.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                        <Mail size={12} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all">
                        <MoreHorizontal size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic text-xs font-medium">
                    No team members found in your department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;
