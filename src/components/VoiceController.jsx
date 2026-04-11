import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Zap } from 'lucide-react';

const VoiceController = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const handleFeedback = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = useCallback((text) => {
    const t = text.toLowerCase();
    
    // 🌎 MULTI-LINGUAL VANGUARD (Telugu / Hindi / Tamil / English)
    const localLanguageMappings = [
      { kw: ['entha', 'ekkada', 'vundi', 'kavali', 'eppudu'], lang: 'TELUGU' },
      { kw: ['kya hai', 'kaha hai', 'chaiye', 'dikhao', 'bataye'], lang: 'HINDI' },
      { kw: ['enga', 'eppo', 'vendum', 'irukku', 'enna'], lang: 'TAMIL' }
    ];

    // If any local language keyword is detected, send the raw text to AI for contextual translation
    const isLocalLang = localLanguageMappings.some(lang => lang.kw.some(k => t.includes(k)));
    if (isLocalLang) {
       handleFeedback("Mission Command Synchronized. Processing Sacred Query.");
       onCommand({ type: 'QUERY_AI', query: text }); // Send original casing for better AI processing
       return true;
    }

    // Command: ASK AI (English)
    const askPrefixes = ['ask', 'tell me', 'find', 'locate', 'explain'];
    for (const prefix of askPrefixes) {
       if (t.startsWith(prefix)) {
          const query = t.replace(prefix, '').trim();
          handleFeedback(`Query received: ${query}`);
          onCommand({ type: 'QUERY_AI', query });
          return true;
       }
    }

    // Command: SWITCH SECTOR / DEPLOY
    if (t.includes('switch to') || t.includes('go to') || t.includes('change to') || t.includes('initialize') || t.includes('deploy')) {
       if (t.includes('overseer') || t.includes('global') || t.includes('grid')) {
          onCommand({ type: 'OPEN_OVERSEER' });
          return true;
       }
       if (t.includes('tirupati') || t.includes('venkateswara')) {
          onCommand({ type: 'SWITCH_SECTOR', sector: 'tirupati' });
          return true;
       }
       if (t.includes('vijayawada') || t.includes('durga')) {
          onCommand({ type: 'SWITCH_SECTOR', sector: 'vijayawada' });
          return true;
       }
       if (t.includes('srisailam') || t.includes('mallikarjuna')) {
          onCommand({ type: 'SWITCH_SECTOR', sector: 'srisailam' });
          return true;
       }
       if (t.includes('simhachalam') || t.includes('narasimha')) {
          onCommand({ type: 'SWITCH_SECTOR', sector: 'simhachalam' });
          return true;
       }
       if (t.includes('annavaram') || t.includes('satyanarayana')) {
          onCommand({ type: 'SWITCH_SECTOR', sector: 'annavaram' });
          return true;
       }
    }

    // Command: SOS / EMERGENCY
    if (t.includes('help') || t.includes('sos') || t.includes('emergency') || t.includes('madad') || t.includes('udhavi') || t.includes('sahayam')) {
       onCommand({ type: 'QUERY_AI', query: 'EMERGENCY_REPORT: ' + text });
       return true;
    }

    return false;
  }, [onCommand]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      startRecognition();
    }
  };

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (e) => {
      setError(e.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const result = e.results[0][0].transcript;
      handleVoiceCommand(result);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[5000] flex flex-col items-center">
      {error && (
         <div className="mb-4 bg-red-500 text-white text-[8px] font-black px-4 py-1 rounded-full uppercase tracking-widest animate-pulse">
            Error: {error}
         </div>
      )}
      
      <button 
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isListening 
            ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
            : 'bg-slate-900 border border-yellow-500/30 hover:border-yellow-500'
        }`}
      >
        {isListening ? (
           <MicOff size={24} className="text-white" />
        ) : (
           <Mic size={24} className="text-yellow-500" />
        )}
        
        {isListening && (
           <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
        )}
      </button>
      
      <div className={`mt-3 px-4 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 transition-all duration-500 ${
         isListening ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
         <div className="flex items-center gap-2">
            <Zap size={10} className="text-yellow-500 animate-pulse" />
            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Listening for AI Mission Command...</span>
         </div>
      </div>
    </div>
  );
};

export default VoiceController;
