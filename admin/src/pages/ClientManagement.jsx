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
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
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
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.location?.toLowerCase().includes(searchTerm.toLowerCase());
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
    { label: 'TOTAL CLIENTS', value: totalClients, icon: Users, color: 'text-slate-800' },
    { label: 'TOTAL PIPELINE', value: formatIndianCurrency(totalPipeline), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'ACTIVE TENDERS', value: activeTendersCount, icon: Briefcase, color: 'text-indigo-600' },
    { label: 'COMPLETED TENDERS', value: completedTenders, icon: Trophy, color: 'text-teal-600' },
    { label: 'COMPLETED VALUE', value: formatIndianCurrency(completedTendersValue), icon: Star, color: 'text-amber-600' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" size={18} />
            <span>Client Directory</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Manage your corporate accounts, points of contact, and business relationships.</p>
        </div>
        
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input 
              type="text" 
              placeholder="Search name, industry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs" 
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xs ${
                showFilter || filterType !== 'All' 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={12} />
              <span>{filterType === 'All' ? 'Filter' : filterType}</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`} />
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-1 text-left">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Firm Type</p>
                {['All', 'Private', 'Govt'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                      filterType === type ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type === 'Govt' ? 'Government' : type}</span>
                    {filterType === type && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Client Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95 whitespace-nowrap"
          >
            <Plus size={13} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex items-center gap-2.5 hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <stat.icon size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block truncate">{stat.label}</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block truncate leading-none mt-0.5">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Clients Grid */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-0.5">
          <h3 className="text-[9.5px] font-bold text-slate-900 tracking-wider uppercase">Active Accounts</h3>
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">{filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredClients.map((client, i) => (
            <div 
              key={client.id || i} 
              onClick={() => onView(client.id)}
              className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-slate-300 hover:shadow-xs transition-all duration-200 relative overflow-hidden cursor-pointer active:scale-[0.99] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    {client.name?.charAt(0) || 'C'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11.5px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate leading-tight">{client.name}</h4>
                    {client.manager && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">{client.manager}</p>}
                    <p className="text-[8px] font-medium text-slate-400 truncate">{client.industry || 'General'}</p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-2.5 text-slate-500">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[9.5px] font-medium truncate">{client.location || 'Location N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[9.5px] font-medium truncate">{client.email || 'No Email'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Phone size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[9.5px] font-medium truncate">{client.phone || 'No Phone'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-slate-100/80">
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">PIPELINE VALUE</span>
                <span className="text-[11px] font-extrabold text-blue-600">
                  {formatIndianCurrency(tenders.filter(t => t.clientId === client.id).reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0))}
                </span>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-10 text-center bg-white rounded-xl border border-dashed border-slate-200 px-4">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-slate-300">
                <Users size={16} />
              </div>
              <h4 className="text-[11px] text-slate-400 font-medium italic">No clients found matching your search</h4>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-3 sm:p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                  <Plus size={13} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Register New Client</h2>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Add a new business partner to directory</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 shrink-0"><X size={15} /></button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-3.5 sm:p-4 space-y-2.5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Company Name <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={newClient.manager}
                    onChange={(e) => setNewClient({...newClient, manager: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Construction"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                  <input 
                    type="text" 
                    placeholder="City, Country"
                    value={newClient.location}
                    onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Company Address</label>
                  <input 
                    type="text" 
                    placeholder="123 Business Rd"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">GST Address</label>
                  <input 
                    type="text" 
                    placeholder="GST Reg Address"
                    value={newClient.gstAddress}
                    onChange={(e) => setNewClient({...newClient, gstAddress: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="client@company.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Firm Type</label>
                  <select 
                    value={newClient.firmType}
                    onChange={(e) => setNewClient({...newClient, firmType: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none cursor-pointer focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Private">Private</option>
                    <option value="Govt">Government</option>
                  </select>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-100 flex justify-end items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs hover:bg-blue-700 active:scale-95"
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
