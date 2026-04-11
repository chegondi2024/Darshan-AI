import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, ZoomControl, Tooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ShieldCheck, MapPin, Users, Zap, AlertTriangle, Landmark, Footprints, Train, Bus, Car, DoorOpen, Wallet, Ticket, Eye, Clock, ShieldAlert, CloudRain, Wind, Sun, Droplets } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { ghatRoadPaths } from '../data/ghatRoadPaths';
import { fetchEvacuationRoutes, fetchOptimizationPlan } from '../services/liveDataService';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { fetchRoadRoute } from '../services/routeService';

// Google Maps Tile Layers
const GOOGLE_ROADS = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
const GOOGLE_TERRAIN = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
const GOOGLE_SATELLITE = 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';

const createNeuralNodeIcon = (name = 'UNKNOWN', color, health) => {
   const safeName = (name || 'UNKNOWN').split(' ')[0] || 'HUB';
   const html = renderToString(
      <div className="flex flex-col items-center">
         <div className="relative flex items-center justify-center">
            <div className={`absolute w-12 h-12 rounded-full border-2 border-white opacity-20 animate-ping`} style={{ backgroundColor: color }}></div>
            <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shadow-xl relative z-10`} style={{ borderColor: color }}>
               <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: color }}></div>
            </div>
         </div>
         <div className="mt-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[80px] shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{safeName}</span>
            <span className={`text-[8px] font-black font-mono tracking-tighter`} style={{ color: color }}>{health || '88'}% OK</span>
         </div>
      </div>
   );
   return L.divIcon({
      html,
      className: 'neural-node-marker',
      iconSize: [120, 80],
      iconAnchor: [60, 40],
   });
};

const createStatusIcon = (status, iconColor, type, badge, isHazard) => {
   const pulseSpeed = (status === 'CRITICAL' || status === 'FULL' || isHazard) ? '1s' : status === 'HEAVY' ? '2s' : '4s';
   const finalColor = isHazard ? '#ef4444' : iconColor;

   const html = renderToString(
      <div className={`relative flex items-center justify-center`}>
         {(status !== 'NORMAL' || isHazard) && (
            <div className="absolute w-16 h-16 rounded-full border-2 border-white opacity-20 animate-ping" style={{ backgroundColor: finalColor, animationDuration: pulseSpeed }}></div>
         )}
         <div className="absolute w-12 h-12 rounded-full border border-white opacity-10 animate-pulse" style={{ backgroundColor: finalColor }}></div>

         <div className={`w-9 h-9 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transition-all bg-white overflow-hidden relative`}>
            {isHazard ? <ShieldAlert size={18} className="text-red-600 animate-pulse" /> :
               type === 'station' ? <Train size={18} /> :
                  type === 'transit' ? <Bus size={18} /> :
                     type === 'pac' ? <DoorOpen size={18} className="text-emerald-600" /> :
                        type === 'temple' || type === 'queue' ? <Landmark size={18} className="text-yellow-600" /> :
                           type === 'waypoint' ? <Footprints size={18} className="text-indigo-600" /> :
                              type === 'vehicle' ? <Car size={16} style={{ color: finalColor }} /> :
                                 <Users size={18} style={{ color: finalColor }} />}
         </div>

         {badge && (
            <div className="absolute -bottom-2 whitespace-nowrap z-50">
               <div className={`text-[7px] font-black text-white px-1.5 py-0.5 rounded-full border border-white shadow-xl ${status === 'CRITICAL' || status === 'FULL' ? 'bg-red-500' : 'bg-slate-800'
                  }`}>
                  {badge}
               </div>
            </div>
         )}

         <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors`} style={{ backgroundColor: iconColor }}></div>
      </div>
   );
   return L.divIcon({
      html,
      className: 'custom-status-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
   });
};

const createRouteLabelIcon = (text, iconType = 'car') => {
   const html = renderToString(
      <div className="flex items-center gap-2 bg-white/95 px-3 py-2 rounded-xl shadow-2xl border border-slate-200 animate-fade-in whitespace-nowrap">
         {iconType === 'car' ? <Car size={14} className="text-slate-600" /> : <Bus size={14} className="text-slate-600" />}
         <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{text}</span>
      </div>
   );
   return L.divIcon({ html, className: 'route-label', iconSize: [120, 40], iconAnchor: [60, 20] });
};

