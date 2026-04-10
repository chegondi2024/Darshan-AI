import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Satyanarayana Swamy Temple (Ratnagiri Hilltop)', coords: [17.281, 82.396], type: 'core' },
  { id: 'vratam_hall', name: 'Mass Vratam Hall Complex', coords: [17.2815, 82.3965], type: 'health' },
  { id: 'pampa_reservoir', name: 'Pampa Reservoir & Boating', coords: [17.275, 82.390], type: 'waypoint' },
  { id: 'rly_station', name: 'Annavaram Railway Junction', coords: [17.268, 82.398], type: 'transit' },
  { id: 'downhill_gate', name: 'Ratnagiri Entrance Gate', coords: [17.270, 82.395], type: 'transit' }
];

const SACRED_KNOWLEDGE = {
  vratam: {
    description: 'Sri Satyanarayana Swamy Vratam. The core pilgrimage ritual for family prosperity.',
    timings: 'Daily 6:00 AM to 5:00 PM. Batch start times: 6:00, 7:30, 9:00, 10:30, 12:00, 1:30, 3:00, 4:30.',
    cost: 'Special (Rs. 1500), Regular (Rs. 500), Special Premium (Rs. 2000).',
    materials: 'Devasthanam provides generic setup. Pilgrims must purchase "Vratham Set" (Flowers, beetle leaves, fruits) from local vendors before entering the hall.'
  },
  darshan: {
    free: 'Sarva Darshan. Hilltop entry. Wait: 1-3 hours. Queue enters from the rear of the main temple.',
    special: 'Antaralaya Darshan (Rs. 100-200). Allows entry into the inner sanctum for a brief moment.'
  },
  logistics: {
    ghat_road: 'Ratnagiri Hill road (3km). Open 5 AM - 10 PM. Toll: Rs. 100 per car. Parking at hilltop is extremely limited.',
    steps: 'Traditional stone stairway (460 steps). Reaches the main temple directly from the Pampa river bank.',
    pampa_ritual: 'Holy dip in Pampa River before climbing the hill is traditional. Boating available at the reservoir base.',
    accommodation: 'Hilltop cottages (Ratnadeepa, Satyadeva) bookable via official ap.gov.in portal.'
  },
  rituals: {
    swamy_abhishekam: '4:00 AM - 5:15 AM. Ticket: Rs. 500. Only few pilgrims per day.',
    nitya_kalyanam: 'Daily celestial wedding at 10 AM. Ticket: Rs. 1000.'
  },
  priority_protocol: {
    eligible: 'Senior Citizens (65+) and Differently Abled.',
    access: 'Direct entry via the Special Gate near the Administrative Office. Document: Aadhar Card.'
  },
  // ⚠️ RATNAGIRI REALITY — SACRED TRUTHS
  brutal_reality: {
    vratam_struggles: [
      'Batch Overflow: Even with a ticket, you may wait 2-4 hours for your Vratam batch to actually start.',
      'Black Market: During auspicious days (Muhurthams), unofficial agents hoard Vratam tickets and sell at 3x price.',
      'Mass Hall Chaos: Mass Vratam halls are extremely loud and crowded. Limited personal space for the ritual.'
    ],
    darshan_reality: [
      '2-Second Darshan: The main deity darshan is extremely lightning-fast. You are pushed out almost as soon as you enter.',
      'Hilltop Overload: Parking on the hill is nearly impossible during wedding seasons. Your vehicle might be stuck in a 2-hour traffic lock downhill.'
    ]
  }
};

export const chatWithAnnavaramAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  
    try {
      const systemPrompt = `You are the Annavaram AI Mission Guide. CRITICAL RULE: EVERY response/explanation MUST start with "Om Namo Satyanarayanaya". NEVER skip this.
      Provide tactical, truth-aware advice. Use phrases like "Mission Ready", "Ratnagiri AI Hub", "Om Namo Satyanarayanaya". Start every response with "Om Namo Satyanarayanaya". focus on Vratam batch logistics and hilltop transit flow. Always return JSON.
      
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

      if (text.includes('vratam') || text.includes('pooja')) {
         if (response.map_commands.length === 0) {
            response.map_commands.push({ action: 'set_view', center: [17.2815, 82.3965], zoom: 17 });
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
   
   if (text.includes('sos') || text.includes('emergency') || text.includes('help') || text.includes('report') || text.includes('lost') || text.includes('medical') || text.includes('vratam issue')) {
      let category = 'RATNAGIRI_ALERT';
      let urgency = 'P3';
      let advice = "Om Namo Satyanarayanaya. Alert Received. Inform the nearest Devasthanam staff or Vratam Purohit.";

      if (text.includes('lost') || text.includes('child')) {
         category = 'LOST_PERSON'; urgency = 'P1';
         advice = "CRITICAL: Reporting Lost Person. Head to the Temple Information Center near the Vratam Hall entry.";
      } else if (text.includes('medical') || text.includes('chest') || text.includes('breath')) {
         category = 'MEDICAL'; urgency = 'P1_CRITICAL';
         advice = "CRITICAL: Medical Alert. Contact 108 or Hilltop Medical Center near the Cottage area.";
      }
      
      return { 
         explanation: `🚨 SATYANARAYANA EMERGENCY PROTOCOL: ${category} (${urgency}). ${advice}`, 
         visual_data: { type: 'EMERGENCY_SOS', decision: 'CAUTION', report: { category, urgency } },
         map_commands: [{ action: 'set_view', center: [17.281, 82.396], zoom: 18 }]
      };
   }

   if (text.includes('vratam') || text.includes('batch') || text.includes('pooja')) {
      return { 
         explanation: `Tactical Briefing: ${sk.vratam.description} Batches start every 30-45 mins. ${sk.vratam.cost}. Purity maintained.`, 
         visual_data: { type: 'VRATAM_ALERT', decision: 'GO' } 
      };
   }

   if (text.includes('hill') || text.includes('steps') || text.includes('reach')) {
      return { explanation: `Logistics Intel: Ratnagiri Hill access is active. ${sk.logistics.ghat_road} Total of ${sk.logistics.steps} available for pilgrims seeking penance.`, visual_data: { type: 'INFO', decision: 'GO' } };
   }

   if (text.includes('best time') || text.includes('when to visit') || text.includes('predict') || text.includes('tomorrow') || text.includes('crowd') || text.includes('waiting')) {
      const window = getOptimalVisitWindow('annavaram');
      return {
         explanation: `Om Namo Satyanarayanaya. RATNAGIRI AI PREDICTION: The optimal window for Darshan and Vratam at Annavaram is ${window.startTime} to ${window.endTime}. AI Analysis shows a potential ${window.savingPercent}% reduction in wait times. Status: ${window.status}. Join the queue early!`,
         visual_data: { type: 'PREDICTION_HUB', decision: window.intensity < 0.4 ? 'GO' : 'CAUTION', window }
      };
   }

   return { 
      explanation: `Om Namo Satyanarayanaya. Annavaram Sector 05 Active. I am your Ratnagiri Mission Commander. Ask me about Vratam batches, Hilltop logistics, or Pampa Reservoir telemetry.`, 
      visual_data: { type: 'GREETING', decision: 'GO' } 
   };
};
