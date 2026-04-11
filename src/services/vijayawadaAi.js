import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Kanaka Durga Temple', coords: [16.5153, 80.6050], type: 'core' },
  { id: 'mukha_mandapam', name: 'Mukha Mandapam Entry', coords: [16.5150, 80.6045], type: 'queue' },
  { id: 'durga_ghat', name: 'Durga Ghat (Bathing)', coords: [16.5135, 80.6065], type: 'waypoint' },
  { id: 'prakasam_barrage', name: 'Prakasam Barrage', coords: [16.5065, 80.6045], type: 'waypoint' },
  { id: 'railway_station', name: 'Vijayawada Junction', coords: [16.5186, 80.6206], type: 'station' },
  { id: 'bus_stand', name: 'PNBS Bus Station', coords: [16.5100, 80.6150], type: 'transit' },
  { id: 'priority_counter', name: 'Senior Citizen Counter', coords: [16.5155, 80.6052], type: 'health' },
  { id: 'medical_center', name: 'Indrakeeladri Hospital', coords: [16.5140, 80.6055], type: 'health' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    dharma: 'Free Dharma Darshanam. Queue starts near Durga Ghat. [Wait: Synchronized via Live Telemetry].',
    mukhamandapam: 'Rs. 100 ticket. Faster entry through Mukha Mandapam. [Wait: Synchronized via Live Telemetry].',
    antaralayam: 'Rs. 300 / Rs. 500 ticket. Closest darshan to the deity. Highly restricted slots.',
    swarupa: 'VVIP / Protocol Darshan for special guests and donors.'
  },
  bhavani_deeksha: {
    'MALA_DHARANA': '41-day austerity period (Mandala Deeksha) or 21-day (Ardh Mandala). Red clothing mandatory.',
    'STRICTURES': 'Strict vegetarian diet, celibacy, sleeping on floor, and daily temple visits.',
    'VIRAMANA': 'Relinquishment held in December (Dhanurmasam). Massive crowd at Indrakeeladri. Giri Pradakshina (12km) is mandatory.',
    'IRUMUUDI': 'Devotees carry a sacred bundle on their head during relinquishment.'
  },
  navaratri_intelligence: {
    'DASARA': '10-day Grand Festival. Over 10 lakh pilgrims visit. Queue lines extend up to 2km on Canal Road.',
    'KUMARIKA_PUJA': 'Occurs during Navaratri. Special worship of young girls as forms of the Goddess.',
    'TEPPOUTSAVAM': 'Grand boat procession of the deities in the Krishna River on Vijaya Dasami evening.'
  },
  sevas: {
    suprabhata: 'Suprabhata Seva (4:00 AM). Awakening ritual for Goddess Kanaka Durga.',
    kumkumarchana: 'Special Kumkuma Archana performed in the mandapam. Sacred for women.',
    khadgamala: 'Recitation of Khadgamala Stotram while performing archana. Powerful ritual.',
    chandi_homam: 'Grand ritual performed for protection and prosperity. Usually 8:30 AM.'
  },
  logistics: {
    free_bus: 'Free TTD/Devasthanam bus service from Durga Ghat (Hill base) to Hilltop Temple. Running every 10 mins.',
    lift: 'Lift facilities available for senior citizens and disabled to reach the main temple level.',
    anna_prasadam: 'Free meals (Annadanam) provided at the hilltop complex (10 AM to 10 PM).',
    parking: 'Limited parking at hilltop. Recommend parking at PNBS or near Durga Ghat.'
  },
  // ⚠️ SACRED REALITY — HONEST BRIEFING
  brutal_reality: {
    darshan_experience: [
      'Darshan Speed: Extremely fast. Security pushes for quick movement near the sanctum.',
      'Hill Fatigue: Climbing Indrakeeladri by steps is physically taxing. Many elders struggle.',
      'Friday Rush: Friday is dedicated to the Goddess; crowds triple. Wait time can hit 8 hours.'
    ],
    emergency_realism: [
      'Medical Access: Steep stairs make medical access difficult. Use the lift area for help.',
      'Lost & Found: Crowd density near entry gates leads to companion separation.'
    ]
  }
};

