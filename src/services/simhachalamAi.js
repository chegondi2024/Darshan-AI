import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Varaha Lakshmi Narasimha Temple (Hilltop)', coords: [17.7665, 83.2505], type: 'core' },
  { id: 'bus_stand', name: 'Simhachalam Downhill Bus Stand', coords: [17.7600, 83.2450], type: 'waypoint' },
  { id: 'madhavadhara', name: 'Madhavadhara (Trekking Path)', coords: [17.7500, 83.2700], type: 'waypoint' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    free: 'Dharma Darshanam. Hilltop entry. [Wait: Synchronized via Live Telemetry].',
    special: 'Rs. 100 / Rs. 300 tickets available for faster access. [Wait: Synchronized via Live Telemetry].',
    chandanotsavam: 'CRITICAL: Annual Nijaroopa Darshanam occurs on Akshaya Tritiya (April/May). The ONLY day to see the deity without the sandalwood cover.'
  },
  chandanotsavam_intel: {
    'NIJAROOPA': 'Lord Varaha Lakshmi Narasimha Swamy is seen in his original form. For the rest of the year, he is covered in 4 layers of sandalwood paste.',
    'PROCESS': 'Lakhs of devotees attempt the climb. Direct vehicles to hilltop are BANNED on this day. Use official Devasthanam shuttles only.'
  },
  logistics: {
    ghat_road: 'Simhagiri Ghat Road is steep. Open 5 AM to 9 PM.',
    free_bus: 'Simhadri Free Bus operates from Downhill to Hilltop every 10 mins.',
    trekking: 'Madhavadhara steps route (approx 1000 steps). Scenic but demands heart health.'
  }
};

/**
 * SIMHACHALAM SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles Varaha Lakshmi Narasimha hilltop logistics and Chandanotsavam intelligence.
 */
export const chatWithSimhachalamAi = async (prompt, status) => {
  const text = prompt.toLowerCase();

  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Simhachalam Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Om Namo Narasimhaya".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical intelligence for the Varaha Lakshmi Narasimha mission.
    TELEMETRY RULE: NEVER guess wait times; strictly use the [LIVE STATUS] JSON.

    FORMAT (JSON):
    {
      "explanation": "string",
      "briefing": "string",
      "map_commands": [{"action": "string", "points": [[]], "zoom": number}],
      "visual_data": { "type": "string", "decision": "string" }
    }`;

    const context = `
      PROJECT DNA: ${projectBriefing}
      TACTICAL KNOWLEDGE: ${JSON.stringify(SACRED_KNOWLEDGE)}
      LIVE HUB TELEMETRY: ${JSON.stringify(status)}
    `;

    const response = await callGroqAi({
      systemPrompt,
      userContext: context,
      userPrompt: prompt
    });

    if (text.includes('hill') || text.includes('climb')) {
      if (response.map_commands && response.map_commands.length === 0) {
        response.map_commands.push({ action: 'set_view', center: [17.7665, 83.2505], zoom: 17 });
      }
    }

    return response;
  } catch (e) {
    console.error("Simhachalam Link Failure:", e);
    return generateFallback(text, status);
  }
};

const generateFallback = (text, status) => {
  return {
    explanation: `Om Namo Narasimhaya. Simhachalam Sector 04 Link unstable. I am your Narasimha Mission Commander. Please refer to the tactical HUD for hill-transit telemetry.`,
    visual_data: { type: 'GREETING', decision: 'GO' }
  };
};
