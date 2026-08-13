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
import ClientDetails from './ClientDetails';

const formatIndianCurrency = (value) => {
  const num = parseInt(value || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(2)}K`;
  return `₹${num}`;
};

const ClientManagement = ({ clients = [], tenders = [], setClients, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('All'); // All, Private, Govt
  const filterRef = useRef(null);
  
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
    const matchesFilter = filterType === 'All' || c.firmType === filterType;
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
    { label: 'ACTIVE TENDERS', value: activeTendersCount, icon: Briefcase, color: 'blue' },
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

      if (t.status === 'Won') { action = 'Tender Awarded'; status = 'SUCCESS'; color = 'blue'; }
      else if (t.status === 'Registered') { action = 'Tender Registered'; status = 'NEW'; color = 'blue'; }
      else if (t.status === 'Active') { action = 'Bid Submitted'; status = 'PENDING'; color = 'amber'; }
      else if (t.status === 'Lost') { action = 'Tender Lost'; status = 'FAILED'; color = 'rose'; }
      else if (t.status === 'Under Review') { action = 'Under Review'; status = 'ACTION REQUIRED'; color = 'rose'; }
      else if (t.status === 'Completed') { action = 'Project Completed'; status = 'DONE'; color = 'blue'; }
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
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] pb-12">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Client Directory</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Manage your corporate relationships and pipelines.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Bar - Grouped next to Filter */}
            <div className="relative group w-full sm:w-80 order-2 sm:order-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search name or industry..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all shadow-xs" 
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
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
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
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-100/90 flex items-center gap-3 hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <stat.icon size={16} />
            </div>
             <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">{stat.label}</p>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight truncate">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Active Clients Section - Full Width & Minimized Cards */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] sm:text-xs font-extrabold text-slate-900 tracking-wider uppercase">ACTIVE CLIENTS</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredClients.map((client, i) => (
            <div 
              key={client.id || i} 
              onClick={() => onView(client.id)}
              className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-100/90 group hover:border-blue-200 hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-[0.98] flex flex-col justify-between"
            >
               <div>
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                       {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                       <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{client.name}</h4>
                       {client.manager && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{client.manager}</p>}
                       <p className="text-[9px] font-semibold text-slate-400 truncate">{client.industry || 'General'}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-slate-500 min-w-0">
                       <MapPin size={12} className="text-slate-400 shrink-0" />
                       <span className="text-[10px] font-bold truncate">{client.location || 'Location N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 min-w-0">
                       <Mail size={12} className="text-slate-400 shrink-0" />
                       <span className="text-[10px] font-bold truncate">{client.email || 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 min-w-0">
                       <Phone size={12} className="text-slate-400 shrink-0" />
                       <span className="text-[10px] font-bold truncate">{client.phone || 'No Phone'}</span>
                    </div>
                 </div>
               </div>
               
               <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">PIPELINE VALUE</span>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-600">
                    {formatIndianCurrency(tenders.filter(t => t.clientId === client.id).reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0))}
                  </span>
               </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-10 text-center bg-white rounded-xl border border-dashed border-slate-200 px-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Users size={22} />
              </div>
              <h4 className="text-xs text-slate-400 font-bold">No clients found matching your search</h4>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal - Professional, 3-Column, Scroll-Free */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                  <Plus size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Register New Client</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Add a new business partner to your directory</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 shrink-0"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Company Name <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Client Contact Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={newClient.manager}
                    onChange={(e) => setNewClient({...newClient, manager: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Construction"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Location</label>
                  <input 
                    type="text" 
                    placeholder="City, Country"
                    value={newClient.location}
                    onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Company Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123 Business Rd"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">GST Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. GST Registered Address"
                    value={newClient.gstAddress}
                    onChange={(e) => setNewClient({...newClient, gstAddress: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="client@company.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Firm Type</label>
                  <select 
                    value={newClient.firmType}
                    onChange={(e) => setNewClient({...newClient, firmType: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="Private">Private</option>
                    <option value="Govt">Government</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Estimated Pipeline Value (₹)</label>
                  <input 
                    type="number" 
                    placeholder="Enter estimated value"
                    value={newClient.value}
                    onChange={(e) => setNewClient({...newClient, value: e.target.value})}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-wider"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
