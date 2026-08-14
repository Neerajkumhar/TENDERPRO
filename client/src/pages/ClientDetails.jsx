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
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${timeStr}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    }
    
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-sm font-bold text-slate-900">Client Not Found</h2>
        <button onClick={onBack} className="mt-2 text-blue-600 text-xs font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const totalTenderValue = associatedTenders.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);
  const totalPaidAmount = payments.reduce((sum, pmt) => sum + (((pmt.status || '').toUpperCase() === 'RECEIVED') ? (parseFloat(pmt.amount) || 0) : 0), 0);
  const totalDueAmount = Math.max(0, totalTenderValue - totalPaidAmount);

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 overflow-x-hidden">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="w-8 h-8 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-all text-slate-600 flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{client.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                client.status === 'Active' ? 'bg-blue-50 text-blue-600' : 
                client.status === 'Lead' ? 'bg-blue-50 text-blue-600' : 
                'bg-amber-50 text-amber-600'}`}>
                {client.status}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium">{client.industry || 'General Industry'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button 
            onClick={openEditClient}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:border-amber-400 hover:text-amber-600 transition-all shadow-2xs active:scale-95 uppercase tracking-wider"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
          <button 
            onClick={handleDeleteClient}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:border-rose-400 hover:text-rose-600 transition-all shadow-2xs active:scale-95 uppercase tracking-wider"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Client Since</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{client.date ? new Date(client.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Account Value</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">₹{totalTenderValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Due Amount</span>
          <span className="text-sm sm:text-base font-extrabold text-rose-600 tracking-tight block leading-none">₹{totalDueAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Active Tenders</span>
          <span className="text-sm sm:text-base font-extrabold text-blue-600 tracking-tight block leading-none">{associatedTenders.filter(t => t.status === 'Active' || t.status === 'Registered').length} Tenders</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Firm Type</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield size={11} className="text-blue-600" />
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">{client.firmType || 'Private'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 sm:gap-3.5">
        {/* Left Side: Profile & Details */}
        <div className="col-span-12 lg:col-span-4 space-y-3 sm:space-y-3.5">
          {/* Client Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
            <div className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="px-3.5 pb-3.5">
              <div className="relative -mt-5 mb-2.5">
                <div className="w-11 h-11 rounded-xl bg-white p-0.5 shadow-2xs ring-2 ring-white">
                  <div className="w-full h-full rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-extrabold">
                    {client.name.charAt(0)}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">{client.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500">{client.location || 'Location Not Set'}</span>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="p-1 bg-white rounded text-blue-500 shadow-2xs shrink-0">
                    <Mail size={11} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Email Address</p>
                    <p className="text-[10px] font-bold text-slate-700 truncate">{client.email || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="p-1 bg-white rounded text-blue-500 shadow-2xs shrink-0">
                    <Phone size={11} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Phone Number</p>
                    <p className="text-[10px] font-bold text-slate-700">{client.phone || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="p-1 bg-white rounded text-indigo-500 shadow-2xs shrink-0">
                    <Globe size={11} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Website</p>
                    <p className="text-[10px] font-bold text-slate-700 truncate">{client.website || 'Not Provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Manager Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs p-3 sm:p-3.5">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Assigned Manager</h3>
              <button 
                onClick={openEditManager}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"
              >
                <Edit2 size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <img 
                src={client.managerPhoto || (client.manager ? `https://i.pravatar.cc/150?u=${client.manager}` : null)} 
                className="w-7 h-7 rounded-lg border border-slate-200 object-cover shrink-0" 
                alt="" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold text-slate-900 truncate">{client.manager || 'No Manager Assigned'}</p>
                <p className="text-[7.5px] text-slate-400 font-semibold uppercase tracking-wider">Account Executive</p>
              </div>
            </div>
            
            <div className="mt-2 space-y-1 text-xs">
              {client.managerEmail && (
                <div className="flex items-center gap-1.5 text-[9.5px] font-medium text-slate-500 min-w-0">
                  <Mail size={11} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.managerEmail}</span>
                </div>
              )}
              {client.managerPhone && (
                <div className="flex items-center gap-1.5 text-[9.5px] font-medium text-slate-500 min-w-0">
                  <Phone size={11} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.managerPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tenders, Invoices, Payments, History */}
        <div className="col-span-12 lg:col-span-8 space-y-3 sm:space-y-3.5">
          {/* Associated Tenders */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Associated Tenders</h3>
                <p className="text-[8.5px] text-slate-500 font-medium">Tenders linked directly to this corporate account</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-3.5 py-2">Tender ID</th>
                    <th className="px-3.5 py-2">Tender Name</th>
                    <th className="px-3.5 py-2">Value</th>
                    <th className="px-3.5 py-2">Status</th>
                    <th className="px-3.5 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {associatedTenders.length > 0 ? (
                    associatedTenders.map((tender, i) => (
                      <tr 
                        key={i} 
                        onClick={() => onTenderClick && onTenderClick(tender.id)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <td className="px-3.5 py-2 text-[10px] font-bold text-slate-400">{tender.reference || tender.id?.slice(0, 8)}</td>
                        <td className="px-3.5 py-2">
                          <p className="font-bold text-slate-800 hover:text-blue-600 transition-colors truncate max-w-[200px]">{tender.title}</p>
                        </td>
                        <td className="px-3.5 py-2 font-extrabold text-slate-900">₹{parseFloat(tender.budget || 0).toLocaleString('en-IN')}</td>
                        <td className="px-3.5 py-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            tender.status === 'Active' ? 'bg-blue-50 text-blue-600' : 
                            tender.status === 'Won' ? 'bg-blue-50 text-blue-600' : 
                            tender.status === 'Registered' ? 'bg-amber-50 text-amber-600' : 
                            'bg-slate-100 text-slate-600'}`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <ExternalLink size={12} className="text-slate-400 hover:text-blue-600 inline" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-xs font-medium text-slate-400 italic">
                        No tenders associated with this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Invoices */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Invoices</h3>
                <p className="text-[8.5px] text-slate-500 font-medium">Invoices issued for this client's tenders</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-3.5 py-2">Invoice #</th>
                    <th className="px-3.5 py-2">Project</th>
                    <th className="px-3.5 py-2">Date</th>
                    <th className="px-3.5 py-2">Total Amount</th>
                    <th className="px-3.5 py-2">Due</th>
                    <th className="px-3.5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {invoices.length > 0 ? (
                    invoices.map((inv, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3.5 py-2 font-bold text-slate-700">{inv.invoiceNumber}</td>
                        <td className="px-3.5 py-2 font-medium text-slate-600 truncate max-w-[150px]">{inv.project || 'N/A'}</td>
                        <td className="px-3.5 py-2 text-slate-500">
                          {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-3.5 py-2 font-extrabold text-slate-900">₹{parseFloat(inv.amount).toLocaleString('en-IN')}</td>
                        <td className="px-3.5 py-2 font-extrabold text-rose-600">₹{parseFloat(inv.amount_due || 0).toLocaleString('en-IN')}</td>
                        <td className="px-3.5 py-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            inv.status === 'Paid' ? 'bg-blue-50 text-blue-600' : 
                            inv.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                            'bg-rose-50 text-rose-600'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 text-center text-xs font-medium text-slate-400 italic">
                        No invoices associated with this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interaction History */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs p-3 sm:p-3.5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Interaction History</h3>
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
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs"
              >
                <Plus size={11} />
                <span>Log Interaction</span>
              </button>
            </div>
            {interactions.length > 0 ? (
              <div className="space-y-2.5">
                {interactions.map((activity, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-blue-600">
                        {activity.type}
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium">{formatInteractionDate(activity.date)}</span>
                    </div>
                    <p className="text-[10.5px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{activity.text}</p>
                    <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Logged by {activity.user}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs font-medium text-slate-400 italic">
                No interactions logged for this client yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {isEditClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Edit Client Details</h2>
                <p className="text-[8.5px] text-slate-400 font-medium">Update company profile</p>
              </div>
              <button onClick={() => setIsEditClientOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded"><X size={15} /></button>
            </div>
            
            <form className="p-3.5 space-y-2.5 text-xs" onSubmit={handleClientUpdate}>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({...clientFormData, name: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Industry</label>
                  <input 
                    type="text" 
                    value={clientFormData.industry}
                    onChange={(e) => setClientFormData({...clientFormData, industry: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                  <select 
                    value={clientFormData.status}
                    onChange={(e) => setClientFormData({...clientFormData, status: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                  <input 
                    type="email" 
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={clientFormData.phone}
                    onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
                  <input 
                    type="text" 
                    value={clientFormData.location}
                    onChange={(e) => setClientFormData({...clientFormData, location: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsEditClientOpen(false)}
                  className="flex-1 py-1.5 border border-slate-200 rounded-lg text-[9.5px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-2xs active:scale-95"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      {isEditManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Edit Manager</h2>
                <p className="text-[8.5px] text-slate-400 font-medium">Update executive contact</p>
              </div>
              <button onClick={() => setIsEditManagerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded"><X size={15} /></button>
            </div>
            
            <form className="p-3.5 space-y-2.5 text-xs" onSubmit={handleManagerUpdate}>
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Manager Name</label>
                <input 
                  type="text" 
                  value={managerData.manager}
                  onChange={(e) => setManagerData({...managerData, manager: e.target.value})}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                <input 
                  type="email" 
                  value={managerData.managerEmail}
                  onChange={(e) => setManagerData({...managerData, managerEmail: e.target.value})}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone</label>
                <input 
                  type="text" 
                  value={managerData.managerPhone}
                  onChange={(e) => setManagerData({...managerData, managerPhone: e.target.value})}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500" 
                />
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsEditManagerOpen(false)}
                  className="flex-1 py-1.5 border border-slate-200 rounded-lg text-[9.5px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-2xs active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Log Interaction</h2>
                <p className="text-[8.5px] text-slate-400 font-medium">Record meeting or communication</p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded"><X size={15} /></button>
            </div>
            
            <form className="p-3.5 space-y-2.5 text-xs" onSubmit={handleLogInteraction}>
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Interaction Type</label>
                <select 
                  value={interactionFormData.type}
                  onChange={(e) => setInteractionFormData({...interactionFormData, type: e.target.value})}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Document">Document</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notes / Description</label>
                <textarea 
                  value={interactionFormData.text}
                  onChange={(e) => setInteractionFormData({...interactionFormData, text: e.target.value})}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 h-20 resize-none" 
                  placeholder="Enter details..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={interactionFormData.date}
                    onChange={(e) => setInteractionFormData({...interactionFormData, date: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Logged By</label>
                  <input 
                    type="text" 
                    value={interactionFormData.user}
                    onChange={(e) => setInteractionFormData({...interactionFormData, user: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-1.5 border border-slate-200 rounded-lg text-[9.5px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-2xs active:scale-95"
                >
                  Save Log
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
