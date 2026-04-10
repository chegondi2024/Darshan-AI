import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Varaha Lakshmi Narasimha Temple (Hilltop)', coords: [17.7665, 83.2505], type: 'core' },
  { id: 'bus_stand', name: 'Simhachalam Downhill Bus Stand', coords: [17.7600, 83.2450], type: 'waypoint' },
  { id: 'madhavadhara', name: 'Madhavadhara (Trekking Path)', coords: [17.7500, 83.2700], type: 'waypoint' },
  { id: 'rly_station', name: 'Simhachalam Railway Junction', coords: [17.7470, 83.2100], type: 'transit' },
  { id: 'priority_counter', name: 'Special Darshan Counter', coords: [17.7668, 83.2507], type: 'health' },
  { id: 'medical_center', name: 'Devasthanam Medical Point', coords: [17.7660, 83.2500], type: 'health' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    free: 'Dharma Darshanam. Hilltop entry. Wait: 2-5 hours.',
    special: 'Rs. 100 / Rs. 300 tickets available for faster access.',
    chandanotsavam: 'CRITICAL: Annual Nijaroopa Darshanam occurs on Akshaya Tritiya (April/May). The ONLY day to see the deity without the sandalwood cover.'
  },
  chandanotsavam_intel: {
    'NIJAROOPA': 'Lord Varaha Lakshmi Narasimha Swamy is seen in his original form. For the rest of the year, he is covered in 4 layers of sandalwood paste (weighted at 490kg).',
    'TICKETS': 'Tickets (Rs. 300, 1000) are released online weeks in advance via ap.gov.in portals. Counters available at foothill during the event.',
    'PROCESS': 'Lakhs of devotees attempt the climb. Direct vehicles to hilltop are BANNED on this day. Use official Devasthanam shuttles only.'
  },
  sevas: {
    nitya_kalyanam: 'Daily celestial wedding at 9:30 AM. Ticket: Rs. 1000. Includes prasadam and silk clothes.',
    kunkumarchana: 'Performed for Goddess Lakshmi. Popular for family prosperity. Ticket: Rs. 100.',
    laksha_kumkumarchana: 'Grand scale ritual performed on specific Fridays and festivals.',
    suprabhata_seva: 'Morning awakening ritual at 4:30 AM. Soulful experience at the hilltop.'
  },
  logistics: {
    ghat_road: 'Simhagiri Ghat Road is steep. Toll fee: Rs. 100 per car. Open 5 AM to 9 PM.',
    free_bus: 'Simhadri Free Bus operates from Downhill to Hilltop every 10 mins.',
    trekking: 'Madhavadhara steps route (approx 1000 steps). Scenic but demands heart health.',
    accommodation: 'Hilltop Srivari Guest Houses and Downhill Satrams available. Book via official TTD/Devasthanam portal.'
  },
  priority_protocol: {
    eligible: 'Senior Citizens (65+) and Differently Abled.',
    process: 'Special queue entry with lift access. Documents: Aadhar Card mandatory for age verification.'
  },
  // ⚠️ HILLTOP REALITY — SACRED TRUTHS
  brutal_reality: {
    darshan_experience: [
      'Darshan Speed: Extremely brief. The deity is covered in sandalwood paste; you only see the silhouette for 2-3 seconds.',
      'Hill Traffic Trap: On festival days, vehicles are stopped halfway up the hill. You may have to walk the remaining 2km in steep heat.',
      'Heat Hazard: The hilltop complex has limited shade. Dehydration is a common mission-stopper during summer.'
    ],
    logistics_struggles: [
      'Token Chaos: Rs. 100/300 tokens can sell out before you even reach the hill top.',
      'Parking Scarcity: Hilltop parking is highly restricted. Expect to park downhill and use the bus complex.'
    ]
  }
};

