import { callGroqAi, isGroqEnabled } from "./aiProvider";

const hasValidKey = isGroqEnabled();

const SABARIMALA_KNOWLEDGE = {
  temple: 'Sabarimala Sree Dharma Sastha Temple',
  deity: 'Lord Ayyappa (Sree Dharma Sastha)',
  location: 'Periyar Tiger Reserve, Pathanamthitta, Kerala',
  elevation: '914 meters above sea level',
  mantra: 'Swamiye Saranam Ayyappa',
  pilgrimage_rules: {
    vrutham_41_days: 'Mandatory 41-day austerity period. Strict celibacy, vegetarian diet, no alcohol/tobacco. Wearing black, blue, or saffron clothing. Walking barefoot.',
    malayidal: 'Formal beginning of Vrutham by wearing the sacred Mala (Tulsi/Rudraksha) from a Guru Swami.',
    virtual_queue: 'MANDATORY online booking for darshan and trekking via the official Kerala Police portal.',
    irumudikettu: 'The two-compartment sacred pouch carried on the head. Front (Munmudi) for offerings like the ghee-filled coconut (Neyy-Thenga). Back (Pinmudi) for travel essentials.'
  },
  key_locations: {
    pamba: { id: 'pamba_camp', coords: [9.3804, 77.0022], desc: 'Pamba River - Sacred bath point and base camp. 5km from Sannidhanam.' },
    sannidhanam: { id: 'temple_sanctum', coords: [9.4346, 77.0814], desc: 'Main Shrine - Home of Lord Ayyappa.' },
    pathinettampadi: { id: 'pathinettampadi', coords: [9.4330, 77.0830], desc: '18 Holy Steps. Only pilgrims with Irumudikettu can climb these.' },
    ponnambalamedu: { id: 'jothi_darshan', coords: [9.4178, 77.1197], desc: 'Jothi Darshan (Ponnambalamedu) - Observation point for the Makara Jyothi flame.' },
    ganapathy: { id: 'ganapathy_shrine', coords: [9.4344, 77.0811], desc: 'Kannimoola Ganapathy (Sakshi) - Required stop before 18 steps.' },
    pada_padam: { id: 'pada_padam', coords: [9.4094, 77.0705], desc: 'Pada Padam (Sri Rama Paadam) - Sacred footprint on the trek.' },
    chan_padam: { id: 'chan_padam', coords: [9.4200, 77.0800], desc: 'Chan Padam - Key trekking waypoint.' },
    nilackal: { id: 'nilackal', coords: [9.3550, 77.0240], desc: 'Nilackal - Last vehicle parking point. Connects to Pamba via forest shuttle.' }
  },
  darshan_types: {
    free_darshan: 'General queue. During peak Mandalam/Makaravilakku, wait times can reach 15-20 hours.',
    virtual_queue: 'Priority slot booking. Wait time: 3-6 hours. Verification at Pamba checkpoint.'
  },
  trail_info: {
    main_route: 'Pamba → Neelimala → Appachimedu → Saramkuthi → Sannidhanam (5km steep trek).',
    forest_route: 'Erumeli → Azhutha → Karimala → Pamba (Traditional 40km forest trek through tiger reserve).',
    duration: 'Pamba route takes 3-5 hours. Erumeli route takes 2-3 days.'
  }
};

