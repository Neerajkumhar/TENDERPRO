import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
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

const ClientManagement = ({ clients = [], setClients, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('All'); // All, Private, Govt
  const filterRef = useRef(null);
  
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || c.firmType === filterType;
    return matchesSearch && matchesFilter;
  });

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] pb-12">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Client Directory</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 italic">Manage your corporate relationships and pipelines.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Bar - Grouped next to Filter */}
            <div className="relative group w-full sm:w-80 order-2 sm:order-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search name or industry..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              {/* Filter Button */}
              <div className="relative flex-1 sm:flex-none" ref={filterRef}>
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all border shadow-sm ${
                    showFilter || filterType !== 'All' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter size={16} />
                  <span>{filterType === 'All' ? 'Filter' : filterType}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} />
                </button>

                {/* Filter Dropdown */}
                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Firm Type</p>
                    {['All', 'Private', 'Govt'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setShowFilter(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          filterType === type ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{type === 'Govt' ? 'Government' : type}</span>
                        {filterType === type && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} />
                <span className="hidden xs:inline">Add Client</span>
                <span className="xs:inline sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                   
                   <div className="flex justify-between items-end pt-5 sm:pt-6 border-t border-slate-50">
                      <div className="min-w-0">
                         <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">FIRM TYPE</p>
                         <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest truncate">{client.firmType}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                         <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">PIPELINE VALUE</p>
                         <p className="text-base sm:text-lg font-black text-blue-600 whitespace-nowrap">₹{(parseInt(client.value || 0) / 1000000).toFixed(1)}M</p>
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
                 {recentActivity.map((act, i) => (
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
                <div className="sm:col-span-2 space-y-1">
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
