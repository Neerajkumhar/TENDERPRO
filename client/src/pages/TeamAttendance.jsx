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
  Users
} from 'lucide-react';

const TeamAttendance = ({ user }) => {
  const [view, setView] = useState('MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Expanded rows state to toggle details for specific user + date rows
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (userId, date) => {
    const key = `${userId}_${date}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Live ticking clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [rawRecords, setRawRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Close date picker popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch all department attendance records dynamically
  const fetchDepartmentAttendance = async () => {
    if (!user?.departmentId) {
      setLoadingRecords(false);
      return;
    }
    try {
      const res = await fetch(`/api/auth/attendance/department/${user.departmentId}`);
      if (res.ok) {
        const data = await res.json();
        // Map backend model format to UI structure
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
            id: item.id,
            userId: item.userId,
            name: item.User?.name || 'Unknown Member',
            email: item.User?.email || '',
            role: item.User?.role || 'Core Team',
            joiningDate: item.User?.createdAt || '2026-05-14',
            date: dateStr,
            session: idx + 1,
            in: inTimeStr,
            out: outTimeStr,
            inTimeRaw: item.inTime,
            outTimeRaw: item.outTime,
            workMin: item.workMin || 0,
            work: workHoursText,
            status: item.status || 'ON TIME'
          };
        });

        setRawRecords(formatted);
      }
    } catch (err) {
      console.error("Error loading department attendance:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchDepartmentAttendance();
  }, [user?.departmentId]);

  // Compute daily stats summary for the selected/today's date
  const getDepartmentStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = rawRecords.filter(r => r.date === todayStr);

    // 1. Total checked-in present members today
    const uniquePresentToday = new Set(todayRecords.map(r => r.userId));
    const totalPresent = uniquePresentToday.size;

    // 2. Active online right now (checked in today but has not checked out yet)
    const activeOnlineCount = todayRecords.filter(r => r.in !== '--' && r.out === '--').length;

    // 3. Late arrivals count today
    const uniqueLateToday = new Set(todayRecords.filter(r => r.status === 'LATE').map(r => r.userId));
    const totalLate = uniqueLateToday.size;

    // 4. On Time Rate today
    const onTimeRate = totalPresent > 0 
      ? Math.round(((totalPresent - totalLate) / totalPresent) * 100)
      : 100;

    // 5. Leave applications (mock count for department)
    const pendingLeaves = 3;

    return [
      { label: "PRESENT TODAY", value: `${totalPresent} Members`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "ACTIVE ONLINE", value: `${activeOnlineCount} Online`, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "LATE TODAY", value: `${totalLate} Late`, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
      { label: "ON-TIME RATE", value: `${onTimeRate}%`, icon: CalendarDays, color: "text-purple-500", bg: "bg-purple-50" },
      { label: "PENDING LEAVES", value: `${pendingLeaves} Requests`, icon: Coffee, color: "text-amber-500", bg: "bg-amber-50" },
      { label: "DEPT MEMBERS", value: "8 Teammates", icon: User, color: "text-indigo-500", bg: "bg-indigo-50" },
    ];
  };

  const stats = getDepartmentStats();

  // Helper to format minutes to "Xh Ym"
  const formatMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  // Helper to get daily session summaries for calendar display (showing count of present members)
  const getDayPresenceCount = (dayNum) => {
    const targetDate = `2026-05-${String(dayNum).padStart(2, '0')}`;
    const dayRecords = rawRecords.filter(r => r.date === targetDate);
    const uniqueUserIds = new Set(dayRecords.map(r => r.userId));
    return uniqueUserIds.size;
  };

  // Process and compute layout rows depending on DAY view vs. WEEK/MONTH views
  const processedRecords = (() => {
    let filtered = [...rawRecords];

    // Filter by name or email query if present
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let rangeFiltered = filtered;
    if (view === 'DAY') {
      const targetDate = `2026-05-${String(selectedDay).padStart(2, '0')}`;
      rangeFiltered = filtered.filter(r => r.date === targetDate);
    } else if (view === 'WEEK') {
      rangeFiltered = filtered.filter(r => {
        const recordDay = parseInt(r.date.split('-')[2], 10);
        return Math.abs(recordDay - selectedDay) <= 3;
      });
    } else {
      // MONTH view date range filter
      rangeFiltered = filtered.filter(r => {
        const sDate = new Date(r.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return sDate >= start && sDate <= end;
      });
    }

    // Now group by userId so there is exactly one row per employee in the table
    const userGroups = {};
    rangeFiltered.forEach(r => {
      if (!userGroups[r.userId]) {
        userGroups[r.userId] = [];
      }
      userGroups[r.userId].push(r);
    });

    return Object.keys(userGroups).map(userId => {
      const userRecords = userGroups[userId];
      const earliestRecord = [...userRecords].sort((a, b) => new Date(a.joiningDate) - new Date(b.joiningDate))[0] || {};
      
      if (view === 'DAY') {
        // DAY view: Group sessions on this single day
        const earliest = [...userRecords].sort((a, b) => {
          if (!a.inTimeRaw) return 1;
          if (!b.inTimeRaw) return -1;
          return new Date(a.inTimeRaw) - new Date(b.inTimeRaw);
        })[0];

        const latest = [...userRecords].sort((a, b) => {
          if (!a.outTimeRaw) return 1;
          if (!b.outTimeRaw) return -1;
          return new Date(b.outTimeRaw) - new Date(a.outTimeRaw);
        })[0];

        const totalWork = userRecords.reduce((sum, curr) => sum + curr.workMin, 0);
        const hasLate = userRecords.some(s => s.status === 'LATE');

        return {
          userId: earliestRecord.userId,
          name: earliestRecord.name,
          email: earliestRecord.email,
          role: earliestRecord.role,
          date: earliestRecord.date,
          in: earliest.in,
          out: latest.out || '--',
          work: formatMinutes(totalWork),
          status: hasLate ? 'LATE' : 'ON TIME',
          sessionNum: userRecords.length,
          allSessions: userRecords.map(u => ({ ...u, sessionNum: 1 })),
          type: 'DAY'
        };
      } else {
        // WEEK or MONTH view: Group by date to form DAYS for dropdown list
        const daysMap = {};
        userRecords.forEach(r => {
          if (!daysMap[r.date]) daysMap[r.date] = [];
          daysMap[r.date].push(r);
        });

        const sortedDates = Object.keys(daysMap).sort((a, b) => new Date(b) - new Date(a));
        const dayRows = sortedDates.map(dateStr => {
          const sessions = daysMap[dateStr];
          const earliest = [...sessions].sort((a, b) => {
            if (!a.inTimeRaw) return 1;
            if (!b.inTimeRaw) return -1;
            return new Date(a.inTimeRaw) - new Date(b.inTimeRaw);
          })[0];

          const latest = [...sessions].sort((a, b) => {
            if (!a.outTimeRaw) return 1;
            if (!b.outTimeRaw) return -1;
            return new Date(b.outTimeRaw) - new Date(a.outTimeRaw);
          })[0];

          const totalWork = sessions.reduce((sum, curr) => sum + curr.workMin, 0);
          const hasLate = sessions.some(s => s.status === 'LATE');

          return {
            date: dateStr,
            in: earliest.in,
            out: latest.out || '--',
            work: formatMinutes(totalWork),
            status: hasLate ? 'LATE' : 'ON TIME',
            sessionNum: sessions.length
          };
        });

        const totalWorkAllDays = userRecords.reduce((sum, curr) => sum + curr.workMin, 0);
        const lateDaysCount = dayRows.filter(d => d.status === 'LATE').length;
        const totalDaysCount = dayRows.length;
        const latePercentage = totalDaysCount > 0 ? Math.round((lateDaysCount / totalDaysCount) * 100) : 0;

        return {
          userId: earliestRecord.userId,
          name: earliestRecord.name,
          email: earliestRecord.email,
          role: earliestRecord.role,
          date: view === 'WEEK' ? 'Active Week' : 'Active Month',
          in: dayRows[0]?.in || '--', // Recent check-in
          out: dayRows[0]?.out || '--', // Recent check-out
          work: formatMinutes(totalWorkAllDays),
          status: latePercentage > 0 ? `${latePercentage}% LATE` : 'ON TIME',
          sessionNum: totalDaysCount, // present days count
          allSessions: dayRows,
          type: 'RANGE'
        };
      }
    }).sort((a, b) => a.name.localeCompare(b.name));
  })();

  // CSV Report Exporter
  const handleExportReport = () => {
    const csvRows = [
      ['Teammate Name', 'Teammate Email', 'Role', 'Date', view === 'DAY' ? 'Sessions Count' : 'Days Present', 'Clock In', 'Clock Out', 'Work Hours', 'Status'],
      ...processedRecords.map(r => [
        r.name, 
        r.email,
        r.role,
        r.date, 
        r.type === 'DAY' ? `${r.sessionNum} Logins` : `${r.sessionNum} Days Present`,
        r.in, 
        r.out, 
        r.work, 
        r.status
      ])
    ];

    const csvContent = csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TenderPro_Department_Attendance_${view}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatRangeText = (start, end) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const sStr = new Date(start).toLocaleDateString('en-US', options);
    const eStr = new Date(end).toLocaleDateString('en-US', options);
    return `${sStr} - ${eStr}`.toUpperCase();
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Team Attendance Panel</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Department-wide real-time tracking, login logs auditing, and attendance sheets
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 px-6 py-4 rounded-2xl text-white shadow-lg shrink-0 border border-slate-800">
          <Clock size={20} className="text-blue-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">REAL TIME TIMER</span>
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
            placeholder="Search team member name or email..."
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

            {/* Popover */}
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
                      setStartDate('2026-05-14');
                      setEndDate('2026-05-19');
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

      {/* Stats Panel */}
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

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
        
        {/* Attendance Log Table */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-10 px-2">
               <div className="flex flex-col">
                  <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">DEPT ATTENDANCE LOG ({view})</h3>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1.5">
                    {processedRecords.length} records matching the current layout window
                  </p>
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
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">TEAMMATE</th>
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {view === 'DAY' ? 'DATE' : 'RANGE'}
                        </th>
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {view === 'DAY' ? 'LOGINS' : 'DAYS PRESENT'}
                        </th>
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {view === 'DAY' ? 'IN-TIME' : 'RECENT IN'}
                        </th>
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {view === 'DAY' ? 'OUT-TIME' : 'RECENT OUT'}
                        </th>
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {view === 'DAY' ? 'WORKED' : 'TOTAL WORKED'}
                        </th>
                        <th className="text-left pb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">STATUS</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loadingRecords ? (
                       <tr>
                         <td colSpan="7" className="py-12 text-center text-xs font-black uppercase text-slate-400 tracking-widest italic animate-pulse">
                           Querying MySQL Database logs...
                         </td>
                       </tr>
                     ) : processedRecords.length === 0 ? (
                       <tr>
                         <td colSpan="7" className="py-12 text-center text-xs font-black uppercase text-slate-400 tracking-widest italic">
                           No attendance records logged for this day
                         </td>
                       </tr>
                     ) : (
                       processedRecords.map((record, i) => {
                         const initial = record.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
                         const key = `${record.userId}_${record.date}`;
                         const isExpanded = !!expandedRows[key];
                         return (
                           <React.Fragment key={i}>
                             <tr 
                               className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                               onClick={() => toggleRow(record.userId, record.date)}
                             >
                                <td className="py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white shadow-sm transition-all group-hover:scale-110">
                                         {initial}
                                      </div>
                                      <div className="flex flex-col">
                                         <div className="flex items-center gap-2">
                                           <span className="text-sm font-black text-slate-800 uppercase tracking-tight hover:text-blue-600 transition-colors">
                                             {record.name}
                                           </span>
                                           <span className="text-[7px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md leading-none animate-bounce">
                                             {isExpanded ? '▲' : '▼'}
                                           </span>
                                         </div>
                                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{record.role}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-6 text-sm font-bold text-slate-500">
                                  {record.type === 'DAY' 
                                    ? new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </td>
                                <td className="py-6 text-sm font-black text-slate-600">
                                  <span className="bg-slate-50 px-3 py-1.5 rounded-xl uppercase tracking-widest text-[9px] font-black">
                                    {record.type === 'DAY' 
                                      ? `${record.sessionNum} ${record.sessionNum === 1 ? 'Login' : 'Logins'}`
                                      : `${record.sessionNum} ${record.sessionNum === 1 ? 'Day' : 'Days'}`}
                                  </span>
                                </td>
                                <td className="py-6 text-sm font-black text-slate-900">{record.in}</td>
                                <td className="py-6 text-sm font-black text-slate-900">{record.out}</td>
                                <td className="py-6 text-sm font-black text-slate-900">{record.work}</td>
                                <td className="py-6">
                                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                     record.status.includes('LATE') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                   }`}>
                                      {record.status}
                                    </span>
                                </td>
                             </tr>

                             {/* Dropdown Session Details Section */}
                             {isExpanded && (
                               <tr className="bg-slate-50/50">
                                 <td colSpan="7" className="p-6 border-l-4 border-blue-500">
                                   <div className="space-y-4 animate-in slide-in-from-top-1 duration-300">
                                     <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">
                                       {record.type === 'DAY' 
                                         ? `Detailed Login / Logout Session Logs for ${record.name} on ${new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                         : `Daily Attendance Breakdown for ${record.name} during this ${view === 'WEEK' ? 'Week' : 'Month'}`}
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                       {record.allSessions.map((item, idx) => (
                                         <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                                           <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                               {record.type === 'DAY' 
                                                 ? `Session #${idx + 1}`
                                                 : new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                             </span>
                                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                               item.status.includes('LATE') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                             }`}>{item.status}</span>
                                           </div>
                                           <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                             <div className="flex items-center gap-1.5">
                                               <span className="text-emerald-500">In:</span>
                                               <span>{item.in}</span>
                                             </div>
                                             <div className="flex items-center gap-1.5">
                                               <span className="text-rose-500">Out:</span>
                                               <span>{item.out}</span>
                                             </div>
                                           </div>
                                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between pt-1">
                                             <span>{record.type === 'DAY' ? 'WORK HOURS' : `WORKED (${item.sessionNum} ${item.sessionNum === 1 ? 'Login' : 'Logins'})`}</span>
                                             <span className="text-slate-700 font-bold">
                                               {item.work}
                                             </span>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 </td>
                               </tr>
                             )}
                           </React.Fragment>
                         );
                       })
                     )}
                  </tbody>
               </table>
            </div>
        </div>

        {/* Dynamic Sidebar Calendar */}
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
                    const presenceCount = getDayPresenceCount(dayNum);
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedDay(dayNum);
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
                         
                         {presenceCount > 0 ? (
                           <div className="flex flex-col items-center mt-1">
                             <span className="bg-emerald-50 px-1 rounded text-[7px] font-black text-emerald-600 uppercase tracking-tighter leading-none">
                               {presenceCount} P
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
                        <span className="text-slate-400">CALENDAR LEGEND</span>
                     </div>
                     <span className="text-slate-900 font-bold"># P = Present Members</span>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAttendance;
