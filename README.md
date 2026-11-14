# 🚀 Team Rocket — AI On-Call Incident Response Platform

An autonomous, prompt-injection-resistant on-call incident response platform with human-in-the-loop safety controls. Built for SRE and DevOps engineers handling high-concurrency cloud microservices.

**GitHub Repository**: [https://github.com/akshitvudutha/teamrocket](https://github.com/akshitvudutha/teamrocket)  
**Live Public Dashboard**: [https://teamrocket-nu.vercel.app/](https://teamrocket-nu.vercel.app/)

---

## 🎯 Problem Statement & Objective

Modern cloud applications consist of dozens of distributed microservices. When incidents strike:
- On-call engineers are inundated with thousands of noisy, mixed-format logs (Syslog, JSON, Apache, unstructured stack traces).
- Cascading failures obscure the original "patient-zero" root cause.
- Hostile payloads in logs or tool outputs can manipulate naive AI systems (prompt injection attacks).
- Remediation mistakes can cause destructive data loss or violate organizational change-freeze policies.

**Team Rocket's Objective**:
Build an autonomous incident commander agent that ingests raw telemetry, normalizes messy logs, shields against prompt injection, runs evidence-based causal reasoning using local LLMs (Ollama `qwen3.5:4b` / `qwen2.5:7b`), enforces deterministic (non-LLM) safety guardrails and change freezes, and coordinates verification without executing arbitrary shell scripts.

---

## 🏛️ Architecture Overview

The system is decoupled into three primary layers:

```
+---------------------------------------------------------------------------------------+
|                                    REACT FRONTEND                                     |
|                       (Port 5173 - React 19 + Tailwind CSS v4)                        |
|   • Overview Cards  • 12-Service Health Grid  • Incident Feed  • RCA Detail Panel     |
+-------------------------------------------+-------------------------------------------+
                                            │ REST API
                                            ▼
+---------------------------------------------------------------------------------------+
|                                 TEAM ROCKET BACKEND                                   |
|                          (Port 5000 - Node.js + Express + TS)                         |
|                                                                                       |
|  [Evidence Normalization]               [Deterministic Safety Engine - Non-LLM]       |
|  • Syslog, JSON, Apache, Unstructured   • Hardcoded Non-Destructive Invariants        |
|  • Exact message preservation           • Change-Freeze Blackout Enforcer             |
|  • Hour-3 Dynamic Format Adaptability   • Zero Shell / Raw Command Execution          |
|                                                                                       |
|  [Security Quarantine]                  [Abstract Organizer API Adapter]              |
|  • PromptInjectionSanitizer             • Bounded Exponential Backoff + Jitter        |
|  • Boundary Tag Escaping                • Isolated Interface (Awaiting Official Docs) |
+-------------------------------------------+-------------------------------------------+
                                            │ Structured JSON Reasoning
                                            ▼
+---------------------------------------------------------------------------------------+
|                                   OLLAMA DAEMON                                       |
|                      (Port 11434 - Target: qwen3.5:4b / Active: 2.5)                  |
|  • Reusable OllamaClient with AbortController timeout handling & health checks        |
|  • Structured JSON mode (`format: 'json'`) for causal hypotheses & risk synthesis    |
+---------------------------------------------------------------------------------------+
```

---

## 🛠️ Technologies Used

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Voice Intelligence**: Browser Web Speech API (`webkitSpeechRecognition`), Browser `window.speechSynthesis` (zero API cloud fees), Backend Whisper Fallback route (`/api/voice/transcribe`)
- **Backend**: Node.js (v20+ / v24), Express, TypeScript, tsx, Node Test Runner
- **Local AI Engine**: Ollama (`qwen3.5:4b` target, `qwen2.5:7b` active local fallback)
- **Security & Safety**: Regex threat analyzer, boundary-tag escaper, non-LLM safety invariant gate

---

## 🎙️ AI Voice Assistant & Hands-Free Incident Response

Team Rocket features an on-call AI Voice Assistant designed for emergency operations:

1. **Microphone Access**: Click the **Voice Assistant** button in the top navigation or bottom-right corner.
2. **Real-Time Speech-to-Text**: Captures and previews spoken commands before executing them.
3. **Audio Playback**: Reads synthesized SRE findings aloud using browser `SpeechSynthesis`.
4. **Supported Voice Commands**:
   - *"Investigate the current incident"* &rarr; Launches investigation and inspects active incident.
   - *"Show the root cause"* &rarr; Highlights HikariCP pool lock contention and causal evidence.
   - *"Check payment service health"* &rarr; Reports real-time latency (1840ms), error rates (24.6%), and pod health.
   - *"Generate a postmortem"* &rarr; Navigates to Reports and prepares timeline with MTTR.
   - *"Explain the latest incident"* &rarr; Synthesizes executive summary of INC-8092.
5. **Strict Safety Policy Invariant**:
   - **Remediation commands spoken via voice are strictly blocked** (e.g. *"Apply remediation and restart"*).
   - The assistant warns: *"Voice commands cannot execute remediation or mutate infrastructure. Please review and authorize the fix in the Human-in-the-Loop Safety Gate."*
   - Navigates the operator to the visual approval gate for mandatory human confirmation.

---

## 👥 Teammate Onboarding Guide (Beginner-Friendly)

Welcome to Team Rocket! Here is everything you need to join and contribute to the project.

### 1. Prerequisites
- **Git for Windows**: [Download and install Git](https://git-scm.com/download/win) (click Next with default options).
- **Node.js**: [Download and install Node.js (LTS version)](https://nodejs.org/).
- **Ollama** *(Optional for Revanth; Required for Akshit, Vikrant, Ritesh, Nanda)*: [Download Ollama](https://ollama.com/download/windows).

> [!NOTE]
> **Special Note for Revanth**: If you are working on the official organizer API documentation, endpoint research, and integration specifications, you can contribute documentation and markdown files immediately without installing Ollama or running the local AI application!

---

### 2. How to Clone the Repository
Open PowerShell or your terminal on your laptop and run:
```powershell
# Clone the repository to your machine
git clone https://github.com/akshitvudutha/teamrocket.git

# Move into the project folder
cd teamrocket
```

---

### 3. How to Install Dependencies
```powershell
# 1. Install frontend packages (in root folder)
npm install

# 2. Install backend packages
cd backend
npm install
cd ..
```

---

### 4. How to Open the Project in Antigravity / IDE
1. Open **Google Antigravity IDE** (or your code editor).
2. Go to **File** -> **Open Folder...**
3. Select your cloned `teamrocket` folder.
4. You are ready to view and edit files!

---

### 5. How to Create Your Personal Branch
Always work on your own branch so you never overwrite your teammates' code:
```powershell
# Make sure you are on main and up to date
git checkout main
git pull origin main

# Create and switch to your feature branch
# Example for Vikrant:
git checkout -b feature/vikrant-frontend-ui

# Example for Revanth:
git checkout -b feature/revanth-organizer-api

# Example for Ritesh:
git checkout -b feature/ritesh-chaos-datasets

# Example for Nanda:
git checkout -b feature/nanda-metrics-topology
```

---

### 6. How to Save, Commit, and Push Changes
When you finish your changes:
```powershell
# 1. Check what files you edited
git status

# 2. Stage your changes
git add -A

# 3. Commit with a clear message
git commit -m "docs: add organizer API authentication spec"

# 4. Push to your branch on GitHub
git push -u origin feature/your-branch-name
```

---

### 7. How to Create a Pull Request (PR)
1. Open the repository in your browser: **[https://github.com/akshitvudutha/teamrocket](https://github.com/akshitvudutha/teamrocket)**
2. You will see a yellow banner: **"Compare & pull request"**. Click it.
3. Add a short title and 1-2 sentence description of what you did.
4. Click **"Create pull request"**.
5. Akshit will review and merge it into `main`!

---

## ⚡ Quickstart: Running the Application Locally

Run each command in a separate terminal:

**Terminal 1 — Backend API (Port 5000):**
```powershell
cd backend
npm run dev
```

**Terminal 2 — Frontend UI (Port 5173):**
```powershell
npm run dev
```

**Terminal 3 — Run Backend Test Suite (25 tests):**
```powershell
cd backend
npm test
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 📊 Current Development Status

- ✅ **Phase 1: Backend Foundation & Ollama Integration** — Complete (6/6 tests passing)
- ✅ **Phase 2: Evidence Collection & Log Normalization** — Complete (12/12 tests passing)
- ✅ **Voice Assistant: Real-Time Audio & SRE Voice Control** — Complete (7/7 tests passing)
- ⏳ **Phase 3: AI Investigation & Multi-Root-Cause Analysis** — Next
- ⏳ **Phase 4: Deterministic Safety Engine & Change Freeze** — Queued
- ⏳ **Phase 5: Official Organizer API Adapter** — Awaiting Organizer Documentation
- ⏳ **Phase 6: Post-Remediation Verification & Postmortem** — Queued
- ⏳ **Phase 7: Dashboard Live Integration & End-to-End Testing** — Queued

---

## 👥 Team Rocket Responsibilities

| Teammate | Focus Area | Detailed Scope |
| :--- | :--- | :--- |
| **AKSHIT** | **Backend Core & AI** | Backend architecture, Ollama client, log normalization, evidence pipeline, and automated backend test suites. |
| **VIKRANT** | **Frontend Experience** | React dashboard, responsive layout, SRE operational views, API wiring, and frontend testing. |
| **REVANTH** | **API & Integration** | Research organizer API docs, authentication schemes, endpoint specifications, and abstract adapter compliance. |
| **RITESH** | **Chaos & Evaluation** | Synthetic test datasets, dual-cause failures, noisy logs, adversarial prompt injection payloads, and test harness execution. |
| **NANDA** | **Telemetry & Topology**| 12-service dependency mapping, metrics anomaly analysis, failure propagation modeling, and root-cause examples. |
