import React, { useState, useCallback, useEffect } from 'react';
import GisMap from './components/GisMap';
import AiChatbot from './components/AiChatbot';
import SectorIntelligence from './components/SectorIntelligence';
import RitualLogs from './components/RitualLogs';
import VoiceController from './components/VoiceController';
import LandingPage from './components/LandingPage';
import UnifiedDashboard from './components/UnifiedDashboard';
import { chatWithTirupatiAi } from './services/tirupatiAi';
import { chatWithVijayawadaAi } from './services/vijayawadaAi';
import { chatWithSrisailamAi } from './services/srisailamAi';
import { chatWithSimhachalamAi } from './services/simhachalamAi';
import { chatWithAnnavaramAi } from './services/annavaramAi';
import { chatWithSabarimalaAi } from './services/sabarimalaAi';
import { chatWithGlobalAi } from './services/globalAi';
import { fetchRealTimeStatus, fetchTransitFleet, fetchAllSectorsData } from './services/liveDataService';
import { Shield, Map as MapIcon, Database, Activity, LayoutDashboard, Settings, Sun, Bell, Eye, EyeOff } from 'lucide-react';

const App = () => {
  const [activeSector, setActiveSector] = useState(null); 
  const [isOverseer, setIsOverseer] = useState(false);
  const [mapView, setMapView] = useState({ center: [13.6833, 79.3474], zoom: 14 });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [showIntelligence, setShowIntelligence] = useState(true);
  const [isMapVisible, setIsMapVisible] = useState(true);
  
  // SYNC METADATA
  const [nextSyncIn, setNextSyncIn] = useState(15);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  
  // LAYER VISIBILITY STATES
  const [showGhatTraffic, setShowGhatTraffic] = useState(true);
  const [showPACMarkers, setShowPACMarkers] = useState(true);
  const [showCrowdMarkers, setShowCrowdMarkers] = useState(true);
  const [showGoogleTraffic, setShowGoogleTraffic] = useState(false);
  
  const [aiTriggerQuery, setAiTriggerQuery] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [transitFleet, setTransitFleet] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);

  // GLOBAL GRID SYNC: TELEMETRY POLLING FOR TICKER
  const [globalGrid, setGlobalGrid] = useState(null);
  useEffect(() => {
     const syncGlobal = async () => {
        try {
           const hubData = await fetchAllSectorsData();
           setGlobalGrid(hubData);
        } catch (e) {
           console.error("Global Grid Sync Failed:", e);
        }
     };
     syncGlobal();
     const interval = setInterval(syncGlobal, 30000); 
     return () => clearInterval(interval);
  }, []);

  // SECTOR BOUNDS & COORDS
  useEffect(() => {
    if (activeSector === 'tirupati') {
      setMapView({ center: [13.6833, 79.3474], zoom: 14 });
    } else if (activeSector === 'srisailam') {
      setMapView({ center: [16.0740, 78.8680], zoom: 15 });
    } else if (activeSector === 'simhachalam') {
      setMapView({ center: [17.7665, 83.2505], zoom: 15 });
    } else if (activeSector === 'annavaram') {
      setMapView({ center: [17.281, 82.396], zoom: 15 });
    } else if (activeSector === 'vijayawada') {
      setMapView({ center: [16.5150, 80.6050], zoom: 15 });
    } else if (activeSector === 'sabarimala') {
      setMapView({ center: [9.4333, 77.0833], zoom: 14 });
    }
  }, [activeSector]);

  // CENTRAL MISSION HEARTBEAT
  useEffect(() => {
    if (!activeSector) return;

    const syncData = async () => {
      try {
        const data = await fetchRealTimeStatus(activeSector);
        setLiveData(data);
        setTransitFleet(fetchTransitFleet(activeSector));
        setLastSyncTime(new Date().toLocaleTimeString());
        setNextSyncIn(15);
      } catch (e) {
        console.error("Critical Sync Failure:", e);
      }
    };

    syncData();
    const syncInterval = setInterval(syncData, 15000); 
    
    const countdownInterval = setInterval(() => {
       setNextSyncIn(prev => prev > 0 ? prev - 1 : 15);
    }, 1000);

    return () => {
       clearInterval(syncInterval);
       clearInterval(countdownInterval);
    };
  }, [activeSector]);

  const handleAiMessage = useCallback(async (prompt) => {
    const text = prompt.toLowerCase();
    let aiService;
    
    if (text.includes('all temple') || text.includes('all darshan') || text.includes('every temple') || text.includes('global report')) {
       aiService = chatWithGlobalAi;
    } else if (activeSector === 'tirupati') aiService = chatWithTirupatiAi;
    else if (activeSector === 'srisailam') aiService = chatWithSrisailamAi;
    else if (activeSector === 'simhachalam') aiService = chatWithSimhachalamAi;
    else if (activeSector === 'annavaram') aiService = chatWithAnnavaramAi;
    else if (activeSector === 'sabarimala') aiService = chatWithSabarimalaAi;
    else aiService = chatWithVijayawadaAi;
    
    const response = await aiService(prompt, liveData);
    if (response.map_commands && response.map_commands.length > 0) {
      response.map_commands.forEach(cmd => {
        if (cmd.action === 'set_view') {
          setMapView({ center: cmd.center, zoom: cmd.zoom || 16 });
        }
        if (cmd.action === 'draw_route' && cmd.points) {
           setActiveRoute(cmd.points);
           setMapView({ center: cmd.points[0], zoom: cmd.zoom || 17 });
        }
      });
    }
    return response;
  }, [liveData, activeSector]);

  const handleFlyTo = useCallback((center, zoom, id, name) => {
    setMapView({ center, zoom });
    if (id) {
       setActiveNodeId(id);
       setAiTriggerQuery(`Tactical briefing for Sector: ${name || id}. Status report requested.`);
    }
    if (!isMapVisible) setIsMapVisible(true); 
  }, [isMapVisible]);

  const handleVoiceCommand = useCallback(({ type, query, sector }) => {
     switch (type) {
        case 'RECENTER': 
           const center = activeSector === 'vijayawada' ? [16.5150, 80.6050] : [13.6833, 79.3474];
           handleFlyTo(center, 15, 'temple'); 
           break;
        case 'QUERY_AI': setAiTriggerQuery(query); break;
        case 'SWITCH_SECTOR': setActiveSector(sector); break;
        case 'OPEN_OVERSEER': setIsOverseer(true); break;
        default: break;
     }
  }, [handleFlyTo, activeSector]);

  const combinedCrowdData = liveData ? [
     ...(liveData.crowd_intelligence || []),
     liveData.footpath_status
  ].filter(Boolean) : [];

   if (isOverseer) {
      return (
         <UnifiedDashboard 
            onClose={() => setIsOverseer(false)} 
            onDeploySector={(s) => {
               setActiveSector(s);
               setIsOverseer(false);
            }} 
         />
      );
   }

   if (!activeSector) {
     return <LandingPage onSelectSector={setActiveSector} onOpenOverseer={() => setIsOverseer(true)} />;
   }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative font-sans text-slate-900">
      <div className="absolute inset-0 z-0 opacity-40">
         <img src="/temple_bg.png" className="w-full h-full object-cover blur-2xl scale-110" alt="" />
         <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-slate-50/90" />
      </div>

      <VoiceController onCommand={handleVoiceCommand} />

      {/* TICKER HUD */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-slate-950 text-white z-[4000] flex items-center overflow-hidden border-t border-slate-800 shadow-2xl">
         <div className="animate-marquee whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] flex gap-12 items-center px-10">
            <span className="flex items-center gap-2 text-yellow-500"><Shield size={12} /> UNIVERSAL GRID SYNC: 06 HUBS ACTIVE</span>
            <span className="flex items-center gap-2">TIRUPATI: {globalGrid?.sectors?.tirupati?.darshan_metrics?.free_waiting?.value || '24'}H WAIT</span>
            <span className="flex items-center gap-2 text-emerald-400">VIJAYAWADA: OPTIMAL FLOW</span>
            <span className="flex items-center gap-2">SRISAILAM: GATE ACTIVE</span>
            <span className="text-slate-500">• MISSION SECURE • {new Date().toLocaleTimeString()} •</span>
            <span onClick={() => setActiveSector(null)} className="cursor-pointer hover:text-red-500 underline decoration-dotted">EXIT MISSION</span>
         </div>
      </div>

      {/* MAIN HUD */}
      <div className="absolute inset-x-0 top-0 p-8 pointer-events-none z-[4000] flex justify-between items-start">
         <div className="bg-white/95 backdrop-blur-3xl p-6 px-10 pointer-events-auto border border-white shadow-2xl rounded-[2.5rem]">
            <div className="flex items-center gap-6 mb-3">
               <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Sun size={24} className="text-yellow-600 animate-spin-slow" />
               </div>
               <div className="flex flex-col">
                  <div className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.4em] mb-1">Sector Hub Sync</div>
                  <h1 className="text-3xl font-black tracking-tighter text-slate-950 uppercase leading-none">
                     {liveData?.title || 'Syncing...'}
                  </h1>
               </div>
            </div>
         </div>
      </div>

      <div id="mission-sidebar" className="w-[100px] bg-white/70 backdrop-blur-3xl border-r border-slate-200 flex flex-col items-center py-10 gap-12 z-[3000] relative">
        <div onClick={() => setActiveSector(null)} className="relative group cursor-pointer">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl relative z-10 p-1">
              <img src="/branding.png" alt="Logo" className="w-full h-full object-contain" />
           </div>
        </div>
        
        <div className="flex flex-col gap-12 text-slate-300">
          <SidebarBtn active={showIntelligence} icon={<LayoutDashboard size={24}/>} label="Intelligence" onClick={() => setShowIntelligence(!showIntelligence)} />
          <SidebarBtn active={isMapVisible} icon={<MapIcon size={24}/>} label="Map" onClick={() => setIsMapVisible(!isMapVisible)} />
        </div>
      </div>

      {showIntelligence && (
        <SectorIntelligence 
           existingData={liveData} 
           onLocatePlace={handleFlyTo} 
           showGhatTraffic={showGhatTraffic}
           setGhatTraffic={setShowGhatTraffic}
           showPACMarkers={showPACMarkers}
           setPACMarkers={setShowPACMarkers}
           showCrowdMarkers={showCrowdMarkers}
           setCrowdMarkers={setShowCrowdMarkers}
           showGoogleTraffic={showGoogleTraffic}
           setGoogleTraffic={setShowGoogleTraffic}
           nextSyncIn={nextSyncIn}
           lastSync={lastSyncTime}
           sector={activeSector}
        />
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isMapVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <GisMap 
             mapView={mapView} 
             activeNodeId={activeNodeId} 
             crowdData={combinedCrowdData} 
             darshanData={liveData?.darshan}
             trafficData={liveData?.traffic_intelligence}
             lockerData={liveData?.pac_lockers}
             advisoryData={liveData?.tactical_advisory}
             showGhatTraffic={showGhatTraffic}
             showPACMarkers={showPACMarkers}
             showCrowdMarkers={showCrowdMarkers}
             showGoogleTraffic={showGoogleTraffic}
             activeRoute={activeRoute}
             transitFleet={transitFleet}
             sector={activeSector}
          />
        </div>

        <div className="absolute right-8 bottom-8 z-[5000] w-[400px] h-[calc(100vh-160px)] pointer-events-auto">
           <AiChatbot onSendMessage={handleAiMessage} onFlyTo={handleFlyTo} triggerQuery={aiTriggerQuery} onQueryProcessed={() => setAiTriggerQuery(null)} sector={activeSector} />
        </div>
      </div>
    </div>
  );
};

const SidebarBtn = ({ active, icon, label, onClick }) => (
   <div onClick={onClick} className={`flex flex-col items-center gap-3 cursor-pointer transition-all hover:scale-110 group ${active ? 'text-yellow-600' : 'text-slate-400'}`}>
      <div className={`p-4 rounded-2xl transition-all ${active ? 'bg-white border border-slate-100 shadow-sm' : ''}`}>
         {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
   </div>
);

export default App;
