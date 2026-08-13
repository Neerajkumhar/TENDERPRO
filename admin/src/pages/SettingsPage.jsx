import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Mail, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Laptop, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Lock, 
  RefreshCw, 
  Database,
  Sliders,
  Check,
  Server,
  Zap,
  Phone,
  Key,
  Terminal,
  RotateCcw,
  Send,
  Upload,
  Radio,
  SlidersHorizontal,
  Info
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('General');
  
  // 1. General Settings Form
  const [generalForm, setGeneralForm] = useState({
    platformName: 'Vagwiin TenderPro',
    tagline: 'Enterprise Tender & Bidding Intelligence Engine',
    adminEmail: 'superadmin@tenderpro.com',
    timezone: '(GMT+05:30) Asia/Kolkata',
    dateFormat: '31 May 2025',
    timeFormat: '12 Hours (02:30 PM)',
    language: 'English',
    maintenanceMode: false,
    allowRegistrations: true,
    itemsPerPage: '10'
  });

  // 2. Company & Branding Settings Form
  const [companyForm, setCompanyForm] = useState({
    companyName: 'Vagwiin TenderPro Pvt. Ltd.',
    gstin: '09AAACV9988P1Z0',
    address: 'B-12, Tech Tower, Sector 63, Noida, UP 201301',
    phone: '+91 98765 43210',
    billingEmail: 'billing@tenderpro.com',
    supportEmail: 'support@tenderpro.com',
    website: 'https://tenderpro.com'
  });

  // 3. Email & SMTP Gateway Settings Form
  const [emailForm, setEmailForm] = useState({
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smtpPassword: '••••••••••••••••••••••••',
    encryption: 'TLS',
    senderName: 'TenderPro System Billing',
    senderEmail: 'notifications@tenderpro.com'
  });

  // 4. Security & Access Policy Form
  const [securityForm, setSecurityForm] = useState({
    enforce2FA: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    maxLoginAttempts: '5',
    ipWhitelisting: false,
    auditLogging: true
  });

  // 5. System Notifications & Alerts Form
  const [notificationsForm, setNotificationsForm] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    webhookUrl: 'https://api.tenderpro.com/v1/webhooks/alerts',
    criticalEmail: 'alerts@tenderpro.com'
  });

  // 6. Payment Gateway Integration Form
  const [paymentsForm, setPaymentsForm] = useState({
    gateway: 'Razorpay',
    environment: 'Live Production',
    razorpayKeyId: 'rzp_live_98234710ABC',
    razorpaySecret: '••••••••••••••••••••••••',
    currency: 'INR (₹)',
    autoInvoicing: true
  });

  // 7. System Infrastructure & Maintenance Form
  const [systemForm, setSystemForm] = useState({
    platformEnvironment: 'Production',
    debugMode: false,
    apiRateLimit: '500',
    autoBackups: 'Daily (02:00 AM)',
    cacheDriver: 'Redis'
  });

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Generic Save Handler
  const handleSaveTab = (tabName) => {
    triggerToast(`${tabName} configuration updated successfully!`, 'success');
  };

  // Action Buttons Handlers
  const handleClearCache = () => {
    triggerToast('Platform Redis & Application Cache cleared successfully!', 'success');
  };

  const handleBackupDatabase = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    triggerToast(`Database backup initiated! (tenderpro_backup_${timestamp}.sql)`, 'info');
  };

  const handleSendTestEmail = () => {
    triggerToast(`Test SMTP verification email sent to ${emailForm.senderEmail}!`, 'success');
  };

  const handleTestPaymentGateway = () => {
    triggerToast(`Connected to ${paymentsForm.gateway} API Gateway (HTTP 200 OK)`, 'success');
  };

  const menuTabs = [
    { id: 'General', label: 'General', icon: SettingsIcon },
    { id: 'Company', label: 'Company & Branding', icon: Building2 },
    { id: 'Email', label: 'Email & SMTP', icon: Mail },
    { id: 'Security', label: 'Security & Policy', icon: ShieldCheck },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Payments', label: 'Payment Gateway', icon: CreditCard },
    { id: 'System', label: 'System & Maintenance', icon: Laptop }
  ];

  return (
    <div className="p-3 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans space-y-4 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-3 ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'warning' ? 'bg-rose-900 text-rose-100 border-rose-700' :
          'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
          {toast.type === 'info' && <SettingsIcon size={16} className="text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="text-blue-600 shrink-0" size={24} />
            System Settings & Preferences
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure global platform parameters, branding, payment gateways, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleSaveTab(activeTab)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <Save size={16} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Master-Detail Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* LEFT COLUMN: Navigation Menu (~25% width / 3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs space-y-1 self-start">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Configuration Tabs
          </div>
          {menuTabs.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-extrabold shadow-xs border border-blue-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Active Tab Form Panel (~75% width / 9 cols) */}
        <div className="lg:col-span-9 space-y-3.5">
          
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'General' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              {/* Card 1: General Settings Form */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">General Platform Settings</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Update the primary platform identification, regional timezones, and display formats.
                    </p>
                  </div>

                  <button 
                    onClick={() => handleSaveTab('General')}
                    className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer self-start sm:self-auto"
                  >
                    Save Changes
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveTab('General'); }} className="space-y-3 text-xs">
                  
                  {/* Platform Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label className="font-bold text-slate-700">Platform Name *</label>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        required
                        value={generalForm.platformName}
                        onChange={(e) => setGeneralForm({ ...generalForm, platformName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label className="font-bold text-slate-700">Platform Tagline</label>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        value={generalForm.tagline}
                        onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Admin Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label className="font-bold text-slate-700">Primary Admin Email *</label>
                    <div className="md:col-span-2">
                      <input 
                        type="email" 
                        required
                        value={generalForm.adminEmail}
                        onChange={(e) => setGeneralForm({ ...generalForm, adminEmail: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Default Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label className="font-bold text-slate-700">Default Timezone</label>
                    <div className="md:col-span-2">
                      <select 
                        value={generalForm.timezone}
                        onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none cursor-pointer focus:border-blue-500 transition"
                      >
                        <option>(GMT+05:30) Asia/Kolkata</option>
                        <option>(GMT+00:00) UTC / London</option>
                        <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                        <option>(GMT+08:00) Singapore / Hong Kong</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Format */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label className="font-bold text-slate-700">Date Format</label>
                    <div className="md:col-span-2">
                      <select 
                        value={generalForm.dateFormat}
                        onChange={(e) => setGeneralForm({ ...generalForm, dateFormat: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none cursor-pointer focus:border-blue-500 transition"
                      >
                        <option>31 May 2025</option>
                        <option>31/05/2025</option>
                        <option>2025-05-31</option>
                        <option>May 31, 2025</option>
                      </select>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label className="font-bold text-slate-700">Primary Language</label>
                    <div className="md:col-span-2">
                      <select 
                        value={generalForm.language}
                        onChange={(e) => setGeneralForm({ ...generalForm, language: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none cursor-pointer focus:border-blue-500 transition"
                      >
                        <option>English</option>
                        <option>Hindi (हिंदी)</option>
                        <option>Spanish (Español)</option>
                        <option>French (Français)</option>
                      </select>
                    </div>
                  </div>

                </form>
              </div>

              {/* Card 2: Other Preferences Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">Platform Operational Toggles</h2>

                <div className="space-y-3.5 text-xs">
                  
                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">System Maintenance Mode</p>
                      <p className="text-slate-400 font-medium mt-0.5">Restrict non-admin access during platform maintenance</p>
                    </div>

                    <button 
                      onClick={() => {
                        const next = !generalForm.maintenanceMode;
                        setGeneralForm({ ...generalForm, maintenanceMode: next });
                        triggerToast(`Maintenance mode set to ${next ? 'ON' : 'OFF'}`, next ? 'warning' : 'info');
                      }}
                      className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        generalForm.maintenanceMode ? 'bg-amber-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                        generalForm.maintenanceMode ? 'translate-x-4.5' : 'translate-x-0'
                      }`}></div>
                    </button>
                  </div>

                  {/* Allow New Registrations */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">Allow Organization Self-Registration</p>
                      <p className="text-slate-400 font-medium mt-0.5">Allow new vendor organizations to create accounts online</p>
                    </div>

                    <button 
                      onClick={() => {
                        const next = !generalForm.allowRegistrations;
                        setGeneralForm({ ...generalForm, allowRegistrations: next });
                        triggerToast(`Self-registrations ${next ? 'Enabled' : 'Disabled'}`, 'info');
                      }}
                      className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        generalForm.allowRegistrations ? 'bg-[#1E56F0]' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                        generalForm.allowRegistrations ? 'translate-x-4.5' : 'translate-x-0'
                      }`}></div>
                    </button>
                  </div>

                  {/* Default Items Per Page */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-bold text-slate-800">Default Table Rows Count</p>
                      <p className="text-slate-400 font-medium mt-0.5">Default items displayed in super admin table components</p>
                    </div>

                    <select 
                      value={generalForm.itemsPerPage}
                      onChange={(e) => setGeneralForm({ ...generalForm, itemsPerPage: e.target.value })}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none cursor-pointer min-w-[80px]"
                    >
                      <option value="10">10 Rows</option>
                      <option value="25">25 Rows</option>
                      <option value="50">50 Rows</option>
                      <option value="100">100 Rows</option>
                    </select>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COMPANY & BRANDING SETTINGS */}
          {activeTab === 'Company' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Legal Company & Billing Entity</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Information displayed on system invoices, payment receipts, and legal audit reports.
                  </p>
                </div>
                <button 
                  onClick={() => handleSaveTab('Company')}
                  className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                >
                  Save Company
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveTab('Company'); }} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Legal Business Name *</label>
                    <input 
                      type="text" 
                      required
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GSTIN / Tax Registration ID *</label>
                    <input 
                      type="text" 
                      required
                      value={companyForm.gstin}
                      onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registered Address *</label>
                  <input 
                    type="text" 
                    required
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Support Phone</label>
                    <input 
                      type="text" 
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Billing Email</label>
                    <input 
                      type="email" 
                      value={companyForm.billingEmail}
                      onChange={(e) => setCompanyForm({ ...companyForm, billingEmail: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Support Email</label>
                    <input 
                      type="email" 
                      value={companyForm.supportEmail}
                      onChange={(e) => setCompanyForm({ ...companyForm, supportEmail: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: EMAIL & SMTP SETTINGS */}
          {activeTab === 'Email' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">SMTP Gateway Configuration</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Configure transactional email delivery for invoices, password resets, and user notifications.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSendTestEmail}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>Send Test Email</span>
                  </button>
                  <button 
                    onClick={() => handleSaveTab('Email')}
                    className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
                  >
                    Save SMTP
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveTab('Email'); }} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SMTP Host Server *</label>
                    <input 
                      type="text" 
                      required
                      value={emailForm.smtpHost}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SMTP Port *</label>
                    <input 
                      type="text" 
                      required
                      value={emailForm.smtpPort}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpPort: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Encryption Protocol</label>
                    <select 
                      value={emailForm.encryption}
                      onChange={(e) => setEmailForm({ ...emailForm, encryption: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none cursor-pointer focus:border-blue-500 transition"
                    >
                      <option value="TLS">TLS (Recommended)</option>
                      <option value="SSL">SSL</option>
                      <option value="None">None (Insecure)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SMTP Username</label>
                    <input 
                      type="text" 
                      value={emailForm.smtpUser}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpUser: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SMTP Password</label>
                    <input 
                      type="password" 
                      value={emailForm.smtpPassword}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sender Display Name</label>
                    <input 
                      type="text" 
                      value={emailForm.senderName}
                      onChange={(e) => setEmailForm({ ...emailForm, senderName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sender Email Address</label>
                    <input 
                      type="email" 
                      value={emailForm.senderEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY & ACCESS POLICY SETTINGS */}
          {activeTab === 'Security' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Security & Authentication Policy</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Enforce two-factor authentication, session timeout durations, and audit log tracking.
                  </p>
                </div>
                <button 
                  onClick={() => handleSaveTab('Security')}
                  className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                >
                  Save Security
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* 2FA Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Mandatory 2FA for Super Admin Roles</p>
                    <p className="text-slate-400 font-medium mt-0.5">Require authenticator apps (TOTP) for all administrative accounts</p>
                  </div>
                  <button 
                    onClick={() => {
                      const next = !securityForm.enforce2FA;
                      setSecurityForm({ ...securityForm, enforce2FA: next });
                      triggerToast(`Mandatory 2FA set to ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      securityForm.enforce2FA ? 'bg-[#1E56F0]' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                      securityForm.enforce2FA ? 'translate-x-4.5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                {/* Audit Logging Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Immutable Audit Logging</p>
                    <p className="text-slate-400 font-medium mt-0.5">Log all administrative actions, data edits, and authorization events</p>
                  </div>
                  <button 
                    onClick={() => {
                      const next = !securityForm.auditLogging;
                      setSecurityForm({ ...securityForm, auditLogging: next });
                      triggerToast(`Audit logging ${next ? 'Enabled' : 'Disabled'}`, 'info');
                    }}
                    className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      securityForm.auditLogging ? 'bg-[#1E56F0]' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                      securityForm.auditLogging ? 'translate-x-4.5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Session Timeout (Minutes)</label>
                    <input 
                      type="number" 
                      value={securityForm.sessionTimeout}
                      onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeout: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Password Expiry (Days)</label>
                    <input 
                      type="number" 
                      value={securityForm.passwordExpiry}
                      onChange={(e) => setSecurityForm({ ...securityForm, passwordExpiry: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Failed Login Attempts</label>
                    <input 
                      type="number" 
                      value={securityForm.maxLoginAttempts}
                      onChange={(e) => setSecurityForm({ ...securityForm, maxLoginAttempts: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS & ALERTS */}
          {activeTab === 'Notifications' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Platform Alerts & Webhooks</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Configure broadcast notification channels, system alerts, and real-time webhook endpoints.
                  </p>
                </div>
                <button 
                  onClick={() => handleSaveTab('Notifications')}
                  className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                >
                  Save Notifications
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Email Notification Triggers</p>
                    <p className="text-slate-400 font-medium mt-0.5">Send instant email alerts for new signups and failed payments</p>
                  </div>
                  <button 
                    onClick={() => {
                      const next = !notificationsForm.emailAlerts;
                      setNotificationsForm({ ...notificationsForm, emailAlerts: next });
                      triggerToast(`Email notifications ${next ? 'Enabled' : 'Disabled'}`, 'info');
                    }}
                    className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      notificationsForm.emailAlerts ? 'bg-[#1E56F0]' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                      notificationsForm.emailAlerts ? 'translate-x-4.5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">System Alert Webhook Endpoint URL</label>
                  <input 
                    type="text" 
                    value={notificationsForm.webhookUrl}
                    onChange={(e) => setNotificationsForm({ ...notificationsForm, webhookUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Critical Escalation Email Address</label>
                  <input 
                    type="email" 
                    value={notificationsForm.criticalEmail}
                    onChange={(e) => setNotificationsForm({ ...notificationsForm, criticalEmail: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENT GATEWAY INTEGRATION */}
          {activeTab === 'Payments' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Payment Gateway Settings</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Connect online payment processors (Razorpay / Stripe) and configure currency settlements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleTestPaymentGateway}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap size={14} className="text-amber-500" />
                    <span>Test Connection</span>
                  </button>
                  <button 
                    onClick={() => handleSaveTab('Payments')}
                    className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                  >
                    Save Gateway
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveTab('Payments'); }} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Payment Provider</label>
                    <select 
                      value={paymentsForm.gateway}
                      onChange={(e) => setPaymentsForm({ ...paymentsForm, gateway: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none cursor-pointer focus:border-blue-500 transition"
                    >
                      <option value="Razorpay">Razorpay (India - UPI/Cards)</option>
                      <option value="Stripe">Stripe (Global Credit Cards)</option>
                      <option value="Paytm">Paytm Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Environment Mode</label>
                    <select 
                      value={paymentsForm.environment}
                      onChange={(e) => setPaymentsForm({ ...paymentsForm, environment: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none cursor-pointer focus:border-blue-500 transition"
                    >
                      <option value="Live Production">Live Production Mode</option>
                      <option value="Sandbox Test">Sandbox Test Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Base Currency</label>
                    <select 
                      value={paymentsForm.currency}
                      onChange={(e) => setPaymentsForm({ ...paymentsForm, currency: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none cursor-pointer focus:border-blue-500 transition"
                    >
                      <option value="INR (₹)">INR (₹ Indian Rupee)</option>
                      <option value="USD ($)">USD ($ US Dollar)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">API Key ID *</label>
                    <input 
                      type="text" 
                      required
                      value={paymentsForm.razorpayKeyId}
                      onChange={(e) => setPaymentsForm({ ...paymentsForm, razorpayKeyId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">API Webhook Secret *</label>
                    <input 
                      type="password" 
                      required
                      value={paymentsForm.razorpaySecret}
                      onChange={(e) => setPaymentsForm({ ...paymentsForm, razorpaySecret: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: SYSTEM & MAINTENANCE */}
          {activeTab === 'System' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Platform Maintenance & Health</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Clear system cache, trigger manual database backups, and inspect platform build info.
                  </p>
                </div>
                <button 
                  onClick={() => handleSaveTab('System')}
                  className="px-4 py-2 bg-[#1E56F0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                >
                  Save System
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Clear Cache Card */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={18} className="text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-xs">Purge Application Cache</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Clear stored Redis key-value cache, compiled templates, and temporary session tokens.
                  </p>
                  <button 
                    onClick={handleClearCache}
                    className="mt-2 w-full py-2 bg-white border border-slate-200 hover:bg-slate-100 font-bold rounded-xl text-xs text-slate-700 transition cursor-pointer"
                  >
                    Clear Platform Cache
                  </button>
                </div>

                {/* Database Backup Card */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Database size={18} className="text-emerald-600" />
                    <h3 className="font-extrabold text-slate-900 text-xs">Manual Database Backup</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Generate an immediate SQL snapshot backup of organizations, bids, and billing logs.
                  </p>
                  <button 
                    onClick={handleBackupDatabase}
                    className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                  >
                    Generate Backup SQL
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1 text-xs">
                <p className="font-extrabold text-slate-900">System Build & Environment Info</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">App Version</span>
                    <span className="font-bold text-slate-800">v2.4.0-build.82</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">React Core</span>
                    <span className="font-bold text-slate-800">v19.0.0</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vite Engine</span>
                    <span className="font-bold text-slate-800">v8.0.13</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Server Uptime</span>
                    <span className="font-bold text-emerald-600">99.98% (42 days)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
