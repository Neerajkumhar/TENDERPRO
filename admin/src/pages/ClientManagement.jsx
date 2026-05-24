import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List,
  User,
  Users,
  Briefcase,
  Trophy,
  Star,
  X
} from 'lucide-react';

const ClientManagement = ({ clients = [], setClients, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    firmType: 'Private',
    status: 'Active',
    manager: '',
    value: ''
  });

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (response.ok) {
        const data = await response.json();
        setClients([data, ...clients]);
        setShowAddModal(false);
        setNewClient({
          name: '',
          industry: '',
          location: '',
          email: '',
          phone: '',
          website: '',
          firmType: 'Private',
          status: 'Active',
          manager: '',
          value: ''
        });
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'TOTAL CLIENTS', value: clients.length, icon: Users, color: 'blue' },
    { label: 'ACTIVE TENDERS', value: '17', icon: Briefcase, color: 'indigo' },
    { label: 'WIN RATE', value: '64%', icon: TrendingUp, color: 'emerald' },
    { label: 'KEY ACCOUNTS', value: '1', icon: Star, color: 'amber' },
  ];

  const recentActivity = [
    { client: 'Metro City Council', action: 'Tender Awarded', project: 'Downtown Subway Extension', status: 'SUCCESS', time: 'TODAY, 10:30 AM', color: 'emerald' },
    { client: 'Apex Infrastructure Ltd.', action: 'Bid Submitted', project: 'Highway 66 Repaving', status: 'PENDING', time: 'YESTERDAY, 2:15 PM', color: 'amber' },
    { client: 'Global Tech Solutions', action: 'Meeting Scheduled', project: 'Cloud Migration Strategy', status: 'UPCOMING', time: 'OCT 24, 2026', color: 'blue' },
    { client: 'EcoEnergy Systems', action: 'Document Requested', project: 'Solar Farm Alpha', status: 'ACTION REQUIRED', time: 'OCT 22, 2026', color: 'rose' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] pb-12">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Client Directory</h1>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-400 transition-all w-[300px]" 
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} />
            Filter
            <ChevronRight size={14} className="rotate-90" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
            <div className={`p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Active Clients Grid */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-900 tracking-[0.2em] uppercase">ACTIVE CLIENTS</h3>
              <button className="text-[10px] font-black text-blue-600 tracking-widest uppercase hover:underline">View All</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClients.map((client, i) => (
                <div 
                  key={client.id || i} 
                  onClick={() => onView(client.id)}
                  className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:border-blue-200 hover:shadow-lg transition-all relative overflow-hidden cursor-pointer active:scale-[0.98]"
                >
                   <div className="absolute top-6 right-6">
                      <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
                         <MoreVertical size={18} />
                      </button>
                   </div>
                   
                   <div className="flex gap-5 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                         {client.name.charAt(0)}
                      </div>
                      <div>
                         <h4 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{client.name}</h4>
                         <p className="text-xs font-bold text-slate-400">{client.industry || 'General'}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-500">
                         <MapPin size={14} className="text-slate-300" />
                         <span className="text-[11px] font-bold">{client.location || 'Location N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                         <Mail size={14} className="text-slate-300" />
                         <span className="text-[11px] font-bold">{client.email || 'No Email'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                         <Phone size={14} className="text-slate-300" />
                         <span className="text-[11px] font-bold">{client.phone || 'No Phone'}</span>
                      </div>
                   </div>
                   
                   <div className="flex justify-between items-end pt-6 border-t border-slate-50">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">FIRM TYPE</p>
                         <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{client.firmType}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PIPELINE VALUE</p>
                         <p className="text-lg font-black text-blue-600">₹{(parseInt(client.value || 0) / 1000000).toFixed(1)}M</p>
                      </div>
                   </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div className="col-span-2 py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                  </div>
                  <h4 className="text-slate-400 font-bold">No clients found matching your search</h4>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="lg:col-span-4">
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8 sticky top-8">
              <h3 className="text-xs font-black text-slate-900 tracking-[0.2em] uppercase">RECENT ACTIVITY</h3>
              
              <div className="space-y-8">
                 {recentActivity.map((act, i) => (
                   <div key={i} className="space-y-2 group cursor-pointer">
                      <div className="flex justify-between items-start">
                         <h5 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{act.client}</h5>
                         <span className={`px-3 py-1 bg-${act.color}-50 text-${act.color}-600 rounded-lg text-[8px] font-black uppercase tracking-widest`}>
                            {act.status}
                         </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500">
                         {act.action}: <span className="text-slate-800">{act.project}</span>
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{act.time}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register New Client</h2>
                  <p className="text-xs text-slate-500 font-medium italic">Add a new business partner to your directory.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Construction"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="City, Country"
                    value={newClient.location}
                    onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="client@email.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 000-0000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firm Type</label>
                  <select 
                    value={newClient.firmType}
                    onChange={(e) => setNewClient({...newClient, firmType: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500"
                  >
                    <option value="Private">Private</option>
                    <option value="Govt">Government</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pipeline Value (₹)</label>
                  <input 
                    type="number" 
                    placeholder="Estimated Value"
                    value={newClient.value}
                    onChange={(e) => setNewClient({...newClient, value: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest">Register Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
