import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (!category) return null;

  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      autoTable(doc, {
        startY: 35,
        head: [["ID", "Date", "Description", "Status", "Amount"]],
        body: rows,
      });
      doc.save(`${filename}.pdf`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 bg-[#f8fafc] min-h-screen text-left">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                Allocation Details
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider
                ${category.status === 'ON TRACK' ? 'bg-blue-600 text-white' : 
                  category.status === 'OVER BUDGET' ? 'bg-rose-500 text-white' : 
                  'bg-emerald-505 text-white'}`}>
                {category.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase mt-1">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Warning Alert if high utilization */}
      {category.utilization >= 80 && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-rose-600 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={20} className="shrink-0" />
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-wider">Critical Utilization Alert</h5>
              <p className="text-[9px] font-bold text-rose-505 mt-0.5">This budget category has reached {category.utilization}% of its total allocation. Please monitor expenditures closely.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 flex flex-col items-start group">
          <div className="p-2.5 rounded-xl bg-blue-50/50 text-blue-600 mb-3">
            <Wallet size={16} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Allocated</span>
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">${category.allocated.toLocaleString()}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block mt-1 leading-none">Fiscal Year 2024</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 flex flex-col items-start group">
          <div className="p-2.5 rounded-xl bg-emerald-50/50 text-emerald-500 mb-3">
            <TrendingUp size={16} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Spent</span>
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">${category.spent.toLocaleString()}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block mt-1 leading-none">Year to Date</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 flex flex-col items-start group sm:col-span-2">
          <div className="flex justify-between w-full mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50/50 text-purple-600">
              <PieChart size={16} />
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Current Trend</span>
              <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${category.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                <ArrowUpRight size={12} className={category.trend.startsWith('-') ? 'rotate-90' : ''} />
                <span>{category.trend} This Month</span>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-auto">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[9px] font-black text-slate-555 uppercase tracking-widest">Utilization Progress</span>
              <span className={`text-xs font-black ${category.utilization > 100 ? 'text-rose-500' : 'text-slate-900'}`}>{category.utilization}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${category.utilization > 100 ? 'bg-rose-500' : 'bg-blue-600'} transition-all`} 
                style={{ width: `${Math.min(category.utilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white text-left">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight uppercase">Recent Transactions</h2>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all w-full sm:w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`p-2 rounded-xl transition-all ${showFilterDropdown ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <Filter size={14} />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-100 z-50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="p-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Filter by Status</div>
                  {['ALL', 'Completed', 'Pending', 'Processing'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-100 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              <Download size={14} className="text-blue-500" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[8.5px] sm:text-[9.5px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-5 sm:px-8 py-3.5">Transaction ID</th>
                <th className="px-5 sm:px-8 py-3.5">Date</th>
                <th className="px-5 sm:px-8 py-3.5">Description</th>
                <th className="px-5 sm:px-8 py-3.5">Status</th>
                <th className="px-5 sm:px-8 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((trx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-5 sm:px-8 py-4 text-xs font-bold text-slate-600">{trx.id}</td>
                  <td className="px-5 sm:px-8 py-4 text-xs font-bold text-slate-600">{trx.date}</td>
                  <td className="px-5 sm:px-8 py-4 text-xs sm:text-sm font-black text-slate-800">{trx.description}</td>
                  <td className="px-5 sm:px-8 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider
                      ${trx.status === 'Completed' ? 'bg-emerald-555 text-white' : 
                        trx.status === 'Pending' ? 'bg-amber-555 text-white' : 
                        'bg-blue-555 text-white'}`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-5 sm:px-8 py-4 text-xs sm:text-sm font-black text-slate-800 text-right">${trx.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto text-slate-300 mb-2" size={20} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions matching filters</p>
            </div>
          )}
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
