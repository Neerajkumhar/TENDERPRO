import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExportModal from '../components/ExportModal';
import {
  ArrowLeft,
  Calendar,
  Wallet,
  TrendingUp,
  PieChart,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

const mockTransactions = [
  { id: 'TRX-001', date: '2024-05-10', description: 'Q2 Software Licenses', amount: 15000, status: 'Completed', department: 'IT' },
  { id: 'TRX-002', date: '2024-05-12', description: 'Marketing Campaign Ad Spend', amount: 25000, status: 'Completed', department: 'Marketing' },
  { id: 'TRX-003', date: '2024-05-15', description: 'Logistics Vendor Payment', amount: 45000, status: 'Pending', department: 'Operations' },
  { id: 'TRX-004', date: '2024-05-18', description: 'Office Equipment Upgrade', amount: 8500, status: 'Completed', department: 'Operations' },
  { id: 'TRX-005', date: '2024-05-20', description: 'Consulting Retainer', amount: 12000, status: 'Processing', department: 'R&D' }
];

const BudgetDetails = ({ category, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (!category) return null;

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const exportData = mockTransactions.filter(trx => {
      const trxDate = new Date(trx.date);
      return trxDate >= start && trxDate <= end;
    });

    if (exportData.length === 0) {
      alert("No transactions found for the selected time period.");
      return;
    }

    const filename = `Admin_Budget_Report_${category.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}`;

    if (format === 'csv') {
      const headers = ['Transaction ID', 'Date', 'Description', 'Status', 'Amount'];
      const rows = exportData.map(trx => [
        trx.id,
        trx.date,
        trx.description,
        trx.status,
        trx.amount.toFixed(2)
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

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
      const exportRows = exportData.map(trx => ({
        "Transaction ID": trx.id,
        "Date": trx.date,
        "Description": trx.description,
        "Status": trx.status,
        "Amount": trx.amount
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Budget");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Budget Report: ${category.name}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
      
      const rows = exportData.map(trx => [trx.id, trx.date, trx.description, trx.status, trx.amount.toLocaleString()]);
      doc.autoTable({
        startY: 35,
        head: [["ID", "Date", "Description", "Status", "Amount"]],
        body: rows,
      });
      doc.save(`${filename}.pdf`);
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f8fafc] min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Allocation Details
              </span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                ${category.status === 'ON TRACK' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 
                  category.status === 'OVER BUDGET' ? 'bg-rose-50 text-rose-600' : 
                  'bg-emerald-50 text-emerald-600'}`}>
                {category.status}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mt-2">
              {category.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Warning Alert if high utilization */}
      {category.utilization >= 80 && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-600 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="shrink-0" />
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider">Critical Utilization Alert</h5>
              <p className="text-[10px] font-bold text-rose-500 mt-0.5">This budget category has reached {category.utilization}% of its total allocation. Please monitor expenditures closely.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-start group">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4 transition-transform group-hover:scale-110">
            <Wallet size={20} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Allocated</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight mb-1">${category.allocated.toLocaleString()}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Fiscal Year 2024</span>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-start group">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500 mb-4 transition-transform group-hover:scale-110">
            <TrendingUp size={20} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight mb-1">${category.spent.toLocaleString()}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Year to Date</span>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-start group md:col-span-2">
          <div className="flex justify-between w-full mb-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
              <PieChart size={20} />
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Current Trend</span>
              <div className={`flex items-center gap-1 text-[11px] font-black ${category.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                <ArrowUpRight size={14} className={category.trend.startsWith('-') ? 'rotate-90' : ''} />
                <span>{category.trend} This Month</span>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilization Progress</span>
              <span className={`text-lg font-black ${category.utilization > 100 ? 'text-rose-500' : 'text-slate-900'}`}>{category.utilization}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${category.utilization > 100 ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'} transition-all duration-1000`} 
                style={{ width: `${Math.min(category.utilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight italic uppercase">Recent Transactions</h2>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mt-1 uppercase">EXPENDITURES FOR THIS BUDGET</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockTransactions.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase())).map((trx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{trx.id}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{trx.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">{trx.description}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                      ${trx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                        trx.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                        'bg-blue-50 text-blue-600'}`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800 text-right">${trx.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        onExport={handleExportReport}
        title="Export Budget Details"
      />
    </div>
  );
};

export default BudgetDetails;
