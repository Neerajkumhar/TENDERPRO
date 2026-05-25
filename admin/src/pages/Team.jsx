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
  
  // Filter members by the project manager's department
  const departmentMembers = members.filter(member => 
    member.departmentId === user.departmentId
  );

  const filteredMembers = departmentMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Manage team members, roles, and access controls</p>
      </div>

      {/* Main Team Card */}
      <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] relative inline-block">
              Team Members
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></div>
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all w-80 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Member</th>
                <th className="px-8 py-6">Role & Designation</th>
                <th className="px-8 py-6">Department</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <tr 
                  key={member.id} 
                  className="hover:bg-blue-50/20 transition-all group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {member.image ? (
                          <img src={member.image} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
                            <User size={24} />
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      </div>
                      <span className="text-sm font-black text-slate-800">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:text-blue-600 transition-colors">
                        <Users size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{member.role || 'Team Member'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                        <Briefcase size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        {departments.find(d => d.id === member.departmentId)?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest
                      ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {member.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Mail size={18} />
                      </button>
                      <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                        <MoreHorizontal size={18} />
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