export const chatWithSimhachalamAi = async (prompt, status) => {
  const text = prompt.toLowerCase();

  try {
    const systemPrompt = `You are the Simhachalam AI Mission Guide. CRITICAL RULE: EVERY response/explanation MUST start with "Om Namo Narasimhaya". NEVER skip this.
      Provide tactical, lion-hill aware advice. Use phrases like "Mission Ready", "Narasimha AI", "Om Namo Narasimhaya". Always return JSON.
      
      FORMAT (JSON):
      {
        "explanation": "string",
        "briefing": "string",
        "map_commands": [{"action": "string", "points": [[]], "zoom": number}],
        "visual_data": { "type": "string", "decision": "string" }
      }`;

    const context = `Tactical Intelligence: ${JSON.stringify(SACRED_KNOWLEDGE)}
      Mission Grid: ${JSON.stringify(GLOBAL_MISSION_GRID)}
      Live Status: ${JSON.stringify(status)}`;

    const response = await callGroqAi({
      systemPrompt,
      userContext: context,
      userPrompt: prompt
    });

    if (text.includes('hill') || text.includes('climb')) {
      if (response.map_commands.length === 0) {
        response.map_commands.push({ action: 'set_view', center: [17.7665, 83.2505], zoom: 17 });
      }
    }

    return response;
  } catch (e) {
    console.error("Groq Failure, using fallback:", e);
    return generateFallback(text, status);
  }

  return generateFallback(text, status);
};

const generateFallback = (text, status) => {
  const sk = SACRED_KNOWLEDGE;

  if (text.includes('sos') || text.includes('emergency') || text.includes('help') || text.includes('report') || text.includes('lost') || text.includes('medical') || text.includes('heat')) {
    let category = 'HILL_ALERT';
    let urgency = 'P3';
    let advice = "Om Namo Narasimhaya. Alert Signal Synchronized. Find Devasthanam staff immediately.";

    if (text.includes('lost') || text.includes('child')) {
      category = 'LOST_PERSON'; urgency = 'P1';
      advice = "CRITICAL: Reporting Lost Person. Head to the Main Temple Office near the queue entry.";
    } else if (text.includes('medical') || text.includes('heat') || text.includes('breath') || text.includes('chest')) {
      category = 'MEDICAL'; urgency = 'P1_CRITICAL';
      advice = "CRITICAL: Medical Alert. Contact 108 or Hilltop Medical Point: 0891-2764922. Find shade immediately.";
    }

    return {
      explanation: `🚨 NARASIMHA EMERGENCY PROTOCOL: ${category} (${urgency}). ${advice}`,
      visual_data: { type: 'EMERGENCY_SOS', decision: 'CAUTION', report: { category, urgency } },
      map_commands: [{ action: 'set_view', center: [17.7660, 83.2500], zoom: 18 }]
    };
  }

  if (text.includes('chandan') || text.includes('original') || text.includes('april')) {
    return {
      explanation: `Tactical Briefing: Chandanotsavam (Nijaroopa Darshanam) is on April 20, 2026. ${sk.darshan.chandanotsavam} Sandalwood paste removal starts early morning.`,
      visual_data: { type: 'FESTIVAL_ALERT', decision: 'CAUTION' }
    };
  }

  if (text.includes('bus') || text.includes('reach')) {
    return { explanation: `Logistics Intel: ${sk.logistics.free_bus} ${sk.logistics.ghat_road}. Tactical access is active.`, visual_data: { type: 'INFO', decision: 'GO' } };
  }

  if (text.includes('best time') || text.includes('when to visit') || text.includes('predict') || text.includes('tomorrow') || text.includes('crowd') || text.includes('waiting')) {
    const window = getOptimalVisitWindow('simhachalam');
    return {
      explanation: `Om Namo Narasimhaya. NARASIMHA AI PREDICTION: The optimal window for Darshan at Simhachalam is ${window.startTime} to ${window.endTime}. AI Analysis shows a potential ${window.savingPercent}% reduction in wait times. Status: ${window.status}. Join the queue early!`,
      visual_data: { type: 'PREDICTION_HUB', decision: window.intensity < 0.4 ? 'GO' : 'CAUTION', window }
    };
  }

  return {
    explanation: `Om Namo Narasimhaya. Simhachalam Sector 04 Active. I am your Narasimha Mission Commander. Ask me about Chandanotsavam, Hill-climb sevas, or Darshan types.`,
    visual_data: { type: 'GREETING', decision: 'GO' }
  };
};
