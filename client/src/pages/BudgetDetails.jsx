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

const BudgetDetails = ({ category, expenses = [], onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (!category) return null;

  // Map expenses to transaction format
  const transactions = expenses.map(e => ({
    id: e.id,
    date: e.date,
    description: e.description || `${e.category} payment to ${e.vendor || 'Vendor'}`,
    amount: parseFloat(e.amount || 0),
    status: e.status,
    vendor: e.vendor
  }));

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.vendor && t.vendor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || (t.status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportReport = ({ format, startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const exportData = transactions.filter(trx => {
      const trxDate = new Date(trx.date);
      return trxDate >= start && trxDate <= end;
    });

    if (exportData.length === 0) {
      alert("No transactions found for the selected time period.");
      return;
    }

    const filename = `Budget_Report_${category.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}`;

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
      doc.setFontSize(14);
      doc.text(`Budget Report: ${category.name}`, 14, 15);
      doc.setFontSize(9);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 22);
      
      const rows = exportData.map(trx => [trx.id, trx.date, trx.description, trx.status, `₹${trx.amount.toLocaleString('en-IN')}`]);
      autoTable(doc, {
        startY: 28,
        head: [["ID", "Date", "Description", "Status", "Amount"]],
        body: rows,
        styles: { fontSize: 8 }
      });
      doc.save(`${filename}.pdf`);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#f8fafc] min-h-screen text-left space-y-3.5 sm:space-y-4 animate-in fade-in duration-500">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 transition-all shadow-2xs"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                Allocation Details
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase tracking-wider
                ${category.status === 'ON TRACK' ? 'bg-blue-600 text-white' : 
                  category.status === 'OVER BUDGET' ? 'bg-rose-500 text-white' : 
                  'bg-blue-500 text-white'}`}>
                {category.status}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase mt-0.5">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Warning Alert if high utilization */}
      {category.utilization >= 80 && (
        <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-rose-600 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <div>
              <h5 className="text-[9px] font-bold uppercase tracking-wider">Critical Utilization Alert</h5>
              <p className="text-[8.5px] font-medium text-rose-600 mt-0.5">This budget category has reached {category.utilization}% of its total allocation. Please monitor expenditures closely.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-1.5">
            <Wallet size={13} />
          </div>
          <div>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Total Allocated</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">₹{category.allocated.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mb-1.5">
            <TrendingUp size={13} />
          </div>
          <div>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Total Spent</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-none">₹{category.spent.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between sm:col-span-2">
          <div className="flex justify-between items-center mb-1.5">
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <PieChart size={13} />
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Trend</span>
              <div className={`flex items-center justify-end gap-0.5 text-[9px] font-bold ${category.trend.startsWith('+') ? 'text-rose-500' : 'text-blue-500'}`}>
                <ArrowUpRight size={10} className={category.trend.startsWith('-') ? 'rotate-90' : ''} />
                <span>{category.trend}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Utilization</span>
              <span className={`text-[10px] font-extrabold ${category.utilization > 100 ? 'text-rose-500' : 'text-slate-900'}`}>{category.utilization}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${category.utilization > 100 ? 'bg-rose-500' : 'bg-blue-600'} transition-all`} 
                style={{ width: `${Math.min(category.utilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/40 text-left">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent Transactions</h2>
            <p className="text-[9px] text-slate-500 font-medium">Expenditures billed to this category.</p>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-7 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px] font-medium focus:outline-none focus:border-blue-500 transition-all w-full sm:w-40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`p-1.5 rounded-lg border transition-all ${showFilterDropdown ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={13} />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 z-50 p-1 animate-in fade-in">
                  {['ALL', 'COMPLETED', 'PENDING', 'APPROVED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Download size={13} className="text-blue-500" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <th className="px-3.5 py-2">Transaction ID</th>
                <th className="px-3.5 py-2">Date</th>
                <th className="px-3.5 py-2">Description</th>
                <th className="px-3.5 py-2">Status</th>
                <th className="px-3.5 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((trx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-all">
                  <td className="px-3.5 py-2 text-[10px] font-bold text-blue-600">{trx.id}</td>
                  <td className="px-3.5 py-2 text-[10px] font-medium text-slate-500 whitespace-nowrap">{trx.date}</td>
                  <td className="px-3.5 py-2 text-[11px] font-bold text-slate-800">{trx.description}</td>
                  <td className="px-3.5 py-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                      ${trx.status === 'COMPLETED' || trx.status === 'APPROVED' ? 'bg-blue-600 text-white' : 
                        trx.status === 'PENDING' ? 'bg-amber-500 text-white' : 
                        'bg-slate-500 text-white'}`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-[11px] font-bold text-slate-900 text-right whitespace-nowrap">₹{trx.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs italic font-medium">
              No transactions matching filters
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
