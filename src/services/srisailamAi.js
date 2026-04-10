import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow } from "./predictionService";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
  { id: 'temple', name: 'Mallikarjuna Temple (Jyotirlinga)', coords: [16.0740, 78.8680], type: 'core' },
  { id: 'pathala_ganga', name: 'Pathala Ganga (Ropeway)', coords: [16.0820, 78.8750], type: 'waypoint' },
  { id: 'sakshi_ganapathi', name: 'Sakshi Ganapathi', coords: [16.0645, 78.8610], type: 'waypoint' },
  { id: 'phaladhara', name: 'Phaladhara Panchadhara', coords: [16.0620, 78.8550], type: 'waypoint' },
  { id: 'dornala_gate', name: 'Dornala Forest Toll Gate', coords: [15.9320, 79.1150], type: 'logistics' },
  { id: 'mannanur_gate', name: 'Mannanur Forest Toll Gate', coords: [16.3200, 78.7800], type: 'logistics' },
  { id: 'priority_counter', name: 'Priority Darshan Counter', coords: [16.0745, 78.8682], type: 'health' },
  { id: 'medical_center', name: 'Srisailam Devasthanam Hospital', coords: [16.0730, 78.8670], type: 'health' }
];

const SACRED_KNOWLEDGE = {
  darshan: {
    free: 'Dharma Darshanam. General queue. Wait time: 3-8 hours.',
    seeghra: 'Rs. 150 ticket. Faster access. Wait time: 1-3 hours.',
    athiseeghra: 'Rs. 300 ticket. Minimal wait. High priority entry.',
    sparsha: 'Rs. 500 ticket. Allows physical contact (Sparsha) with the Jyotirlinga (Traditional dress mandatory).'
  },
  dual_significance: {
    'JYOTIRLINGA': 'One of the 12 sacred Jyotirlingas of Lord Shiva (Mallikarjuna Swamy).',
    'SHAKTI_PEETHA': 'One of the 18 Maha Shakti Peethas (Bhramaramba Devi). This is where the Goddess\'s upper lip fell.',
    'PROTOCOL': 'Devotees typically visit Lord Mallikarjuna first, followed by Goddess Bhramaramba.'
  },
  pathala_ganga_intel: {
    'ROPEWAY': 'Starts from Haritha Hotel. Efficient for avoiding the 500+ step descent. 6 AM to 6 PM. Ticket: Rs. 60.',
    'SACRED_DIP': 'Taking a dip in the Krishna River backwaters (Pathala Ganga) is said to wash away all sins.',
    'FERRY_SERVICE': 'Boats available from Pathala Ganga to Akka Mahadevi Caves (Requires permission).'
  },
  sevas: {
    rudrabhishekam: 'Most popular seva. Abhishekam performed to the main deity. Timings: 6 AM to 3 PM.',
    laksha_kumkumarchana: 'Grand kumkuma ritual for Goddess Bhramaramba.',
    chandi_homam: 'Sacred fire ritual for protection and power. Done in the temple premises.'
  },
  logistics: {
    ropeway: 'Pathala Ganga Ropeway starts from Haritha Hotel. Operating: 6 AM to 6 PM. Ticket: Rs. 60.',
    steps: '500+ steps lead to the Krishna River (Pathala Ganga). Recommended for the fit.',
    forest_gates: 'CRITICAL: Dornala and Mannanur gates CLOSE at 9:00 PM and OPEN at 6:00 AM. Wildlife sanctuary rules apply.',
    anna_prasadam: 'Free meals provided near the main temple (11 AM to 10 PM).'
  },
  priority_protocol: {
    eligible: 'Senior Citizens (65+) and Differently Abled.',
    checkpoint: 'Report to North Gate priority counter. Documents: Aadhar Card mandatory.'
  },
  // ⚠️ FOREST REALITY — TACTICAL BRIEFING
  brutal_reality: {
    darshan_experience: [
      'Sparsha Reality: Physical contact with the Lingam is rare during heavy crowds. Guard pressure is high.',
      'Sparsha Cost: Rs. 500 ticket only buys a few seconds of contact. Physical balance is hard to maintain.',
      'Holiday Crush: Shivaratri and Mondays see 12+ hour waits. The temple area becomes extremely cramped.'
    ],
    forest_hazards: [
      'Gate Lock-in: If you miss the 9:00 PM gate closure, you MUST sleep in your vehicle in the forest zone. No exceptions.',
      'Wildlife Sovereignty: Leopards and bears are active in Srisailam forest. Do NOT step out of your vehicle on Ghat roads.'
    ]
  }
};

