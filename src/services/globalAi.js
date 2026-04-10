import { fetchAllSectorsData } from "./liveDataService";

/**
 * GLOBAL MISSION OVERSEER AI
 * Handles cross-sector queries and high-level grid synchronization requests.
 */
export const chatWithGlobalAi = async (prompt) => {
  const text = prompt.toLowerCase();
  
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
};