const DensityHeatmap = ({ coordinates, status }) => {
   if (!status || status === 'NORMAL' || status === 'AVAILABLE') return null;
   const color = status === 'CRITICAL' || status === 'FULL' ? '#ef4444' : status === 'HEAVY' || status === 'LIMITED' ? '#f97316' : '#eab308';
   return (
      <Circle
         center={coordinates}
         radius={150}
         pathOptions={{
            fillColor: color,
            fillOpacity: 0.15,
            color: 'transparent',
            className: 'animate-pulse'
         }}
      />
   );
};

const MapController = ({ center, zoom }) => {
   const map = useMap();
   useEffect(() => {
      map.flyTo(center, zoom, { duration: 1.5 });
   }, [center, zoom, map]);
   return null;
};

const RouteRenderer = ({ points, info }) => {
   if (!points || points.length < 2) return null;

   // Midpoint for the label
   const midPointIndex = Math.floor(points.length / 2);
   const midPoint = points[midPointIndex];

   return (
      <React.Fragment>
         {/* Shadow Path for depth */}
         <Polyline
            positions={points}
            pathOptions={{ color: '#000000', weight: 14, opacity: 0.1, lineJoin: 'round' }}
         />
         {/* Main Route Border */}
         <Polyline
            positions={points}
            pathOptions={{ color: '#ffffff', weight: 12, opacity: 0.9, lineJoin: 'round' }}
         />
         {/* Active Blue Flow */}
         <Polyline
            positions={points}
            pathOptions={{ color: '#1a73e8', weight: 8, opacity: 1, lineJoin: 'round' }}
            className="animate-route-flow"
         />
         {info && (
            <Marker position={midPoint} icon={createRouteLabelIcon(`${info.duration} (${info.distance} km)`)} />
         )}
      </React.Fragment>
   );
};

const VehicleFlow = ({ path = [], color, density }) => {
   const [posIndex, setPosIndex] = useState(0);
   const safePath = (path && path.length > 0) ? path : [[0, 0]];

   useEffect(() => {
      if (!path || path.length === 0) return;
      const interval = setInterval(() => {
         setPosIndex(prev => (prev + 1) % path.length);
      }, 5000 / (density || 0.5));
      return () => clearInterval(interval);
   }, [path, density]);

   if (!path || path.length === 0) return null;
   return <Marker position={path[posIndex] || [0, 0]} icon={createStatusIcon('NORMAL', color, 'vehicle')} zIndexOffset={1000} />;
};

const TransitFleetLayer = ({ fleet, nodes }) => {
   if (!fleet || !nodes) return null;

   return fleet.map(bus => {
      // Find start/end nodes based on type
      let startNode, endNode;
      if (bus.type.includes('DOWNHILL_TO_HILLTOP') || bus.type.includes('BASE_TO_HILL') || bus.type.includes('DOWNHILL_TO_HILL') || bus.type.includes('CITY_TO_HILL')) {
         startNode = nodes.find(n => n.type === 'transit' || n.type === 'waypoint');
         endNode = nodes.find(n => n.type === 'temple');
      } else {
         startNode = nodes.find(n => n.type === 'temple');
         endNode = nodes.find(n => n.type === 'transit' || n.type === 'waypoint');
      }

      if (!startNode || !endNode) return null;

      // Linear interpolation for simulation
      const lat = startNode.coords[0] + (endNode.coords[0] - startNode.coords[0]) * bus.progress;
      const lng = startNode.coords[1] + (endNode.coords[1] - startNode.coords[1]) * bus.progress;

      return (
         <Marker
            key={bus.id}
            position={[lat, lng]}
            icon={createStatusIcon('NORMAL', '#3b82f6', 'transit')}
            zIndexOffset={2000}
         >
            <Tooltip permanent direction="top" offset={[0, -20]} className="bg-slate-900 border-none shadow-none">
               <span className="text-[7px] font-black text-white uppercase tracking-widest">{bus.name}</span>
            </Tooltip>
         </Marker>
      );
   });
};

