import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, Zap, Map as MapIcon, 
  Terminal, Globe, ChevronRight, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, MousePointer,
  Wallet, DoorOpen, Bus, Ticket, Sun
} from 'lucide-react';
import { fetchAllSectorsData } from '../services/liveDataService';
import GisMap from './GisMap';

import SabarimalaIcon from '../assets/gods/ayyappa.png';
import VijayawadaIcon from '../assets/gods/durga.png';
import SrisailamIcon from '../assets/gods/mallikarjuna.png';
import SimhachalamIcon from '../assets/gods/narasimha.png';
import AnnavaramIcon from '../assets/gods/satyanarayana.png';
import TirupatiIcon from '../assets/gods/venkateswara.png';

const UnifiedDashboard = ({ onDeploySector, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetchAllSectorsData();
      setData(res);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const sectors = [
    { id: 'tirupati', name: 'Tirupati AI', mantra: 'Om Namo Venkatesaya', color: 'border-yellow-500', text: 'text-slate-900', accent: 'text-yellow-600', bg: 'bg-white/80', icon: TirupatiIcon },
    { id: 'vijayawada', name: 'Vijayawada AI Hub', mantra: 'Om Namo Durgaye', color: 'border-emerald-500', text: 'text-slate-900', accent: 'text-emerald-600', bg: 'bg-white/80', icon: VijayawadaIcon },
    { id: 'srisailam', name: 'Srisailam AI', mantra: 'Om Namah Shivaya', color: 'border-orange-500', text: 'text-slate-900', accent: 'text-orange-600', bg: 'bg-white/80', icon: SrisailamIcon },
    { id: 'simhachalam', name: 'Simhachalam AI', mantra: 'Om Namo Narasimhaya', color: 'border-yellow-400', text: 'text-slate-900', accent: 'text-yellow-600', bg: 'bg-white/80', icon: SimhachalamIcon },
    { id: 'annavaram', name: 'Annavaram AI', mantra: 'Om Namo Satyanarayanaya', color: 'border-blue-500', text: 'text-slate-900', accent: 'text-blue-600', bg: 'bg-white/80', icon: AnnavaramIcon },
    { id: 'sabarimala', name: 'Sabarimala AI Hub', mantra: 'Swamiye Saranam Ayyappa', color: 'border-teal-500', text: 'text-slate-900', accent: 'text-teal-600', bg: 'bg-white/80', icon: SabarimalaIcon }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-[5000] flex flex-col items-center justify-center p-8 overflow-hidden">
         <div className="absolute inset-0 opacity-20">
            <img src="/temple_bg.png" className="w-full h-full object-cover blur-3xl scale-110" alt="" />
         </div>
         <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-yellow-500/20 animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Zap size={32} className="text-yellow-600 animate-pulse" />
            </div>
         </div>
         <div className="mt-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] animate-pulse relative z-10">Synchronizing Sacred Grid...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-aurora z-[5000] flex flex-col overflow-hidden text-slate-900 font-sans selection:bg-yellow-500/30">
      {/* Background Neural Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 living-grid opacity-30"></div>
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-yellow-500/5 via-transparent to-emerald-500/5 blur-3xl opacity-40"></div>
      </div>

      {/* HUD HEADER */}
      <div className="h-20 sacred-glass flex items-center justify-between px-10 shrink-0 relative z-[7000] m-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/80">
         <div className="flex items-center gap-8">
            <div className="flex flex-col">
               <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-950 flex items-center gap-2">
                  <span>Darshan Ai</span>
                  <span className="italic text-yellow-600 font-serif lowercase opacity-80">Dashboard</span>
               </h1>
            </div>
            <div className="h-12 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <Activity size={12} className={data.overall_grid_readiness > 0 ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-nowrap">
                      Global Telemetry: {data.overall_grid_readiness > 0 ? "ACTIVE" : "OFFLINE"}
                   </span>
                </div>
               <div className="px-3 py-1 rounded bg-slate-100 border border-slate-200 text-[8px] font-black text-slate-500 uppercase tracking-widest">Channel SECURE</div>
            </div>
         </div>

         <button 
           onClick={onClose}
           className="px-8 py-3 rounded-full border border-slate-900 bg-slate-950 text-white hover:bg-neutral-800 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 z-[8000]"
         >
           Exit Mission Grid
         </button>
      </div>

      {/* 🧭 SACRED COMMAND DIRECTIVE (NEW) */}
      <AnimatePresence>
         {data.global_directive && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mx-10 mb-2 mt-2 px-8 py-4 bg-slate-950 rounded-2xl border border-yellow-500/30 flex items-center justify-between group cursor-pointer hover:border-yellow-500 transition-all shadow-2xl relative overflow-hidden"
               onClick={() => {
                  if (data.global_directive.target) {
                     onDeploySector(data.global_directive.target);
                  }
               }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent opacity-50" />
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 animate-pulse" />
               
               <div className="flex items-center gap-6 relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 group-hover:scale-110 transition-transform">
                     <Zap size={20} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-center gap-3 mb-0.5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                           data.global_directive.type === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-slate-950'
                        }`}>
                           {data.global_directive.type} MANDATE
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Decision Link</span>
                     </div>
                     <p className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-yellow-400 transition-colors">
                        {data.global_directive.text}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-4 relative z-10">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Focus Node</span>
                     <span className="text-[10px] font-black text-white uppercase">{data.global_directive.target?.toUpperCase() || 'GLOBAL'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                     <ChevronRight size={20} />
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* COMMAND MAIN VIEW */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 overflow-hidden relative z-10">
         
         {/* LEFT: SECTOR CARDS */}
         <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-y-auto sacred-scrollbar pb-10 px-2 mt-2 h-full">
            {sectors.map(s => {
               const sectorData = data.sectors?.[s.id];
               if (!sectorData) return null;

               const metrics = sectorData.darshan_metrics || {};
               const lockers = sectorData.locker_metrics || { percent: 0 };
               const accommodation = sectorData.accommodation || {};

               return (
                  <motion.div 
                     key={s.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`p-6 rounded-[2rem] border-2 bg-white/95 backdrop-blur-xl ${s.color} shadow-[0_15px_35px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:scale-[1.02] transition-all flex flex-col gap-3 min-h-[220px]`}
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-10 -translate-y-10 group-hover:bg-yellow-50 transition-colors" />
                     <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-1 shadow-sm">
                              <img src={s.icon} className="w-full h-full object-contain" alt={s.name} />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">{s.mantra}</div>
                                 <div className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-[0.1em] border ${
                                    sectorData.syncStatus === 'LIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                 }`}>
                                    {sectorData.syncStatus === 'LIVE' ? 'LIVE SYNC' : 'OFFLINE'}
                                 </div>
                              </div>
                              <h3 className={`text-xl font-black uppercase tracking-tighter ${s.text}`}>{s.name}</h3>
                           </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sectorData.grid_health > 80 ? 'bg-emerald-50 text-emerald-600' : sectorData.grid_health > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-50 text-slate-300'} border border-current opacity-80`}>
                           {sectorData.grid_health}% READY
                        </div>
                     </div>

                     <div className="flex flex-col gap-2 relative z-10 mt-2">
                        {sectorData.darshan?.categories ? (
                           <div className="grid grid-cols-2 gap-2">
                              {sectorData.darshan.categories.map((cat, ci) => (
                                 <div key={ci} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-1 group/item hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2">
                                       <Clock size={10} className="text-yellow-600" />
                                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{cat.label}</span>
                                    </div>
                                    <div className="text-sm font-black text-slate-900 tracking-tighter uppercase">{cat.value} HRS</div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                 <Clock size={12} className="text-slate-400" />
                                 <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Free Wait</span>
                              </div>
                              <div className="text-sm font-black text-slate-900 tracking-tighter uppercase">{metrics.free_waiting?.value || '0'} HRS</div>
                           </div>
                        )}
                        
                        <div className="p-3 bg-white/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Shield size={12} className="text-emerald-600" />
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Locker Availability</span>
                           </div>
                           <div className="text-[10px] font-black text-slate-950 uppercase">{lockers.percent || 0}% SECURE</div>
                        </div>
                     </div>

                     <div className="mt-4 flex items-center justify-between">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                           {s.id === 'tirupati' ? `SSD: ${metrics.ssd_tokens || '12.4K'}` : 'Mission Optimized Flow'}
                        </div>
                        <button 
                           onClick={() => onDeploySector(s.id)}
                           className={`px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-yellow-600 transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg`}
                        >
                           <Zap size={10} className="text-yellow-400 animate-pulse" /> Deploy Tactical Hub
                        </button>
                     </div>
                  </motion.div>
                );
            })}
         </div>

         {/* CENTER: HIGH-FIDELITY GEOGRAPHIC GRID */}
         <div className="flex-1 sacred-glass rounded-[3rem] border border-white/80 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] group flex flex-col p-8 z-10 h-full">
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #b8860b 0.5px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="relative z-[1000] mb-6 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                     <Globe size={24} className="text-yellow-600 animate-spin-slow" />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mb-0.5">Sacred Geographic Grid</div>
                     <div className="text-xl font-black uppercase tracking-tighter text-slate-950">Universal Synthesis</div>
                  </div>
               </div>
               <div className="px-5 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white shadow-sm flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">Neural Link Secure</span>
               </div>
            </div>

            {/* REAL-WORLD MISSION GRID */}
            <div className="flex-1 relative border border-white/50 rounded-3xl bg-white/30 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-inner translate-z-0">
                <GisMap 
                   mapView={{ center: [14.0, 79.5], zoom: 6 }}
                   sector="all"
                   crowdData={Object.entries(data.sectors).map(([id, s]) => ({ id, status: s.grid_health > 80 ? 'NORMAL' : 'HEAVY', info: `${s.grid_health}% READY` }))}
                   darshanData={Object.fromEntries(Object.entries(data.sectors).map(([id, s]) => [id, s.darshan]))}
                   showCrowdMarkers={true}
                   showGoogleTraffic={false}
                />
            </div>
         </div>

         {/* RIGHT: GLOBAL MISSION LOG */}
         <div className="w-full lg:w-80 flex flex-col gap-6 overflow-hidden z-20 h-full">
            <div className="flex-1 sacred-glass rounded-[2.5rem] border border-white/80 p-8 flex flex-col overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] h-full">
               <div className="flex items-center gap-3 mb-8 shrink-0">
                  <Terminal size={16} className="text-yellow-600" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Sacred Ops Log</span>
               </div>
               <div className="flex-1 overflow-y-auto sacred-scrollbar flex flex-col gap-6">
                  {data.mission_log?.map((log, i) => (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center shrink-0">
                           <div className={`w-1.5 h-1.5 rounded-full ${log.sector === 'SYSTEM' ? 'bg-blue-500' : 'bg-yellow-500'} group-hover:scale-150 transition-transform`} />
                           <div className="w-[1px] h-full bg-slate-100 mt-2" />
                        </div>
                        <div>
                           <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{log.time} • {log.sector}</div>
                           <div className="text-[11px] font-bold text-slate-700 leading-snug group-hover:text-slate-950 transition-colors">{log.event}</div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group shrink-0 border border-slate-800">
               <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-transparent" />
               <div className="relative z-10">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Grid Readiness Matrix</div>
                  <div className="text-5xl font-black text-white tracking-tighter mb-4">{data.overall_grid_readiness}%</div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-400/10 py-2 px-4 rounded-full w-fit">
                     <Shield size={14} className="animate-pulse" /> Mission Optimal
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* GLOBAL HUD TICKER */}
      <div className="h-10 bg-slate-950 text-white flex items-center overflow-hidden border-t border-slate-800 shrink-0 relative z-[9000]">
         <div className="animate-marquee whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] flex gap-12 items-center px-10">
            <span className="flex items-center gap-2 text-yellow-500"><Shield size={10} /> {loading ? "SYNCHRONIZING..." : "OVERSEER SYNC: 06 SACRED HUBS ONLINE"}</span>
            {!loading && data && sectors.map(s => (
               <span key={s.id} className="flex items-center gap-2">
                  {s.name.toUpperCase()}: {data.sectors?.[s.id]?.grid_health || '0'}% OPTIMAL • {data.sectors?.[s.id]?.darshan_metrics?.free_waiting?.value || '0'}H WAIT
               </span>
            ))}
            <span className="text-slate-500">• MISSION SECURE • {new Date().toLocaleTimeString()} •</span>
         </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
