import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

const Approvals = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Leaves');
  const [leaves, setLeaves] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const leavesEndpoint = user?.role === 'Admin' 
        ? '/api/leave-requests' 
        : `/api/leave-requests/department/${user?.departmentId}`;

      const [leavesRes, expensesRes] = await Promise.all([
        fetch(leavesEndpoint),
        fetch('/api/expenses')
      ]);

      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        // Filter for Pending only
        setLeaves(leavesData.filter(l => l.status === 'Pending'));
      }
      
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        // Filter for PENDING only
        setExpenses(expensesData.filter(e => e.status === 'PENDING'));
      }
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
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

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[#f8fafc] min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-blue-600" size={32} />
            Pending Approvals
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm">
            Review and manage all pending requests across the platform.
          </p>
        </div>
        <button 
          onClick={fetchApprovals}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : 'text-slate-400'} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('Leaves')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'Leaves' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Leave Requests ({leaves.length})
          {activeTab === 'Leaves' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('Expenses')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'Expenses' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Expenses ({expenses.length})
          {activeTab === 'Expenses' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-[10px] uppercase tracking-widest">Fetching items...</p>
          </div>
        ) : activeTab === 'Leaves' ? (
          leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 opacity-50 bg-white rounded-3xl border border-dashed border-slate-200">
              <Calendar size={64} strokeWidth={1} />
              <p className="font-black text-[10px] uppercase tracking-widest">No pending leave requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaves.map((request) => (
                <div key={request.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border-2 border-white shadow-sm overflow-hidden shrink-0">
                      {request.User?.image ? <img src={request.User.image} alt="" className="w-full h-full object-cover" /> : request.User?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-4">
                      <h4 className="font-black text-slate-900 tracking-tight truncate uppercase">{request.User?.name || 'Unknown User'}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{request.User?.role || 'Employee'}</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                        <p className="text-xs font-black text-slate-700">
                          {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                        <AlertCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Type & Reason</p>
                        <p className="text-xs font-bold text-slate-600 italic">
                          <span className="text-slate-900 font-black not-italic">{request.leaveType}: </span>
                          "{request.reason || 'No reason provided'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => handleLeaveAction(request.id, 'Approved')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleLeaveAction(request.id, 'Rejected')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4 opacity-50 bg-white rounded-3xl border border-dashed border-slate-200">
              <Wallet size={64} strokeWidth={1} />
              <p className="font-black text-[10px] uppercase tracking-widest">No pending expenses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight uppercase text-lg">{expense.category}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {expense.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{parseFloat(expense.amount).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Expense Date</p>
                        <p className="text-xs font-black text-slate-700">
                          {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm">
                        <UserIcon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vendor / Description</p>
                        <p className="text-xs font-bold text-slate-600 italic">
                          <span className="text-slate-900 font-black not-italic">{expense.vendor}: </span>
                          "{expense.description || 'No description provided'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => handleExpenseAction(expense, 'APPROVED')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleExpenseAction(expense, 'REJECTED')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm active:scale-95"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
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