const EvacuationOverlay = ({ sector }) => {
   const routes = fetchEvacuationRoutes(sector);
   if (!routes || routes.length === 0) return null;

   return routes.map(route => (
      <React.Fragment key={route.id}>
         {/* Shadow Path */}
         <Polyline
            positions={route.points}
            pathOptions={{ color: '#000000', weight: 10, opacity: 0.2, lineJoin: 'round' }}
         />
         {/* Neon Glow Exit Path */}
         <Polyline
            positions={route.points}
            pathOptions={{ color: '#22c55e', weight: 6, opacity: 0.9, lineJoin: 'round' }}
            className="animate-route-flow"
         >
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-emerald-600 border-none shadow-xl text-white font-black text-[7px] uppercase tracking-widest">
               {route.name}
            </Tooltip>
         </Polyline>
      </React.Fragment>
   ));
};

const OptimizationOverlay = ({ sector }) => {
   const plans = fetchOptimizationPlan(sector);
   if (!plans || plans.length === 0) return null;

   return plans.map(plan => (
      <React.Fragment key={plan.id}>
         {/* Optimization Shadow */}
         <Polyline
            positions={plan.points}
            pathOptions={{ color: '#065f46', weight: 8, opacity: 0.1, lineJoin: 'round' }}
         />
         {/* Shimmering Flow Path */}
         <Polyline
            positions={plan.points}
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8, lineJoin: 'round', dashArray: '10, 10' }}
            className="animate-pulse"
         >
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-emerald-500 border-none shadow-xl text-white font-black text-[7px] uppercase tracking-widest">
               {plan.name} :: {plan.mandate}
            </Tooltip>
         </Polyline>
      </React.Fragment>
   ));
};

