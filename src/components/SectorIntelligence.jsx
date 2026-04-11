import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Zap, MapPin, 
  TrendingUp, TrendingDown, Clock, 
  Shield, AlertCircle, ChevronRight, 
  Filter, Wind, Droplets, Sun, Database, Footprints, 
  LifeBuoy, Megaphone, Siren, HeartPulse, RefreshCcw, ShieldAlert, DoorOpen, AlertTriangle, Eye, ShieldCheck, Bus, Map as MapIcon, Database as DataIcon, Activity as ActivityIcon, Activity as HeartIcon, Activity as LogIcon, Activity as GridIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CrowdPredictor from './CrowdPredictor';

import SabarimalaIcon from '../assets/gods/ayyappa.png';
import VijayawadaIcon from '../assets/gods/durga.png';
import SrisailamIcon from '../assets/gods/mallikarjuna.png';
import SimhachalamIcon from '../assets/gods/narasimha.png';
import AnnavaramIcon from '../assets/gods/satyanarayana.png';
import TirupatiIcon from '../assets/gods/venkateswara.png';

const SectorIntelligence = ({ existingData, onLocatePlace, showGhatTraffic, setGhatTraffic, showPACMarkers, setPACMarkers, showCrowdMarkers, setCrowdMarkers, showGoogleTraffic, setGoogleTraffic, showEvacuationRoutes, setEvacuationRoutes, onGridTour, isOptimizing, setIsOptimizing, nextSyncIn, lastSync, sector = 'tirupati', transitFleet = [] }) => {
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, HILL, CITY
  const [expandedCard, setExpandedCard] = useState(null);

  // CRITICAL RESILIENCE GUARD
  if (!existingData || !existingData.grid_health) return (
     <div className="w-[380px] h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Zap size={30} className="text-yellow-500 animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Syncing Intelligence Hub...</span>
        </div>
     </div>
  );

  const liveData = existingData;
  const IS_TIRUPATI = sector === 'tirupati';

  const SECTOR_METADATA = {
     tirupati: { name: 'Venkateswara AI', deity: 'Om Namo Venkatesaya', icon: TirupatiIcon, hillNodes: ['vqc', 'mahadwaram', 'ladu', 'pushkarini', 'sarvadarshan'] },
     vijayawada: { name: 'Kanaka Durga AI', deity: 'Om Namo Durgaye', icon: VijayawadaIcon, hillNodes: ['temple', 'mukha_mandapam'] },
     srisailam: { name: 'Srisailam AI Hub', deity: 'Om Namah Shivaya', icon: SrisailamIcon, hillNodes: ['temple', 'pathala_ganga'] },
     simhachalam: { name: 'Narasimha AI', deity: 'Om Namo Narasimhaya', icon: SimhachalamIcon, hillNodes: ['temple', 'bus_stand'] },
     annavaram: { name: 'Annavaram AI', deity: 'Om Namo Satyanarayanaya', icon: AnnavaramIcon, hillNodes: ['temple', 'vratam_hall'] },
     sabarimala: { name: 'Sabarimala AI Hub', deity: 'Swamiye Saranam Ayyappa', icon: SabarimalaIcon, hillNodes: ['temple_sanctum', 'pathinettampadi', 'marakkoottam'] }
  };

  const sectorMeta = SECTOR_METADATA[sector] || SECTOR_METADATA.tirupati;

  const ALL_NODE_COORDS = {
    tirupati: {
      'temple': [13.6833, 79.3474], 'vqc': [13.6850, 79.3480], 'alipiri': [13.6500, 79.4000], 'govindaraja': [13.6300, 79.4150], 'tiruchanoor': [13.6080, 79.4520],
      'PAC1': [13.6285, 79.4215], 'PAC2': [13.6280, 79.4195], 'PAC3': [13.6505, 79.4005], 'PAC4': [13.6295, 79.4175], 'PAC5': [13.6840, 79.3510],
      'railway_station': [13.6276, 79.4190], 'bus_stand': [13.6490, 79.4010]
    },
    vijayawada: {
       'temple': [16.5153, 80.6050], 'mukha_mandapam': [16.5150, 80.6045], 'durga_ghat': [16.5135, 80.6065], 'prakasam_barrage': [16.5065, 80.6045], 
       'railway_station': [16.5186, 80.6206], 'bus_stand': [16.5100, 80.6150]
    },
    simhachalam: {
       'temple': [17.7665, 83.2505], 'bus_stand': [17.7600, 83.2450], 'madhavadhara': [17.7500, 83.2700], 'rly_station': [17.7470, 83.2100], 
       'priority_counter': [17.7668, 83.2507], 'medical_center': [17.7660, 83.2500]
    },
    annavaram: {
       'temple': [17.281, 82.396], 'vratam_hall': [17.2815, 82.3965], 'pampa_reservoir': [17.275, 82.390], 'rly_station': [17.268, 82.398], 'downhill_gate': [17.270, 82.395]
    },
    srisailam: {
       'temple': [16.0740, 78.8680], 'pathala_ganga': [16.0820, 78.8750], 'sakshi_ganapathi': [16.0645, 78.8610], 'phaladhara': [16.0620, 78.8550], 'dornala_gate': [15.9320, 79.1150], 'mannanur_gate': [16.3200, 78.7800]
    },
    sabarimala: {
       'temple_sanctum': [9.4346, 77.0814], 'pathinettampadi': [9.4330, 77.0830], 'pamba_camp': [9.3804, 77.0022], 'marakkoottam': [9.4350, 77.0840], 
       'erumely': [9.4940, 76.9310], 'nilackal': [9.3550, 77.0240], 'medical_center': [9.4320, 77.0810], 'pada_padam': [9.4094, 77.0705], 
       'chan_padam': [9.4200, 77.0800], 'jothi_darshan': [9.4178, 77.1197], 'ganapathy_shrine': [9.4344, 77.0811]
    }
  };

  const nodeCoords = ALL_NODE_COORDS[sector] || ALL_NODE_COORDS.tirupati;

  const filterData = (data, type) => {
    if (activeFilter === 'ALL') return data;
    if (type === 'PAC') {
       if (activeFilter === 'HILL') return data.filter(item => item.id === 'PAC5');
       if (activeFilter === 'CITY') return data.filter(item => item.id !== 'PAC5');
    }
    if (type === 'CROWD') {
       const hillNodes = sectorMeta.hillNodes;
       if (activeFilter === 'HILL') return data.filter(item => hillNodes.includes(item.id));
       if (activeFilter === 'CITY') return data.filter(item => !hillNodes.includes(item.id));
    }
    return data;
  };

  const filteredPACs = filterData(liveData?.pac_lockers || [], 'PAC');
  const filteredCrowds = filterData(liveData?.crowd_intelligence || [], 'CROWD');

  return (
    <div id="intelligence-sidebar" className="w-[380px] h-screen bg-white/80 backdrop-blur-3xl border-r border-slate-200 p-6 flex flex-col gap-6 z-[2000] shadow-2xl overflow-y-auto sacred-scrollbar relative">
      {/* BRANDING HEADER */}
      <div className="flex flex-col items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl relative overflow-hidden shrink-0 shadow-sm transition-all hover:border-yellow-500/30 group">
         <div className="flex items-center gap-4 w-full relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-500">
               <img 
                  src={sectorMeta.icon} 
                  alt={`${sector} Deity`} 
                  className="w-full h-full object-cover rounded-xl" 
               />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.3em] mb-1">
                  {sectorMeta.deity}
               </div>
               <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter leading-none truncate">
                  {sectorMeta.name}
               </h2>
            </div>
         </div>
         
         <div className="w-full bg-slate-50 rounded-xl py-2 flex justify-center items-center gap-4 border border-slate-100">
            <div className="flex items-center gap-1.5" title={liveData?.lastSource}>
               <Activity size={10} className={`text-emerald-500 ${nextSyncIn >= 28 ? 'animate-bounce' : ''}`} />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                  {nextSyncIn >= 28 ? 'SYNCED' : `PULSE: ${nextSyncIn}S`}
               </span>
               {liveData?.syncStatus === 'LIVE' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[6px] font-black rounded uppercase">LIVE LINK</span>
               )}
            </div>
            <div className="h-2 w-[1px] bg-slate-200" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
               {lastSync}
            </span>
         </div>
      </div>

      {/* 🚨 AI CROWD PREDICTOR */}
      <div className="shrink-0 flex flex-col gap-2">
         <CrowdPredictor sector={sector} currentGridHealth={liveData?.grid_health || 85} />
      </div>

      {/* 🔮 SACRED NEURAL VISION HUB (NEW) */}
      <section className="shrink-0 flex flex-col gap-4 p-6 bg-slate-950 border border-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Eye size={80} className="text-yellow-500/20 rotate-12" />
         </div>

          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sacred Neural Vision</h3>
               </div>
               {liveData?.lastSource && (
                  <a href={liveData.lastSource} target="_blank" rel="noreferrer" className="text-[6px] font-black text-slate-600 uppercase tracking-widest hover:text-yellow-500 transition-colors">
                     Verified via {liveData.lastSource.replace('https://', '')}
                  </a>
               )}
            </div>
            <button 
               onClick={onGridTour}
               className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[8px] font-black rounded-full uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all active:scale-95"
            >
               Initiate Grid Tour
            </button>
         </div>

         {/* LIVE CAM CAROUSEL */}
         <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-800 group/cam shadow-inner">
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
            <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.15] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {(liveData?.neural_cams && liveData?.neural_cams?.length > 0) ? (
               <img 
                  src={liveData?.neural_cams?.[0]?.url} 
                  alt="Neural Cam" 
                  className="w-full h-full object-cover group-hover/cam:scale-110 transition-transform duration-[5000ms]"
               />
            ) : (
               <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest animate-pulse">Establishing Neural Link...</span>
               </div>
            )}

            <div className="absolute bottom-4 left-4 z-30 flex flex-col gap-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-lg">
                     {liveData?.neural_cams?.[0]?.name || 'Feed-01'}
                  </span>
               </div>
               <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest drop-shadow-md">
                  {new Date().toLocaleTimeString()} :: HUB-ZERO-SEC-01
               </span>
            </div>
         </div>

         {/* COMMAND BULLETIN TICKER */}
         <div className="flex flex-col gap-2 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
               <Zap size={10} className="text-yellow-500" />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Official Bulletins</span>
            </div>
            <div className="flex flex-col gap-3 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar-thin text-left">
               {liveData?.bulletins?.map((b, j) => (
                  <div key={j} className="flex gap-3 items-start animate-fade-in">
                     <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        b?.type === 'SAFETY' ? 'bg-red-500' : 'bg-yellow-500'
                     }`} />
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{b?.type}</span>
                        <p className="text-[9px] font-bold text-slate-300 leading-tight tracking-tight">{b?.text}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 🧪 MISSION OPTIMIZATION: PROJECT AMRIT (NEW) */}
      <section className="shrink-0 flex flex-col gap-4 p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={80} className="text-emerald-500/20 -rotate-12" />
         </div>

         <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
               <Activity size={14} className={`text-emerald-500 ${isOptimizing ? 'animate-pulse' : ''}`} />
               <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Project Amrit Optimizer</h3>
            </div>
            <div className={`px-2 py-0.5 ${isOptimizing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'} text-white text-[7px] font-black rounded-full uppercase tracking-widest`}>
               {isOptimizing ? 'Optimizing Grid' : 'Passive Monitoring'}
            </div>
         </div>

         <div className="flex flex-col gap-4 relative z-10">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-900/20">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Efficiency Loop</span>
                  <span className="text-[10px] font-black text-emerald-400 font-mono">{isOptimizing ? '98.4%' : '76.2%'}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: '76%' }}
                     animate={{ width: isOptimizing ? '98%' : '76%' }}
                     className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                     transition={{ duration: 2, ease: "easeOut" }}
                  />
               </div>
            </div>

            <button 
               onClick={() => setIsOptimizing(!isOptimizing)}
               className={`w-full py-4 rounded-2xl border font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  isOptimizing ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-950 border-emerald-900/30 text-emerald-500 hover:border-emerald-500'
               }`}
            >
               {isOptimizing ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />}
               {isOptimizing ? 'DEACTIVATE OPTIMIZATION' : 'INITIATE GLOBAL OPTIMIZATION'}
            </button>

            <AnimatePresence>
               {isOptimizing && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-2 overflow-hidden">
                     <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Active Logistics Redirection</span>
                     {liveData?.optimization_plan?.map((plan, i) => (
                        <div key={i} className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{plan?.mandate}</span>
                        </div>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* MISSION HEALTH HUD */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
         <div className="p-5 bg-slate-950 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent" />
            <div className="relative z-10 flex flex-col items-center">
               <span className="text-2xl font-black text-white mb-0.5">{liveData?.grid_health || 92}%</span>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Stability</span>
               <div className="mt-2 w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${(liveData?.grid_health || 92) > 80 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${liveData?.grid_health || 92}%` }} />
               </div>
            </div>
         </div>

         <div className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-yellow-500/30 transition-all relative overflow-hidden">
             {(liveData?.weather?.weatherImpact > 1.0) && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-[7px] font-black uppercase tracking-widest rounded-bl-xl z-10 animate-pulse">
                   Meteo Risk: High
                </div>
             )}
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                   {liveData?.weather?.condition === 'RAIN' ? <Droplets size={16} className="text-blue-500 animate-bounce" /> : <Sun size={16} className="text-yellow-600" />}
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-lg font-black text-slate-950 tracking-tighter leading-none">{liveData?.weather?.temp || '28'}°C</span>
                   <span className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-widest">{liveData?.weather?.condition || 'Clear'}</span>
                </div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-1"><Wind size={10} /> {liveData?.weather?.wind_speed || '12'} km/h</div>
                   <div className="flex items-center gap-1"><Droplets size={10} /> {liveData?.weather?.humidity || '45'}%</div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${liveData?.weather?.weatherImpact > 1.0 ? 'text-red-500' : 'text-emerald-600'}`}>
                   {liveData?.weather?.weatherImpact > 1.2 ? 'MISSION CAUTION' : 'Ideal Comfort'}
                </span>
             </div>
          </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 shrink-0">
         {['ALL', 'HILL', 'CITY'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
               {f} Sector
            </button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto sacred-scrollbar pr-1 flex flex-col gap-6">
         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
               <div className="flex items-center gap-2">
                  <Users size={12} className="text-slate-900" />
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Crowd Density</h3>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
            
            <div className="space-y-3">
               {filteredCrowds.map(item => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={item.id} onClick={() => nodeCoords[item.id] && onLocatePlace(nodeCoords[item.id])} className="p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl hover:shadow-lg hover:border-yellow-500/20 transition-all cursor-pointer group shadow-sm">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-950 uppercase tracking-tight group-hover:text-yellow-600 transition-colors">{item.name}</span>
                        <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${item.status === 'CRITICAL' ? 'bg-red-50 text-red-600' : item.status === 'HEAVY' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           {item.status}
                        </span>
                     </div>
                     <div className="text-[11px] font-black text-slate-500 tracking-tighter leading-tight">{item.info}</div>
                  </motion.div>
               ))}
            </div>
         </section>

         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
               <div className="flex items-center gap-2">
                  <Activity size={12} className="text-yellow-600" />
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Accommodation Hub</h3>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 bg-emerald-50/50 backdrop-blur-md border border-emerald-100 rounded-2xl flex flex-col shadow-sm">
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Free Access</span>
                  <div className="text-xl font-black text-emerald-950 tracking-tighter leading-none mb-1">{liveData?.accommodation?.free_rooms?.available || 0}</div>
                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Rooms Open</span>
               </div>
               <div className="p-4 bg-blue-50/50 backdrop-blur-md border border-blue-100 rounded-2xl flex flex-col shadow-sm">
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Paid Access</span>
                  <div className="text-xl font-black text-blue-950 tracking-tighter leading-none mb-1">{liveData?.accommodation?.paid_rooms?.available || 0}</div>
                  <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">{liveData?.accommodation?.paid_rooms?.price || 'TBP'}</span>
               </div>
            </div>
         </section>

         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
               <div className="flex items-center gap-2">
                  <DataIcon size={12} className="text-slate-900" />
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{IS_TIRUPATI ? 'Locker Complexes' : 'Sacred Lockers'}</h3>
               </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
               {filteredPACs.map(item => (
                  <div key={item.id} onClick={() => nodeCoords[item.id] && onLocatePlace(nodeCoords[item.id])} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl hover:shadow-lg hover:border-yellow-500/20 transition-all cursor-pointer shadow-sm relative overflow-hidden">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-950 uppercase tracking-tighter mb-1">{item.name}</span>
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Hold</span><span className="text-[11px] font-black text-slate-700">{item.capacity}</span></div>
                           <div className="w-[1px] h-4 bg-slate-200" /><div className="flex flex-col"><span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Current</span><span className="text-[11px] font-black text-slate-950">{item.current}/{item.capacity}</span></div>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${item.percent > 90 ? 'text-red-500' : 'text-emerald-500'}`}>{item.percent}%</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className={`h-full transition-all duration-1000 ${item.percent > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${item.percent}%` }} /></div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2"><div className="flex items-center gap-2"><Bus size={12} className="text-blue-600" /><h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sacred Fleet Intelligence</h3></div><div className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{transitFleet.length} Active Units</div></div>
            <div className="flex flex-col gap-2">
               {transitFleet.length > 0 ? transitFleet.map(bus => (
                  <div key={bus.id} className="p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm group hover:border-blue-500/20 transition-all">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col"><div className="flex items-center gap-2 mb-0.5"><span className="text-[10px] font-black text-slate-950 uppercase tracking-tight">{bus.name}</span><span className="text-[7px] font-black text-slate-400 border border-slate-200 px-1 rounded uppercase tracking-widest">{bus.id}</span></div><span className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">{bus.type.replace(/_/g, ' ')}</span></div>
                        <div className="flex items-center gap-2"><button onClick={() => onLocatePlace(sector === 'tirupati' ? [13.66, 79.37] : [16.51, 80.60], 16)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Eye size={12} /></button><button onClick={() => alert("CRITICAL: Alert triggered.")} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><AlertTriangle size={12} /></button></div>
                     </div>
                     <div className="flex flex-col gap-1.5"><div className="flex justify-between items-center text-[7px] font-black text-slate-400 uppercase tracking-widest"><span>Mission Progress</span><span className="text-blue-600">{Math.floor(bus.progress * 100)}%</span></div><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${bus.progress * 100}%` }} /></div></div>
                  </div>
               )) : <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">No active transit telemetry.</span></div>}
            </div>
         </section>

         <section className="flex flex-col gap-4 p-6 bg-slate-950 rounded-[2.5rem] relative overflow-hidden group mb-4 border border-slate-800 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent" /><div className="flex items-center gap-3 mb-2 relative z-10"><div className="p-2 bg-yellow-600/10 rounded-xl border border-yellow-600/20"><TrendingUp size={14} className="text-yellow-500" /></div><h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Sacred Telemetry</h3></div>
            <div className="flex flex-col gap-5 relative z-10">
               <div className="flex flex-col gap-2"><div className="flex justify-between items-end"><span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.1em]">Ascending Grid</span><span className={`text-[11px] font-black ${liveData?.traffic_intelligence?.up_ghat?.status === 'HEAVY' ? 'text-red-500' : 'text-emerald-400'}`}>{liveData?.traffic_intelligence?.up_ghat?.count || 0} <span className="text-[8px] text-slate-600">UNITS</span></span></div><div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-[2s] ease-out ${liveData?.traffic_intelligence?.up_ghat?.status === 'HEAVY' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, ((liveData?.traffic_intelligence?.up_ghat?.count || 0) / 2000) * 100)}%` }} /></div></div>
               <div className="flex flex-col gap-2"><div className="flex justify-between items-end"><span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.1em]">Descending Grid</span><span className="text-emerald-400 text-[11px] font-black">{liveData?.traffic_intelligence?.down_ghat?.count || 0} <span className="text-[8px] text-slate-600">UNITS</span></span></div><div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-[2s] ease-out" style={{ width: `${Math.min(100, ((liveData?.traffic_intelligence?.down_ghat?.count || 0) / 2000) * 100)}%` }} /></div></div>
            </div>
            {liveData?.gate_intelligence && <div className="mt-2 p-3 rounded-2xl border border-white/5 flex items-center justify-between bg-white/[0.03] relative z-10"><div className="flex flex-col"><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Gate Handshake</span><span className="text-[9px] font-black text-white uppercase tracking-tight">{liveData?.gate_intelligence?.alert}</span></div><span className={`px-3 py-1 rounded-full text-[9px] font-black border ${liveData?.gate_intelligence?.status === 'OPEN' ? 'text-emerald-400 border-emerald-400/30' : 'text-red-400 border-red-400/30'}`}>{liveData?.gate_intelligence?.status}</span></div>}
         </section>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 shrink-0">
         <button onClick={() => setGhatTraffic(!showGhatTraffic)} className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${showGhatTraffic ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-yellow-500/30'}`}><Activity size={14} className={showGhatTraffic ? "text-yellow-500 animate-pulse" : ""} /><span className="text-[9px] font-black uppercase tracking-widest">Ghat View</span></button>
         <button onClick={() => setPACMarkers(!showPACMarkers)} className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${showPACMarkers ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-yellow-500/30'}`}><MapPin size={14} className={showPACMarkers ? "text-emerald-500" : ""} /><span className="text-[9px] font-black uppercase tracking-widest">PAC Layers</span></button>
      </div>

      <div className="shrink-0 flex flex-col gap-3 p-5 bg-red-50 border border-red-100 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute inset-0 bg-red-500/[0.03] animate-pulse pointer-events-none" /><div className="flex items-center gap-3 mb-1"><div className="p-2 bg-red-600 rounded-xl text-white"><Siren size={16} className="animate-bounce" /></div><h3 className="text-[11px] font-black text-red-950 uppercase tracking-[0.2em]">Emergency Hub</h3></div>
         <div className="grid grid-cols-2 gap-3"><button className="flex flex-col items-center justify-center p-3 bg-white border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all group/btn shadow-sm" onClick={() => alert("Medical ALERT")}><HeartPulse size={20} className="text-red-600 group-hover/btn:text-white mb-1.5" /><span className="text-[8px] font-black uppercase tracking-widest">Medical</span></button><button className="flex flex-col items-center justify-center p-3 bg-white border border-red-100 rounded-2xl hover:bg-slate-950 hover:text-white transition-all group/btn shadow-sm" onClick={() => alert("Lost Person ALERT")}><Megaphone size={20} className="text-blue-600 group-hover/btn:text-white mb-1.5" /><span className="text-[8px] font-black uppercase tracking-widest">Lost Person</span></button></div>
         <button className="w-full py-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-500/30 font-black text-[10px] uppercase tracking-[0.3em] transform active:scale-95 transition-all hover:bg-red-700" onClick={() => alert("SOS BROADCAST")}>INITIATE SOS SIGNAL</button>
      </div>
      
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between shrink-0 group hover:border-emerald-500/30 transition-all"><div className="flex flex-col"><div className="flex items-center gap-2 mb-1"><Shield size={16} className="text-emerald-600" /><h4 className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Mission Verified</h4></div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AI Grid v7.0 Secure</p></div><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /></div>
    </div>
  );
};

export default SectorIntelligence;
