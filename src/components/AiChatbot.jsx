import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, MapPin, Crosshair, 
  ChevronRight, Languages, Mic, CheckCircle, 
  AlertCircle, Info, AlertTriangle, Zap,
  History, Sparkles, Gauge, Award, TrendingDown, 
  Navigation, Clock, PlayCircle, ShoppingBag, 
  Activity, Sun, Eye
} from 'lucide-react';

const AiChatbot = ({ onSendMessage, onFlyTo, triggerQuery, onQueryProcessed, sector = 'tirupati' }) => {
  const SECTOR_INTEL = {
    tirupati: { mantra: 'Om Namo Venkatesaya', name: 'Tirupati', code: '01' },
    vijayawada: { mantra: 'Om Namo Durgaye', name: 'Vijayawada', code: '02' },
    srisailam: { mantra: 'Om Namah Shivaya', name: 'Srisailam', code: '03' },
    simhachalam: { mantra: 'Om Namo Narasimhaya', name: 'Simhachalam', code: '04' },
    annavaram: { mantra: 'Om Namo Satyanarayanaya', name: 'Annavaram', code: '05' },
    sabarimala: { mantra: 'Swamiye Saranam Ayyappa', name: 'Sabarimala', code: '06' }
  };

  const currentIntel = SECTOR_INTEL[sector] || SECTOR_INTEL.tirupati;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: `${currentIntel.mantra}. The sacred mission grid is active and secure. Tap 📍 to share your location for live navigation!`,
      meta: { type: 'GREETING' }
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | found | error
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Incoming External Queries (Voice/System)
  useEffect(() => {
    if (triggerQuery) {
       setInput(triggerQuery);
       const timer = setTimeout(() => {
          handleSubmitExternal(triggerQuery);
          onQueryProcessed();
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [triggerQuery]);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitExternal = async (queryText) => {
    if (!queryText.trim()) return;
    const userMessage = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await onSendMessage(queryText);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.explanation,
        map_commands: response.map_commands,
        briefing: response.briefing,
        meta: response.visual_data
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `${currentIntel.mantra}. Primary Mission link unstable. Reconnecting to Sacred Grid...`,
        meta: { type: "RECOVERY_MODE" }
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Default to Indian English, supports multilingual

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        stopListening();
        // Optional: Auto-submit on voice result
        setTimeout(() => handleSubmitExternal(transcript), 500);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech Start Error:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setMessages(prev => [...prev, { role: 'bot', content: `${currentIntel.mantra}. GPS is not available on this device. Please type your location manually.`, meta: { type: 'INFO' } }]);
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(coords);
        setLocationStatus('found');
        onFlyTo(coords, 16, 'current_location', 'Your Location');
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `${currentIntel.mantra}. 📍 Sacred Location Acquired! Lat: ${coords[0].toFixed(4)}, Lng: ${coords[1].toFixed(4)}. Map is centered on your position. Now ask me: "navigate to bus stand" or "route to temple" and I will project the path from your exact location!`,
          meta: { type: 'INFO', decision: 'GO' }
        }]);
      },
      (err) => {
        setLocationStatus('error');
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `${currentIntel.mantra}. 🚨 Location access denied. Please enable GPS permission in your browser settings and try again. Alternatively, tell me your current zone (e.g. "I am at PAC-1") and I will navigate from there.`,
          meta: { type: 'INFO' }
        }]);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    // Inject current location context into the query if user says "my location" / "from here"
    const locationKeywords = ['my location', 'current location', 'from here', 'where i am', 'i am at', 'standing here'];
    const hasLocationRef = locationKeywords.some(kw => input.toLowerCase().includes(kw));
    const enrichedInput = (hasLocationRef && currentLocation)
      ? `${input} [USER_COORDS:${currentLocation[0]},${currentLocation[1]}]`
      : input;
    handleSubmitExternal(enrichedInput);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in font-sans relative">
      {/* Navigator Header */}
      <div className="sacred-glass p-5 flex items-center justify-between border-b border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-3xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="flex items-center gap-4 relative z-10">
            <div className="bg-slate-950 p-2.5 rounded-2xl text-white shadow-xl group-hover:bg-yellow-600 transition-all">
               <Navigation size={22} className="group-hover:rotate-[-45deg] transition-transform" />
            </div>
            <div>
               <div className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.3em] leading-none mb-1.5">{currentIntel.mantra}</div>
               <div className="text-lg font-black text-slate-950 tracking-tighter uppercase leading-none">{currentIntel.name} Mission <span className="italic font-serif opacity-40">Guide</span></div>
            </div>
         </div>
         <div className="flex items-center gap-2 relative z-10">
            <div className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Link Secure</span>
            </div>
         </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 sacred-glass rounded-[2rem] border border-white/80 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none text-[320px] font-black text-slate-900 group-hover:opacity-[0.04] transition-opacity">
           🕉️
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 sacred-scrollbar scroll-smooth relative z-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[100%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed transition-all animate-fade-in ${
                msg.role === 'user' 
                  ? 'bg-yellow-600 text-white font-black rounded-tr-none shadow-xl' 
                  : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                 {msg.role === 'bot' && (
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                       <Sparkles size={12} className="text-yellow-600" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-yellow-600">Sacred Briefing Ready</span>
                    </div>
                 )}
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* EMERGENCY DATA RENDERING */}
                {msg.meta?.type === 'EMERGENCY_SOS' && (
                  <div className="mt-4 p-4 bg-red-600 rounded-xl text-white shadow-lg border-2 border-white/20 animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                      <Siren size={20} className="animate-bounce" />
                      <span className="text-sm font-black uppercase tracking-widest">CRITICAL ALERT: {msg.meta.report?.category}</span>
                    </div>
                    <div className="text-[10px] font-bold opacity-90 mb-2">URGENCY: {msg.meta.report?.urgency} | TTD AI NOTIFIED</div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white animate-scan-line" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                )}

                {/* HONEST REALITY RENDERING */}
                {msg.meta?.type === 'INFO' && msg.meta?.decision === 'CAUTION' && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-inner">
                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                      <AlertTriangle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Ground Reality Check</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed italic">
                      "Secure briefing: Crowds are currently exceeding the mission parameters. Physical pressure is peaking near the sanctum."
                    </p>
                  </div>
                )}
                
                {msg.role === 'bot' && (
                   <button 
                      onClick={() => handleSpeak(msg.content)}
                      className="mt-4 w-full p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center gap-3 text-yellow-700 hover:bg-yellow-500/10 transition-all font-bold group/btn active:scale-95 shadow-sm"
                   >
                      <PlayCircle size={20} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Listen to Sacred Audio Info</span>
                   </button>
                )}

                {/* MISSION GRID REPORT RENDERING */}
                {msg.meta?.type === 'GRID_REPORT' && msg.meta.sectors && (
                   <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-200 pt-4">
                      {Object.entries(msg.meta.sectors).map(([id, s]) => (
                         <div key={id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{id}</span>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.darshan_metrics?.free_waiting?.value}H Wait</span>
                            </div>
                            <div className="flex gap-2">
                               <div className="px-2 py-1 bg-emerald-50 rounded border border-emerald-100 flex flex-col items-center min-w-[40px]">
                                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Lock</span>
                                  <span className="text-[9px] font-black text-emerald-700">{s.locker_metrics?.percent}%</span>
                               </div>
                               <div className="px-2 py-1 bg-blue-50 rounded border border-blue-100 flex flex-col items-center min-w-[40px]">
                                  <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">Stay</span>
                                  <span className="text-[9px] font-black text-blue-700">{s.accommodation?.paid_rooms?.available}</span>
                                </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
              </div>

              {msg.map_commands && msg.map_commands.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {msg.map_commands.map((cmd, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        if (cmd.points) {
                          onFlyTo(cmd.points[0], cmd.zoom || 17, 'route_node');
                        } else {
                          onFlyTo(cmd.center, cmd.zoom || 17, cmd.node_id);
                        }
                      }}
                      className="px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-yellow-600 transition-all flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap"
                    >
                      {cmd.action === 'draw_route' ? <Navigation size={14} className="text-yellow-500" /> : <Crosshair size={14} className="text-yellow-500" />}
                      {cmd.action === 'draw_route' ? 'START MISSION NAVIGATION' : 'SCAN MISSION GRID'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col gap-3 p-4 animate-pulse">
               <div className="flex items-center gap-3 text-yellow-600">
                  <Zap size={18} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono">Processing Voice Query...</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 animate-scan-line w-1/3"></div>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/10 border-t border-white/50 relative z-20">
          {/* Location Status Bar */}
          <div className="flex gap-2 mb-2 items-center">
            {locationStatus !== 'idle' && (
              <div className={`flex-1 px-4 py-2 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${
                locationStatus === 'loading' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-700' :
                locationStatus === 'found' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700' :
                'bg-red-500/10 border border-red-500/20 text-red-700'
              }`}>
                <MapPin size={12} className={locationStatus === 'loading' ? 'animate-bounce' : ''} />
                {locationStatus === 'loading' ? 'Acquiring GPS Location...' :
                 locationStatus === 'found' ? `📍 Location Locked: ${currentLocation?.[0]?.toFixed(4)}, ${currentLocation?.[1]?.toFixed(4)}` :
                 'GPS Error'}
              </div>
            )}
            
            {/* SOS / MEDICAL BUTTON */}
            <button
               type="button"
               onClick={() => handleSubmitExternal("🆘 EMERGENCY MEDICAL / HEALTH ALERT: Help needed immediately.")}
               className="flex items-center gap-2 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all border border-red-500/30"
            >
               <Activity size={14} className="animate-pulse" /> SOS / Health
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex gap-2">
               {/* GPS Locate Button */}
               <button
                 type="button"
                 onClick={handleLocate}
                 title="Share my current location"
                 className={`p-4 rounded-2xl border transition-all flex-shrink-0 shadow-lg active:scale-90 ${
                   locationStatus === 'found' 
                     ? 'bg-emerald-500 text-white border-emerald-400' 
                     : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                 }`}
               >
                 <MapPin size={22} />
               </button>

               {/* SACRED VOICE: MIC BUTTON */}
               <button
                 type="button"
                 onClick={isListening ? stopListening : startListening}
                 className={`p-4 rounded-2xl border transition-all flex-shrink-0 shadow-lg active:scale-90 flex items-center justify-center ${
                   isListening 
                     ? 'bg-red-600 text-white border-red-400 animate-pulse ring-4 ring-red-600/20' 
                     : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500'
                 }`}
                 title={isListening ? "Listening..." : "Voice Command"}
               >
                 <Mic size={22} className={isListening ? 'animate-bounce' : ''} />
               </button>
            </div>

            <div className="flex-1 relative">
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder={isListening ? 'Listening for command...' : currentLocation ? 'Ask: navigate to bus stand from here...' : `Query ${currentIntel.name} Mission brain...`}
                 className="w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-[1.5rem] px-6 py-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-slate-900 placeholder:text-slate-400 font-bold transition-all shadow-inner"
               />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-slate-950 text-white px-5 rounded-2xl hover:bg-yellow-600 shadow-2xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center p-4"
            >
              <Send size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiChatbot;
