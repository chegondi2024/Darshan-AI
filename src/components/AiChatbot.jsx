import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, MapPin, Crosshair, 
  ChevronRight, Languages, Mic, CheckCircle, 
  AlertCircle, Info, AlertTriangle, Zap,
  History, Sparkles, Gauge, Award, TrendingDown, 
  Navigation, Clock, PlayCircle, ShoppingBag, 
  Activity, Sun, Eye
} from 'lucide-react';

const AiChatbot = ({ onSendMessage, onFlyTo, triggerQuery, onQueryProcessed, sector = 'tirupati', onClose }) => {
  const SECTOR_INTEL = {
    tirupati: { mantra: 'Om Namo Venkatesaya', name: 'Tirupati', code: '01' },
    vijayawada: { mantra: 'Om Namo Durgaye', name: 'Vijayawada', code: '02' },
    srisailam: { mantra: 'Om Namah Shivaya', name: 'Srisailam', code: '03' },
    simhachalam: { mantra: 'Om Namo Narasimhaya', name: 'Simhachalam', code: '04' },
    annavaram: { mantra: 'Om Namo Satyanarayanaya', name: 'Annavaram', code: '05' },
    sabarimala: { mantra: 'Swamiye Saranam Ayyappa', name: 'Sabarimala', code: '06' }
  };

  const LANG_METADATA = {
    en: { label: 'EN', greeting: (mantra) => `${mantra}. The sacred mission grid is active and secure. Tap 📍 to share your location for live navigation!` },
    hi: { label: 'हिन्दी', greeting: (mantra) => `${mantra}. पवित्र मिशन ग्रिड सक्रिय और सुरक्षित है। लाइव नेविगेशन के लिए अपना स्थान साझा करने के लिए 📍 पर टैప్ करें!` },
    te: { label: 'తెలుగు', greeting: (mantra) => `${mantra}. పవిత్ర మిషన్ గ్రిడ్ యాక్టివ్‌గా మరియు సురక్షితంగా ఉంది. ప్రత్యక్ష నావిగేషన్ కోసం మీ స్థానాన్ని షేర్ చేయడానికి 📍 నొక్కండి!` }
  };

  const AURA_CONFIG = {
    gold: { name: 'Sacred Gold', color: 'yellow', theme: 'text-yellow-600', primary: 'bg-yellow-600', accent: 'text-yellow-600', ring: 'ring-yellow-400', glow: 'bg-yellow-500' },
    emerald: { name: 'Mystic Emerald', color: 'emerald', theme: 'text-emerald-600', primary: 'bg-emerald-600', accent: 'text-emerald-600', ring: 'ring-emerald-400', glow: 'bg-emerald-500' },
    sapphire: { name: 'Vedic Sapphire', color: 'blue', theme: 'text-blue-600', primary: 'bg-blue-600', accent: 'text-blue-600', ring: 'ring-blue-400', glow: 'bg-blue-500' }
  };

  const currentIntel = SECTOR_INTEL[sector] || SECTOR_INTEL.tirupati;
  const [selectedLang, setSelectedLang] = useState('en');
  const [activeAura, setActiveAura] = useState('gold');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: LANG_METADATA[selectedLang].greeting(currentIntel.mantra),
      meta: { type: 'GREETING' }
    }
  ]);

  // Handle Language Shift
  useEffect(() => {
     setMessages(prev => {
        if (prev.length === 1 && prev[0].meta?.type === 'GREETING') {
           return [{ 
              role: 'bot', 
              content: LANG_METADATA[selectedLang].greeting(currentIntel.mantra),
              meta: { type: 'GREETING' }
           }];
        }
        return prev;
     });
  }, [selectedLang, currentIntel.mantra]);

  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | found | error
  const scrollRef = useRef(null);

  const [autoSpeak, setAutoSpeak] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Load and select best voices for Multilingual support
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      const bestVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                        voices.find(v => v.lang.startsWith('en')) || 
                        voices[0];
      setSelectedVoice(bestVoice);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 🌍 MISSION LANGUAGE ADAPTATION
    if (selectedLang === 'hi') {
       utterance.voice = availableVoices.find(v => v.lang.startsWith('hi')) || selectedVoice;
       utterance.lang = 'hi-IN';
    } else if (selectedLang === 'te') {
       utterance.voice = availableVoices.find(v => v.lang.startsWith('te')) || selectedVoice;
       utterance.lang = 'te-IN';
    } else {
       utterance.voice = selectedVoice;
       utterance.lang = 'en-IN';
    }

    utterance.pitch = 1.1; // Tactical authority
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmitExternal = async (query, viaVoice = false) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: query.replace(/\[[^\]]+\]/g, '').trim() }]);
    
    try {
      const currentStatus = await onSendMessage(query);
      const response = await currentStatus;
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.explanation,
        map_commands: response.map_commands,
        visual_data: response.visual_data
      }]);

      if (autoSpeak || viaVoice) {
         handleSpeak(response.explanation);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const recoveryMsg = `${currentIntel.mantra}. Primary Mission link unstable. Reconnecting to Sacred Grid...`;
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: recoveryMsg,
        meta: { type: "RECOVERY_MODE" }
      }]);
      if (autoSpeak) handleSpeak(recoveryMsg);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // 🎙️ MISSION VOICE RECOGNITION (Multilingual)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Update language based on selection
      const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
      recognition.lang = langMap[selectedLang] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setTimeout(() => {
           handleSubmitExternal(`${transcript} [LANGUAGE:${selectedLang.toUpperCase()}]`, true);
        }, 800);
      };

      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Speech Start Error:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setMessages(prev => [...prev, { role: 'bot', content: `${currentIntel.mantra}. GPS is not available on this device.`, meta: { type: 'INFO' } }]);
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(coords);
        setLocationStatus('found');
        onFlyTo(coords, 16);
      },
      () => setLocationStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const enrichedInput = `${input} [LANGUAGE:${selectedLang.toUpperCase()}]`;
    handleSubmitExternal(enrichedInput);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in font-sans relative">
      <div className="sacred-glass flex flex-col border-b border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-3xl relative overflow-hidden group">
         <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${AURA_CONFIG[activeAura].primary}/5`} />
         
         <div className="p-4 flex items-center justify-between border-b border-black/5">
            <div className="flex items-center gap-3 relative z-10">
               <div className={`p-2.5 rounded-2xl text-white shadow-xl transition-all ${AURA_CONFIG[activeAura].primary}`}>
                  <Navigation size={20} />
               </div>
               <div>
                  <div className={`text-[9px] font-black uppercase tracking-[0.3em] leading-none mb-1 ${AURA_CONFIG[activeAura].accent}`}>{sector ? currentIntel.mantra : 'Divine Protocol 00'}</div>
                  <div className="text-base font-black text-slate-950 tracking-tighter uppercase leading-none">{sector ? `${currentIntel.name} Mission` : 'Global Mission Oracle'} <span className="opacity-40 text-xs">AI</span></div>
               </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
               <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
                  {Object.entries(AURA_CONFIG).map(([key, aura]) => (
                     <button 
                        key={key}
                        onClick={() => setActiveAura(key)}
                        className={`w-3.5 h-3.5 rounded-full ring-offset-2 transition-all ${aura.primary} ${
                           activeAura === key ? `ring-2 ${aura.ring} scale-125` : 'opacity-40 hover:opacity-100'
                        }`}
                        title={aura.name}
                     />
                  ))}
               </div>
               
               {onClose && (
                  <button 
                     onClick={onClose}
                     className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-inner border border-slate-200"
                     title="Minimize Oracle"
                  >
                     <ChevronRight size={18} className="translate-x-0.5" />
                  </button>
               )}
            </div>
         </div>

         <div className="px-4 py-3 bg-white/50 backdrop-blur-md flex items-center justify-between gap-2">
            <div className="flex bg-slate-200/30 p-1 rounded-[14px] border border-slate-300/20 shadow-inner">
               {Object.entries(LANG_METADATA).map(([code, data]) => (
                  <button
                     key={code}
                     onClick={() => setSelectedLang(code)}
                     className={`px-3 py-1 rounded-xl text-[9px] font-black tracking-widest transition-all ${
                        selectedLang === code ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                     }`}
                  >
                     {data.label}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-2">
               <button 
                  onClick={() => {
                     setAutoSpeak(!autoSpeak);
                     if (!autoSpeak) handleSpeak("Voice Auto-Response Activated.");
                     else window.speechSynthesis.cancel();
                  }}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                     autoSpeak ? `${AURA_CONFIG[activeAura].theme} border-current bg-current/10` : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
               >
                  {autoSpeak ? <PlayCircle size={12} className="animate-pulse" /> : <Mic size={12} />}
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">{autoSpeak ? 'Voice ON' : 'Voice OFF'}</span>
               </button>
               
               <div className="px-2.5 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">SECURE</span>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 sacred-glass rounded-[2rem] border border-white/80 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 sacred-scrollbar scroll-smooth relative z-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[100%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed transition-all animate-fade-in ${
                msg.role === 'user' 
                  ? `${AURA_CONFIG[activeAura].primary} text-white font-black rounded-tr-none shadow-xl` 
                  : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                 {msg.content}
              </div>
              {msg.map_commands?.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {msg.map_commands.map((cmd, idx) => (
                    <button 
                      key={idx}
                      onClick={() => onFlyTo(cmd.points?.[0] || cmd.center, cmd.zoom || 17)}
                      className={`px-4 py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 shadow-lg active:scale-95 ${AURA_CONFIG[activeAura].primary}`}
                    >
                      <Navigation size={14} /> {cmd.action === 'draw_route' ? 'START NAVIGATION' : 'SCAN GRID'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`flex flex-col gap-3 p-4 animate-pulse ${AURA_CONFIG[activeAura].theme}`}>
               <Zap size={18} className="animate-bounce" />
               <span className="text-[10px] font-black uppercase tracking-widest font-mono">Mission Processing...</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/10 border-t border-white/50 relative z-20">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <button
               type="button"
               onClick={handleLocate}
               className={`p-4 rounded-2xl border transition-all flex-shrink-0 ${locationStatus === 'found' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600'}`}
            >
               <MapPin size={22} />
            </button>
            <button
               type="button"
               onClick={isListening ? stopListening : startListening}
               className={`p-4 rounded-2xl border transition-all flex-shrink-0 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-600'}`}
            >
               <Mic size={22} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak or type command..."
              className="flex-1 bg-white/80 border border-slate-200 rounded-2xl px-5 text-[14px] font-medium focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-400 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`p-4 rounded-2xl text-white shadow-xl transition-all ${isLoading || !input.trim() ? 'bg-slate-300' : AURA_CONFIG[activeAura].primary}`}
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
