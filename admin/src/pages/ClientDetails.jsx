import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2,
  MoreHorizontal, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Shield, 
  Briefcase, 
  FileText, 
  Clock, 
  Plus, 
  ExternalLink,
  Loader2,
  Upload,
  X
} from 'lucide-react';

const ClientDetails = ({ clientId, onBack, onTenderClick }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isEditManagerOpen, setIsEditManagerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    manager: '',
    industry: '',
    status: '',
    firmType: '',
    value: '',
    email: '',
    phone: '',
    website: '',
    location: ''
  });
  const [managerData, setManagerData] = useState({
    manager: '',
    managerEmail: '',
    managerPhone: '',
    managerPhoto: ''
  });
  const [associatedTenders, setAssociatedTenders] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [interactionFormData, setInteractionFormData] = useState({
    type: 'Meeting',
    text: '',
    user: '',
    date: ''
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setInteractionFormData(prev => ({
      ...prev,
      user: savedUser.name || 'Admin',
      date: new Date().toISOString().substring(0, 16)
    }));
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const response = await fetch(`/api/clients`);
      const data = await response.json();
      let foundClient = null;
      if (response.ok) {
        // Find the specific client from the list (ideally there would be a GET /api/clients/:id)
        foundClient = data.find(c => c.id === clientId);
        setClient(foundClient);
      }
      
      const tenderResponse = await fetch(`/api/tenders`);
      const tenderData = await tenderResponse.json();
      let clientTenders = [];
      if (tenderResponse.ok) {
        clientTenders = tenderData.filter(t => t.clientId === clientId);
        setAssociatedTenders(clientTenders);
      }

      const clientTenderIds = clientTenders.map(t => t.id);

      // Fetch Invoices
      let filteredInvoices = [];
      const invoiceResponse = await fetch(`/api/invoices`);
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        filteredInvoices = invoiceData.filter(inv => inv.tenderId && clientTenderIds.includes(inv.tenderId));
        setInvoices(filteredInvoices);
      }

      // Fetch Payments
      const paymentResponse = await fetch(`/api/payments`);
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        const clientInvoiceIds = filteredInvoices.map(inv => inv.id);
        const filteredPayments = paymentData.filter(pay => 
          (pay.invoiceId && clientInvoiceIds.includes(pay.invoiceId)) ||
          (pay.client && pay.client.toLowerCase() === foundClient?.name?.toLowerCase())
        );
        setPayments(filteredPayments);
      }

      const interactionsResponse = await fetch(`/api/clients/${clientId}/interactions`);
      const interactionsData = await interactionsResponse.json();
      if (interactionsResponse.ok) {
        setInteractions(interactionsData);
      }
    } catch (error) {
      console.error('Error fetching client details, tenders or interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogInteraction = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionFormData)
      });
      if (response.ok) {
        const newInteraction = await response.json();
        setInteractions(prev => [newInteraction, ...prev]);
        setIsLogModalOpen(false);
        // Reset form
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setInteractionFormData({
          type: 'Meeting',
          text: '',
          user: savedUser.name || 'Admin',
          date: new Date().toISOString().substring(0, 16)
        });
      } else {
        alert('Failed to log interaction');
      }
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  const formatInteractionDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${timeStr}`;
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    }
    
    // Otherwise format as 'DD MMM YYYY'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleClientUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientFormData)
      });
      if (response.ok) {
        const updated = await response.json();
        setClient(updated);
        setIsEditClientOpen(false);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async () => {
    if (window.confirm('Are you sure you want to delete this client? All associated data will be removed.')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          if (typeof onBack === 'function') {
            onBack(clientId, 'deleted');
          }
        } else {
          alert('Failed to delete client.');
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const openEditClient = () => {
    setClientFormData({
      name: client.name || '',
      manager: client.manager || '',
      industry: client.industry || '',
      status: client.status || 'Active',
      firmType: client.firmType || 'Private',
      value: client.value || '',
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      location: client.location || ''
    });
    setIsEditClientOpen(true);
  };

  const handleManagerUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(managerData)
      });
      if (response.ok) {
        const updated = await response.json();
        setClient(updated);
        setIsEditManagerOpen(false);
      }
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };

  const openEditManager = () => {
    setManagerData({
      manager: client.manager || '',
      managerEmail: client.managerEmail || '',
      managerPhone: client.managerPhone || '',
      managerPhoto: client.managerPhoto || ''
    });
    setIsEditManagerOpen(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setManagerData(prev => ({ ...prev, managerPhoto: data.url }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-black text-slate-900">Client Not Found</h2>
        <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const totalTenderValue = associatedTenders.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);
  const totalPaidAmount = payments.reduce((sum, pmt) => sum + (((pmt.status || '').toUpperCase() === 'RECEIVED') ? (parseFloat(pmt.amount) || 0) : 0), 0);
  const totalDueAmount = Math.max(0, totalTenderValue - totalPaidAmount);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{client.name}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                  ${client.status === 'Active' ? 'bg-blue-500 text-white shadow-blue-200' : 
                    client.status === 'Lead' ? 'bg-blue-500 text-white shadow-blue-200' : 
                    'bg-amber-500 text-white shadow-amber-200'}`}>
                  {client.status}
                </span>
              </div>
              <p className="text-slate-500 mt-1 font-medium italic">{client.industry || 'General Industry'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={openEditClient}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
            >
              <Edit2 size={18} />
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDeleteClient}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition-all shadow-sm"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner - Minimized */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
          <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-100/90">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Since</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">{new Date(client.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-100/90">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Value</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">₹ {totalTenderValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-100/90">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Amount</p>
            <p className="text-xs sm:text-sm font-extrabold text-rose-600 mt-0.5">₹ {totalDueAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-100/90">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tenders</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">{associatedTenders.filter(t => t.status === 'Active' || t.status === 'Registered').length} Tenders</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-100/90">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield size={13} className="text-blue-500" />
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">{client.firmType || 'Private'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left Side: Profile & Details */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Client Profile Card - Minimized */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden group">
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="px-5 pb-5">
              <div className="relative -mt-8 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md ring-4 ring-white group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-extrabold">
                    {client.name.charAt(0)}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{client.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">{client.location || 'Location Not Set'}</span>
              </div>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100/70">
                  <div className="p-1.5 bg-white rounded-lg shadow-xs text-blue-500">
                    <Mail size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{client.email || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100/70">
                  <div className="p-1.5 bg-white rounded-lg shadow-xs text-blue-500">
                    <Phone size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-xs font-bold text-slate-700">{client.phone || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100/70">
                  <div className="p-1.5 bg-white rounded-lg shadow-xs text-indigo-500">
                    <Globe size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Website</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{client.website || 'Not Provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Manager Card - Minimized */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Assigned Manager</h3>
              <button 
                onClick={openEditManager}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Edit2 size={15} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
              <img 
                src={client.managerPhoto || (client.manager ? `https://i.pravatar.cc/150?u=${client.manager}` : null)} 
                className="w-10 h-10 rounded-xl shadow-xs border-2 border-white object-cover shrink-0" 
                alt="" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-slate-900 truncate">{client.manager || 'No Manager Assigned'}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Account Executive</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              {client.managerEmail && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 min-w-0">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.managerEmail}</span>
                </div>
              )}
              {client.managerPhone && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 min-w-0">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.managerPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Client Modal */}
        {isEditClientOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Company Details</h2>
                <p className="text-xs text-slate-500 font-medium italic mt-1">Update corporate information for {client.name}.</p>
              </div>
              
              <form className="p-5 space-y-4" onSubmit={handleClientUpdate}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                    <input
                      type="text"
                      value={clientFormData.name}
                      onChange={(e) => setClientFormData({...clientFormData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name (Contact)</label>
                    <input
                      type="text"
                      value={clientFormData.manager || ''}
                      onChange={(e) => setClientFormData({...clientFormData, manager: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>                    <input 
                      type="text" 
                      value={clientFormData.industry}
                      onChange={(e) => setClientFormData({...clientFormData, industry: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={clientFormData.status}
                      onChange={(e) => setClientFormData({...clientFormData, status: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Lead">Lead</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={clientFormData.email}
                      onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={clientFormData.phone}
                      onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                    <input 
                      type="text" 
                      value={clientFormData.website}
                      onChange={(e) => setClientFormData({...clientFormData, website: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                      placeholder="www.company.com"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Location</label>
                    <input 
                      type="text" 
                      value={clientFormData.location}
                      onChange={(e) => setClientFormData({...clientFormData, location: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm" 
                      placeholder="City, State"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firm Type</label>
                    <div className="flex gap-4">
                      <label className="flex-1 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all">
                        <input 
                          type="radio" 
                          name="firmType" 
                          value="Private" 
                          checked={clientFormData.firmType === 'Private'}
                          onChange={(e) => setClientFormData({...clientFormData, firmType: e.target.value})}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-bold text-slate-700">Private Firm</span>
                      </label>
                      <label className="flex-1 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all">
                        <input 
                          type="radio" 
                          name="firmType" 
                          value="Govt" 
                          checked={clientFormData.firmType === 'Govt'}
                          onChange={(e) => setClientFormData({...clientFormData, firmType: e.target.value})}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-bold text-slate-700">Government</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditClientOpen(false)}
                    className="flex-1 py-3 px-6 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    Update Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Manager Modal */}
        {isEditManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Manager</h2>
                <p className="text-xs text-slate-500 font-medium italic mt-1">Update contact details for the assigned manager.</p>
              </div>
              
              <form className="p-5 space-y-4" onSubmit={handleManagerUpdate}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Name</label>
                    <input 
                      type="text" 
                      value={managerData.manager}
                      onChange={(e) => setManagerData({...managerData, manager: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" 
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={managerData.managerEmail}
                      onChange={(e) => setManagerData({...managerData, managerEmail: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" 
                      placeholder="manager@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={managerData.managerPhone}
                      onChange={(e) => setManagerData({...managerData, managerPhone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" 
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Photo</label>
                    <div className="relative">
                      {managerData.managerPhoto ? (
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200">
                          <img src={managerData.managerPhoto || null} className="w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button"
                            onClick={() => setManagerData({...managerData, managerPhoto: ''})}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 hover:bg-white transition-all shadow-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFileUpload(e.dataTransfer.files[0]);
                          }}
                          className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group relative"
                        >
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                          ) : (
                            <>
                              <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-500 group-hover:bg-white transition-all">
                                <Upload size={20} />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-all">Drag & Drop or Click</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditManagerOpen(false)}
                    className="flex-1 py-3 px-6 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Right Side: Tenders & History - Minimized Cards */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Associated Tenders - Minimized */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Associated Tenders</h3>
                <p className="text-xs text-slate-500 font-medium">Track all tenders linked to this client</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Tender ID</th>
                    <th className="px-4 py-3">Tender Name</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {associatedTenders.length > 0 ? (
                    associatedTenders.map((tender, i) => (
                      <tr 
                        key={i} 
                        onClick={() => onTenderClick && onTenderClick(tender.id)}
                        className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                      >
                        <td className="px-4 py-3 text-xs font-bold text-slate-400">{tender.reference || tender.id.slice(0, 8)}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{tender.title}</p>
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm font-extrabold text-slate-900">₹ {tender.budget || '0'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider
                            ${tender.status === 'Active' ? 'bg-blue-50 text-blue-600' : 
                              tender.status === 'Won' ? 'bg-blue-50 text-blue-600' : 
                              tender.status === 'Registered' ? 'bg-amber-50 text-amber-600' : 
                              'bg-slate-50 text-slate-600'}`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 transition-all inline" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-6 text-center text-xs font-bold text-slate-400">
                        No tenders associated with this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Invoices - Minimized */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Client Invoices</h3>
                <p className="text-xs text-slate-500 font-medium">Manage and track invoices issued for this client's tenders</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Tender / Project</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Due Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.length > 0 ? (
                    invoices.map((inv, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{inv.project || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{inv.tender?.title || 'General'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                          {new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs font-extrabold text-slate-900">₹ {parseFloat(inv.amount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-xs font-extrabold text-rose-600">₹ {parseFloat(inv.amount_due || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider
                            ${inv.status === 'Paid' ? 'bg-blue-50 text-blue-600' : 
                              inv.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                              'bg-rose-50 text-rose-600'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-6 text-center text-xs font-bold text-slate-400">
                        No invoices associated with this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments & Transactions - Minimized */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Payments & Transactions</h3>
                <p className="text-xs text-slate-500 font-medium">Transaction history for this client</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length > 0 ? (
                    payments.map((pmt, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{pmt.paymentId}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500">{pmt.invoiceNumber || 'General'}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500">
                          {new Date(pmt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">{pmt.method}</td>
                        <td className="px-4 py-3 text-xs font-extrabold text-slate-900">₹ {parseFloat(pmt.amount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider
                            ${pmt.status === 'RECEIVED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {pmt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-6 text-center text-xs font-bold text-slate-400">
                        No transactions logged for this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log - Minimized */}
          <div className="bg-white border border-slate-100/90 rounded-xl shadow-xs p-4 sm:p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Interaction History</h3>
              <button 
                onClick={() => {
                  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                  setInteractionFormData(prev => ({
                    ...prev,
                    user: savedUser.name || 'Admin',
                    date: new Date().toISOString().substring(0, 16)
                  }));
                  setIsLogModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <Plus size={14} />
                <span>Log Interaction</span>
              </button>
            </div>
            {interactions.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {interactions.map((activity, i) => (
                  <div key={i} className="relative pl-8 group">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-blue-500 group-hover:scale-105 transition-all flex items-center justify-center z-10 shadow-xs">
                      <div className={`w-2 h-2 rounded-full
                        ${activity.type === 'Meeting' ? 'bg-indigo-500' :
                          activity.type === 'Call' ? 'bg-blue-500' :
                          activity.type === 'Email' ? 'bg-amber-500' :
                          activity.type === 'Document' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider
                          ${activity.type === 'Meeting' ? 'text-indigo-600' :
                            activity.type === 'Call' ? 'text-blue-600' :
                            activity.type === 'Email' ? 'text-amber-600' :
                            activity.type === 'Document' ? 'text-rose-600' : 'text-blue-600'}`}>
                          {activity.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">• {formatInteractionDate(activity.date)}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">{activity.text}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5 italic">Action by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs font-bold text-slate-400">
                No interactions logged for this client yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Interaction Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Log Interaction</h2>
                <p className="text-xs text-slate-500 font-medium italic mt-1">Record a meeting, call, email, or document for {client.name}</p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 shrink-0"><X size={20} /></button>
            </div>
            
            <form className="p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col min-h-0" onSubmit={handleLogInteraction}>
              <div className="space-y-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-4">
                <div className="space-y-1.5 shrink-0">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interaction Type</label>
                  <select 
                    value={interactionFormData.type}
                    onChange={(e) => setInteractionFormData({...interactionFormData, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Document">Document</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-1.5 shrink-0">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Description</label>
                  <textarea 
                    value={interactionFormData.text}
                    onChange={(e) => setInteractionFormData({...interactionFormData, text: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none" 
                    placeholder="Enter details about the interaction..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={interactionFormData.date}
                      onChange={(e) => setInteractionFormData({...interactionFormData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logged By</label>
                    <input 
                      type="text" 
                      value={interactionFormData.user}
                      onChange={(e) => setInteractionFormData({...interactionFormData, user: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                      placeholder="Admin"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-slate-100 shrink-0 mt-auto">
                <button 
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-3 px-6 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Log Interaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;