const SABARIMALA_SYSTEM_PROMPT = `You are the SABARIMALA AI MISSION GUIDE - a Zero-Filter, truth-aware sacred intelligence for Lord Ayyappa pilgrimage management. 

CRITICAL RULE: EVERY response/explanation MUST start with "Swamiye Saranam Ayyappa". NEVER skip this.

SACRED IDENTITY:
- Temple: ${SABARIMALA_KNOWLEDGE.temple}
- Deity: ${SABARIMALA_KNOWLEDGE.deity}
- Location: ${SABARIMALA_KNOWLEDGE.location}
- Elevation: ${SABARIMALA_KNOWLEDGE.elevation}
- Sacred Mantra: ${SABARIMALA_KNOWLEDGE.mantra}

YOUR MISSION:
You provide real-time, tactical pilgrimage intelligence for Sabarimala devotees (Ayyappa Swamis). You are fluent in Malayalam, Telugu, Tamil, Hindi, and English.

YOU KNOW:
1. PILGRIMAGE ESSENTIALS: Virtual queue (Kerala app) is MANDATORY. 41-day mandalam vrat preparation. Irumudikettu (sacred pouch) is required for entry.
2. ROUTES: Pamba base camp → 5km forest trek → 18 steps → Sanctum. Alternative: Erumeli forest trek (80km, 5-6 days).
3. 18 HOLY STEPS (PATHINETTAMPADI): Only pilgrims carrying Irumudikettu can climb. Identification: Mala (tulsi/rudraksha) worn around neck.
4. PEAK SEASONS: Mandalam (Nov-Jan) = extreme crowds. Makaravilakku (Jan 14) = highest rush of the year (5-6 lakh pilgrims). Off-season visits possible in Madam/Meenam months.
5. FACILITIES: Annadhanam (free food), paid accommodation at Sannidhanam, cloak rooms at Pamba and Sannidhanam.
6. SAFETY: Forest (tiger reserve) - stay on marked trails. Emergency medical camps at Pamba and Sannidhanam.

RESPONSE FORMAT (strict JSON):
{
  "explanation": "<Full tactical answer in the user's language. Start with 'Swamiye Saranam Ayyappa.'>",
  "map_commands": [{"action": "set_view", "center": [lat, lon], "zoom": 15, "node_id": "location_id"}],
  "visual_data": {"type": "INFO|ROUTE|CROWD|CRITICAL", "decision": "GO|WAIT|CAUTION"},
  "briefing": {"status": "OPTIMAL|BUSY|CRITICAL", "wait_time": "X hrs", "recommendation": "..."}
}`;

let conversationHistory = [];

const extractJsonFromText = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) { /* fall through */ }
  return {
    explanation: text,
    map_commands: [],
    visual_data: { type: 'INFO' },
    briefing: null
  };
};

export const chatWithSabarimalaAi = async (userMessage, liveData = null) => {
  if (!hasValidKey) {
    return {
      explanation: 'Swamiye Saranam Ayyappa. Groq API key not configured. Please set VITE_GROQ_API_KEY.',
      map_commands: [],
      visual_data: { type: 'INFO' },
      briefing: null
    };
  }

  const liveContext = liveData ? `
LIVE SABARIMALA GRID DATA (${new Date().toLocaleTimeString()} IST):
- Trek Status: ${liveData.crowd_intelligence?.[0]?.info || 'Active'}
- Pamba Queue: ${liveData.crowd_intelligence?.[1]?.info || 'Monitoring'}
- Grid Health: ${liveData.grid_health || 85}%
- Weather at Hill: ${liveData.weather?.temp || '--'}°C, ${liveData.weather?.condition || 'Checking'}
- 18 Steps Status: ${liveData.darshan?.steps_status || 'Open'}
- Free Accommodation: ${liveData.accommodation?.free_rooms?.available || 0} rooms
` : '';

  try {
    const responseBody = await callGroqAi({
      systemPrompt: SABARIMALA_SYSTEM_PROMPT,
      userContext: liveContext,
      userPrompt: userMessage
    });

    return responseBody;
  } catch (error) {
    console.error("Groq AI Mission Error:", error);
    return {
      explanation: `Swamiye Saranam Ayyappa. Mission link disrupted. Sabarimala pilgrimage logistics: Carry Irumudikettu, book virtual queue via Kerala app, trek from Pamba (5km). 18 steps entry requires mandalam vrat completion.`,
      map_commands: [{ action: 'set_view', center: [9.4333, 77.0833], zoom: 15 }],
      visual_data: { type: 'INFO', decision: 'GO' },
      briefing: { status: 'ADVISORY', wait_time: 'Varies', recommendation: 'Check virtual queue status before departure.' }
    };
  }
};
