# 🚀 Team Rocket — AI On-Call Incident Response Platform

An autonomous, prompt-injection-resistant on-call incident response platform with human-in-the-loop safety controls. Built for SRE and DevOps engineers handling high-concurrency cloud microservices.

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
- **Backend**: Node.js (v24), Express, TypeScript, tsx, Node Test Runner
- **Local AI Engine**: Ollama (`qwen3.5:4b` target, `qwen2.5:7b` active)
- **Security & Safety**: Custom regex AST threat analyzer, boundary-tag escaper, non-LLM safety invariant gate

---

## 📂 Project Folder Structure

```
team-rocket-dashboard/
├── .gitignore                           # Excludes node_modules, dist, logs, env secrets
├── README.md                            # Main project overview & quickstart
├── CONTRIBUTING.md                      # Teammate guide for branches & pull requests
├── TEAM_TASKS.md                        # Task ownership for Akshit, Vikrant, Revanth, Ritesh, Nanda
├── docs/
│   ├── ARCHITECTURE.md                  # Deep architectural breakdown
│   ├── DEVELOPMENT_GUIDE.md             # Windows laptop step-by-step setup
│   └── GIT_GUIDE.md                     # Beginner Git & GitHub primer
│
├── package.json                         # Frontend dependencies & scripts
├── vite.config.ts                       # Vite bundler config with Tailwind v4
├── src/                                 # Frontend source
│   ├── components/                      # Header, Sidebar, ServiceGrid, IncidentTable, etc.
│   ├── types/                           # UI domain interfaces
│   └── services/                        # In-memory mock adapter & API connector
│
└── backend/                             # Standalone Backend Service
    ├── package.json                     # Express, tsx, TypeScript
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts                     # Server entry point (port 5000)
    │   ├── app.ts                       # Express app configuration & routing
    │   ├── config.ts                    # Env config (Ollama host, target model, port)
    │   ├── types/                       # Backend domain models (evidence, ollama, safety)
    │   ├── ollama/                      # Reusable OllamaClient (JSON mode, timeouts, health)
    │   ├── logs/                        # Evidence normalizer, parsers, and prompt sanitizer
    │   └── routes/                      # Health & evidence REST endpoints
    └── tests/
        ├── phase1-ollama.test.ts        # Phase 1 automated tests (6/6 passing)
        └── phase2-evidence.test.ts      # Phase 2 automated tests (12/12 passing)
```

---

## ⚡ Quickstart: Running on a New Machine

### 1. Prerequisites
- **Node.js** (v20+ or v24): [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)
- **Ollama**: [Download Ollama](https://ollama.com/)

### 2. Pull the Local Model in Ollama
Open PowerShell and run:
```powershell
ollama pull qwen2.5:7b
# Or target model when available:
# ollama pull qwen3.5:4b
```

### 3. Install Dependencies
```powershell
# In project root (frontend)
npm install

# In backend folder
cd backend
npm install
cd ..
```

### 4. Start the Services
Run each in a separate terminal:

**Terminal 1 — Backend API (Port 5000):**
```powershell
cd backend
npm run dev
```

**Terminal 2 — Frontend UI (Port 5173):**
```powershell
npm run dev
```

**Terminal 3 — Run Backend Test Suite:**
```powershell
cd backend
npm test
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 📊 Current Development Status

- ✅ **Phase 1: Backend Foundation & Ollama Integration** — Complete (6/6 tests passing)
- ✅ **Phase 2: Evidence Collection & Log Normalization** — Complete (12/12 tests passing)
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