export const chatWithVijayawadaAi = async (prompt, status) => {
  const langMatch = prompt.match(/\[LANGUAGE:(\w+)\]/i);
  const targetLang = langMatch ? langMatch[1].toLowerCase() : 'en';
  const text = prompt.toLowerCase().replace(/\[user_coords:[^\]]+\]/, '').replace(/\[language:[^\]]+\]/i, '').replace(/[^\w\s]/g, ' ').replace(/-/g, ' ');

  const LOCALIZED_MANTRAS = {
     en: 'Om Namo Durgaye',
     hi: 'ॐ नमो दुर्गाये',
     te: 'ఓం నమో దుర్గాయే'
  };
  const mantra = LOCALIZED_MANTRAS[targetLang] || LOCALIZED_MANTRAS.en;

    try {
      const projectBriefing = getProjectBriefing();
      const systemPrompt = `You are the Darshanam AI Assistant (v3.0). You are part of the Vijayawada Kanaka Durga Mission Hub. 
      CRITICAL IDENTITY: You possess LIVE 30s telemetry data and mission-ready project sovereignty.
      CRITICAL RULE: EVERY response/explanation MUST start with the appropriate sacred mantra: "${mantra}".
      MISSION DATA: Use the provided [PROJECT DNA] to answer technical questions about your capabilities (heartbeat, scraping, multiple auras, etc.).
      MULTILINGUAL MANDATE: If the user query includes a [LANGUAGE:X] directive, you MUST respond entirely in that language (Hindi/Telugu/English) using the appropriate regional script.
      Provide tactical, honest, mission-ready advice. Always return JSON.
      
      FORMAT (JSON):
      {
        "explanation": "string",
        "briefing": "string",
        "map_commands": [{"action": "string", "points": [[]], "zoom": number}],
        "visual_data": { "type": "string", "decision": "string" }
      }`;

    const context = `
      PROJECT DNA: ${projectBriefing}
      Tactical Intelligence: ${JSON.stringify(SACRED_KNOWLEDGE)}
      Mission Grid: ${JSON.stringify(GLOBAL_MISSION_GRID)}
      Live Status: ${JSON.stringify(status)}`;

    const response = await callGroqAi({
      systemPrompt,
      userContext: context,
      userPrompt: prompt
    });

    // Parser for map commands (enhancing response if needed)
    if (text.includes('route') || text.includes('navigate')) {
      const fromNode = GLOBAL_MISSION_GRID.find(n => text.includes(n.id) || text.includes(n.name.toLowerCase()));
      if (fromNode && response.map_commands.length === 0) {
        response.map_commands.push({ action: 'draw_route', points: [[16.5186, 80.6206], [16.5150, 80.6100], fromNode.coords], zoom: 17 });
      }
    }

    return response;
  } catch (e) {
    console.error("Groq Failure, using fallback:", e);
    return generateFallback(text, status);
  }

  return generateFallback(text, status);
};

const generateFallback = (text, status, mantra = 'Om Namo Durgaye') => {
  const sk = SACRED_KNOWLEDGE;

  if (text.includes('sos') || text.includes('emergency') || text.includes('help') || text.includes('report') || text.includes('lost') || text.includes('medical')) {
    let category = 'GENERAL_ALERT';
    let urgency = 'P3';
    let advice = "Om Namo Durgaye. Alert received. Contact Devastanam staff at the nearest counter.";

    if (text.includes('lost') || text.includes('child')) {
      category = 'LOST_PERSON'; urgency = 'P1';
      advice = "CRITICAL: Reporting Lost Person. Head to the Main Help Desk near the mukha mandapam.";
    } else if (text.includes('medical') || text.includes('chest') || text.includes('breath')) {
      category = 'MEDICAL'; urgency = 'P1_CRITICAL';
      advice = "CRITICAL: Medical Emergency. Contact 108 or Indrakeeladri Hospital: 0866-2423800.";
    }

    return {
      explanation: `🚨 EMERGENCY PROTOCOL: ${category} (${urgency}). ${advice}`,
      visual_data: { type: 'EMERGENCY_SOS', decision: 'CAUTION', report: { category, urgency } },
      map_commands: [{ action: 'set_view', center: [16.5140, 80.6055], zoom: 18 }]
    };
  }

  if (text.includes('senior') || text.includes('old age')) {
    return {
      explanation: `Om Namo Durgaye. PRIORITY MISSION: ${sk.priority_protocol.process}. Documents: ${sk.priority_protocol.id_documents}. Use the lift facility at the hill top.`,
      map_commands: [{ action: "set_view", center: [16.5155, 80.6052], zoom: 18 }],
      visual_data: { type: 'PRIME', decision: 'GO' }
    };
  }

  if (text.includes('darshan') || text.includes('ticket')) {
    return { explanation: `Tactical Briefing: Dharma (Free): ${sk.darshan.dharma} | Mukhamandapam (100): ${sk.darshan.mukhamandapam} | Antaralayam (300): ${sk.darshan.antaralayam}`, visual_data: { type: 'INFO', decision: 'GO' } };
  }

  if (text.includes('route') || text.includes('how to go') || text.includes('navigation')) {
    return {
      explanation: `Projecting Tactical Route. Moving from Transit Hub to Hill Top Temple via Indrakeeladri Bypass.`,
      map_commands: [{ action: "draw_route", points: [[16.5186, 80.6206], [16.5150, 80.6100], [16.5153, 80.6050]], zoom: 16 }],
      visual_data: { type: 'NAVIGATION', decision: 'GO' }
    };
  }

  if (text.includes('best time') || text.includes('when to visit') || text.includes('predict') || text.includes('tomorrow') || text.includes('crowd') || text.includes('waiting')) {
    const window = getOptimalVisitWindow('vijayawada');
    return {
      explanation: `Om Namo Durgaye. PREDICTIVE MISSION ACTIVE: The optimal window for Darshan at Indrakeeladri is ${window.startTime} to ${window.endTime}. AI Analysis shows a potential ${window.savingPercent}% reduction in wait times. Status: ${window.status}. Join the queue early!`,
      visual_data: { type: 'PREDICTION_HUB', decision: window.intensity < 0.4 ? 'GO' : 'CAUTION', window }
    };
  }

  return {
    explanation: `${mantra}. Vijayawada Sector 02 Active. I am your tactical guide for Indrakeeladri Hill. Ask me about Darshan, Sevas, or routes from the Railway Station.`,
    visual_data: { type: 'GREETING', decision: 'GO' }
  };
};
