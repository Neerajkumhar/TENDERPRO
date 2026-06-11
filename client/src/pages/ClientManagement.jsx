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
  X,
  Check
} from 'lucide-react';

const formatIndianCurrency = (value) => {
  const num = parseInt(value || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(2)}K`;
  return `₹${num}`;
};

const ClientManagement = ({ clients = [], tenders = [], setClients, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    location: '',
    address: '',
    gstAddress: '',
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
          address: '',
          gstAddress: '',
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

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || c.firmType === filterType || (filterType === 'Govt' && c.firmType === 'Government');
    return matchesSearch && matchesFilter;
  });

  const totalClients = clients.length;
  const activeTendersCount = tenders.filter(t => t.clientId && t.status === 'Active').length;
  
  const pipelineTenders = tenders.filter(t => t.clientId && ['Active', 'Registered', 'Under Review'].includes(t.status));
  const totalPipeline = pipelineTenders.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);

  const completedTendersList = tenders.filter(t => t.clientId && t.status === 'Completed');
  const completedTenders = completedTendersList.length;
  const completedTendersValue = completedTendersList.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);

  const stats = [
    { label: 'TOTAL CLIENTS', value: totalClients, icon: Users, color: 'blue' },
    { label: 'TOTAL PIPELINE', value: formatIndianCurrency(totalPipeline), icon: TrendingUp, color: 'indigo' },
    { label: 'ACTIVE TENDERS', value: activeTendersCount, icon: Briefcase, color: 'emerald' },
    { label: 'COMPLETED TENDERS', value: completedTenders, icon: Trophy, color: 'amber' },
    { label: 'COMPLETED VALUE', value: formatIndianCurrency(completedTendersValue), icon: Star, color: 'rose' },
  ];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `TODAY, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `YESTERDAY, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    }
  };

  const recentActivity = tenders
    .filter(t => t.clientId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)
    .map(t => {
      const client = clients.find(c => c.id === t.clientId);
      let action = 'Tender Updated';
      let status = 'INFO';
      let color = 'blue';

      if (t.status === 'Won') { action = 'Tender Awarded'; status = 'SUCCESS'; color = 'emerald'; }
      else if (t.status === 'Registered') { action = 'Tender Registered'; status = 'NEW'; color = 'blue'; }
      else if (t.status === 'Active') { action = 'Bid Submitted'; status = 'PENDING'; color = 'amber'; }
      else if (t.status === 'Lost') { action = 'Tender Lost'; status = 'FAILED'; color = 'rose'; }
      else if (t.status === 'Under Review') { action = 'Under Review'; status = 'ACTION REQUIRED'; color = 'rose'; }
      else if (t.status === 'Completed') { action = 'Project Completed'; status = 'DONE'; color = 'emerald'; }
      else { status = t.status.toUpperCase(); }
      
      return {
        client: client ? client.name : 'Unknown Client',
        action: action,
        project: t.title,
        status: status,
        time: formatTime(t.updatedAt),
        color: color
      };
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] pb-12">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Client Directory</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 italic">Manage your corporate relationships and pipelines.</p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Bar - Grouped near Filter */}
            <div className="relative group w-full sm:w-80 order-2 sm:order-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search name or industry..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all shadow-sm" 
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              <div className="relative flex-1 sm:flex-none">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white border ${filterType !== 'All' ? 'border-blue-400 text-blue-600' : 'border-slate-200 text-slate-600'} rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm`}
                >
                  <Filter size={16} />
                  <span className="truncate">{filterType === 'All' ? 'Filter' : filterType}</span>
                  <ChevronRight size={14} className={`shrink-0 transition-transform duration-300 ${showFilter ? '-rotate-90' : 'rotate-90'}`} />
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2 text-left">
                    {['All', 'Private', 'Govt'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setShowFilter(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold transition-all ${filterType === type ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span>{type === 'All' ? 'All Firm Types' : `${type} Firms`}</span>
                        {filterType === type && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden xs:inline">Add Client</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-4 sm:gap-6 group hover:shadow-xl transition-all duration-500">
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform shrink-0`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
               <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 sm:mb-1 truncate">{stat.label}</p>
               <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Main Content: Active Clients Grid */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
           <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] sm:text-xs font-black text-slate-900 tracking-[0.2em] uppercase">ACTIVE CLIENTS</h3>
              <button className="text-[9px] sm:text-[10px] font-black text-blue-600 tracking-widest uppercase hover:underline">View All</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredClients.map((client, i) => (
                <div 
                  key={client.id || i} 
                  onClick={() => onView(client.id)}
                  className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 group hover:border-blue-200 hover:shadow-lg transition-all relative overflow-hidden cursor-pointer active:scale-[0.98]"
                >
                   <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                      <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
                         <MoreVertical size={18} />
                      </button>
                   </div>
                   
                   <div className="flex items-center sm:items-start gap-4 sm:gap-5 mb-6 sm:mb-8">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-lg sm:text-xl font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                         {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                         <h4 className="text-sm sm:text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{client.name}</h4>
                         {client.manager && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{client.manager}</p>}
                         <p className="text-[10px] sm:text-xs font-bold text-slate-400 truncate">{client.industry || 'General'}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                      <div className="flex items-center gap-3 text-slate-500 min-w-0">
                         <MapPin size={14} className="text-slate-300 shrink-0" />
                         <span className="text-[10px] sm:text-[11px] font-bold truncate">{client.location || 'Location N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 min-w-0">
                         <Mail size={14} className="text-slate-300 shrink-0" />
                         <span className="text-[10px] sm:text-[11px] font-bold truncate">{client.email || 'No Email'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 min-w-0">
                         <Phone size={14} className="text-slate-300 shrink-0" />
                         <span className="text-[10px] sm:text-[11px] font-bold truncate">{client.phone || 'No Phone'}</span>
                      </div>
                   </div>
                   
                   <div className="flex justify-end items-end pt-5 sm:pt-6 border-t border-slate-50">
                      <div className="text-right shrink-0 ml-4">
                         <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">PIPELINE VALUE</p>
                         <p className="text-base sm:text-lg font-black text-blue-600 whitespace-nowrap">
                           {formatIndianCurrency(tenders.filter(t => t.clientId === client.id).reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0))}
                         </p>
                      </div>
                   </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div className="col-span-1 md:col-span-2 py-12 sm:py-20 text-center bg-white rounded-2xl sm:rounded-[2rem] border border-dashed border-slate-200 px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  <h4 className="text-sm sm:text-base text-slate-400 font-bold">No clients found matching your search</h4>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="lg:col-span-4">
           <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-100 space-y-6 sm:space-y-8 sticky top-8">
              <h3 className="text-[10px] sm:text-xs font-black text-slate-900 tracking-[0.2em] uppercase px-1">RECENT ACTIVITY</h3>
              
              <div className="space-y-6 sm:space-y-8">
                 {recentActivity.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-xs text-slate-400 font-bold">No recent activities found.</p>
                    </div>
                 ) : recentActivity.map((act, i) => (
                   <div key={i} className="space-y-1.5 sm:space-y-2 group cursor-pointer px-1">
                      <div className="flex justify-between items-start gap-4">
                         <h5 className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{act.client}</h5>
                         <span className={`shrink-0 px-2 sm:px-3 py-1 bg-${act.color}-50 text-${act.color}-600 rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest`}>
                            {act.status}
                         </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 line-clamp-2">
                         {act.action}: <span className="text-slate-800">{act.project}</span>
                      </p>
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{act.time}</p>
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
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                  <Plus size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Register New Client</h2>
                  <p className="hidden sm:block text-xs text-slate-500 font-medium italic">Add a new business partner to your directory.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 shrink-0"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6 sm:p-10 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name (Contact)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={newClient.manager}
                    onChange={(e) => setNewClient({...newClient, manager: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Construction"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="City, Country"
                    value={newClient.location}
                    onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address (Company)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123 Business Rd"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Address (Company)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123 Business Rd"
                    value={newClient.gstAddress}
                    onChange={(e) => setNewClient({...newClient, gstAddress: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="client@email.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 000-0000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firm Type</label>
                  <select 
                    value={newClient.firmType}
                    onChange={(e) => setNewClient({...newClient, firmType: e.target.value})}
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-500"
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
                    className="w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  />
                </div>
              </div>
              <div className="pt-4 sm:pt-6 flex flex-col xs:flex-row gap-3 sm:gap-4 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 sm:py-4 text-slate-500 text-sm font-black uppercase tracking-widest hover:bg-slate-50 rounded-xl sm:rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest">Register Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
