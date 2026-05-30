import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  MoreHorizontal, 
  User,
  Plus,
  Briefcase
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
      console.error('Failed to fetch unread counts:', err);
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
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase italic">Team Directory</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium italic">Manage team members, roles, and access controls for your department.</p>
      </div>

      {/* Main Team Card */}
      <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
        <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/10">
          <div>
            <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-[0.2em] relative inline-block">
              Team Members
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></div>
            </h3>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 sm:px-8 py-5 sm:py-6">Member</th>
                <th className="px-6 sm:px-8 py-5 sm:py-6">Role & Designation</th>
                <th className="px-6 sm:px-8 py-5 sm:py-6">Department</th>
                <th className="px-6 sm:px-8 py-5 sm:py-6">Status</th>
                <th className="px-6 sm:px-8 py-5 sm:py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr 
                  key={member.id} 
                  onClick={() => onMemberClick && onMemberClick(member.id)}
                  className="hover:bg-blue-50/20 transition-all group cursor-pointer"
                >
                  <td className="px-6 sm:px-8 py-5 sm:py-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative flex-shrink-0">
                        {member.image ? (
                          <img src={member.image} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-white shadow-sm object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                            <User size={20} className="sm:w-6 sm:h-6" />
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        
                        {/* Dual Unread Badges */}
                        <div className="absolute -top-2 -right-2 flex flex-col gap-0.5 z-10">
                          {member.id && unreadCounts[member.id] > 0 && (
                            <div className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce" title="New messages received">
                              {unreadCounts[member.id]}
                            </div>
                          )}
                          {member.id && sentUnreadCounts[member.id] > 0 && (
                            <div className="min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg" title="Your sent messages (unread by them)">
                              {sentUnreadCounts[member.id]}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-800">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-5 sm:py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:text-blue-600 transition-colors hidden sm:block">
                        <Users size={16} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-600">{member.role || 'Team Member'}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-5 sm:py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg hidden sm:block">
                        <Briefcase size={16} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-600">
                        {departments.find(d => d.id === member.departmentId)?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-5 sm:py-6">
                    <span className={`px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest
                      ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {member.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-5 sm:py-6 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button className="p-2 sm:p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button className="p-2 sm:p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                        <MoreHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic font-medium">
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
