import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'pamba', name: 'Pamba Base Camp', coords: [9.3804, 77.0022], type: 'core' },
  { id: 'sanctum', name: 'Sannidhanam Main Shrine', coords: [9.4346, 77.0814], type: 'core' },
  { id: 'steps', name: 'Pathinettampadi (18 Holy Steps)', coords: [9.4330, 77.0830], type: 'waypoint' },
  { id: 'nilackal', name: 'Nilackal Parking Complex', coords: [9.3550, 77.0240], type: 'transit' }
];

const SACRED_KNOWLEDGE = {
  pilgrimage_rules: {
    vrutham_41_days: 'Mandatory 41-day austerity period. Wearing black/blue/saffron clothing. Walking barefoot.',
    virtual_queue: 'MANDATORY online booking for darshan and trekking via the official Kerala Police portal.',
    irumudikettu: 'Sacred pouch carried on the head. Required for climbing the 18 steps.'
  },
  darshan_types: {
    free_darshan: 'General queue. [Wait: Synchronized via Live Telemetry].',
    virtual_queue: 'Priority slot booking. [Wait: Synchronized via Live Telemetry]. Verification at Pamba.'
  },
  trail_info: {
    main_route: 'Pamba → Neelimala → Appachimedu → Saramkuthi → Sannidhanam (5km steep trek).',
    forest_route: 'Erumeli → Karimala → Pamba (Traditional 40km forest trek).'
  }
};

/**
 * SABARIMALA SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles Ayyappa pilgrimage logistics and 18-step sacred protocols.
 */
export const chatWithSabarimalaAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  
  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Sabarimala Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Swamiye Saranam Ayyappa".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical intelligence for the Lord Ayyappa mission.
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

    return response;
  } catch (e) {
    console.error("Sabarimala Neural Link Failure:", e);
    return generateFallback(text, status);
  }
};

const generateFallback = (text, status) => {
   return { 
      explanation: `Swamiye Saranam Ayyappa. Sabarimala Sector 06 Link unstable. I am your Ayyappa Mission Commander. Please refer to the tactical HUD for trek-flow telemetry and Pamba status.`, 
      visual_data: { type: 'GREETING', decision: 'GO' } 
   };
};
