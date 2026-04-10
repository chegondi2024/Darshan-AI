import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, HeartPulse, Megaphone, Users, Zap,
  MapPin, Send, CheckCircle, X, Activity, Shield
} from 'lucide-react';

const CATEGORIES = [
  { id: 'medical', icon: HeartPulse, label: 'Medical Emergency', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-300', urgency: 'CRITICAL' },
  { id: 'lost_person', icon: Users, label: 'Lost Person', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-300', urgency: 'HIGH' },
  { id: 'crowd_panic', icon: Zap, label: 'Crowd Panic / Stampede', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-300', urgency: 'CRITICAL' },
  { id: 'infrastructure', icon: AlertTriangle, label: 'Infrastructure / Facility', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', urgency: 'MODERATE' },
  { id: 'theft', icon: Shield, label: 'Theft / Security', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-300', urgency: 'HIGH' },
  { id: 'general', icon: Megaphone, label: 'General Report', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-300', urgency: 'LOW' },
];

const SECTOR_NAMES = {
  tirupati: 'Tirupati', vijayawada: 'Vijayawada', srisailam: 'Srisailam',
  simhachalam: 'Simhachalam', annavaram: 'Annavaram', sabarimala: 'Sabarimala'
};

let caseCounter = 1;
const generateCaseId = (sector) => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `SOS-${sector.toUpperCase()}-${dateStr}-${String(caseCounter++).padStart(3,'0')}`;
};

const EmergencyReporter = ({ sector = 'tirupati', isOpen, onClose }) => {
  const [step, setStep] = useState('select'); // select | describe | submitted
  const [selected, setSelected] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Unknown Location');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setLocation(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
        setGpsLoading(false);
      },
      () => { setLocation('GPS Denied — Location Unknown'); setGpsLoading(false); },
      { timeout: 6000 }
    );
  };

  const handleSubmit = () => {
    const caseId = generateCaseId(sector);
    const report = {
      id: caseId,
      category: selected,
      description: description || 'No additional description provided.',
      location,
      sector,
      timestamp: new Date().toLocaleTimeString('en-IN'),
      urgency: CATEGORIES.find(c => c.id === selected)?.urgency || 'MODERATE'
    };
    setCurrentCase(report);
    setReports(prev => [report, ...prev].slice(0, 5));
    setStep('submitted');

    // Play alert sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch(e) {}
  };

  const reset = () => {
    setStep('select');
    setSelected(null);
    setDescription('');
    setLocation('Unknown Location');
    setCurrentCase(null);
  };

  if (!isOpen) return null;

  const cat = CATEGORIES.find(c => c.id === selected);

  return (
    <div className="fixed inset-0 z-[7000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-600 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 animate-pulse bg-red-400" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Activity size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="text-[8px] font-black text-red-200 uppercase tracking-[0.3em]">Emergency AI System</div>
              <div className="text-lg font-black text-white uppercase tracking-tight">{SECTOR_NAMES[sector]} SOS</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors relative z-10">
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* STEP 1: SELECT CATEGORY */}
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Emergency Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelected(cat.id); setStep('describe'); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${cat.bg} ${cat.border}`}
                    >
                      <cat.icon size={22} className={cat.color} />
                      <span className={`text-[9px] font-black uppercase tracking-tight text-center ${cat.color}`}>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Past Reports */}
                {reports.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Recent Reports This Session</p>
                    {reports.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-[9px] font-black text-slate-700">{r.id}</span>
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-full ${r.urgency === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{r.urgency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: DESCRIBE */}
            {step === 'describe' && cat && (
              <motion.div key="describe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className={`flex items-center gap-3 p-4 rounded-2xl ${cat.bg} border ${cat.border} mb-4`}>
                  <cat.icon size={20} className={cat.color} />
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${cat.color}`}>{cat.label}</p>
                    <p className="text-[8px] text-slate-500 font-bold">Urgency: {cat.urgency}</p>
                  </div>
                </div>

                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[12px] text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:border-red-400 mb-3"
                  rows={3}
                  placeholder="Describe the situation briefly (optional)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />

                <button
                  onClick={getGPS}
                  disabled={gpsLoading}
                  className="w-full flex items-center gap-2 justify-center py-2.5 mb-3 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <MapPin size={12} className={gpsLoading ? 'animate-bounce text-blue-500' : ''} />
                  {gpsLoading ? 'Acquiring GPS...' : location === 'Unknown Location' ? 'Share GPS Location' : `📍 ${location}`}
                </button>

                <div className="flex gap-2">
                  <button onClick={() => setStep('select')} className="flex-1 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                  >
                    <Send size={12} /> Broadcast SOS
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUBMITTED */}
            {step === 'submitted' && currentCase && (
              <motion.div key="submitted" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">SOS Broadcast</h3>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-4">AI Mission Hub Alerted</p>
                
                <div className="bg-slate-50 rounded-2xl p-4 text-left mb-4 border border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Case Details</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]"><span className="text-slate-500">Case ID</span><span className="font-black text-slate-900">{currentCase.id}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-500">Category</span><span className="font-black text-slate-900">{CATEGORIES.find(c=>c.id===currentCase.category)?.label}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-500">Urgency</span><span className={`font-black ${currentCase.urgency==='CRITICAL'?'text-red-600':'text-amber-600'}`}>{currentCase.urgency}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-500">Location</span><span className="font-black text-slate-700 text-right max-w-[60%] truncate">{currentCase.location}</span></div>
                    <div className="flex justify-between text-[10px]"><span className="text-slate-500">Time</span><span className="font-black text-slate-900">{currentCase.timestamp}</span></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={reset} className="flex-1 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                    New Report
                  </button>
                  <button onClick={onClose} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyReporter;
