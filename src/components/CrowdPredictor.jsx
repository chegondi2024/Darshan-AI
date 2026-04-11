import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, TrendingDown, 
  AlertTriangle, Calendar, Info, ShieldCheck, 
  MapPin, CheckCircle
} from 'lucide-react';
import { get24HourForecast, getOptimalVisitWindow } from '../services/predictionService';

const IntensityHeatmap = ({ forecast, currentHour }) => {
  return (
    <div className="relative mt-2 mb-8 h-6 w-full rounded-2xl bg-slate-100 overflow-hidden flex shadow-inner group grow-0 shrink-0 border border-slate-200/50">
      {forecast.map((f, i) => (
        <div 
          key={i} 
          className={`h-full flex-1 transition-all ${
            f.intensity < 0.3 ? 'bg-emerald-500' :
            f.intensity < 0.6 ? 'bg-yellow-500' :
            f.intensity < 0.8 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ opacity: 0.2 + (f.intensity * 0.8) }}
          title={`${f.displayHour}: ${Math.round(f.intensity * 100)}% Intensity`}
        />
      ))}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-slate-950 shadow-[0_0_8px_rgba(0,0,0,0.2)] z-10"
        style={{ left: '0%' }}
      />
      <div className="absolute top-0 left-0 px-3 py-1 bg-slate-950 text-white text-[7px] font-black rounded-br-xl z-10 uppercase tracking-widest shadow-lg">NOW</div>
    </div>
  );
};

const CrowdPredictor = ({ sector = 'tirupati', currentGridHealth = 100 }) => {
  const [forecast, setForecast] = useState([]);
  const [bestWindow, setBestWindow] = useState(null);
  
  useEffect(() => {
    const weatherFactor = (sector === 'tirupati' && currentGridHealth) ? 1.0 : (1.0); // Fallback logic
    // We'll use the prop passed or a default
    setForecast(get24HourForecast(sector, 1.0));
    setBestWindow(getOptimalVisitWindow(sector));
  }, [sector, currentGridHealth]);

  if (!bestWindow) return null;

  return (
    <div className="flex flex-col gap-4 group">
      <div className="p-6 rounded-[2.5rem] relative overflow-hidden bg-white/90 backdrop-blur-3xl border border-white/50 shadow-xl group/card transition-all hover:border-yellow-500/30">
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-600 border border-yellow-500/20 shadow-sm">
                     <Zap size={18} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                     <div className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.4em] mb-0.5">Neural Forecast</div>
                     <h3 className="text-lg font-black text-slate-950 uppercase tracking-tighter leading-none">AI Intent Matrix</h3>
                  </div>
               </div>
               <div className="px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 text-blue-600 text-[9px] font-black uppercase tracking-widest">
                  SYNC: 100%
               </div>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
               24H Crowd Telemetry Analysis:
            </p>

            <IntensityHeatmap forecast={forecast} currentHour={new Date().getHours()} />

            {/* RECOMMENDATION BLOCK */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-5 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm"
            >
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                     <TrendingDown size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Optimal Grid Access Window</span>
               </div>
               
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                     <div className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none mb-1">
                        {bestWindow.startTime} <span className="text-slate-300 font-serif lowercase italic">to</span> {bestWindow.endTime}
                     </div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated {bestWindow.intensity < 0.4 ? '1.5h - 2.5h' : '3h - 5h'} Wait Time</span>
                  </div>
                  <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex flex-col items-center min-w-[70px]">
                     <span className="text-lg font-black text-white leading-none">{bestWindow.savingPercent}%</span>
                     <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter mt-1">SAVES</span>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      {/* QUICK TIP MINI-BANNER */}
      <div className="p-5 bg-slate-950 rounded-[2rem] relative overflow-hidden flex items-center gap-5 border border-slate-800 shadow-2xl group/tip overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-transparent" />
         <div className="p-3 bg-white/5 rounded-2xl text-yellow-500 border border-white/10 group-hover/tip:bg-yellow-500 group-hover/tip:text-slate-950 transition-all duration-500 shadow-lg">
            <Clock size={18} />
         </div>
         <div className="flex flex-col relative z-10 flex-1">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Mission Mandate</div>
            <div className="text-[11px] font-black text-white uppercase tracking-wide leading-tight group-hover:text-yellow-400 transition-colors">
               {bestWindow.intensity < 0.4 ? 'SACRED HUB OPTIMAL. COMMENCE JOURNEY NOW.' : 'GRID CONGESTION DETECTED. DELAY DEPLOYMENT.'}
            </div>
         </div>
         <ChevronRight size={18} className="text-slate-700 ml-auto group-hover/tip:text-white transition-colors" />
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;

export default CrowdPredictor;
