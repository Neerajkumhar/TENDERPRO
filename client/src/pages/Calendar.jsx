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
  const [notes, setNotes] = useState(() => localStorage.getItem('client_calendar_notes') || '');
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
        if (r.type === 'Meeting') color = '#3b82f6';
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
    localStorage.setItem('client_calendar_notes', val);
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
      return currentDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || e.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

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
    { label: 'Upcoming Deadlines', value: upcomingDeadlinesCount.toString(), color: 'text-slate-800' },
    { label: "Today's Events", value: todaysEventsCount.toString(), color: 'text-blue-600' },
    { label: 'Pending Reviews', value: pendingReviewsCount.toString(), color: 'text-amber-500' },
    { label: 'Overdue Items', value: overdueItemsCount.toString(), color: 'text-rose-500' },
    { label: 'Scheduled Meetings', value: scheduledMeetingsCount.toString(), color: 'text-indigo-600' },
  ];

  const legend = [
    { label: 'Tender Events', color: '#3b82f6' },
    { label: 'Deadlines', color: '#ef4444' },
    { label: 'Bid Reviews', color: '#f59e0b' },
    { label: 'Meetings', color: '#3b82f6' },
    { label: 'Reminders', color: '#a855f7' },
    { label: 'Approval Dates', color: '#93c5fd' },
  ];

  // Render Year View
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
        {months.map(m => {
          const firstDay = new Date(year, m, 1).getDay();
          const daysInMonth = new Date(year, m + 1, 0).getDate();

          return (
            <div key={m} className="bg-slate-50/60 border border-slate-100 rounded-xl p-2.5 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-800 tracking-tight mb-2 text-center">{monthNames[m]}</h4>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-[8px] font-bold text-slate-400">{d}</div>)}
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
                      className={`w-5 h-5 mx-auto flex items-center justify-center rounded-full text-[9px] font-bold transition-all relative ${isToday ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'}`}
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
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {days.map(day => (
            <div key={day} className="py-2 text-center text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.substring(0, 2)}</span>
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-7 ${totalCells > 35 ? 'grid-rows-6' : 'grid-rows-5'} min-h-[320px] md:min-h-[460px]`}>
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
                className="border-r border-b border-slate-100 p-1 sm:p-1.5 relative group hover:bg-slate-50/70 transition-colors min-h-[65px] md:min-h-[85px] cursor-pointer flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-[9.5px] sm:text-[10px] font-bold ${cell.isPrevMonth || cell.isNextMonth ? 'text-slate-300' : 'text-slate-600'} ${isToday ? 'bg-blue-600 text-white font-extrabold shadow-2xs' : ''}`}>
                    {cell.dayNum}
                  </span>
                </div>
                {/* Desktop event titles */}
                <div className="hidden md:block mt-1 space-y-0.5 overflow-y-auto max-h-[60px] custom-scrollbar pr-0.5 flex-1">
                  {dayEvents.map(e => (
                    <div key={e.id} className="px-1.5 py-0.5 text-white rounded text-[7.5px] font-bold truncate shadow-2xs mb-0.5 leading-tight" style={{ backgroundColor: e.color }} title={e.title}>
                      {e.time && `${formatTime(e.time)} - `}{e.title}
                    </div>
                  ))}
                </div>
                {/* Mobile event dots */}
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
        <div className="hidden md:grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 min-h-[420px]">
          {weekDays.map((wd, i) => {
            const isToday = new Date().toDateString() === wd.toDateString();
            const dayEvents = filteredEvents.filter(e => e.date.toDateString() === wd.toDateString());
            return (
              <div key={i} className="border-r border-slate-100 flex flex-col min-h-[420px] bg-white">
                <div className="py-2.5 text-center border-b border-slate-100 bg-slate-50/30">
                  <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">{days[wd.getDay()]}</div>
                  <div className={`mt-0.5 mx-auto w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-700'}`}>
                    {wd.getDate()}
                  </div>
                </div>
                <div className="flex-1 p-1.5 space-y-1 bg-white">
                  {dayEvents.map(e => (
                    <div key={e.id} className="p-1.5 text-white rounded-md text-[9px] font-bold shadow-2xs" style={{ backgroundColor: e.color }}>
                      <div className="flex justify-between items-center text-[7.5px] uppercase opacity-80 mb-0.5">
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

        {/* Mobile vertical agenda list */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100 p-3 bg-white text-left">
          {weekDays.map((wd, i) => {
            const isToday = new Date().toDateString() === wd.toDateString();
            const dayEvents = filteredEvents.filter(e => e.date.toDateString() === wd.toDateString());
            return (
              <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${isToday ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                    {wd.getDate()}
                  </span>
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{days[wd.getDay()]}</span>
                  {isToday && <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded uppercase">Today</span>}
                </div>
                <div className="pl-8 space-y-1">
                  {dayEvents.length === 0 ? (
                    <p className="text-[9px] font-medium text-slate-400 italic">No events</p>
                  ) : (
                    dayEvents.map(e => (
                      <div key={e.id} className="p-2 text-white rounded-lg text-[9.5px] font-bold shadow-2xs flex flex-col gap-0.5" style={{ backgroundColor: e.color }} onClick={() => { setCurrentDate(wd); setView('Day'); }}>
                        <div className="flex justify-between items-center text-[7.5px] uppercase opacity-80">
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
    const todayReminders = dayEvents.filter(e => e.id);
    const activeEvent = todayReminders.find(e => e.id === selectedEventId) || todayReminders[0] || null;

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
      if (h === 12) return '12 PM';
      return h > 12 ? `${h - 12} PM` : `${h} AM`;
    };

    const now = new Date();
    const isToday = currentDate.toDateString() === now.toDateString();
    const currentTop = (now.getHours() * 60) + now.getMinutes();

    return (
      <div className="flex flex-col space-y-3.5 p-3 sm:p-4 bg-slate-50/40 text-left">
        {/* Horizontal Mini Week Strip */}
        <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-2xs border border-slate-200/80">
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
                className="flex flex-col items-center flex-1 py-1 rounded-lg transition-all hover:bg-slate-50"
              >
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  <span className="hidden sm:inline">{days[wd.getDay()]}</span>
                  <span className="sm:hidden">{days[wd.getDay()][0]}</span>
                </span>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isSelected ? 'bg-blue-600 text-white shadow-2xs' :
                  isTodayDay ? 'text-blue-600 border border-blue-200 font-extrabold' : 'text-slate-700'
                }`}>
                  {wd.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Panel: Hourly Timeline */}
          <div className="lg:col-span-8 bg-white rounded-xl p-3 sm:p-3.5 shadow-2xs border border-slate-200/80 flex flex-col">
            <div ref={timelineRef} className="relative h-[480px] overflow-y-auto border border-slate-100 rounded-lg bg-slate-50/20 custom-scrollbar">
              <div className="relative w-full min-w-0" style={{ height: '1440px' }}>
                {isToday && (
                  <div
                    className="absolute left-[60px] right-0 h-[2px] bg-rose-500 z-10 pointer-events-none flex items-center"
                    style={{ top: `${currentTop}px` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -left-1 shadow-2xs" />
                  </div>
                )}

                {hours.map(h => (
                  <div key={h} className="absolute left-0 right-0 flex border-b border-slate-100" style={{ top: `${h * 60}px`, height: '60px' }}>
                    <span className="w-[55px] text-right pr-2 pt-1 text-[8.5px] font-bold text-slate-400 uppercase select-none shrink-0">
                      {formatHourLabel(h)}
                    </span>
                    <div className="flex-1 border-l border-slate-100 relative h-full"></div>
                  </div>
                ))}

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
                      className={`absolute left-[65px] right-2 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all border flex flex-col justify-between shadow-2xs ${
                        isSelected ? 'ring-2 ring-blue-500/20' : ''
                      }`}
                      style={{
                        top: `${top}px`,
                        height: '50px',
                        backgroundColor: `${e.color}15`,
                        borderColor: e.color,
                        borderLeftWidth: '4px'
                      }}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10.5px] font-bold text-slate-800 truncate" style={{ color: isSelected ? e.color : undefined }}>{e.title}</span>
                        <span className="text-[8px] font-bold text-slate-400 bg-white px-1 py-0.2 rounded border border-slate-100 shrink-0">
                          {e.time ? formatTime(e.time) : 'All Day'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Selected Event Details */}
          {activeEvent && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none lg:z-auto lg:p-0 lg:col-span-4">
              <div className="bg-white lg:bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xl lg:shadow-none w-full max-w-md lg:max-w-none space-y-3.5 animate-in zoom-in-95 duration-150 lg:animate-none">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeEvent.color }} />
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">{activeEvent.type}</span>
                  </div>
                  <button onClick={() => setSelectedEventId(null)} className="lg:hidden p-1 hover:bg-slate-100 rounded">
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug">{activeEvent.title}</h3>
                </div>

                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-600">
                    <CalendarIcon size={12} className="text-slate-400" />
                    <span>{activeEvent.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {activeEvent.time && (
                    <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-600">
                      <Clock size={12} className="text-slate-400" />
                      <span>{formatTime(activeEvent.time)}</span>
                    </div>
                  )}
                </div>

                {activeEvent.id.startsWith('r_') && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(activeEvent.id)}
                    className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-colors border border-rose-100 shadow-2xs"
                  >
                    Delete Event
                  </button>
                )}
              </div>
            </div>
          )}

          {!activeEvent && (
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 py-10 text-center flex flex-col items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-slate-300 mb-2" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Selection</h4>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Select an event from the timeline.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3 sm:space-y-3.5 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={18} />
            <span>Calendar</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-medium">Track tender deadlines, bid review sessions, and team schedules.</p>
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs active:scale-95 whitespace-nowrap"
           >
             <Plus size={13} />
             <span>Add Event</span>
           </button>
        </div>
      </div>

      {/* Control Bar (Views, Search, filters) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 bg-white p-2 sm:p-2.5 rounded-xl shadow-2xs border border-slate-200/80">
         <div className="flex bg-slate-50 p-0.5 rounded-lg overflow-x-auto w-full md:w-auto border border-slate-200/60">
            {['Year', 'Month', 'Week', 'Day'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 md:flex-none px-3 py-1 rounded-md text-[9.5px] font-bold uppercase tracking-wider transition-all ${view === v ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {v}
              </button>
            ))}
         </div>
         <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto md:justify-end">
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events..." 
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium outline-none focus:border-blue-500 transition-all shadow-2xs" 
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-2xs"
              >
                <Filter size={12} className="text-slate-400" />
                <span>{activeFilter === 'All' ? 'All Filters' : activeFilter}</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-1 text-left animate-in fade-in slide-in-from-top-1">
                  {['All', 'Submission Deadlines', 'Tender Events', 'Bid Reviews', 'Meetings', 'Reminders', 'Approval Dates'].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setActiveFilter(f);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
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
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9.5px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Download size={12} />
              <span>Export</span>
            </button>
         </div>
      </div>

      {/* Top 5 KPI Stats Cards */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">{stat.label}</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start">
        {/* Main Calendar Area */}
        <div className={`${view === 'Day' ? 'lg:col-span-12' : 'lg:col-span-9'} bg-white rounded-xl shadow-2xs border border-slate-200/80 overflow-hidden flex flex-col`}>
           {/* Calendar Header */}
           <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-2 justify-between items-center bg-slate-50/40 shrink-0">
             <div className="flex items-center justify-between w-full sm:w-auto gap-2">
               <button onClick={() => shiftDate(-1)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-500"><ChevronLeft size={15} /></button>
               <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight text-center uppercase min-w-[140px]">{getHeaderTitle()}</h2>
               <button onClick={() => shiftDate(1)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-500"><ChevronRight size={15} /></button>
             </div>
             <button onClick={goToday} className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-2xs">Today</button>
           </div>
           
           {/* Calendar Content Area */}
           <div className="flex-1 bg-white">
             {view === 'Year' && renderYearView()}
             {view === 'Month' && renderMonthView()}
             {view === 'Week' && renderWeekView()}
             {view === 'Day' && renderDayView()}
           </div>
           
           {/* Legend */}
           <div className="p-2.5 sm:p-3 border-t border-slate-100 flex flex-wrap gap-3 justify-start shrink-0 bg-slate-50/30">
              {legend.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-sm shadow-2xs" style={{backgroundColor: item.color}}></div>
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar Area */}
        {view !== 'Day' && (
          <div className="lg:col-span-3 space-y-3">
             <div className="bg-white p-3 sm:p-3.5 rounded-xl shadow-2xs border border-slate-200/80 space-y-3 text-left">
                <div>
                   <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-wider mb-2">Next 7 Days Deadlines</h3>
                   <div className="space-y-1.5">
                     {next7DaysEvents.length === 0 ? (
                       <p className="text-[9px] text-slate-400 italic">No deadlines in next 7 days.</p>
                     ) : (
                       next7DaysEvents.map(e => (
                         <div key={e.id} className="flex justify-between items-center text-[9.5px] font-medium text-slate-600 gap-1.5">
                            <span className="truncate" title={e.title}>{e.title}</span>
                            <span className="text-[8px] font-bold shrink-0" style={{ color: e.color }}>
                              {e.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                         </div>
                       ))
                     )}
                   </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100">
                   <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-wider mb-2">Review Meetings</h3>
                   <div className="space-y-1.5">
                      {reviewMeetingsList.length === 0 ? (
                        <p className="text-[9px] text-slate-400 italic">No upcoming reviews.</p>
                      ) : (
                        reviewMeetingsList.map(e => (
                          <div key={e.id} className="flex justify-between items-center text-[9.5px] font-medium text-slate-600 gap-1.5">
                            <span className="truncate" title={e.title}>{e.title}</span>
                            <span className="text-[8px] font-bold shrink-0" style={{ color: e.color }}>
                              {e.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100">
                   <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-wider mb-2">Document Reminders</h3>
                   <div className="space-y-1.5">
                      {documentRemindersList.length === 0 ? (
                        <p className="text-[9px] text-slate-400 italic">No active reminders.</p>
                      ) : (
                        documentRemindersList.map(e => (
                          <div key={e.id} className="flex justify-between items-center text-[9.5px] font-medium text-slate-600 gap-1.5">
                            <span className="truncate" title={e.title}>{e.title}</span>
                            <span className="text-[8px] font-bold shrink-0" style={{ color: e.color }}>
                              {e.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                   <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">Quick Notes</h3>
                   <textarea 
                      placeholder="Type reminders or quick notes..." 
                      value={notes}
                      onChange={e => handleNotesChange(e.target.value)}
                      className="w-full h-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-blue-500 resize-none"
                   ></textarea>
                </div>
             </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-4 sm:p-5 w-full max-w-md shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">Add New Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newReminder.title}
                  onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-blue-500"
                  placeholder="E.g. Bid Review Session"
                />
              </div>

              <div>
                <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Type</label>
                <select
                  value={newReminder.type}
                  onChange={e => setNewReminder({ ...newReminder, type: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-blue-500"
                >
                  <option value="Reminders">Reminder</option>
                  <option value="Meetings">Meeting</option>
                  <option value="Bid Reviews">Review</option>
                  <option value="Approval Dates">General Event</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newReminder.date}
                    onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Time</label>
                  <input
                    type="time"
                    required
                    value={newReminder.time || ''}
                    onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9.5px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-2xs active:scale-95">
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
