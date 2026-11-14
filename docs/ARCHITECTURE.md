# 🏛️ Team Rocket — System Architecture Specification

This document explains the end-to-end architecture of Team Rocket's AI On-Call Incident Response Platform in plain English.

---

## 1. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    REACT FRONTEND                                     |
|                       (Port 5173 - React 19 + Tailwind CSS v4)                        |
|                                                                                       |
|  [Header & Branding]   [Sidebar (6 views)]   [12 Microservices Health Grid]           |
|  [Active Incidents]    [Incident Detail RCA Modal with Safety Approval Gate]          |
+-------------------------------------------+-------------------------------------------+
                                            │ HTTP / JSON REST Calls
                                            ▼
+---------------------------------------------------------------------------------------+
|                                 TEAM ROCKET BACKEND                                   |
|                          (Port 5000 - Node.js + Express + TS)                         |
|                                                                                       |
|  1. Ingestion & Evidence Normalization:                                               |
|     • LogNormalizer: Auto-detects JSON, Syslog, Apache, or Unstructured logs.         |
|     • Exact Preservation: Original messages preserved character-for-character.        |
|     • Hour-3 Adaptability: Pluggable registry pattern for dynamic format changes.     |
|                                                                                       |
|  2. Security & Prompt Injection Defense:                                              |
|     • PromptInjectionSanitizer: Scans untrusted evidence for jailbreaks, prompt       |
|       leaks, shell execution, and delimiter escapes.                                  |
|     • Boundary Tagging: Encapsulates logs inside safe `<untrusted_evidence_log>` tags.|
|                                                                                       |
|  3. Deterministic Safety Engine (NON-LLM):                                            |
|     • Hardcoded programmatic rules engine (outside the AI).                           |
|     • Enforces change-freeze blackout periods.                                        |
|     • ZERO arbitrary shell execution permitted.                                       |
|                                                                                       |
|  4. Abstract Organizer API Adapter:                                                   |
|     • Isolated client with exponential backoff & jitter for flaky network tools.      |
|     • Awaits official hackathon documentation before concrete endpoint wiring.        |
+-------------------------------------------+-------------------------------------------+
                                            │ Boundary-Isolated Prompt
                                            ▼
+---------------------------------------------------------------------------------------+
|                                   OLLAMA DAEMON                                       |
|                      (Port 11434 - Target: qwen3.5:4b / Active: 2.5)                  |
|                                                                                       |
|  • Reusable OllamaClient with AbortController timeout management                      |
|  • Native JSON Schema generation (`format: 'json'`)                                   |
|  • Evidence-based causal reasoning & recommendation without hallucination             |
+---------------------------------------------------------------------------------------+
```

---

## 2. Component Deep Dive

### A. React Frontend (`src/`)
- **Port**: `5173`
- **Role**: Provides the human-in-the-loop SRE command center.
- **Key Views**:
  - **Overview**: Executive KPIs (12 services, healthy count, active critical incidents, MTTR).
  - **Services**: 12 e-commerce microservices with P99 latency, error rate %, CPU bars, pod counts.
  - **Incidents Table**: Real-time incident feed with severity color indicators.
  - **Incident Detail Modal**: Complete deep-dive showing AI root-cause analysis, time-series telemetry charts, color-coded diagnostic logs, copyable runbook snippet, and the Human-in-the-loop Authorization Gate.

### B. Node.js Backend (`backend/`)
- **Port**: `5000`
- **Role**: Central controller managing evidence, safety, and agent orchestration.
- **Key Modules**:
  - **`OllamaClient`**: Reusable client with health checks, structured JSON mode, and timeouts.
  - **`LogNormalizer`**: Translates diverse formats into `NormalizedLogEntry` records without data loss.
  - **`PromptInjectionSanitizer`**: Multi-vector threat scanner neutralizing hostile log payloads.
  - **`EvidencePipeline`**: Packages sanitized evidence bundles ready for AI investigation.

### C. Local Ollama AI Engine
- **Port**: `11434`
- **Model**: Initial target `qwen3.5:4b`, currently active local fallback `qwen2.5:7b`.
- **Role**: Synthesizes complex causal chains from sanitized evidence logs and outputs strictly typed JSON.
- **Security Rule**: The LLM is an advisor, NOT an executor. It proposes recommendations; deterministic code checks invariants and human SREs approve mutations.

### D. Deterministic Safety Engine (Non-LLM)
- **Role**: Programmatic gatekeeper that protects production from destructive actions.
- **Rules**:
  - Validates that mutations are non-destructive (no `DROP`, no `rm -rf`, no unbound scale).
  - Verifies resource headroom on target nodes.
  - Checks if an active **Change Freeze** is in effect. If so, mutating actions are strictly blocked unless a cryptographic emergency bypass token is provided.

### E. Abstract Organizer API Adapter
- **Role**: Clean isolation layer for external communication.
- **Design Pattern**: Abstract Adapter / Strategy Pattern.
- **Why**: Protects the team from hardcoding guessed endpoints. When the hackathon organizers release their official documentation, Revanth only updates this adapter without modifying the rest of the codebase.