const GisMap = ({ mapView, activeNodeId, crowdData, trafficData, lockerData, advisoryData, darshanData, showGhatTraffic, showPACMarkers, showCrowdMarkers, showGoogleTraffic, showEvacuationRoutes, isOptimizing, activeRoute, transitFleet, sector = 'tirupati', existingData }) => {
   const [nodes, setNodes] = useState([]);
   const [roadRoute, setRoadRoute] = useState(null);

   useEffect(() => {
      // If activeRoute is passed (from Chatbot/System), we fetch the actual road-following path
      if (activeRoute && activeRoute.length >= 2) {
         fetchRoadRoute(activeRoute[0], activeRoute[activeRoute.length - 1])
            .then(res => setRoadRoute(res));
      } else {
         setRoadRoute(null);
      }
   }, [activeRoute]);

   useEffect(() => {
      if (sector === 'vijayawada') {
         setNodes([
            { id: 'temple', name: 'Kanaka Durga Temple', coords: [16.5153, 80.6050], type: 'temple' },
            { id: 'mukha_mandapam', name: 'Mukha Mandapam Entry', coords: [16.5150, 80.6045], type: 'queue' },
            { id: 'durga_ghat', name: 'Durga Ghat (Bathing)', coords: [16.5135, 80.6065], type: 'waypoint' },
            { id: 'prakasam_barrage', name: 'Prakasam Barrage', coords: [16.5065, 80.6045], type: 'waypoint' },
            { id: 'railway_station', name: 'Vijayawada Junction', coords: [16.5186, 80.6206], type: 'station' },
            { id: 'bus_stand', name: 'PNBS Bus Station', coords: [16.5100, 80.6150], type: 'transit' },
            { id: 'priority_counter', name: 'Senior Citizen Counter', coords: [16.5155, 80.6052], type: 'health' },
            { id: 'medical_center', name: 'Indrakeeladri Hospital', coords: [16.5140, 80.6055], type: 'health' }
         ]);
      } else if (sector === 'simhachalam') {
         setNodes([
            { id: 'temple', name: 'Varaha Narasimha Temple', coords: [17.7665, 83.2505], type: 'temple' },
            { id: 'bus_stand', name: 'Downhill Bus Stand', coords: [17.7600, 83.2450], type: 'waypoint' },
            { id: 'madhavadhara', name: 'Madhavadhara Path', coords: [17.7500, 83.2700], type: 'waypoint' },
            { id: 'rly_station', name: 'Simhachalam Railway', coords: [17.7470, 83.2100], type: 'transit' }
         ]);
      } else if (sector === 'annavaram') {
         setNodes([
            { id: 'temple', name: 'Satyanarayana Swamy Temple', coords: [17.281, 82.396], type: 'temple' },
            { id: 'vratam_hall', name: 'Vratam Hall Complex', coords: [17.2815, 82.3965], type: 'queue' },
            { id: 'pampa_reservoir', name: 'Pampa Reservoir', coords: [17.275, 82.390], type: 'waypoint' },
            { id: 'rly_station', name: 'Annavaram Railway', coords: [17.268, 82.398], type: 'transit' }
         ]);
      } else if (sector === 'srisailam') {
         setNodes([
            { id: 'temple', name: 'Mallikarjuna Temple', coords: [16.0740, 78.8680], type: 'temple' },
            { id: 'pathala_ganga', name: 'Pathala Ganga (Ropeway)', coords: [16.0820, 78.8750], type: 'waypoint' },
            { id: 'sakshi_ganapathi', name: 'Sakshi Ganapathi', coords: [16.0645, 78.8610], type: 'waypoint' },
            { id: 'phaladhara', name: 'Phaladhara Panchadhara', coords: [16.0620, 78.8550], type: 'waypoint' },
            { id: 'dornala_gate', name: 'Dornala Toll Gate', coords: [15.9320, 79.1150], type: 'transit' },
            { id: 'mannanur_gate', name: 'Mannanur Toll Gate', coords: [16.3200, 78.7800], type: 'transit' }
         ]);
      } else if (sector === 'sabarimala') {
         setNodes([
            { id: 'temple_sanctum', name: 'Ayyappa Temple (Sannidhanam)', coords: [9.4346, 77.0814], type: 'temple' },
            { id: 'pathinettampadi', name: '18 Holy Steps', coords: [9.4330, 77.0830], type: 'queue' },
            { id: 'pamba_camp', name: 'Pamba Base Camp', coords: [9.3804, 77.0022], type: 'waypoint' },
            { id: 'ganapathy_shrine', name: 'Kannimoola Ganapathy (Sakshi)', coords: [9.4344, 77.0811], type: 'temple' },
            { id: 'pada_padam', name: 'Pada Padam (Sri Rama Paadam)', coords: [9.4094, 77.0705], type: 'waypoint' },
            { id: 'chan_padam', name: 'Chan Padam', coords: [9.4200, 77.0800], type: 'waypoint' },
            { id: 'jothi_darshan', name: 'Jothi Darshan (Ponnambalamedu)', coords: [9.4178, 77.1197], type: 'waypoint' },
            { id: 'marakkoottam', name: 'Marakkoottam Hold', coords: [9.4350, 77.0840], type: 'waypoint' },
            { id: 'nilackal', name: 'Nilackal Global Parking', coords: [9.3550, 77.0240], type: 'transit' }
         ]);
      } else if (sector === 'all') {
         setNodes([
            { id: 'tirupati', name: 'Tirupati (Venkateswara)', coords: [13.6833, 79.3474], type: 'temple' },
            { id: 'vijayawada', name: 'Vijayawada (Durga)', coords: [16.5150, 80.6050], type: 'temple' },
            { id: 'srisailam', name: 'Srisailam (Mallikarjuna)', coords: [16.0740, 78.8680], type: 'temple' },
            { id: 'simhachalam', name: 'Simhachalam (Narasimha)', coords: [17.7665, 83.2505], type: 'temple' },
            { id: 'annavaram', name: 'Annavaram (Satyanarayana)', coords: [17.281, 82.396], type: 'temple' },
            { id: 'sabarimala', name: 'Sabarimala (Ayyappa)', coords: [9.4333, 77.0833], type: 'temple' }
         ]);
      } else {
         setNodes([
            { id: 'temple', name: 'Srivari Temple', coords: [13.6833, 79.3474], type: 'temple' },
            { id: 'vqc', name: 'VQC Complex', coords: [13.6850, 79.3480], type: 'queue' },
            { id: 'alipiri', name: 'Alipiri Gate', coords: [13.6500, 79.4000], type: 'waypoint' },
            { id: 'govindaraja', name: 'Sri Govindaraja Swamy', coords: [13.6300, 79.4150], type: 'temple' },
            { id: 'tiruchanoor', name: 'Tiruchanoor Ammavari', coords: [13.6080, 79.4520], type: 'temple' },
            { id: 'PAC1', name: 'PAC-1 (Srinivasam)', coords: [13.6285, 79.4215], type: 'pac' },
            { id: 'PAC2', name: 'PAC-2 (Vishnu Nivasam)', coords: [13.6280, 79.4195], type: 'pac' },
            { id: 'PAC3', name: 'PAC-3 (Alipiri)', coords: [13.6505, 79.4005], type: 'pac' },
            { id: 'PAC4', name: 'PAC-4 (Madhavan)', coords: [13.6295, 79.4175], type: 'pac' },
            { id: 'PAC5', name: 'PAC-5 (Venkatadri)', coords: [13.6840, 79.3510], type: 'pac' },
            { id: 'railway_station', name: 'Tirupati Station', coords: [13.6276, 79.4190], type: 'station' },
            { id: 'bus_stand', name: 'Alipiri Bus Complex', coords: [13.6490, 79.4010], type: 'transit' },
            { id: 'priority_counter', name: 'Priority Darshan Counter (Seniors)', coords: [13.6828, 79.3470], type: 'health' },
            { id: 'medical_center', name: 'Main Medical Center', coords: [13.6845, 79.3505], type: 'health' }
         ]);
      }
   }, [sector]);

   const tacticalPaths = Array.isArray(advisoryData) ? advisoryData.filter(a => a.tactical_path && Array.isArray(a.tactical_path)) : [];

   const getStatusOfNode = (nodeId) => {
      const crowd = crowdData?.find(c => c.id === nodeId);
      if (crowd) return crowd;
      const locker = lockerData?.find(l => l.id === nodeId);
      return locker;
   };

   const visibleNodes = nodes.filter(node => {
      if (node.type === 'pac') return showPACMarkers;
      if (['temple', 'queue', 'service', 'landmark'].includes(node.type)) return showCrowdMarkers;
      return true;
   });

   return (
      <div className="w-full h-full relative">
         <MapContainer center={mapView.center} zoom={mapView.zoom} className="w-full h-full" zoomControl={false}>
            {/* ⛈️ METEOROLOGICAL TINT (NEW) */}
            {(existingData?.weather?.condition === 'RAIN' || existingData?.weather?.condition === 'STORM') && (
               <div className={`absolute inset-0 z-[1000] pointer-events-none transition-opacity duration-1000 ${existingData.weather.condition === 'STORM' ? 'bg-indigo-900/20 blur-[2px]' : 'bg-blue-900/10'
                  }`} />
            )}

            <TileLayer url={GOOGLE_ROADS} attribution='&copy; Google Maps' />

            {showGoogleTraffic && (
               <TileLayer
                  url="https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}"
                  attribution='&copy; Google'
                  zIndex={100}
               />
            )}
            <MapController center={mapView.center} zoom={mapView.zoom} />
            <ZoomControl position="bottomleft" />

            {/* HIGH-FIDELITY ROAD-FOLLOWING ROUTE */}
            {roadRoute && (
               <RouteRenderer points={roadRoute.coordinates} info={roadRoute} />
            )}

            {/* 🆘 EVACUATION ROUTES */}
            {showEvacuationRoutes && (
               <EvacuationOverlay sector={sector} />
            )}

            {/* 🧪 PROJECT AMRIT OPTIMIZATION (NEW) */}
            {isOptimizing && (
               <OptimizationOverlay sector={sector} />
            )}

            {tacticalPaths.map((tp, idx) => (
               <Polyline key={idx} positions={tp.tactical_path} pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.6, dashArray: '5, 5' }} />
            ))}

            {showGhatTraffic && (
               <React.Fragment>
                  <Polyline positions={ghatRoadPaths.upward_path} pathOptions={{ color: '#eab308', weight: 4, opacity: 0.6, dashArray: '10, 10' }} />
                  <Polyline positions={ghatRoadPaths.downward_path} pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.6, dashArray: '10, 10' }} />
                  <VehicleFlow path={ghatRoadPaths.upward_path} color="#eab308" density={trafficData?.up_ghat?.density} />
                  <VehicleFlow path={ghatRoadPaths.downward_path} color="#6366f1" density={trafficData?.down_ghat?.density} />
               </React.Fragment>
            )}

            {/* SACRED TRANSIT FLEET LAYER */}
            <TransitFleetLayer fleet={transitFleet} nodes={nodes} />

            {/* UNIVERSAL GRID NEURAL PATH (SACRED CIRCUIT) */}
            {sector === 'all' && (
               <Polyline
                  positions={[
                     [9.4333, 77.0833], // Sabarimala
                     [13.6833, 79.3474], // Tirupati
                     [16.0740, 78.8680], // Srisailam
                     [16.5150, 80.6050], // Vijayawada
                     [17.281, 82.396],   // Annavaram
                     [17.7665, 83.2505], // Simhachalam
                  ]}
                  pathOptions={{ color: '#b8860b', weight: 4, opacity: 0.2, dashArray: '10, 10' }}
               />
            )}

            {visibleNodes.map(node => {
               const isGlobalHub = sector === 'all';
               const status = getStatusOfNode(node?.id);
               const healthValue = parseInt(status?.health) || 88;
               const isHazard = status?.status === 'CRITICAL' || status?.status === 'FULL' || (isGlobalHub && healthValue < 50);

               let statusColor = '#94a3b8';
               if (status) {
                  if (status.status === 'CRITICAL' || status.status === 'FULL') statusColor = '#ef4444';
                  else if (status.status === 'HEAVY' || status.status === 'LIMITED') statusColor = '#f97316';
                  else if (status.status === 'MODERATE') statusColor = '#eab308';
                  else if (status.status === 'NORMAL' || status.status === 'AVAILABLE') statusColor = '#10b981';
               }

               return (
                  <React.Fragment key={node.id}>
                     <DensityHeatmap coordinates={node?.coords || [0,0]} status={status?.status} />
                     <Marker
                        position={node?.coords || [0,0]}
                        icon={isGlobalHub ? createNeuralNodeIcon(node?.name?.split(' ')[0], statusColor, status?.health || 92) : createStatusIcon(status?.status || 'NORMAL', statusColor, node?.type, status?.count || status?.info, isHazard)}
                     >
                        <Tooltip direction="top" offset={[0, -25]} className="sacred-map-label">
                           <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter bg-white/95 px-2 py-0.5 rounded border border-slate-200 shadow-sm leading-none flex items-center gap-1.5 whitespace-nowrap">
                                 {node.name}
                              </span>
                           </div>
                        </Tooltip>

                        <Popup className="tactical-popup">
                           <div className="flex flex-col gap-2 p-1 min-w-[150px]">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                                 <span className="text-[10px] font-black text-slate-950 uppercase tracking-tight">{node.name}</span>
                                 <div className="flex items-center gap-1">
                                    {existingData?.weather?.condition === 'RAIN' ? <CloudRain size={10} className="text-blue-500 animate-bounce" /> : existingData?.weather?.condition === 'STORM' ? <Wind size={10} className="text-indigo-500 animate-pulse" /> : <Sun size={10} className="text-yellow-500" />}
                                    <span className="text-[8px] font-black text-slate-400">{existingData?.weather?.temp || '28'}°C</span>
                                 </div>
                              </div>

                              {/* TICKET-WISE WAITING INTELLIGENCE */}
                              {(isGlobalHub ? darshanData?.[node?.id]?.categories : darshanData?.categories)?.map((cat, idx) => (
                                 <div key={idx} className="flex flex-col gap-2 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Darshanam Ops</div>
                                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100">
                                       <div className="flex items-center gap-2">
                                          {(cat?.icon === 'Users' || cat?.icon === 'Users') ? <Users size={12} className="text-yellow-600" /> :
                                             cat?.icon === 'Ticket' ? <Ticket size={12} className="text-emerald-600" /> :
                                                <Clock size={12} className="text-slate-400" />}
                                          <span className="text-[9px] font-bold text-slate-700">{cat?.label}</span>
                                       </div>
                                       <div className="text-[10px] font-black text-slate-950 tracking-tighter">{cat?.value}H</div>
                                    </div>
                                 </div>
                              ))}

                              <a
                                 href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${node.coords[0]},${node.coords[1]}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-600 transition-all shadow-lg active:scale-95"
                              >
                                 <Eye size={12} className="text-yellow-500" /> Explore Street View
                              </a>
                           </div>
                        </Popup>
                     </Marker>
                  </React.Fragment>
               );
            })}
         </MapContainer>
      </div>
   );
};

export default GisMap;
