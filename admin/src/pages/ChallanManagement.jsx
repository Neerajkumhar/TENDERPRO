import React, { useState } from 'react';
import DeliveryChallan from './DeliveryChallan';
import InstallationChallan from './InstallationChallan';
import { Truck, Wrench } from 'lucide-react';

const ChallanManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('Delivery');

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Top Toggle Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-center sticky top-0 z-40">
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] shadow-inner border border-slate-200/50">
          <button
            onClick={() => setActiveSubTab('Delivery')}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeSubTab === 'Delivery' 
                ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-900/5 scale-100' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 scale-95'
            }`}
          >
            <Truck size={16} />
            Delivery Challans
          </button>
          <button
            onClick={() => setActiveSubTab('Installation')}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeSubTab === 'Installation' 
                ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-900/5 scale-100' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 scale-95'
            }`}
          >
            <Wrench size={16} />
            Installation Challans
          </button>
        </div>
      </div>

      {/* Render Component */}
      <div className="flex-1">
        {activeSubTab === 'Delivery' ? <DeliveryChallan /> : <InstallationChallan />}
      </div>
    </div>
  );
};

export default ChallanManagement;
