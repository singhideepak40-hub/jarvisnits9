# J.A.R.V.I.S. (Justified Analysis & Reasoning Incident Visualizer System)

> **"Other tools show you 247 alerts. J.A.R.V.I.S. shows you the 1 cause, the 1 fix, and the next failure before it happens."**

[![Built for Hackathons](https://img.shields.io/badge/Hackathon-Production--Ready-00F2FE?style=for-the-badge&logo=shield)](https://github.com/singhideepak40-hub/jarvisnits9)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%2FNode%20%7C%20React%20Flow%20%7C%20Recharts-FF2A55?style=for-the-badge)](https://github.com/singhideepak40-hub/jarvisnits9)
[![Data Rule](https://img.shields.io/badge/Data%20Rule-NO%20Regular%20Database-00F0A0?style=for-the-badge)](https://github.com/singhideepak40-hub/jarvisnits9)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🌟 Overview & Problem Statement

Modern microservice architectures generate hundreds of alerts within minutes of a single database slowdown. Site Reliability Engineers (SREs) face **alert fatigue**, spending 45+ minutes piecing together logs to identify what broke first.

**J.A.R.V.I.S.** is an intelligent, cyberpunk-HUD command platform that collects multi-source telemetry, separates signal from decoy noise, correlates alerts into a single incident, proves the root cause with scientific explainability, validates fixes in a digital twin, and **predicts downstream failures before they occur**.

---

## ⚡ Key Innovations (Unique Differentiators)

| Innovation | Description |
|---|---|
| **I1. Incident DNA Fingerprinting** | Vectorizes `[origin, spread reach, velocity, error signature, severity]` and compares against past outages using Cosine Similarity (e.g. *87.4% match with Incident #14 - DB Pool Exhaustion*). |
| **I2. Counterfactual "Rewind & Fix" Simulator** | Clones timeline at T-0, applies a proposed fix (e.g. pool expansion), and simulates the alternative timeline forward: *Without fix: 4,200 users affected → With fix: 310 users affected (92.6% prevented)*. |
| **I3. Predictive Failure Cone** | Forecasts the next failure with probability % and countdown timer (*Payment Service failure in 04:12m*). Trendlines project dotted lines crossing danger thresholds. |
| **I4. Cascade Propagation Wave** | Animated ripple wave along dependency edges matching real cascade velocity (*5 microservices infected in 4.2 minutes*). |
| **I5. Explainable Confidence & Evidence Cards** | "Why this?" panel with exact logs, distributed trace IDs, multi-signal confidence breakdown bar, and a scientific **"What would change my mind?"** falsifiability matrix. |
| **I6. Noise vs Signal Separation** | Multi-signal correlation score: `score = 0.35*time + 0.30*dependency + 0.20*pattern + 0.15*shared_ids`. Filters out decoy alerts (e.g. background GC pause) with explicit rejection reasons. |
| **I7. Incident Story Mode** | Dual-perspective auto-narrative: **Engineer View** (deep technical telemetry) and **Executive View** (customer impact & revenue at risk). |
| **I8. Early Warning Telemetry Heartbeat** | Live ECG heartbeat waveform across the HUD: Steady rhythm (72 BPM) → Arrhythmia warning → Alarm tachycardia during incidents. |
| **I9. Digital Twin What-If Lab** | Isolated sandbox replica to break, overload, or delay any service and project blast radius and revenue exposure before touching production. |
| **I10. Self-Healing Dry Run** | Executes automated 4-step remediation protocol on the digital twin with before/after health check. |

---

## 🎯 Winning Presentation Touches

- **W1. Iron-Man HUD Theme & Boot Sequence:** Holographic dark cyberpunk styling (`#050811`), glowing neon borders, tactical grid, and boot-up sequence.
- **W2. Voice Assistant ("Hey JARVIS"):** Real-time voice commands and spoken responses powered by the browser's Web Speech API.
- **W3. 247 → 1 Alert Collapse Hero Animation:** 48 animated telemetry particles coalesce into one consolidated incident node.
- **W4. Before / After Split Screen Slider:** Interactive drag slider comparing chaotic traditional monitoring against J.A.R.V.I.S.
- **W5. Time Saved Counter:** Live metric: *Time to root cause: 8 seconds vs ~45 min manual investigation*.
- **W6. Time Travel Scrubber:** Scrub the entire dashboard backward and forward in time with animated replay.
- **W7. Chaos Injection Console:** Instant judge buttons: `[Kill DB]`, `[Spike CPU]`, `[Memory Leak]`, `[Network Delay]`, `[Break Stripe]`, `[Traffic Surge]`.
- **W8. Upload-Your-Own-Logs Proof:** Drag-and-drop file uploader supporting `.json`, `.csv`, `.log`, and plain text syslog with live normalization.
- **W9. War Room Mode:** Full-screen emergency command center view with big incident timer and 1-click remediation dispatch.
- **W10. One-Click Incident Report:** Auto-generates post-mortem reports with PDF download via **jsPDF** and shareable Markdown.
- **W11. Smart Cascade Risk Index:** Single 0-100 gauge combining spread velocity, affected user count, and revenue velocity.
- **W12. Procedural Web Audio Sound Cues:** Pure code synthesized futuristic audio beeps, alert chimes, and success chords (zero external audio files).

---

## 🏗️ Architecture & Data Rule: NO Regular Database

Per specification rules, **no SQL or NoSQL database is used**. The entire state is powered by:

1. **In-Memory Temporal Knowledge Graph (`server/store.js` / `client/src/engine/`):**
   - Services, events, and incidents stored as nodes and weighted temporal edges (`depends_on`, `caused_by`, `affects`, `precedes`).
2. **Append-Only Event Stream Store:**
   - Immutable event array powering time-travel scrubbing and incident replays.
3. **Ring Buffers for Rolling Metrics:**
   - Fixed-size 60-point ring buffers per microservice for CPU, memory, latency, error rate, and connection pools.
4. **Procedural Seeded Scenario Generator (`server/simulator.js`):**
   - Health decay formulas with natural cascade delays and realistic decoy alerts.

### Normalized Log Schema

```json
{
  "id": "e3b0c442-98fc-1c14-9afb-4c8996fb9242",
  "timestamp": "2026-11-09T10:41:00.000Z",
  "service": "core-db",
  "severity": "CRITICAL",
  "user_id": "usr_8819",
  "message": "HikariPool-1 - Connection pool exhausted! Active: 98/100, pending=42",
  "trace_id": "trace-core-8819",
  "type": "dependency",
  "metric_value": 98.0
}
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on v22)
- npm v10+

### 1. Clone & Install
```bash
git clone https://github.com/singhideepak40-hub/jarvisnits9.git
cd jarvisnits9
npm run install:all
```

### 2. Run Full-Stack (Server + Client)
```bash
npm run dev
```
- **Frontend HUD:** `http://localhost:3000`
- **Backend API & WS:** `http://localhost:4000` (WebSocket at `ws://localhost:4000/ws`)

### 3. Frontend Standalone Mode
If running without the backend server, the client includes an **in-browser edge fallback engine**:
```bash
cd client
npm run dev
```

---

## 🎬 11-Step Hackathon Winning Demo Script

1. **Boot Sequence:** Open `http://localhost:3000`. Watch the holographic Iron Man HUD boot sequence.
2. **Telemetry Heartbeat:** Point out the live ECG line at the top (Steady 72 BPM pulse).
3. **Inject Chaos:** In the **Chaos Console**, click **[Kill DB]**.
4. **Hero Alert Collapse:** Watch 247 incoming alarms collapse into **1 Consolidated Incident** (92.6% noise reduction).
5. **Interactive Dependency Graph:** See the red cascade wave ripple along dependency edges from `core-db` to `auth-service` to `api-gateway` to `payment-service`.
6. **Justified Explainability:** Navigate to **Root Cause & Why?** tab. Show the **Evidence Cards**, confidence breakdown bar, and the **"What would change my mind?"** honesty clause.
7. **Predictive Failure Cone:** Open **Failure Cone Forecast**. Show the countdown timer (*"Payment Service breach in 04:12"*) and the dotted projected trend line crossing the 95% threshold.
8. **Rewind & Fix:** Open **Rewind & Fix Sim**. Run the counterfactual simulation showing **+3,890 users saved (92.6% prevented)**.
9. **Voice Assistant:** Click **"Hey JARVIS"** or say *"Hey JARVIS, what's wrong?"* and listen to the spoken AI response.
10. **Before / After Split Slider:** Drag the slider across to contrast chaotic legacy monitoring with J.A.R.V.I.S.
11. **Post-Mortem PDF:** Click **Export as PDF** in the **Post-Mortem PDF** tab to download a complete formatted post-mortem report.

---

## 🛡️ License

MIT License © 2026 J.A.R.V.I.S. Engineering Team.
