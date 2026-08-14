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
  Plus,
  X,
  FileText,
  Send
} from 'lucide-react';

const Attendance = ({ user = {} }) => {
  const [view, setView] = useState('MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Leave Form State
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState('');

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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchAllAttendance = async () => {
    try {
      const res = await fetch(`/api/auth/attendance/all/records`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item, idx) => {
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
            date: item.date,
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
      console.error("Error loading global attendance:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveFormData.startDate || !leaveFormData.endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    setSubmittingLeave(true);
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 1,
          leaveType: leaveFormData.leaveType,
          startDate: leaveFormData.startDate,
          endDate: leaveFormData.endDate,
          reason: leaveFormData.reason
        })
      });
      if (response.ok) {
        setLeaveSuccessMsg('Leave request submitted successfully!');
        setTimeout(() => {
          setLeaveSuccessMsg('');
          setIsLeaveModalOpen(false);
          setLeaveFormData({
            leaveType: 'Annual Leave',
            startDate: '',
            endDate: '',
            reason: ''
          });
        }, 1200);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit leave request');
      }
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      alert('Error submitting leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const getGlobalStats = () => {
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

    const totalUsersSet = new Set(rawRecords.map(r => r.userId));
    const totalUsers = totalUsersSet.size || 12;

    return [
      { label: "PRESENT TODAY", value: `${totalPresent}`, subtext: "Checked In", icon: CheckCircle2, color: "text-blue-600", light: "bg-blue-50" },
      { label: "ACTIVE ONLINE", value: `${activeOnlineCount}`, subtext: "In Session", icon: Clock, color: "text-amber-500", light: "bg-amber-50" },
      { label: "LATE TODAY", value: `${totalLate}`, subtext: "Delayed", icon: AlertCircle, color: "text-rose-500", light: "bg-rose-50" },
      { label: "ON-TIME RATE", value: `${onTimeRate}%`, subtext: "Compliance", icon: CalendarDays, color: "text-blue-600", light: "bg-blue-50" },
      { label: "PENDING LEAVES", value: `5`, subtext: "To Review", icon: Coffee, color: "text-amber-500", light: "bg-amber-50" },
      { label: "TOTAL MEMBERS", value: `${totalUsers}`, subtext: "Registered", icon: User, color: "text-indigo-500", light: "bg-indigo-50" },
    ];
  };

  const stats = getGlobalStats();

  const formatMinutes = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  const getDayPresenceCount = (dayNum) => {
    const targetDate = `2026-05-${String(dayNum).padStart(2, '0')}`;
    const dayRecords = rawRecords.filter(r => r.date === targetDate);
    const uniqueUserIds = new Set(dayRecords.map(r => r.userId));
    return uniqueUserIds.size;
  };

  const processedRecords = (() => {
    let filtered = [...rawRecords];

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase())
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
          in: earliest?.in || '--',
          out: latest?.out || '--',
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
            in: earliest?.in || '--',
            out: latest?.out || '--',
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
      alert("No attendance records found for the selected period.");
      return;
    }

    const filename = `Attendance_${startDate}_to_${endDate}`;

    if (format === 'csv') {
      const csvRows = [
        ['Member Name', 'Member Email', 'Role', 'Date', 'Clock In', 'Clock Out', 'Status'],
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Attendance Report", 14, 15);
      doc.setFontSize(9);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);
      
      const rows = exportData.map(r => [r.name, r.date, r.in, r.out, r.status]);
      autoTable(doc, {
        startY: 26,
        head: [["Name", "Date", "In", "Out", "Status"]],
        body: rows,
        styles: { fontSize: 8 }
      });
      doc.save(`${filename}.pdf`);
    }
  };

  const formatRangeText = (start, end) => {
    const options = { month: 'short', day: 'numeric' };
    const sStr = new Date(start).toLocaleDateString('en-US', options);
    const eStr = new Date(end).toLocaleDateString('en-US', options);
    return `${sStr} - ${eStr}`.toUpperCase();
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-3.5 animate-in fade-in duration-500 bg-[#f8fafc] min-h-screen text-left overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <span>Attendance Log & Records</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Real-time attendance logs, session breakdown, and shift times</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>Apply Leave</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg text-white shadow-2xs shrink-0">
            <Clock size={13} className="text-blue-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none">Live Time</span>
              <span className="text-[10.5px] font-extrabold tracking-wider leading-none mt-0.5 text-blue-400 font-mono">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Stats */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">{stat.label}</span>
                <div className={`p-1 rounded ${stat.light} ${stat.color}`}>
                  <IconComp size={11} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase">{stat.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header Search & View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input 
            type="text" 
            placeholder="Search member, email..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 shadow-2xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Active Date Range Trigger */}
          <div className="relative" ref={datePickerRef}>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-slate-700 uppercase tracking-wider cursor-pointer"
            >
               <CalendarIcon size={12} className="text-blue-500" />
               <span>{formatRangeText(startDate, endDate)}</span>
            </button>

            {/* Popover */}
            {showDatePicker && (
              <div className="absolute right-0 mt-1.5 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-72 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase">Filter Window</span>
                  <span className="text-[7.5px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">Range</span>
                </div>
                
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setStartDate('2026-05-14');
                      setEndDate('2026-05-19');
                      setShowDatePicker(false);
                    }}
                    className="py-1 bg-slate-50 hover:bg-slate-100 text-[8px] font-bold text-slate-600 rounded uppercase tracking-wider"
                  >
                    Last 7 Days
                  </button>
                  <button 
                    onClick={() => {
                      setStartDate('2026-05-01');
                      setEndDate('2026-05-31');
                      setShowDatePicker(false);
                    }}
                    className="py-1 bg-slate-50 hover:bg-slate-100 text-[8px] font-bold text-slate-600 rounded uppercase tracking-wider"
                  >
                    This Month
                  </button>
                </div>

                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-[9px] font-bold text-white rounded-lg uppercase tracking-wider transition-all shadow-2xs"
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
                    ${view === t ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* Attendance Log Table (Span 8) */}
        <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
               <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Attendance Log ({view})</h3>
                  <p className="text-[8.5px] text-slate-500 font-medium">{processedRecords.length} records matching current view</p>
               </div>
               <button 
                 onClick={() => setIsExportModalOpen(true)}
                 className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 rounded-lg text-[9.5px] font-bold text-slate-700 uppercase tracking-wider cursor-pointer transition-all shadow-2xs"
               >
                  <Download size={11} />
                  <span>Export</span>
               </button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-100 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2 px-2">Member</th>
                        <th className="py-2 px-2">{view === 'DAY' ? 'Date' : 'Range'}</th>
                        <th className="py-2 px-2">{view === 'DAY' ? 'Logins' : 'Days'}</th>
                        <th className="py-2 px-2">{view === 'DAY' ? 'In' : 'Recent In'}</th>
                        <th className="py-2 px-2">{view === 'DAY' ? 'Out' : 'Recent Out'}</th>
                        <th className="py-2 px-2">Worked</th>
                        <th className="py-2 px-2">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                     {loadingRecords ? (
                       <tr>
                         <td colSpan="7" className="py-6 text-center text-xs font-bold uppercase text-slate-400 tracking-wider animate-pulse">
                           Loading Attendance Logs...
                         </td>
                       </tr>
                     ) : processedRecords.length === 0 ? (
                       <tr>
                         <td colSpan="7" className="py-6 text-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                           No attendance records found for this period
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
                                <td className="py-2 px-2">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-bold shrink-0">
                                         {initial}
                                      </div>
                                      <div className="min-w-0">
                                         <div className="flex items-center gap-1">
                                           <span className="text-[11px] font-bold text-slate-800 uppercase truncate max-w-[120px]">
                                             {record.name}
                                           </span>
                                           <span className="text-[7px] text-blue-500 font-bold bg-blue-50 px-1 py-0.2 rounded leading-none">
                                             {isExpanded ? '▲' : '▼'}
                                           </span>
                                         </div>
                                         <span className="text-[7.5px] font-medium text-slate-400 uppercase truncate block">{record.role}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-2 px-2 text-[10.5px] font-medium text-slate-600">
                                  {record.type === 'DAY' 
                                    ? new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </td>
                                <td className="py-2 px-2 text-[10.5px] font-bold text-slate-700">
                                  <span className="bg-slate-50 px-1.5 py-0.5 rounded uppercase text-[8.5px] font-bold">
                                    {record.type === 'DAY' 
                                      ? `${record.sessionNum} ${record.sessionNum === 1 ? 'Login' : 'Logins'}`
                                      : `${record.sessionNum} ${record.sessionNum === 1 ? 'Day' : 'Days'}`}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-[10.5px] font-bold text-slate-800">{record.in}</td>
                                <td className="py-2 px-2 text-[10.5px] font-bold text-slate-800">{record.out}</td>
                                <td className="py-2 px-2 text-[10.5px] font-bold text-slate-800">{record.work}</td>
                                <td className="py-2 px-2">
                                   <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                                     record.status.includes('LATE') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                   }`}>
                                      {record.status}
                                    </span>
                                </td>
                             </tr>

                             {/* Dropdown Session Details */}
                             {isExpanded && (
                               <tr className="bg-slate-50/50">
                                 <td colSpan="7" className="p-2.5 border-l-2 border-blue-500">
                                   <div className="space-y-2 animate-in fade-in duration-200">
                                     <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider block">
                                       {record.type === 'DAY' 
                                         ? `Session Logs for ${record.name} on ${new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                         : `Daily Breakdown for ${record.name} (${view === 'WEEK' ? 'Week' : 'Month'})`}
                                     </span>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                       {record.allSessions.map((item, idx) => (
                                         <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs space-y-1">
                                           <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                                             <span className="text-[8px] font-bold text-slate-400 uppercase">
                                               {record.type === 'DAY' 
                                                 ? `Session #${idx + 1}`
                                                 : new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                             </span>
                                             <span className={`px-1 rounded text-[7px] font-bold uppercase ${
                                               item.status.includes('LATE') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                             }`}>{item.status}</span>
                                           </div>
                                           <div className="flex justify-between items-center text-[10px] font-medium text-slate-700">
                                             <span>In: <strong className="text-slate-900">{item.in}</strong></span>
                                             <span>Out: <strong className="text-slate-900">{item.out}</strong></span>
                                           </div>
                                           <div className="text-[8px] font-semibold text-slate-400 uppercase flex items-center justify-between pt-0.5">
                                             <span>Worked</span>
                                             <span className="text-slate-800 font-bold">{item.work}</span>
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

        {/* Dynamic Sidebar Calendar (Span 4) */}
        <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
               <div className="flex justify-between items-center w-full mb-2 px-1">
                  <button className="p-1 rounded hover:bg-slate-50 text-slate-400"><ChevronLeft size={14} /></button>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">MAY 2026</span>
                  <button className="p-1 rounded hover:bg-slate-50 text-slate-400"><ChevronRight size={14} /></button>
               </div>

               <div className="grid grid-cols-7 gap-y-2 w-full text-center">
                  {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                    <span key={d} className="text-[7.5px] font-bold text-slate-400 uppercase">{d}</span>
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
                        className={`flex flex-col items-center p-1 rounded-lg group cursor-pointer border transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'bg-white border-transparent hover:bg-slate-50'
                        }`}
                      >
                         <span className={`text-[10px] font-bold leading-none ${
                           isSelected ? 'text-blue-600' : 'text-slate-600'
                         }`}>
                           {dayNum}
                         </span>
                         
                         {presenceCount > 0 ? (
                           <span className="bg-blue-50 px-1 rounded text-[6.5px] font-bold text-blue-600 leading-tight mt-0.5">
                             {presenceCount}P
                           </span>
                         ) : (
                           <div className="w-1 h-1 rounded-full bg-slate-200 mt-1"></div>
                         )}
                      </div>
                    );
                  })}
               </div>

               <div className="mt-3 w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[7.5px] font-bold uppercase text-slate-400">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                     <span>Legend</span>
                  </div>
                  <span className="text-slate-600 font-semibold">#P = Present Count</span>
               </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl text-white space-y-1.5 relative overflow-hidden">
               <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">Apply For Leave</span>
               <h4 className="text-xs font-bold uppercase leading-tight">Submit your time-off request for supervisor review</h4>
               <button 
                 onClick={() => setIsLeaveModalOpen(true)}
                 className="px-2.5 py-1 bg-white text-slate-900 rounded-lg text-[8.5px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-2xs cursor-pointer"
               >
                  Apply Leave
               </button>
            </div>
        </div>
      </div>
      
      {/* Apply Leave Request Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg text-white bg-blue-600 shadow-2xs">
                  <FileText size={13} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Apply Leave Request</h2>
                  <p className="text-[8px] text-slate-400 font-medium">Submit time-off details for authorization</p>
                </div>
              </div>
              <button onClick={() => setIsLeaveModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-3.5 space-y-2.5 text-xs">
              {/* Leave Balance Chips */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-1.5 rounded-lg bg-blue-50/50 border border-blue-100 text-center">
                  <span className="text-[7.5px] font-bold text-blue-600 uppercase block">Annual Leave</span>
                  <span className="text-xs font-extrabold text-slate-900">12 Days</span>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50/50 border border-amber-100 text-center">
                  <span className="text-[7.5px] font-bold text-amber-600 uppercase block">Sick Leave</span>
                  <span className="text-xs font-extrabold text-slate-900">7 Days</span>
                </div>
                <div className="p-1.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-center">
                  <span className="text-[7.5px] font-bold text-indigo-600 uppercase block">Casual Leave</span>
                  <span className="text-xs font-extrabold text-slate-900">5 Days</span>
                </div>
              </div>

              {leaveSuccessMsg && (
                <div className="p-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg text-center">
                  {leaveSuccessMsg}
                </div>
              )}

              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Leave Type</label>
                <select 
                  required
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity Leave">Maternity / Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Reason / Justification</label>
                <textarea 
                  required
                  rows={2}
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder="Provide details about your leave application..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 resize-none h-16"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-1.5 text-slate-500 text-[9.5px] font-bold uppercase tracking-wider hover:bg-slate-100 rounded-lg"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={submittingLeave}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider shadow-2xs hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send size={10} />
                  <span>{submittingLeave ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExportReport}
        title="Export Global Attendance"
      />
    </div>
  );
};

export default Attendance;
