import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Clock,
  Calendar as CalendarIcon,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  StickyNote,
  X,
  ChevronDown
} from 'lucide-react';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hour, min] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${min} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
};

const CalendarPage = () => {
  const [view, setView] = useState('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', date: '', time: '', type: 'Reminder' });
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [notes, setNotes] = useState(() => localStorage.getItem('admin_calendar_notes') || '');
  const timelineRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-scroll timeline to focus on scheduled events or active time
  useEffect(() => {
    if (view === 'Day' && timelineRef.current) {
      const dayEvents = events.filter(e => {
        const evDate = new Date(e.date);
        return evDate.toDateString() === currentDate.toDateString() && e.time;
      });
      if (dayEvents.length > 0) {
        dayEvents.sort((a, b) => a.time.localeCompare(b.time));
        const [hour] = dayEvents[0].time.split(':').map(Number);
        const scrollTarget = Math.max(0, (hour - 2) * 60);
        setTimeout(() => {
          if (timelineRef.current) {
            timelineRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          }
        }, 100);
      } else {
        const now = new Date();
        const currentHour = now.getHours();
        const scrollTarget = Math.max(0, (currentHour - 2) * 60);
        setTimeout(() => {
          if (timelineRef.current) {
            timelineRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [currentDate, view, events]);

  const fetchEvents = async () => {
    try {
      const [tendersRes, assignmentsRes, remindersRes] = await Promise.all([
        fetch('/api/tenders'),
        fetch('/api/assignments'),
        fetch('/api/reminders')
      ]);

      const tenders = await tendersRes.json();
      const assignments = await assignmentsRes.json();
      const reminders = await remindersRes.json();

      const allEvents = [];

      tenders.forEach(t => {
        if (t.submissionDate) {
          allEvents.push({
            id: `t_${t.id}`,
            title: `Tender Sub: ${(t.title || 'Unnamed Tender').slice(0, 20)}...`,
            date: new Date(t.submissionDate),
            type: 'Submission Deadlines',
            color: '#ef4444'
          });
        }
      });

      assignments.forEach(a => {
        if (a.deadline) {
          allEvents.push({
            id: `a_${a.id}`,
            title: `Project: ${(a.title || 'Unnamed Project').slice(0, 20)}...`,
            date: new Date(a.deadline),
            type: 'Tender Events',
            color: '#3b82f6'
          });
        }
      });

      reminders.forEach(r => {
        let color = '#a855f7';
        if (r.type === 'Meeting') color = '#10b981';
        if (r.type === 'Review') color = '#f59e0b';
        if (r.type === 'Event') color = '#93c5fd';
        allEvents.push({
          id: `r_${r.id}`,
          title: r.title,
          date: new Date(r.date),
          type: r.type === 'Review' ? 'Bid Reviews' : r.type === 'Meeting' ? 'Meetings' : r.type === 'Event' ? 'Approval Dates' : 'Reminders',
          color,
          time: r.time || ''
        });
      });

      setEvents(allEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      // Map back admin event type to API type
      let apiType = 'Reminder';
      if (newReminder.type === 'Meetings') apiType = 'Meeting';
      if (newReminder.type === 'Bid Reviews') apiType = 'Review';
      if (newReminder.type === 'Approval Dates') apiType = 'Event';

      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReminder,
          type: apiType
        })
      });
      setShowAddModal(false);
      setNewReminder({ title: '', date: '', time: '', type: 'Reminder' });
      fetchEvents();
    } catch (err) {
      console.error("Error adding reminder:", err);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!id) return;
    try {
      const plainId = typeof id === 'string' && id.startsWith('r_') ? id.slice(2) : id;
      await fetch(`/api/reminders/${plainId}`, {
        method: 'DELETE'
      });
      setSelectedEventId(null);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const shiftDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'Year') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    } else if (view === 'Month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (view === 'Week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'Day') {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const handleNotesChange = (val) => {
    setNotes(val);
    localStorage.setItem('admin_calendar_notes', val);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Title,Type,Date,Time"].join(",") + "\n"
      + filteredEvents.map(e => `"${e.title}","${e.type}","${e.date.toLocaleDateString()}","${e.time || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `calendar_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to format Header Title
  const getHeaderTitle = () => {
    if (view === 'Year') return currentDate.getFullYear().toString();
    if (view === 'Month') return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'Week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${monthNames[start.getMonth()].substring(0, 3)} ${start.getDate()} - ${monthNames[end.getMonth()].substring(0, 3)} ${end.getDate()}, ${start.getFullYear()}`;
    }
    if (view === 'Day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // Filter computation
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || e.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate dynamic stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDeadlinesCount = events.filter(e => 
    (e.type === 'Submission Deadlines' || e.type === 'Tender Events') && e.date >= today
  ).length;

  const todaysEventsCount = events.filter(e => 
    e.date.toDateString() === new Date().toDateString()
  ).length;

  const pendingReviewsCount = events.filter(e => 
    e.type === 'Bid Reviews' && e.date >= today
  ).length;

  const overdueItemsCount = events.filter(e => 
    (e.type === 'Submission Deadlines' || e.type === 'Tender Events') && e.date < today
  ).length;

  const scheduledMeetingsCount = events.filter(e => 
    e.type === 'Meetings' && e.date >= today
  ).length;

  const stats = [
    { label: 'Upcoming Deadlines', value: upcomingDeadlinesCount.toString() },
    { label: "Today's Events", value: todaysEventsCount.toString() },
    { label: 'Pending Reviews', value: pendingReviewsCount.toString() },
    { label: 'Overdue Items', value: overdueItemsCount.toString() },
    { label: 'Scheduled Meetings', value: scheduledMeetingsCount.toString() },
  ];

  const legend = [
    { label: 'Tender Events', color: '#3b82f6' },
    { label: 'Submission Deadlines', color: '#ef4444' },
    { label: 'Bid Reviews', color: '#f59e0b' },
    { label: 'Meetings', color: '#10b981' },
    { label: 'Reminders', color: '#a855f7' },
    { label: 'Approval Dates', color: '#93c5fd' },
  ];

  // Render Year View
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {months.map(m => {
          const firstDay = new Date(year, m, 1).getDay();
          const daysInMonth = new Date(year, m + 1, 0).getDate();

          return (
            <div key={m} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-black text-slate-800 tracking-tight mb-4 text-center">{monthNames[m]}</h4>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-[9px] font-black text-slate-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dDate = new Date(year, m, dayNum);
                  const isToday = new Date().toDateString() === dDate.toDateString();
                  const hasEvent = filteredEvents.some(e => e.date.toDateString() === dDate.toDateString());

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setCurrentDate(dDate);
                        setView('Day');
                      }}
                      className={`w-6 h-6 mx-auto flex items-center justify-center rounded-full text-[10px] font-bold transition-all relative ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                      {dayNum}
                      {hasEvent && !isToday && <div className="absolute bottom-0 w-1 h-1 bg-rose-500 rounded-full"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const totalCells = firstDayOfMonth + daysInMonth > 35 ? 42 : 35;

    const calendarCells = Array.from({ length: totalCells }, (_, i) => {
      let dayNum;
      let isPrevMonth = false;
      let isNextMonth = false;
      let cellDate;

      if (i < firstDayOfMonth) {
        isPrevMonth = true;
        dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
        cellDate = new Date(year, month - 1, dayNum);
      } else if (i >= firstDayOfMonth + daysInMonth) {
        isNextMonth = true;
        dayNum = i - firstDayOfMonth - daysInMonth + 1;
        cellDate = new Date(year, month + 1, dayNum);
      } else {
        dayNum = i - firstDayOfMonth + 1;
        cellDate = new Date(year, month, dayNum);
      }
      return { dayNum, isPrevMonth, isNextMonth, cellDate };
    });

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
          {days.map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.substring(0, 2)}</span>
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-7 ${totalCells > 35 ? 'grid-rows-6' : 'grid-rows-5'} min-h-[350px] md:min-h-[600px]`}>
          {calendarCells.map((cell, i) => {
            const cellDateStr = cell.cellDate.toDateString();
            const isToday = new Date().toDateString() === cellDateStr;
            const dayEvents = filteredEvents.filter(e => e.date.toDateString() === cellDateStr);

            return (
              <div
                key={i}
                onClick={() => {
                  setCurrentDate(cell.cellDate);
                  setView('Day');
                }}
                className="border-r border-b border-slate-50 p-1 md:p-3 relative group hover:bg-slate-50/50 transition-colors min-h-[60px] md:min-h-[120px] cursor-pointer flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full text-[10px] md:text-[11px] font-black ${cell.isPrevMonth || cell.isNextMonth ? 'text-slate-200' : 'text-slate-400'} ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                    {cell.dayNum}
                  </span>
                </div>
                {/* Desktop view event titles */}
                <div className="hidden md:block mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1 flex-1">
                  {dayEvents.map(e => (
                    <div key={e.id} className="px-2 py-1 text-white rounded text-[8px] font-black truncate shadow-sm mb-1" style={{ backgroundColor: e.color }} title={e.title}>
                      {e.time && `${formatTime(e.time)} - `}{e.title}
                    </div>
                  ))}
                </div>
                {/* Mobile view event dots */}
                <div className="md:hidden flex flex-wrap gap-0.5 justify-center mt-1">
                  {dayEvents.map(e => (
                    <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} title={e.title}></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="w-full">
        {/* Desktop grid (hidden on mobile, visible on md+) */}
        <div className="hidden md:grid grid-cols-7 border-b border-slate-50 bg-slate-50/30 h-full min-h-[500px]">
          {weekDays.map((wd, i) => {
            const isToday = new Date().toDateString() === wd.toDateString();
            const dayEvents = filteredEvents.filter(e => e.date.toDateString() === wd.toDateString());
            return (
              <div key={i} className="border-r border-slate-50 flex flex-col min-h-[500px] bg-white">
                <div className="py-4 text-center border-b border-slate-50 bg-slate-50/10">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{days[wd.getDay()]}</div>
                  <div className={`mt-1 mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-black ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}`}>
                    {wd.getDate()}
                  </div>
                </div>
                <div className="flex-1 p-2 space-y-2 bg-white/50">
                  {dayEvents.map(e => (
                    <div key={e.id} className="p-2 text-white rounded-lg text-xs font-bold shadow-sm" style={{ backgroundColor: e.color }}>
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-widest opacity-80 mb-1">
                        <span>{e.type}</span>
                        {e.time && <span>{formatTime(e.time)}</span>}
                      </div>
                      <div className="truncate" title={e.title}>{e.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile vertical agenda list (visible on mobile, hidden on md+) */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 p-4 bg-white">
          {weekDays.map((wd, i) => {
            const isToday = new Date().toDateString() === wd.toDateString();
            const dayEvents = filteredEvents.filter(e => e.date.toDateString() === wd.toDateString());
            return (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black shrink-0 ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                    {wd.getDate()}
                  </span>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{days[wd.getDay()]}</span>
                  {isToday && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Today</span>}
                </div>
                <div className="pl-11 space-y-2">
                  {dayEvents.length === 0 ? (
                    <p className="text-[10px] font-bold text-slate-400 italic">No events</p>
                  ) : (
                    dayEvents.map(e => (
                      <div key={e.id} className="p-3 text-white rounded-xl text-xs font-bold shadow-sm flex flex-col gap-1" style={{ backgroundColor: e.color }} onClick={() => { setCurrentDate(wd); setView('Day'); }}>
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest opacity-80">
                          <span>{e.type}</span>
                          {e.time && <span>{formatTime(e.time)}</span>}
                        </div>
                        <div>{e.title}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dayEvents = filteredEvents.filter(e => e.date.toDateString() === currentDate.toDateString());
    
    // Auto-select first event if selectedEventId is not set or not in today's events
    const todayReminders = dayEvents.filter(e => e.id);
    const activeEvent = todayReminders.find(e => e.id === selectedEventId) || todayReminders[0] || null;

    // Days in current week for week strip
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const formatHourLabel = (h) => {
      if (h === 0) return '12 AM';
      if (h === 12) return 'Midday';
      return h > 12 ? `${h - 12} PM` : `${h} AM`;
    };

    // Calculate current time line positioning
    const now = new Date();
    const isToday = currentDate.toDateString() === now.toDateString();
    const currentTop = (now.getHours() * 60) + now.getMinutes();

    return (
      <div className="flex flex-col space-y-6 p-4 md:p-8 bg-slate-50/30">
        {/* Horizontal Mini Week Strip */}
        <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100">
          {weekDays.map((wd, i) => {
            const isSelected = wd.toDateString() === currentDate.toDateString();
            const isTodayDay = wd.toDateString() === new Date().toDateString();
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCurrentDate(wd);
                  setSelectedEventId(null);
                }}
                className="flex flex-col items-center flex-1 py-1 md:py-2 rounded-xl transition-all hover:bg-slate-50 relative group"
              >
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <span className="hidden sm:inline">{days[wd.getDay()]}</span>
                  <span className="sm:hidden">{days[wd.getDay()][0]}</span>
                </span>
                <span className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-[10px] md:text-xs font-black transition-all ${
                  isSelected ? 'bg-red-500 text-white shadow-md shadow-red-200' :
                  isTodayDay ? 'text-red-500 border border-red-200 font-extrabold' : 'text-slate-700'
                }`}>
                  {wd.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Hourly Timeline */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col">
            {/* Scrollable Timeline Grid */}
            <div ref={timelineRef} className="relative h-[600px] overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/10 custom-scrollbar">
              <div className="relative w-full min-w-0" style={{ height: '1440px' }}>
                {/* Red Current Time Line */}
                {isToday && (
                  <div
                    className="absolute left-[70px] right-0 h-[2px] bg-red-500 z-10 pointer-events-none flex items-center"
                    style={{ top: `${currentTop}px` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 absolute -left-1.5 shadow-md shadow-red-200" />
                  </div>
                )}

                {/* Hour Rows */}
                {hours.map(h => (
                  <div key={h} className="absolute left-0 right-0 flex border-b border-slate-100" style={{ top: `${h * 60}px`, height: '60px' }}>
                    <span className="w-[65px] md:w-[70px] text-right pr-2 md:pr-4 pt-1 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider select-none shrink-0">
                      {formatHourLabel(h)}
                    </span>
                    <div className="flex-1 border-l border-slate-100 relative h-full"></div>
                  </div>
                ))}

                {/* Absolute Events */}
                {dayEvents.map(e => {
                  const eventTime = e.time || '09:00';
                  const [hour, min] = eventTime.split(':').map(Number);
                  const top = (hour * 60) + min;
                  const isSelected = activeEvent?.id === e.id;
                  
                  return (
                    <div
                      key={e.id}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setSelectedEventId(e.id);
                      }}
                      className={`absolute left-[75px] md:left-[85px] right-2 md:right-4 p-2 md:p-3 rounded-xl cursor-pointer transition-all border flex flex-col justify-between shadow-sm group hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-blue-500/20' : ''
                      }`}
                      style={{
                        top: `${top}px`,
                        height: '54px',
                        backgroundColor: `${e.color}15`,
                        borderColor: e.color,
                        borderLeftWidth: '5px'
                      }}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] md:text-xs font-black text-slate-800 truncate" style={{ color: isSelected ? e.color : undefined }}>{e.title}</span>
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-400 bg-white/80 px-1 md:px-1.5 py-0.5 rounded border border-slate-100 shrink-0">
                          {e.time ? formatTime(e.time) : 'All Day'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Selected Event Details (Drawer/Modal on mobile, Sidebar on desktop) */}
          {activeEvent && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none lg:z-auto lg:p-0 lg:col-span-4">
              <div className="bg-white lg:bg-slate-50/50 p-6 rounded-[2rem] lg:rounded-2xl border border-slate-100 shadow-2xl lg:shadow-none w-full max-w-md lg:max-w-none space-y-6 animate-in zoom-in-95 duration-200 lg:animate-none">
                {/* Details Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: activeEvent.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{activeEvent.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">Active Event</span>
                    <button onClick={() => setSelectedEventId(null)} className="lg:hidden p-1 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Event Title */}
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-snug">{activeEvent.title}</h3>
                </div>

                {/* Date and Time Fields */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                    <CalendarIcon size={14} className="text-slate-400" />
                    <span>{activeEvent.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {activeEvent.time && (
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      <span>{formatTime(activeEvent.time)}</span>
                    </div>
                  )}
                </div>

                {/* Delete Button (Only for User Reminders/Meetings) */}
                {activeEvent.id.startsWith('r_') && (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(activeEvent.id)}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-red-100/50 shadow-sm"
                    >
                      Delete Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!activeEvent && (
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 py-12 text-center flex flex-col items-center justify-center">
                <CalendarIcon className="w-12 h-12 text-slate-200 mb-3" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">No Selection</h4>
                <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-[200px]">Select an event to view details here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Compute dynamic lists for admin sidebar
  const next7DaysEvents = events
    .filter(e => {
      const diff = e.date - today;
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const reviewMeetingsList = events
    .filter(e => e.type === 'Bid Reviews' && e.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const documentRemindersList = events
    .filter(e => e.type === 'Reminders' && e.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd] ">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Calendar</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto bg-blue-600 text-white rounded-xl text-xs font-black shadow-xl shadow-blue-200 uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
           >
             <Plus size={16} />
             Add Event
           </button>
        </div>
      </div>

      {/* Control Bar (Views, Search, filters) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex bg-slate-50 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
            {['Year', 'Month', 'Week', 'Day'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-black transition-all ${view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v}
              </button>
            ))}
         </div>
         <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
            <div className="relative group w-full sm:flex-1 md:w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Global search" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-200 transition-all" 
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-black text-slate-600 hover:bg-white hover:border-slate-200 transition-all"
              >
                <Filter size={14} className="opacity-75" />
                Filter: {activeFilter === 'All' ? 'All' : activeFilter}
                <ChevronDown size={14} className="opacity-50 ml-1" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-30 p-2 py-1 space-y-1">
                  {['All', 'Submission Deadlines', 'Tender Events', 'Bid Reviews', 'Meetings', 'Reminders', 'Approval Dates'].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setActiveFilter(f);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeFilter === f ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {f === 'All' ? 'All Events' : f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-black text-slate-600 hover:bg-white hover:border-slate-200 transition-all"
            >
              <Download size={16} />
              Export
            </button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Calendar Area */}
        <div className={`${view === 'Day' ? 'lg:col-span-12' : 'lg:col-span-9'} bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col`}>
           {/* Calendar Header */}
           <div className="px-4 py-4 md:px-8 md:py-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/10 shrink-0">
             <div className="flex items-center justify-between w-full sm:w-auto gap-2">
               <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100"><ChevronLeft size={18} /></button>
               <h2 className="text-sm md:text-lg font-black text-slate-800 tracking-tight text-center min-w-[150px] md:min-w-[200px]">{getHeaderTitle()}</h2>
               <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100"><ChevronRight size={18} /></button>
             </div>
             <button onClick={goToday} className="px-3 md:px-5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[9px] md:text-[10px] font-black transition-colors shrink-0">Today</button>
           </div>
           
           {/* Calendar Content Area */}
           <div className="flex-1 bg-white">
             {view === 'Year' && renderYearView()}
             {view === 'Month' && renderMonthView()}
             {view === 'Week' && renderWeekView()}
             {view === 'Day' && renderDayView()}
           </div>
           
           {/* Legend */}
           <div className="p-4 md:p-8 border-t border-slate-50 flex flex-wrap gap-4 md:gap-6 justify-start shrink-0">
              {legend.map((item, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                   <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-md shadow-sm" style={{backgroundColor: item.color}}></div>
                   <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar Area */}
        {view !== 'Day' && (
          <div className="lg:col-span-3 space-y-8">
             <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
                <div>
                   <h3 className="text-xs font-black text-slate-900 tracking-[0.2em] uppercase mb-4">Next 7 Days</h3>
                   <div className="space-y-4">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Upcoming Deadlines</p>
                      <div className="space-y-3">
                         {next7DaysEvents.length === 0 ? (
                           <p className="text-[10px] font-bold text-slate-400 italic">No deadlines next 7 days.</p>
                         ) : (
                           next7DaysEvents.map(e => (
                             <div key={e.id} className="flex justify-between items-center text-[10px] font-bold text-slate-500 gap-2">
                                <span className="truncate text-slate-700" title={e.title}>{e.title}</span>
                                <span className="text-slate-400 shrink-0 font-medium" style={{ color: e.color }}>
                                  {e.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                                </span>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                   <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Review Meetings</h3>
                   <div className="space-y-3">
                      {reviewMeetingsList.length === 0 ? (
                        <p className="text-[10px] font-bold text-slate-400 italic">No upcoming reviews.</p>
                      ) : (
                        reviewMeetingsList.map(e => (
                          <div key={e.id} className="flex justify-between items-center text-[10px] font-bold text-slate-500 gap-2">
                            <span className="truncate text-slate-700" title={e.title}>{e.title}</span>
                            <span className="text-slate-400 shrink-0 font-medium" style={{ color: e.color }}>
                              {e.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                   <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Document Reminders</h3>
                   <div className="space-y-3">
                      {documentRemindersList.length === 0 ? (
                        <p className="text-[10px] font-bold text-slate-400 italic">No active reminders.</p>
                      ) : (
                        documentRemindersList.map(e => (
                          <div key={e.id} className="flex justify-between items-center text-[10px] font-bold text-slate-500 gap-2">
                            <span className="truncate text-slate-700" title={e.title}>{e.title}</span>
                            <span className="text-slate-400 shrink-0 font-medium" style={{ color: e.color }}>
                              {e.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50 space-y-4">
                   <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Notes</h3>
                   <div className="relative">
                      <textarea 
                         placeholder="Quick notes" 
                         value={notes}
                         onChange={e => handleNotesChange(e.target.value)}
                         className="w-full h-32 p-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-blue-200 transition-all resize-none"
                      ></textarea>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Add New Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Event Title</label>
                <input
                  type="text"
                  required
                  value={newReminder.title}
                  onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-400 transition-all"
                  placeholder="E.g., Bid Review Session"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Event Type</label>
                <select
                  value={newReminder.type}
                  onChange={e => setNewReminder({ ...newReminder, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-400 transition-all"
                >
                  <option value="Reminders">Reminder</option>
                  <option value="Meetings">Meeting</option>
                  <option value="Bid Reviews">Review</option>
                  <option value="Approval Dates">General Event</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={newReminder.date}
                  onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all mb-4"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Event Time</label>
                <input
                  type="time"
                  required
                  value={newReminder.time || ''}
                  onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
