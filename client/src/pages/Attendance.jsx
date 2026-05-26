import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Coffee,
  CalendarDays,
  XCircle,
  Clock3
} from 'lucide-react';

const Attendance = ({ user }) => {
  const [view, setView] = useState('MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Live ticking clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Leave Request Form States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [userLeaveRequests, setUserLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const fetchUserLeaveRequests = async () => {
    if (!user?.id) return;
    setLoadingLeaves(true);
    try {
      const res = await fetch(`/api/leave-requests/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserLeaveRequests(data);
      }
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // Raw database of multiple login/logout dashboard sessions for self (Sarah/logged-in user)
  const sessionsDatabase = [
    // May 14th sessions (3 logins)
    { date: "2026-05-14", session: 1, in: "09:02 AM", out: "01:00 PM", workMin: 238, status: "ON TIME" },
    { date: "2026-05-14", session: 2, in: "01:45 PM", out: "04:30 PM", workMin: 165, status: "ON TIME" },
    { date: "2026-05-14", session: 3, in: "05:00 PM", out: "06:05 PM", workMin: 65, status: "ON TIME" },

    // May 13th sessions (2 logins)
    { date: "2026-05-13", session: 1, in: "09:05 AM", out: "01:30 PM", workMin: 265, status: "ON TIME" },
    { date: "2026-05-13", session: 2, in: "02:30 PM", out: "06:00 PM", workMin: 210, status: "ON TIME" },

    // May 12th sessions (1 login)
    { date: "2026-05-12", session: 1, in: "09:05 AM", out: "06:00 PM", workMin: 535, status: "ON TIME" },

    // May 11th sessions (2 logins)
    { date: "2026-05-11", session: 1, in: "09:01 AM", out: "12:30 PM", workMin: 209, status: "ON TIME" },
    { date: "2026-05-11", session: 2, in: "01:30 PM", out: "06:00 PM", workMin: 270, status: "ON TIME" },

    // May 10th sessions (1 login - late)
    { date: "2026-05-10", session: 1, in: "09:15 AM", out: "06:00 PM", workMin: 525, status: "LATE" },

    // May 8th sessions (1 login)
    { date: "2026-05-08", session: 1, in: "09:03 AM", out: "06:00 PM", workMin: 537, status: "ON TIME" },

    // May 5th sessions (2 logins)
    { date: "2026-05-05", session: 1, in: "09:02 AM", out: "01:00 PM", workMin: 238, status: "ON TIME" },
    { date: "2026-05-05", session: 2, in: "02:00 PM", out: "06:02 PM", workMin: 242, status: "ON TIME" },

    // May 2nd sessions (1 login - late)
    { date: "2026-05-02", session: 1, in: "09:30 AM", out: "06:00 PM", workMin: 510, status: "LATE" },
  ];

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Close picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch real backend login/logout sessions dynamically
  useEffect(() => {
    const fetchRealAttendance = async () => {
      if (!user?.id) {
        setLoadingSessions(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/attendance/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Map backend model format to UI sessions structure
          const formatted = data.map((item, idx) => {
            const dateStr = item.date;
            
            // Format times beautifully
            const formatTime = (isoString) => {
              if (!isoString) return '--';
              const date = new Date(isoString);
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            };

            const inTimeStr = formatTime(item.inTime);
            const outTimeStr = formatTime(item.outTime);
            const workHoursText = item.workMin ? `${Math.floor(item.workMin / 60)}h ${String(item.workMin % 60).padStart(2, '0')}m` : '--';

            return {
              date: dateStr,
              session: idx + 1,
              in: inTimeStr,
              out: outTimeStr,
              workMin: item.workMin || 0,
              work: workHoursText,
              status: item.status || 'ON TIME'
            };
          });

          setSessions(formatted);
        }
      } catch (err) {
        console.error("Error loading real database sessions:", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchRealAttendance();
    fetchUserLeaveRequests();
  }, [user?.id]);

  // Parse stats from real database logs, falling back to mock values if no database records exist
  const getDynamicStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRealSessions = sessions.filter(s => s.date === todayStr);

    if (sessions.length === 0) {
      // Return high-fidelity mock starting stats
      return [
        { label: "TODAY'S STATUS", value: "Present", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "CLOCK IN TIME", value: "09:02 AM", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "CLOCK OUT TIME", value: "06:05 PM", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "TOTAL HOURS", value: "9h 03m", icon: CalendarDays, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "LATE COUNT", value: "2", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
        { label: "LEAVE BALANCE", value: "18 days", icon: User, color: "text-amber-500", bg: "bg-amber-50" },
      ];
    }

    const hasRealToday = todayRealSessions.length > 0;
    
    // Sort today's sessions by in-time
    const parseTime = (tStr) => {
      if (!tStr || tStr === '--') return 0;
      const [time, period] = tStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const sortedToday = [...todayRealSessions].sort((a, b) => parseTime(a.in) - parseTime(b.in));

    const clockInVal = hasRealToday ? sortedToday[0].in : "--";
    const clockOutVal = (hasRealToday && sortedToday[sortedToday.length - 1].out !== '--') 
      ? sortedToday[sortedToday.length - 1].out 
      : "--";

    const totalMinutes = todayRealSessions.reduce((acc, curr) => acc + (curr.workMin || 0), 0);
    const totalHoursVal = hasRealToday 
      ? `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}m`
      : "--";

    const statusVal = hasRealToday ? "Present" : "Absent";
    const lateSessions = sessions.filter(s => s.status === 'LATE');

    return [
      { label: "TODAY'S STATUS", value: statusVal, icon: CheckCircle2, color: statusVal === "Present" ? "text-emerald-500" : "text-slate-400", bg: "bg-emerald-50" },
      { label: "CLOCK IN TIME", value: clockInVal, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "CLOCK OUT TIME", value: clockOutVal, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
      { label: "TOTAL HOURS", value: totalHoursVal, icon: CalendarDays, color: "text-purple-500", bg: "bg-purple-50" },
      { label: "LATE COUNT", value: lateSessions.length.toString(), icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
      { label: "LEAVE BALANCE", value: "18 days", icon: User, color: "text-amber-500", bg: "bg-amber-50" },
    ];
  };

  const stats = getDynamicStats();

  const getDaySessionTimes = (dayNum) => {
    const targetDate = `2026-05-${String(dayNum).padStart(2, '0')}`;
    const dayRecords = [...sessions, ...sessionsDatabase].filter(s => s.date === targetDate);
    
    if (dayRecords.length === 0) return null;

    // Filter out sessions that occur BEFORE the teammate's real joining date!
    const joiningDate = user?.createdAt ? new Date(user.createdAt) : new Date("2026-05-14");
    const jDateOnly = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
    const sParts = targetDate.split('-');
    const sDateOnly = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
    
    if (sDateOnly < jDateOnly) return null;

    const parseTime = (tStr) => {
      if (!tStr || tStr === '--') return 9999;
      const [time, period] = tStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const sortedByIn = [...dayRecords].sort((a, b) => parseTime(a.in) - parseTime(b.in));
    const sortedByOut = [...dayRecords].sort((a, b) => parseTime(a.out) - parseTime(b.out));

    return {
      in: sortedByIn[0]?.in || '--',
      out: sortedByOut[sortedByOut.length - 1]?.out || '--'
    };
  };

  const getDynamicStatsSummary = () => {
    // 1. Get all unique dates with attendance records
    const allRecords = [...sessions, ...sessionsDatabase];
    
    // Filter out sessions that occur BEFORE the teammate's real joining date!
    const joiningDate = user?.createdAt ? new Date(user.createdAt) : new Date("2026-05-14");
    const jDateOnly = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());

    const filteredRecords = allRecords.filter(r => {
      const parts = r.date.split('-');
      const rDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return rDate >= jDateOnly;
    });

    const uniquePresentDates = new Set(filteredRecords.map(r => r.date));
    const presentDaysCount = uniquePresentDates.size;

    // 2. Calculate absent days starting from joining date up to today (May 19th)
    const today = new Date();
    const tDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let absentDaysCount = 0;
    
    // Iterate from joining date up to today (inclusive)
    let iterDate = new Date(jDateOnly);
    while (iterDate <= tDateOnly) {
      const dayOfWeek = iterDate.getDay();
      // Only count weekdays (Mon-Fri) as potential working days
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const year = iterDate.getFullYear();
        const month = String(iterDate.getMonth() + 1).padStart(2, '0');
        const day = String(iterDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // If they did not attend on this weekday, they were absent!
        if (!uniquePresentDates.has(dateStr)) {
          absentDaysCount++;
        }
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }

    return {
      present: presentDaysCount,
      absent: absentDaysCount
    };
  };

  const summaryStats = getDynamicStatsSummary();

  // Resolve self identity dynamically
  const selfName = user?.name || "Sarah Jensen";
  const selfInitial = selfName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  // Helper to format minutes to "Xh Ym"
  const formatMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  // Process and compute layout rows depending on DAY view vs. WEEK/MONTH views
  const processedRecords = (() => {
    let baseSessions = [...sessions, ...sessionsDatabase];

    // Logically filter out mock database sessions prior to the user's actual joining date
    const joiningDate = user?.createdAt ? new Date(user.createdAt) : new Date("2026-05-14");
    const jDateOnly = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());

    baseSessions = baseSessions.filter(s => {
      const sParts = s.date.split('-');
      const sDateOnly = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
      return sDateOnly >= jDateOnly;
    });

    // Filter by Search Query if present
    if (searchQuery) {
      baseSessions = baseSessions.filter(() => selfName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (view === 'DAY') {
      // In DAY view: Show each individual login session for the selected day
      const targetDate = `2026-05-${String(selectedDay).padStart(2, '0')}`;
      const daySessions = baseSessions.filter(s => s.date === targetDate);
      return daySessions.map(s => ({
        name: selfName,
        initial: selfInitial,
        date: s.date,
        in: s.in,
        out: s.out,
        work: formatMinutes(s.workMin),
        status: s.status,
        sColor: s.status === 'LATE' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
        isSessionView: true,
        sessionNum: s.session
      }));
    } else {
      // WEEK & MONTH views: Aggregate all login sessions for a single day into one single day row
      let filteredSessions = baseSessions;
      if (view === 'WEEK') {
        filteredSessions = baseSessions.filter(s => {
          const recordDay = parseInt(s.date.split('-')[2], 10);
          return Math.abs(recordDay - selectedDay) <= 3;
        });
      } else {
        // MONTH view date range filter
        filteredSessions = baseSessions.filter(s => {
          const sDate = new Date(s.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return sDate >= start && sDate <= end;
        });
      }

      // Group sessions of the same day together
      const grouped = {};
      filteredSessions.forEach(s => {
        if (!grouped[s.date]) grouped[s.date] = [];
        grouped[s.date].push(s);
      });

      const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

      return sortedDates.map(dateStr => {
        const daySessions = grouped[dateStr];

        // Parse time helper to sort times for earliest and latest bounds
        const parseTime = (tStr) => {
          const [time, period] = tStr.split(' ');
          let [h, m] = time.split(':').map(Number);
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };

        const sortedByIn = [...daySessions].sort((a, b) => parseTime(a.in) - parseTime(b.in));
        const sortedByOut = [...daySessions].sort((a, b) => parseTime(a.out) - parseTime(b.out));

        const earliestIn = sortedByIn[0]?.in || '--';
        const latestOut = sortedByOut[sortedByOut.length - 1]?.out || '--';
        const totalWork = daySessions.reduce((sum, curr) => sum + curr.workMin, 0);
        const hasLate = daySessions.some(s => s.status === 'LATE');

        return {
          name: selfName,
          initial: selfInitial,
          date: dateStr,
          in: earliestIn,
          out: latestOut,
          work: formatMinutes(totalWork),
          status: hasLate ? 'LATE' : 'ON TIME',
          sColor: hasLate ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
          isSessionView: false,
          sessionNum: daySessions.length // Total session count for the day
        };
      });
    }
  })();

  // Direct CSV Export capability
  const handleExportReport = () => {
    const csvRows = [
      ['Teammate Name', 'Date', view === 'DAY' ? 'Session' : 'Total Sessions', 'Clock In', 'Clock Out', 'Work Hours', 'Status'],
      ...processedRecords.map(r => [
        r.name, 
        r.date, 
        view === 'DAY' ? `Session #${r.sessionNum}` : `${r.sessionNum} Logins`,
        r.in, 
        r.out, 
        r.work, 
        r.status
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `TenderPro_Attendance_Report_${view}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Convert dates to human readable string format
  const formatRangeText = (start, end) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const sStr = new Date(start).toLocaleDateString('en-US', options);
    const eStr = new Date(end).toLocaleDateString('en-US', options);
    return `${sStr} - ${eStr}`.toUpperCase();
  };

  function renderLeaveModal() {
    if (!showLeaveModal) return null;
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { if (!isSubmittingLeave) setShowLeaveModal(false); }}></div>
        <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* Success State Overlay */}
          {leaveSubmitted ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-6 bg-white min-h-[450px]">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center border border-emerald-100 shadow-md animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Request Submitted!</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto text-center">
                  Your leave request for <span className="font-black text-slate-800">{leaveType}</span> has been logged and forwarded to your manager for approval.
                </p>
              </div>
              <button 
                onClick={() => {
                  setLeaveSubmitted(false);
                  setShowLeaveModal(false);
                  setLeaveStart('');
                  setLeaveEnd('');
                  setLeaveReason('');
                  fetchUserLeaveRequests();
                }}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shadow-sm">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Request Time Off</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Submit request for manager review</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all border border-slate-100 shadow-sm cursor-pointer"
                >
                  <ChevronRight size={18} className="rotate-45" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user?.id) return;
                  setIsSubmittingLeave(true);
                  setLeaveError('');
                  try {
                    const response = await fetch('/api/leave-requests', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user.id,
                        leaveType,
                        startDate: leaveStart,
                        endDate: leaveEnd,
                        reason: leaveReason
                      })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      setLeaveSubmitted(true);
                    } else {
                      setLeaveError(data.message || data.error || 'Failed to submit leave request');
                    }
                  } catch (err) {
                    console.error('Failed to submit leave request:', err);
                    setLeaveError('Network error. Please try again later.');
                  } finally {
                    setIsSubmittingLeave(false);
                  }
                }}
                className="p-8 space-y-6"
              >
                {/* Error Alert */}
                {leaveError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in zoom-in-95">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-tight">{leaveError}</p>
                  </div>
                )}

                {/* Leave Type Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Annual Leave', desc: 'Vacation time' },
                      { label: 'Sick Leave', desc: 'Medical emergency' },
                      { label: 'Casual Leave', desc: 'Personal errands' },
                      { label: 'Unpaid Leave', desc: 'Special exceptions' },
                    ].map((item) => (
                      <div 
                        key={item.label}
                        onClick={() => setLeaveType(item.label)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02]
                          ${leaveType === item.label 
                            ? 'border-blue-500 bg-blue-50/20 text-blue-600 hover:border-blue-500' 
                            : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                          }`}
                      >
                        <span className="text-xs font-black uppercase tracking-tight">{item.label}</span>
                        <span className="text-[9px] font-bold text-slate-400 mt-1">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Reason Textarea */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Description</label>
                  <textarea 
                    required
                    placeholder="Please explain the reason for your time-off request..."
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400 resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingLeave ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Logging Request...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Premium Dynamic Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Attendance Dashboard</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Real-time checking, login session tracking, and leave management
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 px-6 py-4 rounded-2xl text-white shadow-lg shrink-0 border border-slate-800">
          <Clock size={20} className="text-blue-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">REAL TIME CLOCK</span>
            <span className="text-xs font-black tracking-widest leading-none mt-1.5 text-emerald-400 font-mono">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search for attendance or records"
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          {/* Active Date Range Trigger */}
          <div className="relative" ref={datePickerRef}>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-3 bg-white hover:bg-slate-50 transition-colors px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm text-xs font-black text-slate-600 uppercase tracking-widest cursor-pointer"
            >
               <CalendarIcon size={18} className="text-blue-500" />
               <span>{formatRangeText(startDate, endDate)}</span>
            </button>

            {/* Premium Date Range Popover */}
            {showDatePicker && (
              <div className="absolute right-0 mt-3 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[60] w-80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between pb-1 border-b border-slate-50">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Configure Date Window</h4>
                  <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Filter</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => {
                      setStartDate('2026-05-08');
                      setEndDate('2026-05-14');
                      setShowDatePicker(false);
                    }}
                    className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[9px] font-black text-slate-600 rounded-lg uppercase tracking-widest transition-all"
                  >
                    Last 7 Days
                  </button>
                  <button 
                    onClick={() => {
                      setStartDate('2026-05-01');
                      setEndDate('2026-05-31');
                      setShowDatePicker(false);
                    }}
                    className="py-2.5 bg-slate-50 hover:bg-slate-100 text-[9px] font-black text-slate-600 rounded-lg uppercase tracking-widest transition-all"
                  >
                    This Month
                  </button>
                </div>

                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-[9px] font-black text-white rounded-xl uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Apply Filter Window
                </button>
              </div>
            )}
          </div>

          {/* View Tab Selector */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-50 shadow-sm">
             {['MONTH', 'WEEK', 'DAY'].map(t => (
                <button 
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer
                    ${view === t ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.replace('text', 'bg')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
             <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
        
        {/* Main Attendance List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm">
              <div className="flex justify-between items-center mb-10 px-2">
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">DAILY VIEW ({view})</h3>
                    {view === 'DAY' && (
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1.5">
                        {processedRecords.length} Dashboard {processedRecords.length === 1 ? 'Login' : 'Logins'} Today
                      </p>
                    )}
                </div>
                <button 
                  onClick={handleExportReport}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer transition-all shadow-sm"
                >
                    <Download size={16} />
                    <span>EXPORT REPORT</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-50">
                          <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">NAME</th>
                          <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">DATE</th>
                          {view === 'DAY' ? (
                            <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">SESSION</th>
                          ) : (
                            <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">TOTAL LOGINS</th>
                          )}
                          <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">IN-TIME</th>
                          <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">OUT-TIME</th>
                          <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">{view === 'DAY' ? 'SESSION WORK' : 'TOTAL WORK'}</th>
                          <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {processedRecords.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-xs font-black uppercase text-slate-400 tracking-widest italic">
                            No attendance records found matching this window
                          </td>
                        </tr>
                      ) : (
                        processedRecords.map((record, i) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white shadow-sm transition-all group-hover:scale-110">
                                      {record.initial}
                                    </div>
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{record.name}</span>
                                </div>
                              </td>
                              <td className="py-6 text-sm font-bold text-slate-500">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              {view === 'DAY' ? (
                                <td className="py-6 text-sm font-black text-blue-600">
                                  <span className="bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-widest text-[9px] font-black">
                                    Session #{record.sessionNum}
                                  </span>
                                </td>
                              ) : (
                                <td className="py-6 text-sm font-black text-slate-600">
                                  <span className="bg-slate-50 px-3 py-1.5 rounded-xl uppercase tracking-widest text-[9px] font-black">
                                    {record.sessionNum} {record.sessionNum === 1 ? 'Login' : 'Logins'}
                                  </span>
                                </td>
                              )}
                              <td className="py-6 text-sm font-black text-slate-900">{record.in}</td>
                              <td className="py-6 text-sm font-black text-slate-900">{record.out}</td>
                              <td className="py-6 text-sm font-black text-slate-900">{record.work}</td>
                              <td className="py-6">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${record.sColor}`}>
                                    {record.status}
                                  </span>
                              </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                </table>
              </div>
          </div>

          {/* User's Leave Requests History */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">My Leave Requests</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">
                  Track the status of your time-off applications
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Coffee size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {loadingLeaves ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-black text-[9px] uppercase tracking-widest">Loading history...</p>
                </div>
              ) : userLeaveRequests.length === 0 ? (
                <div className="py-12 text-center text-xs font-black uppercase text-slate-300 tracking-widest italic border-2 border-dashed border-slate-50 rounded-[2rem]">
                  No leave applications found
                </div>
              ) : (
                userLeaveRequests.map((request) => (
                  <div key={request.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm 
                        ${request.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                          request.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 
                          'bg-amber-100 text-amber-600'}`}>
                        {request.status === 'Approved' ? <CheckCircle2 size={24} /> : 
                         request.status === 'Rejected' ? <XCircle size={24} /> : 
                         <Clock3 size={24} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{request.leaveType}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <CalendarIcon size={12} className="text-blue-500" />
                            {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="flex-1 md:text-right">
                         <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm
                          ${request.status === 'Approved' ? 'bg-emerald-500 text-white shadow-emerald-100' : 
                            request.status === 'Rejected' ? 'bg-rose-500 text-white shadow-rose-100' : 
                            'bg-amber-500 text-white shadow-amber-100'}`}>
                          {request.status}
                        </span>
                        {request.managerComment && (
                          <p className="text-[9px] font-bold text-slate-400 mt-2 italic">"{request.managerComment}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Calendar Sidebar */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm flex flex-col items-center">
               <div className="flex justify-between items-center w-full mb-10 px-2">
                  <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 transition-colors"><ChevronLeft size={20} /></button>
                  <span className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">MAY 2026</span>
                  <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 transition-colors"><ChevronRight size={20} /></button>
               </div>

               <div className="grid grid-cols-7 gap-y-8 w-full">
                  {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                    <span key={d} className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">{d}</span>
                  ))}
                  
                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected = dayNum === selectedDay;
                    const dayTimes = getDaySessionTimes(dayNum);
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedDay(dayNum);
                          // Sync active start/end date context for convenience
                          const padDay = String(dayNum).padStart(2, '0');
                          setStartDate(`2026-05-${padDay}`);
                          setEndDate(`2026-05-${padDay}`);
                        }}
                        className={`flex flex-col items-center p-2 rounded-2xl group cursor-pointer border transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 shadow-sm scale-105' 
                            : 'bg-white border-transparent hover:bg-slate-50'
                        }`}
                      >
                         <span className={`text-xs font-black transition-all ${
                           isSelected ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'
                         }`}>
                           {dayNum}
                         </span>
                         
                         {dayTimes ? (
                           <div className="flex flex-col items-center mt-1 space-y-0.5">
                             {/* Clock In */}
                             <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter leading-none">
                               {dayTimes.in.replace(' AM', 'a').replace(' PM', 'p')}
                             </span>
                             {/* Clock Out */}
                             <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter leading-none">
                               {dayTimes.out.replace(' AM', 'a').replace(' PM', 'p')}
                             </span>
                           </div>
                         ) : (
                           <div className="w-1 h-1 rounded-full bg-slate-200 mt-2"></div>
                         )}
                      </div>
                    );
                  })}
               </div>

               <div className="mt-12 w-full pt-8 border-t border-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-slate-400">JOINING DATE</span>
                     </div>
                     <span className="text-slate-900">
                       {user?.createdAt 
                         ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                         : 'MAY 1, 2026'}
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-400">PRESENT DAYS</span>
                     </div>
                     <span className="text-slate-900">{summaryStats.present}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-slate-400">ABSENT DAYS</span>
                     </div>
                     <span className="text-slate-900">{summaryStats.absent}</span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all">
               <div className="absolute -right-4 -bottom-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Coffee size={120} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">LEAVE REQUEST</p>
               <h4 className="text-xl font-black tracking-tight uppercase leading-tight mb-6">Plan your next time off.</h4>
               <button 
                 onClick={() => setShowLeaveModal(true)}
                 className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl cursor-pointer"
               >
                  APPLY NOW
               </button>
            </div>
        </div>
      </div>

      {renderLeaveModal()}
    </div>
  );
};

export default Attendance;
