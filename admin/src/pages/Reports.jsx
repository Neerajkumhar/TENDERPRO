import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportModal from '../components/ExportModal';
import {
  Search,
  Filter,
  Download,
  Calendar,
  MoreVertical,
  Edit2,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  Check,
  X
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('This Month');
  const [showTimeframePopover, setShowTimeframePopover] = useState(false);
  const timeframeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeframeRef.current && !timeframeRef.current.contains(event.target)) {
        setShowTimeframePopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = [
    { label: 'Total Tenders', value: '2,500' },
    { label: 'Active', value: '689' },
    { label: 'Submitted', value: '912' },
    { label: 'Won', value: '510' },
    { label: 'Lost', value: '389' },
    { label: 'Approval Pending', value: '45' },
  ];

  const pieData = [
    { name: 'IT', value: 1245, color: '#3b82f6' },
    { name: 'Construction', value: 879, color: '#f59e0b' },
    { name: 'Consulting', value: 458, color: '#10b981' },
    { name: 'Ifi service', value: 300, color: '#8b5cf6' },
    { name: 'Others', value: 163, color: '#e2e8f0' },
  ];

  const barData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const handleExportReport = ({ format, startDate, endDate }) => {
    const filename = `Admin_Overview_${startDate}_to_${endDate}`;

    if (format === 'xlsx') {
      const exportRows = [
        ...stats.map(s => ({ "Metric": s.label, "Value": s.value })),
        { "Metric": "", "Value": "" }, 
        { "Metric": `Period: ${startDate} to ${endDate}`, "Value": "" },
        { "Metric": "Category Breakdown", "Value": "" },
        ...pieData.map(p => ({ "Metric": p.name, "Value": p.value.toLocaleString() }))
      ];

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Overview");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("TenderPro Admin Overview Report", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
      
      const rows = stats.map(s => [s.label, s.value]);
      
      autoTable(doc, {
        startY: 40,
        head: [["Metric", "Value"]],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      
      doc.save(`${filename}.pdf`);
    } else if (format === 'csv') {
      const rows = stats.map(s => [s.label, s.value]);
      const csvContent = [["Metric", "Value"], ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const timeframeOptions = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfcfd]">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-[300px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none" ref={timeframeRef}>
              <button 
                onClick={() => setShowTimeframePopover(!showTimeframePopover)}
                className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all border shadow-sm active:scale-95 ${
                  showTimeframePopover || timeframe !== 'This Month' 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar size={16} />
                <span>{timeframe}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showTimeframePopover ? 'rotate-180' : ''}`} />
              </button>

              {/* Timeframe Popover */}
              {showTimeframePopover && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-1">Select Timeframe</p>
                  {timeframeOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setTimeframe(option);
                        setShowTimeframePopover(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        timeframe === option ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{option}</span>
                      {timeframe === option && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Performance Trend</h3>
              <MoreVertical className="text-slate-400 cursor-pointer" size={20} />
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Pie Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase mb-8">Category Share</h3>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">3.0k</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tenders</span>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: item.color}}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">{((item.value / 3046) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExportReport}
        title="Export Admin Report"
      />
    </div>
  );
};

export default Reports;
