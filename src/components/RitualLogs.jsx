import React, { useState, useEffect } from 'react';
import { ScrollText, Clock, CheckCircle, PlayCircle, Loader2, Shield, Sun, X } from 'lucide-react';
import { fetchRealTimeStatus } from '../services/liveDataService';

const MissionLogItem = ({ time, ritual, status, duration }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-all group">
    <div className="flex flex-col items-center">
       <div className="text-[10px] font-black text-slate-400 uppercase leading-none">{time}</div>
       <div className="h-8 w-[1px] bg-slate-200 my-1"></div>
    </div>
    
    <div className="flex-1">
       <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{ritual}</h4>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
             status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' :
             status === 'ACTIVE' ? 'bg-yellow-50 border-yellow-500/20 text-yellow-600 animate-pulse' :
             'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
             {status}
          </span>
       </div>
       <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1">
             <Clock size={10} />
             {duration || 'Processing'}
          </div>
          <div className="flex items-center gap-1 text-emerald-600/60">
             <Shield size={10} />
             LIVE SYNC
          </div>
       </div>
    </div>
    
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
       {status === 'ACTIVE' ? <Loader2 size={16} className="text-yellow-600 animate-spin" /> : <CheckCircle size={16} className="text-emerald-500" />}
    </div>
  </div>
);

const RitualLogs = ({ isOpen, onClose, sector = 'tirupati' }) => {
  const [logs, setLogs] = useState([]);
  const MANTRAS = {
    tirupati: 'Om Namo Venkatesaya',
    vijayawada: 'Om Namo Durgaye',
    srisailam: 'Om Namah Shivaya',
    simhachalam: 'Om Namo Narasimhaya',
    annavaram: 'Om Namo Satyanarayanaya',
    sabarimala: 'Swamiye Saranam Ayyappa'
  };

  useEffect(() => {
    if (isOpen) {
       const updateLogs = async () => {
          const data = await fetchRealTimeStatus(sector);
          setLogs(data.rituals?.map(r => ({
             time: r.start,
             ritual: r.name,
             status: r.status,
             duration: `${r.start} - ${r.end}`
          })) || []);
       };
       updateLogs();
    }
  }, [isOpen, sector]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[6000] flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div 
        className="w-[500px] max-h-[90vh] bg-white rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden flex flex-col animate-scale-up relative z-[6001]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-white to-slate-50 border-b border-slate-100 flex justify-between items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-[0.05] rotate-12">
              <ScrollText size={120} className="text-slate-900" />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <Sun size={18} className="text-yellow-600 animate-spin-slow" />
                 <span className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.4em]">{MANTRAS[sector] || MANTRAS.tirupati}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sacred Mission Logs</h2>
              <p className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest">Real-Time IST Orchestration Grid</p>
           </div>
           
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
             className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all bg-white relative z-50 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
           >
              <X size={20} />
           </button>
        </div>

        {/* Logs Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 sacred-scrollbar bg-white shadow-inner">
           {logs.length > 0 ? logs.map((log, i) => (
             <MissionLogItem key={i} {...log} />
           )) : (
             <div className="py-20 text-center space-y-4">
                <Loader2 size={40} className="mx-auto text-yellow-600 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Live Mission Grid...</p>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IST ZONE SYNC ACTIVE</span>
           </div>
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
             className="px-6 py-3 bg-yellow-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg hover:shadow-yellow-600/20 active:scale-95 cursor-pointer"
           >
              Dismiss Log
           </button>
        </div>
      </div>
      
      {/* Background Dimming Close */}
      <div className="absolute inset-0 cursor-pointer z-0" onClick={onClose}></div>
    </div>
  );
};

export default RitualLogs;
