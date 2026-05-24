import React from 'react';
import { User, Mail, Shield, Calendar, LogOut, Camera, Bell, Lock, Globe } from 'lucide-react';

const Profile = ({ user, onLogout, departments = [] }) => {
  const department = departments.find(d => 
    d.id && user?.departmentId && String(d.id).toLowerCase() === String(user.departmentId).toLowerCase()
  );
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {department?.name ? `${department.name} ` : ''}{user?.role || 'User'} Account Settings
        </h1>
        <p className="text-slate-500 font-medium">Manage your profile and security preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-600" />
            
            <div className="relative mt-8">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 mx-auto shadow-xl ring-4 ring-white">
                <div className="w-full h-full rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-black">
                  {user?.name?.[0] || 'A'}
                </div>
              </div>
              <button className="absolute bottom-0 right-1/2 translate-x-12 p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 shadow-lg transition-all active:scale-90">
                <Camera size={16} />
              </button>
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-black text-slate-900">{user?.name || 'User Name'}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role || 'User Role'}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
              <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                <Globe size={18} />
                <span className="text-sm">Public Profile</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
            <h3 className="font-bold text-lg mb-2">Security Status</h3>
            <p className="text-blue-100 text-sm mb-4">Your account is secured with 2FA and enterprise encryption.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest">
              Level 4 Secured
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50">
              <h3 className="font-black text-slate-900 tracking-tight">Personal Information</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <User size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{user?.name}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{user?.email}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</label>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-transparent">
                  <Shield size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{user?.role || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Since</label>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-transparent">
                  <Calendar size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Joined May 2026'}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</label>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-transparent">
                  <Shield size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">
                    {department?.name || (user?.role === 'Admin' ? 'Management' : 'General')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 tracking-tight">Preferences</h3>
              <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">Update All</button>
            </div>
            <div className="p-4 sm:p-6 space-y-2">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Email Notifications</h4>
                    <p className="text-xs text-slate-500">Receive alerts about tender deadlines</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                  <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                  <div className="absolute left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
