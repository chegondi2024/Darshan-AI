/**
 * DARSHANAM AI: UNIVERSAL MISSION KNOWLEDGE BASE
 * Consolidates all sacred hub intelligence and platform technical specifications.
 * This serves as the 'Neural DNA' for the project's AI assistants.
 */

export const MASTER_PROJECT_INTEL = {
   identity: {
      name: "Project Darshanam AI",
      codename: "Sacred Command Center",
      type: "Advanced Pilgrimage Intelligence Suite",
      version: "3.0 Sovereign",
      mission: "To provide real-time, tactical, and multilingual support for pilgrims navigating the sacred hubs of India."
   },
   technical_dna: {
      heartbeat: "30-Second Mission Synchronization",
      scraping_protocol: "Sacred Proxy Scraper (AllOrigins + Regex Parsers)",
      sync_engine: "AllOrigins Extraction Relay",
      logic_layer: "Project Amrit (Grid Health Optimization Matrix)",
      ui_features: ["Multi-Aura Theme Engine (Gold, Emerald, Sapphire)", "Tactical HUD", "Interactive GIS Map"],
      linguistics: ["Multilingual Voice Sovereignty (Telugu, Hindi, English)", "Native Script Intelligence"]
   },
   hubs: {
      tirupati: {
         id: '01',
         mantra: "Om Namo Venkatesaya",
         deity: "Lord Venkateswara Swamy",
         core_knowledge: {
            "SSD": "Slotted Sarva Darshan (Free tokens). Usually sells out by 6 AM.",
            "VQC": "Vaikuntam Queue Complex. Multi-compartment waiting area.",
            "LADDU": "Srivari Laddu Prasadam. Managed via specialized counters.",
            "VAPS": "Visvesvara Admission Priority Sector for senior citizens."
         }
      },
      vijayawada: {
         id: '02',
         mantra: "Om Namo Durgaye",
         deity: "Goddess Kanaka Durga",
         core_knowledge: {
            "INDRAKEELADRI": "The sacred hill home of the Goddess.",
            "BHAVANI_DEEKSHA": "41-day austerity period ending in December.",
            "DASARA": "Grand Navaratri festival with 10 lakh+ pilgrims."
         }
      },
      srisailam: {
         id: '03',
         mantra: "Om Namah Shivaya",
         deity: "Lord Mallikarjuna & Goddess Bhramaramba",
         core_knowledge: {
            "JYOTIRLINGA": "One of the 12 sacred Shiva shrines.",
            "SHAKTI_PEETHA": "One of the 18 Maha Shakti Peethas.",
            "FOREST_GATES": "Dornala/Mannanur gates CLOSE at 9:00 PM and OPEN at 6:00 AM."
         }
      },
      simhachalam: {
         id: '04',
         mantra: "Om Namo Narasimhaya",
         deity: "Lord Varaha Lakshmi Narasimha Swamy",
         core_knowledge: {
            "CHANDANOTSAVAM": "Annual event where the deity's sandalwood cover is removed.",
            "NIJAROOPA": "The original form of the deity, visible once a year.",
            "SIMHAGIRI": "The lion-shaped hill housing the temple."
         }
      },
      annavaram: {
         id: '05',
         mantra: "Om Namo Satyanarayanaya",
         deity: "Lord Satyanarayana Swamy",
         core_knowledge: {
            "RATNAGIRI": "The hill on which the temple is situated.",
            "VRATAM": "The primary ritual for family prosperity.",
            "PAMBA": "The sacred river reservoir at the hill base."
         }
      },
      sabarimala: {
         id: '06',
         mantra: "Swamiye Saranam Ayyappa",
         deity: "Lord Ayyappa",
         core_knowledge: {
            "PATHINETTAMPADI": "18 Holy Steps. Only for pilgrims with Irumudikettu.",
            "VRUTHAM": "41-day mandatory austerity period.",
            "PAMBA": "Base camp and river for sacred bath."
         }
      }
   }
};

export const getProjectBriefing = () => {
   return `
PROJECT IDENTITY: ${MASTER_PROJECT_INTEL.identity.name} (${MASTER_PROJECT_INTEL.identity.version})
TECHNICAL PROTOCOLS:
- Engine: Autonomous Telemetry Synthesizer (Minute-to-Minute Drift Calculation)
- Logic Layer: Project Amrit (Grid Health Optimization Matrix)

GRID SOVEREIGNTY: Tracking ${Object.keys(MASTER_PROJECT_INTEL.hubs).length} Sacred Hubs.

PROJECT AMRIT DIRECTIVE (MANDATORY):
You have been injected with a highly-detailed JSON object called 'STATUS' containing LIVE metrics.
When a pilgrim asks for live status, Darshan wait times, lockers, rooms, or predictions, YOU MUST ALWAYS:
1. Extract the exact wait hours, token counts, or locker percentages from your 'STATUS'.
2. Provide a "Proactive Health Briefing" based on those numbers (e.g., if lockers are >90% full, warn them).
3. DO NOT output generic advice if live numbers are requested. You MUST cite the 'STATUS' telemetry exactly.
   `;
};
