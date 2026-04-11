import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Mallikarjuna Temple (Jyotirlinga)', coords: [16.0740, 78.8680], type: 'core' },
  { id: 'pathala_ganga', name: 'Pathala Ganga (Ropeway)', coords: [16.0820, 78.8750], type: 'waypoint' },
  { id: 'sakshi_ganapathi', name: 'Sakshi Ganapathi', coords: [16.0645, 78.8610], type: 'waypoint' },
  { id: 'phaladhara', name: 'Phaladhara Panchadhara', coords: [16.0620, 78.8550], type: 'waypoint' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    free: 'Dharma Darshanam. General queue. [Wait: Synchronized via Live Telemetry].',
    seeghra: 'Rs. 150 ticket. Faster access. [Wait: Synchronized via Live Telemetry].',
    athiseeghra: 'Rs. 300 ticket. Minimal wait. High priority entry.',
    sparsha: 'Rs. 500 ticket. Allows physical contact (Sparsha) with the Jyotirlinga (Traditional dress mandatory).'
  },
  dual_significance: {
    'JYOTIRLINGA': 'One of the 12 sacred Jyotirlingas of Lord Shiva (Mallikarjuna Swamy).',
    'SHAKTI_PEETHA': 'One of the 18 Maha Shakti Peethas (Bhramaramba Devi).',
    'PROTOCOL': 'Devotees typically visit Lord Mallikarjuna first, followed by Goddess Bhramaramba.'
  },
  pathala_ganga_intel: {
    'ROPEWAY': 'Starts from Haritha Hotel. Efficient for avoiding the 500+ step descent. 6 AM to 6 PM.',
    'SACRED_DIP': 'Taking a dip in the Krishna River backwaters (Pathala Ganga) is said to wash away all sins.'
  },
  logistics: {
    forest_gates: 'CRITICAL: Dornala and Mannanur gates CLOSE at 9:00 PM and OPEN at 6:00 AM. Wildlife sanctuary rules apply.',
    anna_prasadam: 'Free meals provided near the main temple (11 AM to 10 PM).'
  }
};

/**
 * SRISAILAM SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles sacred Jyotirlinga logistics and Bhramaramba Shakti Peetha intelligence.
 */
export const chatWithSrisailamAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  
  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Srisailam Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Om Namah Shivaya".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical, forest-aware intelligence for the Bhramaramba Mallikarjuna mission.
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

    // Post-processing for specific Srisailam commands
    if (text.includes('pathala ganga') || text.includes('ropeway')) {
       if (response.map_commands && response.map_commands.length === 0) {
          response.map_commands.push({ action: 'set_view', center: [16.0820, 78.8750], zoom: 17 });
       }
    }

    return response;
  } catch (e) {
    console.error("Srisailam Sector Disrupted:", e);
    return generateFallback(text, status);
  }
};

const generateFallback = (text, status) => {
   // Minimal offline recovery logic
   return { 
      explanation: `Om Namah Shivaya. Srisailam Sector 03 Link unstable. I am your Forest Mission Commander. Please refer to the tactical HUD for live Forest Gate status.`, 
      visual_data: { type: 'GREETING', decision: 'GO' } 
   };
};
