import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
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

const ClientDetails = ({ clientId, onBack }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isEditManagerOpen, setIsEditManagerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: '',
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

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const response = await fetch(`/api/clients`);
      const data = await response.json();
      if (response.ok) {
        // Find the specific client from the list (ideally there would be a GET /api/clients/:id)
        const foundClient = data.find(c => c.id === clientId);
        setClient(foundClient);
      }
      
      const tenderResponse = await fetch(`/api/tenders`);
      const tenderData = await tenderResponse.json();
      if (tenderResponse.ok) {
        setAssociatedTenders(tenderData.filter(t => t.clientId === clientId));
      }
    } catch (error) {
      console.error('Error fetching client details or tenders:', error);
    } finally {
      setIsLoading(false);
    }
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

  const openEditClient = () => {
    setClientFormData({
      name: client.name || '',
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
                  ${client.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-blue-400 transition-all shadow-sm"
            >
              <Edit2 size={18} />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1 bg-slate-100/50 rounded-[28px] border border-slate-200/50">
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Since</p>
            <p className="text-sm font-black text-slate-900 mt-1">{new Date(client.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Value</p>
            <p className="text-sm font-black text-slate-900 mt-1">{client.value || '₹ 0'}</p>
          </div>
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tenders</p>
            <p className="text-sm font-black text-slate-900 mt-1">{associatedTenders.filter(t => t.status === 'Active' || t.status === 'Registered').length} Tenders</p>
          </div>
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
            <div className="flex items-center gap-2 mt-1">
              <Shield size={14} className="text-blue-500" />
              <span className="text-sm font-black text-slate-900">{client.firmType || 'Private'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Side: Profile & Details */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Client Profile Card */}
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden group">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6">
                <div className="w-24 h-24 rounded-[32px] bg-white p-1.5 shadow-xl ring-4 ring-white group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-[24px] bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-black">
                    {client.name.charAt(0)}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{client.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500">{client.location || 'Location Not Set'}</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{client.email || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-500">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-xs font-bold text-slate-700">{client.phone || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-500">
                    <Globe size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{client.website || 'Not Provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Assigned Manager</h3>
              <button 
                onClick={openEditManager}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[28px] border border-slate-100 group">
              <img 
                src={client.managerPhoto || (client.manager ? `https://i.pravatar.cc/150?u=${client.manager}` : null)} 
                className="w-14 h-14 rounded-2xl shadow-sm border-2 border-white object-cover" 
                alt="" 
              />
              <div>
                <p className="text-sm font-black text-slate-900">{client.manager || 'No Manager Assigned'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Account Executive</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {client.managerEmail && (
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Mail size={14} className="text-slate-400" />
                  <span>{client.managerEmail}</span>
                </div>
              )}
              {client.managerPhone && (
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Phone size={14} className="text-slate-400" />
                  <span>{client.managerPhone}</span>
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
              
              <form className="p-8 space-y-6" onSubmit={handleClientUpdate}>
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
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                    <input 
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
              
              <form className="p-8 space-y-6" onSubmit={handleManagerUpdate}>
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

        {/* Right Side: Tenders & History */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Associated Tenders */}
          <div className="card bg-white border-none shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Associated Tenders</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Track all tenders linked to this client</p>
              </div>
              <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-4">Tender ID</th>
                    <th className="px-8 py-4">Tender Name</th>
                    <th className="px-8 py-4">Value</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {associatedTenders.length > 0 ? (
                    associatedTenders.map((tender, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-all group cursor-pointer">
                        <td className="px-8 py-5 text-xs font-bold text-slate-400">{tender.reference || tender.id.slice(0, 8)}</td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{tender.title}</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-slate-900">₹ {tender.budget || '0'}</td>
                        <td className="px-8 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest
                            ${tender.status === 'Active' ? 'bg-blue-100 text-blue-600' : 
                              tender.status === 'Won' ? 'bg-emerald-100 text-emerald-600' : 
                              tender.status === 'Registered' ? 'bg-amber-100 text-amber-600' : 
                              'bg-slate-100 text-slate-600'}`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 transition-all inline" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-8 py-8 text-center text-sm font-bold text-slate-400">
                        No tenders associated with this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Log */}
          <div className="card p-8 bg-white border-none shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-slate-900 text-xl tracking-tight mb-8">Interaction History</h3>
            <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
              {[
                { type: 'Meeting', text: 'Financial proposal review meeting held with client stakeholders.', date: 'Today, 10:30 AM', user: 'Admin' },
                { type: 'Email', text: 'Sent updated quotation for TND-2024-001 with revised scope.', date: 'Yesterday, 04:15 PM', user: 'Admin' },
                { type: 'Call', text: 'Call with manager regarding technical requirements and site visit.', date: '21 May 2024', user: 'Rakesh Sharma' },
                { type: 'Document', text: 'Client uploaded signed NDA and project requirements document.', date: '19 May 2024', user: 'System' },
              ].map((activity, i) => (
                <div key={i} className="relative pl-10 group">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-xl bg-white border-2 border-slate-100 group-hover:border-blue-500 group-hover:scale-110 transition-all flex items-center justify-center z-10 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{activity.type}</span>
                      <span className="text-[10px] text-slate-400 font-bold">• {activity.date}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 italic">Action by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-3 border border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all">
              Load More History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
