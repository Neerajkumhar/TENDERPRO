import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExportModal from '../components/ExportModal';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  CalendarDays, 
  Users 
} from 'lucide-react';

const TeamAttendance = ({ user }) => {
  const [view, setView] = useState('MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed

  const getFormattedDate = (date) => {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - (offset * 60 * 1000));
    return local.toISOString().split('T')[0];
  };

  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [startDate, setStartDate] = useState(() => getFormattedDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [endDate, setEndDate] = useState(() => getFormattedDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Expanded rows state
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
  const [deptMemberCount, setDeptMemberCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);

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
        const formatted = data.map((item, idx) => {
          const dateStr = item.date;
          
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
            joiningDate: item.User?.createdAt || new Date().toISOString().split('T')[0],
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

  const fetchDepartmentStats = async () => {
    try {
      const membersRes = await fetch('/api/members');
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const deptId = user?.departmentId;
        const filtered = deptId 
          ? membersData.filter(m => m.departmentId === deptId) 
          : membersData;
        setDeptMemberCount(filtered.length);
      }
    } catch (err) {
      console.error("Error loading department members count:", err);
    }

    try {
      const deptId = user?.departmentId;
      const url = deptId 
        ? `/api/leave-requests/department/${deptId}`
        : '/api/leave-requests';
      const leavesRes = await fetch(url);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        const pendingCount = leavesData.filter(l => l.status === 'Pending').length;
        setPendingLeavesCount(pendingCount);
      }
    } catch (err) {
      console.error("Error loading pending leaves count:", err);
    }
  };

  useEffect(() => {
    fetchDepartmentAttendance();
    fetchDepartmentStats();
  }, [user?.departmentId]);

  // Compute daily stats summary
  const getDepartmentStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = rawRecords.filter(r => r.date === todayStr);

    const uniquePresentToday = new Set(todayRecords.map(r => r.userId));
    const totalPresent = uniquePresentToday.size;

    const activeOnlineCount = todayRecords.filter(r => r.in !== '--' && r.out === '--').length;

    const uniqueLateToday = new Set(todayRecords.filter(r => r.status === 'LATE').map(r => r.userId));
    const totalLate = uniqueLateToday.size;

    const onTimeRate = totalPresent > 0 
      ? Math.round(((totalPresent - totalLate) / totalPresent) * 100)
      : 100;

    return [
      { label: "PRESENT TODAY", value: `${totalPresent}`, subtext: "Checked In", color: "text-blue-600" },
      { label: "ACTIVE ONLINE", value: `${activeOnlineCount}`, subtext: "Live Now", color: "text-blue-600" },
      { label: "LATE TODAY", value: `${totalLate}`, subtext: "Arrivals", color: "text-rose-600" },
      { label: "ON-TIME RATE", value: `${onTimeRate}%`, subtext: "Punctuality", color: "text-indigo-600" },
      { label: "PENDING LEAVES", value: `${pendingLeavesCount}`, subtext: "Requests", color: "text-amber-500" },
      { label: "DEPT MEMBERS", value: `${deptMemberCount}`, subtext: "Total Team", color: "text-slate-900" },
    ];
  };

  const stats = getDepartmentStats();

  const formatMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  const getDayPresenceCount = (dayNum) => {
    const targetDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayRecords = rawRecords.filter(r => r.date === targetDate);
    const uniqueUserIds = new Set(dayRecords.map(r => r.userId));
    return uniqueUserIds.size;
  };

  // Process rows
  const processedRecords = (() => {
    let filtered = [...rawRecords];

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let rangeFiltered = filtered;
    if (view === 'DAY') {
      const targetDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      rangeFiltered = filtered.filter(r => r.date === targetDate);
    } else if (view === 'WEEK') {
      rangeFiltered = filtered.filter(r => {
        const recordDay = parseInt(r.date.split('-')[2], 10);
        return Math.abs(recordDay - selectedDay) <= 3;
      });
    } else {
      rangeFiltered = filtered.filter(r => {
        const sDate = new Date(r.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return sDate >= start && sDate <= end;
      });
    }

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
          in: dayRows[0]?.in || '--',
          out: dayRows[0]?.out || '--',
          work: formatMinutes(totalWorkAllDays),
          status: latePercentage > 0 ? `${latePercentage}% LATE` : 'ON TIME',
          sessionNum: totalDaysCount,
          allSessions: dayRows,
          type: 'RANGE'
        };
      }
    }).sort((a, b) => a.name.localeCompare(b.name));
  })();

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const exportData = rawRecords.filter(r => {
      const rDate = new Date(r.date);
      return rDate >= start && rDate <= end;
    });

    if (exportData.length === 0) {
      alert("No team attendance records found for the selected time period.");
      return;
    }

    const filename = `Team_Attendance_${startDate}_to_${endDate}`;

    if (format === 'csv') {
      const csvRows = [
        ['Teammate Name', 'Teammate Email', 'Role', 'Date', 'Clock In', 'Clock Out', 'Status'],
        ...exportData.map(r => [r.name, r.email, r.role, r.date, r.in, r.out, r.status])
      ];
      const csvContent = csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'xlsx') {
      const exportRows = exportData.map(r => ({
        "Name": r.name,
        "Email": r.email,
        "Role": r.role,
        "Date": r.date,
        "Clock In": r.in,
        "Clock Out": r.out,
        "Status": r.status
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Team Attendance");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Team Attendance Report", 14, 18);
      doc.setFontSize(9);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 25);
      
      const rows = exportData.map(r => [r.name, r.date, r.in, r.out, r.status]);
      autoTable(doc, {
        startY: 30,
        head: [["Name", "Date", "In", "Out", "Status"]],
        body: rows,
      });
      doc.save(`${filename}.pdf`);
    }
  };

  const formatRangeText = (start, end) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const sStr = new Date(start).toLocaleDateString('en-US', options);
    const eStr = new Date(end).toLocaleDateString('en-US', options);
    return `${sStr} - ${eStr}`;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <span>Team Attendance Panel</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Department-wide real-time tracking and login logs auditing</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg text-white shadow-2xs shrink-0">
          <Clock size={12} className="text-blue-400 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-bold text-slate-400 uppercase">Live:</span>
            <span className="text-[10px] font-bold tracking-wider text-blue-400 font-mono">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-auto">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight block leading-none ${stat.color}`}>{stat.value}</span>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase">{stat.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input 
            type="text" 
            placeholder="Search member name..."
            className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 outline-none focus:border-blue-500 shadow-2xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 justify-end">
          {/* Active Date Range Trigger */}
          <div className="relative" ref={datePickerRef}>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-[9.5px] font-bold text-slate-700 uppercase tracking-wider"
            >
               <CalendarIcon size={12} className="text-blue-600" />
               <span>{formatRangeText(startDate, endDate)}</span>
            </button>

            {/* Popover */}
            {showDatePicker && (
              <div className="absolute right-0 mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-64 space-y-2.5 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Date Range</h4>
                  <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Filter</span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      const d7 = new Date();
                      d7.setDate(d7.getDate() - 7);
                      setStartDate(getFormattedDate(d7));
                      setEndDate(getFormattedDate(new Date()));
                      setShowDatePicker(false);
                    }}
                    className="py-1 bg-slate-50 hover:bg-slate-100 text-[8.5px] font-bold text-slate-600 rounded uppercase"
                  >
                    Last 7 Days
                  </button>
                  <button 
                    onClick={() => {
                      setStartDate(getFormattedDate(new Date(currentYear, currentMonth, 1)));
                      setEndDate(getFormattedDate(new Date(currentYear, currentMonth + 1, 0)));
                      setShowDatePicker(false);
                    }}
                    className="py-1 bg-slate-50 hover:bg-slate-100 text-[8.5px] font-bold text-slate-600 rounded uppercase"
                  >
                    This Month
                  </button>
                </div>

                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-[9px] font-bold text-white rounded-lg uppercase tracking-wider"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* View Tab Selector */}
          <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
             {['MONTH', 'WEEK', 'DAY'].map(t => (
                <button 
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer
                    ${view === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 pb-6">
        
        {/* Attendance Log Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight uppercase">Attendance Log ({view})</h3>
                  <p className="text-[8.5px] text-slate-500 font-medium">
                    {processedRecords.length} records matching current filter
                  </p>
               </div>
               <button 
                 onClick={() => setIsExportModalOpen(true)}
                 className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9.5px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
               >
                  <Download size={12} />
                  <span>Export</span>
               </button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[650px]">
                  <thead>
                     <tr className="bg-slate-50/50 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-3.5 py-2">Teammate</th>
                        <th className="px-3.5 py-2">{view === 'DAY' ? 'Date' : 'Range'}</th>
                        <th className="px-3.5 py-2">{view === 'DAY' ? 'Logins' : 'Days Present'}</th>
                        <th className="px-3.5 py-2">{view === 'DAY' ? 'In-Time' : 'Recent In'}</th>
                        <th className="px-3.5 py-2">{view === 'DAY' ? 'Out-Time' : 'Recent Out'}</th>
                        <th className="px-3.5 py-2">{view === 'DAY' ? 'Worked' : 'Total Worked'}</th>
                        <th className="px-3.5 py-2">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                     {loadingRecords ? (
                       <tr>
                         <td colSpan="7" className="py-8 text-center text-xs font-semibold text-slate-400 italic">
                           Loading attendance logs...
                         </td>
                       </tr>
                     ) : processedRecords.length === 0 ? (
                       <tr>
                         <td colSpan="7" className="py-8 text-center text-xs font-medium text-slate-400 italic">
                           No attendance records found for this period.
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
                               className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                               onClick={() => toggleRow(record.userId, record.date)}
                             >
                                <td className="px-3.5 py-2">
                                   <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                                         {initial}
                                      </div>
                                      <div className="min-w-0">
                                         <div className="flex items-center gap-1.5">
                                           <span className="font-bold text-slate-800 hover:text-blue-600 transition-colors truncate max-w-[130px]">
                                             {record.name}
                                           </span>
                                           <span className="text-[7px] text-blue-500 font-bold bg-blue-50 px-1 py-0.2 rounded">
                                             {isExpanded ? '▲' : '▼'}
                                           </span>
                                         </div>
                                         <span className="text-[8px] text-slate-400 uppercase truncate block">{record.role}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-3.5 py-2 text-slate-600 font-medium whitespace-nowrap">
                                  {record.type === 'DAY' 
                                    ? new Date(record.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                                    : `${new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
                                </td>
                                <td className="px-3.5 py-2">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[8.5px] font-bold uppercase">
                                    {record.type === 'DAY' 
                                      ? `${record.sessionNum} Log`
                                      : `${record.sessionNum} Days`}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2 font-bold text-slate-800">{record.in}</td>
                                <td className="px-3.5 py-2 font-bold text-slate-800">{record.out}</td>
                                <td className="px-3.5 py-2 font-extrabold text-slate-900">{record.work}</td>
                                <td className="px-3.5 py-2">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                     record.status.includes('LATE') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                   }`}>
                                      {record.status}
                                   </span>
                                </td>
                             </tr>

                             {/* Expanded Session Details */}
                             {isExpanded && (
                               <tr className="bg-slate-50/60">
                                 <td colSpan="7" className="p-3 border-l-2 border-blue-500">
                                   <div className="space-y-2">
                                     <div className="text-[8.5px] font-bold text-blue-600 uppercase tracking-wider">
                                       {record.type === 'DAY' 
                                         ? `Login Session Logs for ${record.name}`
                                         : `Daily Breakdown for ${record.name}`}
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                       {record.allSessions.map((item, idx) => (
                                         <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                                           <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                             <span className="text-[8px] font-bold text-slate-400 uppercase">
                                               {record.type === 'DAY' 
                                                 ? `Session #${idx + 1}`
                                                 : new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                             </span>
                                             <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase ${
                                               item.status.includes('LATE') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                             }`}>{item.status}</span>
                                           </div>
                                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                             <span>In: {item.in}</span>
                                             <span>Out: {item.out}</span>
                                           </div>
                                           <div className="text-[7.5px] font-bold text-slate-400 uppercase flex items-center justify-between pt-0.5">
                                             <span>Worked:</span>
                                             <span className="text-slate-800 font-extrabold">{item.work}</span>
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

        {/* Sidebar Mini Calendar */}
        <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
               <div className="flex justify-between items-center w-full mb-3 px-1">
                  <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-600"><ChevronLeft size={14} /></button>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-600"><ChevronRight size={14} /></button>
               </div>

               <div className="grid grid-cols-7 gap-1 w-full text-center">
                  {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                    <span key={d} className="text-[8px] font-bold text-slate-400 uppercase">{d}</span>
                  ))}
                  
                  {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected = dayNum === selectedDay;
                    const presenceCount = getDayPresenceCount(dayNum);
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedDay(dayNum);
                          const padDay = String(dayNum).padStart(2, '0');
                          const padMonth = String(currentMonth + 1).padStart(2, '0');
                          const newD = `${currentYear}-${padMonth}-${padDay}`;
                          setStartDate(newD);
                          setEndDate(newD);
                        }}
                        className={`flex flex-col items-center py-1 rounded-lg cursor-pointer border transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-transparent hover:bg-slate-50'
                        }`}
                      >
                         <span className={`text-[10px] font-bold ${
                           isSelected ? 'text-blue-600' : 'text-slate-600'
                         }`}>
                           {dayNum}
                         </span>
                         
                         {presenceCount > 0 ? (
                           <span className="text-[6.5px] font-bold text-blue-600 leading-none mt-0.5">
                             {presenceCount}P
                           </span>
                         ) : (
                           <div className="w-1 h-1 rounded-full bg-slate-200 mt-1"></div>
                         )}
                      </div>
                    );
                  })}
               </div>

               <div className="mt-3 w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] font-semibold text-slate-400 uppercase">
                  <span>Legend:</span>
                  <span className="text-blue-600 font-bold">#P = Present Members</span>
               </div>
            </div>
        </div>
      </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExportReport}
        title="Export Team Attendance"
      />
    </div>
  );
};

export default TeamAttendance;