export const chatWithSrisailamAi = async (prompt, status) => {
  const text = prompt.toLowerCase();
  
    try {
      const systemPrompt = `You are the Srisailam AI Mission Guide. CRITICAL RULE: EVERY response/explanation MUST start with "Om Namah Shivaya". NEVER skip this.
      Provide tactical, forest-aware, mission-ready advice. Use phrases like "Mission Ready", "Forest AI", "Om Namah Shivaya". Always return JSON.
      
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

      if (text.includes('pathala ganga') || text.includes('ropeway')) {
         if (response.map_commands.length === 0) {
            response.map_commands.push({ action: 'set_view', center: [16.0820, 78.8750], zoom: 17 });
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
   
   if (text.includes('sos') || text.includes('emergency') || text.includes('help') || text.includes('report') || text.includes('lost') || text.includes('medical')) {
      let category = 'FOREST_ALERT';
      let urgency = 'P3';
      let advice = "Om Namah Shivaya. Emergency Signal Received. Contact Srisailam Devasthanam staff IMMEDIATELY.";

      if (text.includes('lost') || text.includes('child')) {
         category = 'LOST_PERSON'; urgency = 'P1';
         advice = "CRITICAL: Reporting Lost Person. Head to the Main Help Desk at the North Gate entrance.";
      } else if (text.includes('medical') || text.includes('chest') || text.includes('breath') || text.includes('snake')) {
         category = 'MEDICAL'; urgency = 'P1_CRITICAL';
         advice = "CRITICAL: Medical Emergency. Contact 108 or Srisailam Hospital: 08524-287018.";
      }
      
      return { 
         explanation: `🚨 FOREST EMERGENCY PROTOCOL: ${category} (${urgency}). ${advice}`, 
         visual_data: { type: 'EMERGENCY_SOS', decision: 'CAUTION', report: { category, urgency } },
         map_commands: [{ action: 'set_view', center: [16.0730, 78.8670], zoom: 18 }]
      };
   }

   if (text.includes('gate') || text.includes('road') || text.includes('close')) {
      const hour = new Date().getHours();
      const isClosed = hour >= 21 || hour < 6;
      return { 
         explanation: `FOREST AI ALERT. Forest Gates (Dornala/Mannanur) are ${isClosed ? 'CLOSED' : 'OPEN'}. Road movement forbidden between 9 PM and 6 AM for wildlife sovereignty.`, 
         visual_data: { type: 'ALERT', decision: isClosed ? 'STOP' : 'GO' } 
      };
   }

   if (text.includes('sparsha') || text.includes('touch')) {
      return { explanation: `Tactical Briefing: ${sk.darshan.sparsha}. Note: Traditional dress (Dhoti/Saree) is mandatory for Jyotirlinga Sparsha.`, visual_data: { type: 'INFO', decision: 'GO' } };
   }

   if (text.includes('ropeway') || text.includes('pathala ganga')) {
      const isRouting = text.includes('how to reach') || text.includes('how do i go') || text.includes('route') || text.includes('navigate') || text.includes('directions');
      return { 
         explanation: isRouting 
            ? `Om Namah Shivaya. Deploying tactical route path to Pathala Ganga. Estimated travel time being calculated by the Sacred Route Engine. Preparing mission navigation...`
            : `Navigating to Pathala Ganga. ${sk.logistics.ropeway}. Access to Krishna River via steps or ropeway is active.`,
         map_commands: isRouting ? [
            { action: "draw_route", points: [[16.5153, 80.6050], [16.0820, 78.8750]], zoom: 10 } // Route from Vijayawada to Pathala Ganga for demo
         ] : [
            { action: "set_view", center: [16.0820, 78.8750], zoom: 17 }
         ],
         visual_data: { type: 'NAVIGATION', decision: 'GO' } 
      };
   }

   if (text.includes('best time') || text.includes('when to visit') || text.includes('predict') || text.includes('tomorrow') || text.includes('crowd') || text.includes('waiting')) {
      const window = getOptimalVisitWindow('srisailam');
      return {
         explanation: `Om Namah Shivaya. FOREST AI PREDICTION: The optimal window for Darshan at Srisailam is ${window.startTime} to ${window.endTime}. AI Analysis shows a potential ${window.savingPercent}% reduction in wait times. Status: ${window.status}. Join the queue early!`,
         visual_data: { type: 'PREDICTION_HUB', decision: window.intensity < 0.4 ? 'GO' : 'CAUTION', window }
      };
   }

   return { 
      explanation: `Om Namah Shivaya. Srisailam Sector 03 Active. I am your Forest Mission Commander. Ask me about Darshan, Sevas, or Pathala Ganga logistics.`, 
      visual_data: { type: 'GREETING', decision: 'GO' } 
   };
};
