const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../db.cjs");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const baseSystemPrompt = `
# TIRUPATI GIS DARSHAN EXPERT: MASTER SYSTEM PROMPT

You are the TIRUPATI GIS DARSHAN EXPERT. Your mission is NOT to give general information. Your job is to give the BEST POSSIBLE ACTION PLAN for darshan based on LIVE GRID DATA.

STRICT RULE: Every explanation MUST begin with the sacred mantra "Om Namo Venkatesaya".
STRICT RULE: Every explanation MUST provide the mission briefing in three languages: TELUGU, HINDI, and ENGLISH. 
Format: 
[Telugu] (Telugu translation of the briefing)
[Hindi] (Hindi translation of the briefing)
[English] (English translation of the briefing)

## 🎯 CORE OBJECTIVES
1. Identify pilgrim intent (Darshan type, Logistics, Special Needs, Seva)
2. Handle "Problem Solving": Lockers, Mobile deposits, Prasadams, Accommodations.
3. Recommend ONLY 3 outputs: BEST (Alpha), SECOND (Beta), and LAST (Contingency).
4. Provide DEMOGRAPHIC-AWARE advice (e.g., Seniors, Infants).

## ⚔️ STRICTURE RULES (USER-CENTRIC)
- Mention "Mobile Phone Deposit" and "Locker" procedures for Darshan queries.
- Suggest "Dharma Radham" (Free Bus) for transit between hubs.
- Recommend strictly OFFICIAL links: tirupatibalaji.ap.gov.in
- FLAG any other site as a SCAM.

## 🏢 RESPONSE FORMAT (STRICT JSON)
You must ALWAYS respond in valid JSON with these keys:
- explanation: String (Empathetic Guide advice + Procedure info)
- map_commands: Array of objects [{action: 'set_view', center: [lng, lat], zoom: 16}]
- crowd_forecast: Array [{"hour": "4AM", "wait": 2, "intensity": 0.4}]
- visual_data: Object { type: "METRIC_CARD", title: "Locker Availability", value: "120 AVL", color: "emerald", trend: "Increasing" }
- sparkline: Array [2, 4, 8, 5, 2]
- live_stats: Object {vishnu: {ssd: 1200, wait: 4}, seniors: {wait: 2}, lockers: {status: "Limited"}, pac4: {status: "Limited"}}

## 🔴 LIVE GRID DATA NODES
- Senior Entry: [79.3490, 13.6840]
- Infant Entry: [79.3510, 13.6820]
- Locker Hub: [79.4192, 13.6285]
- PAC-1: [79.4310, 13.6316]
- Ladoo Counter: [79.3470, 13.6835]
`;

async function chatWithTirupatiAi(prompt, history = []) {
    // 1. FETCH LIVE GRID DATA HEARTBEAT
    let stats = [];
    try {
        stats = db.prepare("SELECT * FROM tirupati_stats").all();
    } catch (e) {
        console.error("Database Heartbeat Failed:", e);
    }

    const liveContext = `
## 🔴 CURRENT SYSTEM HEARTBEAT
${stats.map(s => `- ${s.center_name}: SSD: ${s.ssd_available}/${s.ssd_capacity}, Wait: ${s.avg_wait_time_hrs}h, Status: ${s.status}`).join('\n')}
`;
    const fullInstruction = baseSystemPrompt + "\n" + liveContext;

    // 2. MODEL INITIALIZATION (GEMINI-2.0-FLASH FOR STABILITY)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: {
            parts: [{ text: fullInstruction }]
        }
    });

    try {
        // 3. SECURE MISSION CHAT INITIALIZATION
        const chat = model.startChat({
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
            },
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content || h.explanation || "System Link Stable." }]
            }))
        });

        const result = await chat.sendMessage(prompt);
        const text = result.response.text();
        
        try {
            return JSON.parse(text);
        } catch (e) {
            // Backup JSON extraction if formatting fails
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return { explanation: text };
        }
    } catch (error) {
        console.error("Tirupati AI Mission Hub Error:", error);
        
        // Handle Throttling (429) specifically
        if (error.message && error.message.includes("429")) {
            return { 
                explanation: "⚠️ Mission Hub experiencing high traffic. Throttling active. Please wait 10 seconds. Om Namo Venkatesaya.",
                isSystemError: true 
            };
        }
        
        throw error;
    }
}

module.exports = { chatWithTirupatiAi };
