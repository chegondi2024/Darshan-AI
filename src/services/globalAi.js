import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { fetchAllSectorsData } from "./liveDataService";
import { MASTER_PROJECT_INTEL, getProjectBriefing } from "./masterMissionIntel";

const hasValidKey = isGroqEnabled();

const GLOBAL_DARSHAN_KNOWLEDGE = {
   tirupati: {
      tickets: "SSD (Free Slot Token), SED (Rs.300 Online), DIVYA (Free for foot pilgrims), SARVA (Free walk-in, longest wait), VIP (Rs.1500+).",
      timings: "Suprabhata Seva (3AM), Thomala (3:30AM), Kalyanotsavam (10AM), Ekanta Seva (10:30PM)",
      rules: "Strict traditional dress code. Senior citizen priority darshan available at 10AM/3PM with medical proof. Free Laddus given for all."
   },
   vijayawada: {
      tickets: "Dharma Darshanam (Free), Special Ticket (Rs.100), VIP Ticket (Rs.300).",
      timings: "Suprabhata Seva (4AM), Laksha Kumkumarchana (10AM), Pallaki Seva (6PM).",
      rules: "Heavy crowds during Dasara/Navaratri and Bhavani Deeksha. Ghat road closed to private vehicles during peaks (use free TTD buses)."
   },
   srisailam: {
      tickets: "Dharma Darshanam (Free), Seeghra Darshan (Rs.150), Athiseeghra (Rs.300), VIP Break (Rs.500).",
      timings: "Mangala Arathi (4:30AM), Rudrabhishekam (6:30AM), Pallaki Seva (7PM).",
      rules: "Located deep in Nallamala Forest. Forest gates CLOSE strictly at 9:00 PM and OPEN at 6:00 AM. Plan travel accordingly."
   },
   simhachalam: {
      tickets: "Dharma Darshanam (Free), Special Ticket (Rs.100/300).",
      timings: "Thiruvaradhana (5AM), Raja Bhogam (11AM), Pavallimpu Seva (8PM).",
      rules: "Chandanotsavam in May is the only day the Lord is seen without Sandalwood paste. Massive crowds."
   },
   annavaram: {
      tickets: "Dharma Darshanam (Free), Antaralayam (Rs.100), VIP (Rs.300).",
      timings: "Pratahkala Pooja (6AM), Satyanarayana Vratam (Bacthes 8AM-12PM), Sayamkala Pooja (5PM).",
      rules: "Famous for Vratam pooja done by couples. Batches start every early morning. Mandatory traditional dress for the Vratam."
   },
   sabarimala: {
      tickets: "Virtual Queue (Online Booking Mandatory). Pamba trek required.",
      timings: "Palliyunarthal (3AM), Neyyabhishekam (4AM), Harivarasanam (11PM).",
      rules: "41-day Vratham austerity is mandatory. Irumudikettu is required to climb the 18 Holy Steps (Pathinettampadi)."
   }
};

/**
 * GLOBAL MISSION OVERSEER AI (v3.0)
 * Handles cross-sector queries and high-level grid synchronization requests.
 * Uses total 'Project DNA' to provide high-fidelity mission briefings.
 */
export const chatWithGlobalAi = async (prompt) => {
   const text = prompt.toLowerCase();

   if (!hasValidKey) {
      if (text.includes('show all') || text.includes('all temple') || text.includes('every temple') || text.includes('all darshan') || text.includes('global report')) {
         const data = await fetchAllSectorsData();
         return {
            explanation: `Om Namo Narayanaya. Universal Sacred Grid Report generated. I have synchronized data from all 6 sacred hubs. Stability check: ${data.overall_grid_readiness}% optimal.`,
            briefing: "Sacred Mission Report: All sectors are currently monitored and secure.",
            visual_data: {
               type: "GRID_REPORT",
               sectors: data.sectors,
               readiness: data.overall_grid_readiness
            }
         };
      }
      return {
         explanation: "Om Namo Narayanaya. Universal Grid Active. Please specify which sector (Tirupati, Vijayawada, etc.) you wish to inspect, or ask for a 'Global Status Report'.",
         visual_data: { type: "GREETING", decision: "GO" }
      };
   }

   try {
      const liveGrid = await fetchAllSectorsData();
      const projectBriefing = getProjectBriefing();

      const systemPrompt = `You are the Darshanam Global Mission Overseer (v3.0). 
      CRITICAL IDENTITY: You possess LIVE telemetry for the entire 6-hub sacred grid.
      MISSION DATA: Use the provided [PROJECT DNA] and [DARSHAN KNOWLEDGE] to answer questions comprehensively about any temple's operational rules, tickets, and exact darshan details.
      SACRED RULE: EVERY response MUST start with "Om Namo Narayanaya".
      YOUR ROLE: Synthesize high-level intelligence across Tirupati, Vijayawada, Srisailam, Simhachalam, Annavaram, and Sabarimala. Be highly detailed about Darshan processes if asked.`;

      const context = `
         PROJECT DNA: ${projectBriefing}
         GLOBAL DARSHAN KNOWLEDGE (Crucial Rules & Tickets): ${JSON.stringify(GLOBAL_DARSHAN_KNOWLEDGE)}
         LIVE GRID TELEMETRY: ${JSON.stringify(liveGrid)}
      `;

      return await callGroqAi({
         systemPrompt,
         userContext: context,
         userPrompt: prompt
      });

   } catch (e) {
      console.error("Global AI Mission Failure:", e);
      return {
         explanation: "Om Namo Narayanaya. Universal Link Disrupted. All 6 hubs (Tirupati, Vijayawada, Srisailam, Simhachalam, Annavaram, Sabarimala) are active in the Grid. Please select a specific sector hub for tactical navigation.",
         visual_data: { type: "RECOVERY_MODE", decision: "CAUTION" }
      };
   }
};
