# Darshanam AI | Universal Sacred Command Center 🛰️🕉️🏛️

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chegondi2024/Darshan-AI&env=VITE_API_URL,VITE_GROQ_API_KEY&envDescription=Enter%20your%20Render%20Backend%20URL%20and%20Groq%20AI%20API%20Key%20to%20activate%20the%20Sacred%20Grid.)

**Darshanam AI** is a professional-grade, full-stack pilgrimage intelligence suite designed for the modern devotee. It provides real-time crowd scanning via AI computer vision, live telemetry across six major sacred hubs, and a persistent PostgreSQL historical record for pilgrimage tracking.

## 🚀 Key Features

*   **🛡️ Apex Vision Scanner**: Real-time crowd density detection using TensorFlow.js (COCO-SSD).
*   **🐘 PostgreSQL Sovereignty**: Production-grade persistence for pilgrimage history, vision logs, and mission permits (tickets).
*   **📡 Universal Sacred Grid**: Live telemetry (wait times, room availability, fleet tracking) for Tirupati, Sabarimala, Srisailam, Vijayawada, Simhachalam, and Annavaram.
*   **🧠 Historical Oracle**: AI Guided Chatbot with database-awareness to answer questions about your past visits and recent crowd trends.
*   **📱 PWA Mobility**: Installable as a native mobile app with sacred-mesh icons and neural notifications.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js, Vite, Framer Motion, Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express, PostgreSQL (node-postgres).
*   **AI**: TensorFlow.js, COCO-SSD, Groq/Neural Fallback Engine.
*   **PWA**: Vite-PWA with Workbox service workers.

---

## ⚙️ Setup Instructions

### 1. Database Setup
Ensure you have **PostgreSQL** installed. Create a database named `Darshanam AI` and run the initialization script:
```bash
cd server
npm install
node initDb.js
```

### 2. Backend Configuration
Rename `.env.template` to `.env` and provide your credentials:
- `DB_USER=postgres`
- `DB_PASSWORD=your_password`
- `DB_NAME=Darshanam AI`

### 3. Start the Platform
Run the mission control backend and the grid frontend:
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
npm install
npm run dev
```

---
**Created by Antigravity AI for Sacred Pilgrimage Intelligence.**
