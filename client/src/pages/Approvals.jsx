import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  User as UserIcon,
  RefreshCw,
  FileText,
  Lock,
  Flag,
  Download,
  Search,
  ExternalLink,
  Loader2,
  Clock,
  Layers
} from 'lucide-react';

const Approvals = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Leaves');
  const [leaves, setLeaves] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [docRequests, setDocRequests] = useState([]);
  const [tenderCompletions, setTenderCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection state
  const [rejectingTenderId, setRejectingTenderId] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');

  const fetchApprovals = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const leavesEndpoint = user?.role === 'Admin' 
        ? '/api/leave-requests' 
        : `/api/leave-requests/department/${user?.departmentId}`;

      const [leavesRes, expensesRes, docRequestsRes, tendersRes] = await Promise.all([
        fetch(leavesEndpoint),
        fetch('/api/expenses'),
        fetch('/api/doc-requests'),
        fetch('/api/tenders')
      ]);

      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData.filter(l => l.status === 'Pending'));
      }
      
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData.filter(e => e.status === 'PENDING'));
      }

      if (docRequestsRes.ok) {
        const docReqData = await docRequestsRes.json();
        setDocRequests(docReqData);
      }

      if (tendersRes.ok) {
        let tendersData = await tendersRes.json();
        tendersData = tendersData.map(t => {
          if (typeof t.completionDocuments === 'string') {
            try {
              let parsed = JSON.parse(t.completionDocuments);
              if (typeof parsed === 'string') parsed = JSON.parse(parsed);
              t.completionDocuments = parsed;
            } catch(e) {
              t.completionDocuments = {};
            }
          }
          return t;
        });
        setTenderCompletions(tendersData.filter(t => t.status === 'Under Review'));
      }
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();

    const intervalId = setInterval(() => {
      fetchApprovals(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleLeaveAction = async (id, status) => {
    try {
      const response = await fetch(`/api/leave-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approverId: user?.id })
      });
      if (response.ok) {
        setLeaves(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to update leave status:', err);
    }
  };

  const handleExpenseAction = async (expense, status) => {
    try {
      const payload = { ...expense, status };
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setExpenses(prev => prev.filter(e => e.id !== expense.id));
      }
    } catch (err) {
      console.error('Failed to update expense status:', err);
    }
  };

  const handleDocRequestAction = async (id, status) => {
    try {
      const response = await fetch(`/api/doc-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setDocRequests(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to update document request status:', err);
    }
  };

  const handleTenderAction = async (id, action) => {
    if (action === 'reject' && rejectingTenderId !== id) {
      setRejectingTenderId(id);
      setRejectRemark('');
      return;
    }
    
    if (action === 'cancel-reject') {
      setRejectingTenderId(null);
      setRejectRemark('');
      return;
    }

    try {
      const endpoint = action === 'approve' ? 'approve-completion' : 'reject-completion';
      const response = await fetch(`/api/tenders/${id}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'reject' ? JSON.stringify({ reason: rejectRemark || 'Completion requirements not met.' }) : null
      });
      if (response.ok) {
        setTenderCompletions(prev => prev.filter(t => t.id !== id));
        if (action === 'reject') {
          setRejectingTenderId(null);
          setRejectRemark('');
        }
      }
    } catch (err) {
      console.error('Failed to update tender completion status:', err);
    }
  };

  const totalInQueue = leaves.length + expenses.length + docRequests.length + tenderCompletions.length;

  const stats = [
    { label: 'Pending Leaves', value: leaves.length, color: 'text-blue-600' },
    { label: 'Pending Expenses', value: expenses.length, color: 'text-indigo-600' },
    { label: 'Document Requests', value: docRequests.length, color: 'text-amber-500' },
    { label: 'Tender Completions', value: tenderCompletions.length, color: 'text-rose-500' },
    { label: 'Total In Queue', value: totalInQueue, color: 'text-slate-900' },
  ];

  const tabs = [
    { id: 'Leaves', label: 'Leaves', count: leaves.length },
    { id: 'Expenses', label: 'Expenses', count: expenses.length },
    { id: 'Documents', label: 'Docs', count: docRequests.length },
    { id: 'Tenders', label: 'Tenders', count: tenderCompletions.length }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-left">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" size={18} />
            <span>Approvals Queue</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Review and authorize pending leave requests, team expenses, document locks, and tender completions.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => fetchApprovals(true)}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9.5px] font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-blue-600' : 'text-slate-400'} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <span className={`text-sm sm:text-base font-extrabold tracking-tight block leading-none ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200/80 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-2xs' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-extrabold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-1">
        {loading && totalInQueue === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <p className="font-bold text-[8.5px] uppercase tracking-wider">Fetching authorization queue...</p>
          </div>
        ) : activeTab === 'Leaves' ? (
          leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-1.5 bg-white rounded-xl border border-dashed border-slate-200">
              <Calendar size={28} strokeWidth={1.5} className="text-slate-300" />
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400">No pending leave requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {leaves.map((request) => (
                <div key={request.id} className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 overflow-hidden shrink-0">
                        {request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 tracking-tight truncate uppercase text-[10.5px]">{request.User?.name || 'Unknown User'}</h4>
                        <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">{request.User?.role || 'Employee'}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-0.5 bg-white rounded text-blue-500 shadow-2xs shrink-0">
                          <Calendar size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Duration</p>
                          <p className="text-[9.5px] font-bold text-slate-700 truncate">
                            {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-0.5 bg-white rounded text-amber-500 shadow-2xs shrink-0 mt-0.5">
                          <AlertCircle size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Type &amp; Reason</p>
                          <p className="text-[9.5px] text-slate-600 font-medium line-clamp-2">
                            <span className="text-slate-800 font-bold">{request.leaveType}: </span>
                            "{request.reason || 'No reason provided'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleLeaveAction(request.id, 'Approved')}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-blue-600 text-white rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
                    >
                      <CheckCircle2 size={11} />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleLeaveAction(request.id, 'Rejected')}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-all shadow-2xs active:scale-95"
                    >
                      <XCircle size={11} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'Expenses' ? (
          expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-1.5 bg-white rounded-xl border border-dashed border-slate-200">
              <Wallet size={28} strokeWidth={1.5} className="text-slate-300" />
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400">No pending expenses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 pr-1">
                        <h4 className="font-bold text-slate-900 tracking-tight uppercase text-[11px] truncate">{expense.category}</h4>
                        <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">ID: #{expense.id?.toString().slice(0, 6)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">₹{parseFloat(expense.amount).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-0.5 bg-white rounded text-blue-500 shadow-2xs shrink-0">
                          <Calendar size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Expense Date</p>
                          <p className="text-[9.5px] font-bold text-slate-700 truncate">
                            {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-0.5 bg-white rounded text-indigo-500 shadow-2xs shrink-0 mt-0.5">
                          <UserIcon size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Vendor / Info</p>
                          <p className="text-[9.5px] text-slate-600 font-medium line-clamp-2">
                            <span className="text-slate-800 font-bold">{expense.vendor}: </span>
                            "{expense.description || 'No description'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleExpenseAction(expense, 'APPROVED')}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-blue-600 text-white rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
                    >
                      <CheckCircle2 size={11} />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleExpenseAction(expense, 'REJECTED')}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-all shadow-2xs active:scale-95"
                    >
                      <XCircle size={11} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'Documents' ? (
          docRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-1.5 bg-white rounded-xl border border-dashed border-slate-200">
              <FileText size={28} strokeWidth={1.5} className="text-slate-300" />
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400">No pending document requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {docRequests.map((request) => (
                <div key={request.id} className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 overflow-hidden shrink-0">
                        {request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 pr-1">
                        <h4 className="font-bold text-slate-800 tracking-tight truncate uppercase text-[10.5px]">{request.User?.name || 'Unknown User'}</h4>
                        <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">{request.User?.role || 'User'}</p>
                      </div>
                      <div className="p-1 bg-rose-50 text-rose-500 rounded shrink-0">
                        <Lock size={11} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-0.5 bg-white rounded text-blue-500 shadow-2xs shrink-0">
                          <FileText size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Document Name</p>
                          <p className="text-[9.5px] font-bold text-slate-700 truncate">{request.documentName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="p-0.5 bg-white rounded text-indigo-500 shadow-2xs shrink-0 mt-0.5">
                          <ClipboardCheck size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Tender Info</p>
                          <p className="text-[9.5px] font-bold text-slate-700 truncate">{request.Tender?.reference || 'REF: N/A'}</p>
                          <p className="text-[8.5px] text-slate-500 truncate">{request.Tender?.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleDocRequestAction(request.id, 'Approved')}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-blue-600 text-white rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
                    >
                      <CheckCircle2 size={11} />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleDocRequestAction(request.id, 'Rejected')}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-all shadow-2xs active:scale-95"
                    >
                      <XCircle size={11} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          tenderCompletions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-1.5 bg-white rounded-xl border border-dashed border-slate-200">
              <Flag size={28} strokeWidth={1.5} className="text-slate-300" />
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400">No pending tender completions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {tenderCompletions.map((tender) => (
                <div key={tender.id} className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Flag size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 tracking-tight truncate uppercase text-[10.5px]">{tender.title}</h4>
                        <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">{tender.reference || 'REF: N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Attached Documents</p>
                      <div className="space-y-1">
                        {[
                          { label: 'Delivery Challan', url: tender.completionDocuments?.deliveryChallan },
                          { label: 'E-way Bill', url: tender.completionDocuments?.ewayBill },
                          { label: 'Invoice', url: tender.completionDocuments?.invoice },
                          { label: 'Installation Challan', url: tender.completionDocuments?.installationChallan },
                          { label: 'NOC', url: tender.completionDocuments?.noc },
                        ].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-1 bg-slate-50 rounded-md border border-slate-100">
                            <span className="text-[8.5px] font-medium text-slate-600 truncate mr-1">{doc.label}</span>
                            {doc.url ? (
                              <a href={doc.url} target="_blank" rel="noreferrer" className="px-1.5 py-0.2 flex items-center gap-0.5 text-[7.5px] font-bold uppercase tracking-wider text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded transition-colors shrink-0">
                                <ExternalLink size={9} />
                                <span>View</span>
                              </a>
                            ) : (
                              <span className="text-[7.5px] font-bold text-rose-400 uppercase shrink-0">Missing</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                    {rejectingTenderId === tender.id ? (
                      <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <textarea
                          placeholder="Rejection remark (optional)"
                          value={rejectRemark}
                          onChange={(e) => setRejectRemark(e.target.value)}
                          className="w-full text-[10px] p-1.5 rounded-lg border border-rose-200 focus:outline-none focus:border-rose-400 bg-rose-50/30 placeholder:text-rose-300 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleTenderAction(tender.id, 'cancel-reject')}
                            className="flex-1 py-1 bg-slate-100 text-slate-600 rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleTenderAction(tender.id, 'reject')}
                            className="flex-1 py-1 bg-rose-600 text-white rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-rose-700 transition-all shadow-2xs"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleTenderAction(tender.id, 'approve')}
                          className="flex-1 flex items-center justify-center gap-1 py-1 bg-blue-600 text-white rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95"
                        >
                          <CheckCircle2 size={11} />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => handleTenderAction(tender.id, 'reject')}
                          className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-all shadow-2xs active:scale-95"
                        >
                          <XCircle size={11} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Approvals;
