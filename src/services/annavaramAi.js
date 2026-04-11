import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Satyanarayana Swamy Temple (Ratnagiri Hilltop)', coords: [17.281, 82.396], type: 'core' },
  { id: 'vratam_hall', name: 'Mass Vratam Hall Complex', coords: [17.2815, 82.3965], type: 'health' },
  { id: 'pampa_reservoir', name: 'Pampa Reservoir & Boating', coords: [17.275, 82.390], type: 'waypoint' }
];

const SACRED_KNOWLEDGE = {
  vratam: {
    description: 'Sri Satyanarayana Swamy Vratam. The core pilgrimage ritual for family prosperity.',
    timings: 'Daily 6:00 AM to 5:00 PM. Batches start every 30-45 mins. [Wait: Synchronized via Live Telemetry].',
    cost: 'Special (Rs. 1500), Regular (Rs. 500), Special Premium (Rs. 2000).',
    materials: 'Devasthanam provides generic setup.'
  },
  darshan: {
    free: 'Sarva Darshan. Hilltop entry. [Wait: Synchronized via Live Telemetry].',
    special: 'Antaralaya Darshan (Rs. 100-200). Allows entry into the inner sanctum.'
  },
  logistics: {
    ghat_road: 'Ratnagiri Hill road (3km). Open 5 AM - 10 PM. Toll: Rs. 100 per car.',
    steps: 'Traditional stone stairway (460 steps).',
    pampa_ritual: 'Holy dip in Pampa River before climbing the hill is traditional.'
  }
};

/**
 * ANNAVARAM SECTOR AI (v3.0 - SOVEREIGN GUIDE)
 * Synchronized with the Universal Mission Knowledge Base (Project DNA).
 * Handles Satyanarayana Swamy Vratam logistics and Ratnagiri hilltop flow.
 */
export const chatWithAnnavaramAi = async (prompt, status) => {
  const text = prompt.toLowerCase();

  try {
    const projectBriefing = getProjectBriefing();

    const systemPrompt = `You are the Annavaram Mission Guide (v3.0).
    SACRED MANDATE: EVERY response MUST start with "Om Namo Satyanarayanaya".
    MISSION DATA: You possess total awareness of the [PROJECT DNA] infrastructure (30s heartbeat, live scrapers, aura shifting).
    YOUR ROLE: Provide tactical intelligence for the Satyanarayana Swamy Vratam mission.
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

    if (text.includes('vratam') || text.includes('pooja')) {
      if (response.map_commands && response.map_commands.length === 0) {
        response.map_commands.push({ action: 'set_view', center: [17.2815, 82.3965], zoom: 17 });
      }
    }

    return response;
  } catch (e) {
    console.error("Annavaram Hub Disrupted:", e);
    return generateFallback(text, status);
  }
};

const generateFallback = (text, status) => {
  return {
    explanation: `Om Namo Satyanarayanaya. Annavaram Sector 05 Link unstable. I am your Ratnagiri Mission Commander. Please refer to the tactical HUD for Vratam batch telemetry.`,
    visual_data: { type: 'GREETING', decision: 'GO' }
  };
};
