import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Zap, ChevronRight, Navigation, Crosshair, Database, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAllSectorsData } from '../services/liveDataService';

const LandingPage = ({ onSelectSector, onOpenOverseer }) => {
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
     const syncLive = async () => {
        try {
           const data = await fetchAllSectorsData();
           setLiveStats(data.sectors);
        } catch (e) {
           console.error("Landing Grid Sync Failed:", e);
        }
     };
     syncLive();
     const interval = setInterval(syncLive, 30000);
     return () => clearInterval(interval);
  }, []);

  const sectors = [
    {
      id: 'tirupati',
      num: '01',
      name: 'Tirupati AI',
      location: 'Seshachalam Hills',
      description: 'Strategic AI-Powered Hub for Lord Venkateswara Darshan Management.',
      color: 'text-yellow-500',
      godIcon: '/assets/gods/venkateswara.png'
    },
    {
      id: 'vijayawada',
      num: '02',
      name: 'Vijayawada AI Hub',
      location: 'Indrakeeladri Hill',
      description: 'Tactical Mission Hub for Kanaka Durga Temple Navigation & Intelligence.',
      color: 'text-emerald-500',
      godIcon: '/assets/gods/durga.png'
    },
    {
      id: 'srisailam',
      num: '03',
      name: 'Srisailam AI',
      location: 'Nallamala Forests',
      description: 'Strategic Hub for Mallikarjuna Jyotirlinga. Specialized in Forest Gate Logistics.',
      color: 'text-orange-500',
      godIcon: '/assets/gods/mallikarjuna.png'
    },
    {
      id: 'simhachalam',
      num: '04',
      name: 'Simhachalam AI',
      location: 'Simhagiri Hill',
      description: 'Tactical Hub for Narasimha Swamy. Specialized in Crowd Control.',
      color: 'text-yellow-400',
      godIcon: '/assets/gods/narasimha.png'
    },
    {
      id: 'annavaram',
      num: '05',
      name: 'Annavaram AI',
      location: 'Ratnagiri Hill',
      description: 'Strategic Hub for Satyanarayana Swamy. Specialized in Vratam Logistics.',
      color: 'text-blue-500',
      godIcon: '/assets/gods/satyanarayana.png'
    },
    {
      id: 'sabarimala',
      num: '06',
      name: 'Sabarimala AI Hub',
      location: 'Periyar, Kerala',
      description: 'Mission Hub for Ayyappa. Specialized in 18-Steps & Pamba Navigation.',
      color: 'text-teal-500',
      godIcon: '/assets/gods/ayyappa.png'
    }
  ];

  return (
    <div className="h-screen w-full bg-aurora flex flex-col items-center justify-start pt-12 pb-24 px-8 relative overflow-y-auto overflow-x-hidden sacred-scrollbar">
      {/* GLOBAL MISSION HUD TICKER */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-slate-950 text-white z-[5000] flex items-center overflow-hidden border-b border-slate-800 shadow-2xl">
         <div className="animate-marquee whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] flex gap-12 items-center px-10">
            <span className="flex items-center gap-2 text-yellow-500"><Shield size={10} /> MISSION PULSE: 06 SACRED HUBS ONLINE</span>
            {sectors.map(s => (
               <span key={s.id} className="flex items-center gap-2">
                  {s.name.toUpperCase()}: {liveStats?.[s.id]?.grid_health || '0'}% OK • {liveStats?.[s.id]?.darshan_metrics?.free_waiting?.value || '0'}H WAIT
               </span>
            ))}
            <span className="text-slate-500 opacity-50">• SACRED GRID SYNCHRONIZED • {new Date().toLocaleTimeString()} •</span>
         </div>
      </div>

      {/* BACKGROUND SACRED BRANDING LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 living-grid opacity-30"></div>
         <div className="absolute inset-0 sacred-mandala-overlay opacity-10"></div>
         
         {/* FLOATING SACRED SYMBOLS */}
         <div className="absolute top-[15%] left-[10%] text-yellow-500/10 animate-float-gentle [animation-duration:8s]">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
               <path d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5z M50 85c-19.3 0-35-15.7-35-35s15.7-35 35-35s35 15.7 35 35-15.7 35-35 35z" />
               <path d="M50 25c-13.8 0-25 11.2-25 25s11.2 25 25 25s25-11.2 25-25-11.2-25-25-25z M50 65c-8.3 0-15-6.7-15-15s6.7-15 15-15s15 6.7 15 15-6.7 15-15 15z" />
            </svg>
         </div>
         <div className="absolute bottom-[20%] right-[15%] text-emerald-500/10 animate-float-gentle [animation-duration:12s]">
            <span className="text-9xl font-serif">ॐ</span>
         </div>
         <div className="absolute top-[30%] right-[10%] text-yellow-500/5 animate-spin-slow">
            <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
               <circle cx="50" cy="50" r="45" />
               <path d="M50 5 L50 95 M5 50 L95 50" />
               <circle cx="50" cy="50" r="30" />
               <path d="M14.6 14.6 L85.4 85.4 M14.6 85.4 L85.4 14.6" />
            </svg>
         </div>

         {/* PULSING SACRED AURA */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-yellow-500/10 via-transparent to-emerald-500/10 blur-3xl animate-pulse-sacred opacity-30"></div>
         
         {/* ROTATING MANDALA BACKDROP */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
            <div className="w-[800px] h-[800px] border-[1px] border-yellow-600 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-0 w-[800px] h-[800px] border-[1px] border-emerald-600 rounded-full animate-spin-slow-reverse scale-90"></div>
            <div className="absolute inset-0 w-[800px] h-[800px] border-[1px] border-yellow-600 rotate-45 animate-spin-slow"></div>
         </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 relative z-10 mt-10"
      >
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-yellow-500/10 bg-white/50 backdrop-blur-md shadow-sm mb-4">
           <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse-glow" />
           <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em]">Universal Sacred Intelligence</span>
        </div>
        
        <div className="relative inline-block mb-1">
           {/* SACRED EMBLEM BACKDROP */}
           <div className="absolute -inset-20 flex items-center justify-center opacity-10 animate-spin-slow">
              <img src="/namam_bg.png" alt="" className="w-64 h-64 object-contain brightness-0" />
           </div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 0.4, scale: 1 }}
             transition={{ duration: 2 }}
             className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none"
           >
              <img src="/namam_bg.png" alt="" className="w-full h-full object-contain" />
           </motion.div>
           
           <h1 className="text-7xl font-black text-slate-950 tracking-tighter uppercase leading-none relative z-10 flex items-center gap-4 select-none">
              <span className="tracking-tight">Darshanam</span>
              <span className="gold-text italic">AI</span>
           </h1>
        </div>
        
        <p className="text-slate-500 font-bold max-w-lg mx-auto text-[11px] leading-relaxed mb-4 tracking-tight uppercase tracking-[0.2em] opacity-80">
           Orchestrating divine flow across the state grid.
        </p>

        {/* GODS COMPOSITE GALLERY (FLOATING) */}
        <div className="flex justify-center items-center gap-4 mb-8 opacity-40">
           {sectors.map((s, idx) => (
              <motion.div 
                 key={s.id}
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                 className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-white shadow-sm p-1"
              >
                 <img src={s.godIcon} alt="" className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all cursor-help" />
              </motion.div>
           ))}
        </div>

        <div className="flex justify-center gap-4 mb-6">
           <button 
             onClick={onOpenOverseer}
             className="group relative px-8 py-4 bg-slate-950 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl border border-slate-800"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3">
                 <Shield size={16} className="text-white group-hover:text-slate-900 transition-colors" />
                 <span className="text-[11px] font-black text-white group-hover:text-slate-900 uppercase tracking-[0.3em]">Initialize Overseer Mode</span>
              </div>
           </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl relative z-10">
        {sectors.map((sector, index) => {
          const stats = liveStats?.[sector.id];
          return (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectSector(sector.id)}
              className={`group cursor-pointer relative sacred-glass p-6 rounded-[2.5rem] transition-all hover:-translate-y-2 hover:shadow-[0_45px_100px_rgba(212,175,55,0.2)] overflow-hidden border border-white/90 flex flex-col min-h-[300px]`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-all opacity-0 group-hover:opacity-10 ${sector.id === 'tirupati' ? 'from-yellow-500 to-transparent' : 'from-slate-500 to-transparent'}`} />
              
              <div className="flex items-start justify-between mb-4">
                 <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-1 shadow-md group-hover:scale-110 group-hover:border-yellow-500/50 transition-all overflow-hidden relative z-10 bg-gradient-to-b from-white to-slate-50">
                    <img src={sector.godIcon} alt="" className="w-full h-full object-contain rounded-xl" />
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-slate-900/5 italic tracking-tighter group-hover:text-yellow-500/10 transition-colors leading-none">
                       {sector.num}
                    </span>
                    {stats && (
                       <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white border border-slate-800 shadow-xl mt-2">
                          <Activity size={10} className="text-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black tracking-widest uppercase">{stats.grid_health}% OK</span>
                       </div>
                    )}
                 </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-0.5 group-hover:text-yellow-600 transition-colors">
                 {sector.name}
              </h2>
              <div className="flex items-center gap-1.5 mb-3 text-slate-400 font-bold text-[8px] uppercase tracking-[0.2em]">
                 <MapPin size={10} className="text-slate-300 group-hover:text-yellow-500 transition-colors" /> {sector.location}
              </div>

              <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-6 h-10 overflow-hidden italic line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                 {sector.description}
              </p>

              <div className="flex items-center justify-between mt-auto">
                 <div className="flex-1 flex flex-col gap-2">
                    {stats?.darshan?.categories ? (
                       <div className="flex flex-col gap-1.5 w-full">
                          {stats.darshan.categories.map((cat, ci) => (
                             <div key={ci} className="px-3 py-2 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-between group-hover:border-yellow-500/20 transition-all">
                                <div className="flex items-center gap-2">
                                   <Clock size={10} className="text-yellow-600" />
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{cat.label}</span>
                                </div>
                                <span className="text-[11px] font-black text-slate-950 tracking-tighter leading-none">{cat.value}H</span>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 shadow-inner flex flex-col justify-center min-w-[100px] animate-pulse">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Wait Time</span>
                          <span className="text-[11px] font-black text-slate-950 tracking-tighter">Syncing...</span>
                       </div>
                    )}
                 </div>
                 <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all ml-4 group-hover:shadow-lg">
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 text-center opacity-40 select-none pb-12">
         <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.8em] border-t border-slate-200 pt-10 px-16 block mx-auto max-w-3xl">Global Divine Overlay • AI Engine Integrated • 2026</span>
      </div>
    </div>
  );
};

export default LandingPage;
