# 📋 Team Rocket — Role & Task Assignments

This document outlines the clear ownership of modules for our hackathon project.

---

## 👨‍💻 AKSHIT — Backend Core, AI & Pipeline Lead
**Primary Workspace**: `backend/`
- **Ownership**:
  - Node.js / Express backend architecture (`backend/src/app.ts`, `backend/src/index.ts`).
  - Reusable Ollama integration (`backend/src/ollama/client.ts`) with timeout handling, health checks, and JSON mode.
  - Multi-format Log Normalization (`JsonParser`, `SyslogParser`, `ApacheParser`, `UnstructuredParser`).
  - Evidence pipeline & prompt-injection defense (`sanitizer.ts`, `pipeline.ts`).
  - Automated test runner & test suites (`backend/tests/`).
- **Current Status**: Phase 1 & Phase 2 completed (18/18 tests passing). Next: Phase 3 multi-root-cause engine.

---

## 🎨 VIKRANT — Frontend Operations Dashboard Lead
**Primary Workspace**: `src/`
- **Ownership**:
  - React 19 + Tailwind CSS v4 dashboard components.
  - SRE monitoring views: Header, Sidebar, Overview KPI cards, 12-Service Health grid, Incident Table.
  - Interactive Incident Detail Modal: Root-cause tree, metric progression charts, diagnostic log viewer.
  - Connecting the frontend directly to the backend REST API (`http://localhost:5000/api`) replacing local mock data.
  - Frontend responsiveness, error toasts, and visual state indicators.
- **Current Status**: Foundation complete and building cleanly with zero errors.

---

## 🔍 REVANTH — Organizer API & Integration Lead
**Primary Workspace**: `backend/src/adapters/` and `docs/api/`
- **Ownership**:
  - Monitoring hackathon organizer channels for official API documentation releases.
  - Documenting required endpoints: incident ingestion, metric streams, log fetching, and authorized remediation actions.
  - Specifying exact authentication mechanisms (API keys, Bearer JWTs, TLS mTLS).
  - Implementing the official client adapter adhering to `backend/src/adapters/organizerAdapter.ts`.
  - Ensuring the agent never calls unauthorized endpoints.
- **Current Status**: Abstract adapter interface designed; waiting for organizer API documentation release.

---

## 🧪 RITESH — Chaos Engineering, Test Datasets & Evaluation Lead
**Primary Workspace**: `backend/tests/fixtures/` and test scenarios
- **Ownership**:
  - Crafting synthetic incident test datasets:
    - Dual independent root causes (e.g. concurrent DB pool starvation + carrier API outage).
    - High-volume noisy log flooding (10,000+ entries) to stress-test normalization latency.
    - Malicious adversarial prompt injection attacks (jailbreaks, delimiter breakouts, system prompt extraction).
    - Flaky tools & network simulator (random 500s, 504 timeouts, dropped connections).
    - Log-format mutation scenarios (simulating the Hour-3 challenge rule change).
  - Measuring agent detection precision, recall, and false positive rates.
- **Current Status**: Phase 1 and Phase 2 test assertions established; preparing Phase 3 multi-cause evaluation suite.

---

## 🕸️ NANDA — Microservices Topology & Metrics Analysis Lead
**Primary Workspace**: `backend/src/analysis/` and architecture models
- **Ownership**:
  - Mapping the 12-service e-commerce dependency graph (DAG) across Core, Commerce, Data, and Infrastructure.
  - Modeling failure propagation rules (how upstream payment timeouts cascade into order Saga failures and API gateway 504s).
  - Developing statistical metric anomaly detection algorithms (Z-score, moving average deviations, latency thresholds).
  - Defining blast-radius calculation formulas and downstream impact estimations.
  - Providing concrete incident investigation examples for post-mortem generation.
- **Current Status**: 12 services defined; building topology graph structures for Phase 3.
