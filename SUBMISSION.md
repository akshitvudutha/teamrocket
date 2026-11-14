# SUBMISSION.md

## 1. Team
- **Team name**: Team Rocket (Product: TARSIER)
- **Problem (P1-P5)**: Problem 5 — SEV-1: Night Shift (Flagship / Hard)
- **Members and who did what**:
  - **Akshit** (Backend Core & AI Lead): Node.js/Express backend architecture (`backend/src/`), local Ollama integration (`backend/src/ollama/client.ts`), log normalization engine across 4 formats, adversarial prompt-injection defense (`sanitizer.ts`), and test suites.
  - **Vikrant** (Frontend Operations Lead): React 19 + Tailwind CSS v4 dashboard (`src/components/tarsier/`), Notch-inspired Apple minimalist UI, 12-service health grid, incident stream, website detail tabs, and Vercel production UI.
  - **Revanth** (Organizer API & Integration Lead): Abstract organizer API adapter specs (`backend/src/adapters/organizerAdapter.ts`), bounded exponential backoff with jitter, error boundaries, and webhook/polling contract.
  - **Ritesh** (Chaos Engineering & Evaluation Lead): Synthetic incident test fixtures, dual-root-cause failure models, adversarial injection payload fuzzing, and noise log generation (`backend/tests/fixtures/`).
  - **Nanda** (Microservices Topology & Metrics Lead): 12-service dependency DAG mapping, failure propagation modeling (upstream payment timeouts → saga rollbacks → gateway 504s), and blast-radius anomaly heuristics.

## 2. What we did (3-5 lines)
We built **TARSIER**, an autonomous, prompt-injection-resistant AI on-call incident response platform for the 12-service online shop. We focused on the end-to-end investigation and safety slice: ingesting noisy multi-format logs, stripping prompt injections, running structured causal reasoning via local Ollama LLMs, enforcing deterministic non-LLM safety guardrails against destructive remediation, and providing a hands-free natural female Indian-English voice assistant. We chose this slice because autonomous agents in production are dangerous without strict input sanitization and non-LLM safety guardrails.

## 3. Customer: who is this for?
- **Target user**: Priyanshu, a solo on-call Site Reliability Engineer (SRE) at a growing e-commerce startup in Bengaluru waking up at 3:15 AM to a SEV-1 pager alert.
- **Their pain today**: Woken up half-asleep, he has to juggle 6 browser tabs (Grafana, Datadog, Kibana, Slack, AWS console), sift through 50,000 raw mixed-format logs across 12 cascading microservices, deduce patient-zero root causes manually, and fears running a destructive terminal command while drowsy.
- **Why they'd switch**: TARSIER triages the alert in seconds, isolates the root cause from cascading symptoms, sanitizes adversarial log noise, briefs him hands-free via voice while he gets to his desk, and enforces strict non-destructive safety gates so he can approve fixes with one click.
- **Size / reach**: ~250,000 DevOps & SRE engineers globally managing cloud microservices, plus tens of thousands of solo developer-founders on call for their own products.

## 4. System design
```
Alert / Raw Logs -> [ Log Normalizer ] -> [ Prompt Sanitizer ] -> [ Ollama LLM Reasoning ] -> [ Deterministic Safety Gate ] -> Human Approval / Postmortem
```
- **Main components and what each does**:
  - `Log Normalizer` (`backend/src/logs/`): Parses Syslog (RFC 5424/3164), JSON, Apache, and unstructured text into normalized telemetry without losing message integrity; hot-swaps parser on Hour-3 format switch.
  - `Prompt Sanitizer` (`backend/src/logs/sanitizer.ts`): Strips jailbreak attempts, delimiter breakouts (`</system>`, `### INSTRUCTION`), and adversarial prompt injection strings before context enters the LLM.
  - `Ollama Reasoning Engine` (`backend/src/ollama/client.ts`): Prompts local `qwen2.5:7b` / `qwen3.5:4b` in JSON mode (`format: 'json'`) to output structured causal hypotheses, blast radius, and candidate remediations.
  - `Deterministic Safety Gate`: Non-LLM rule engine enforcing change freezes, forbidding destructive shell execution, and blocking autonomous voice remediation.
  - `TARSIER Voice & React Frontend` (`src/`): Apple-inspired Notch capsule dashboard and real-time hands-free speech assistant (`en-IN` female speech synthesis + Web Speech API).
- **Models / APIs / data used (and what the LLM does vs plain code does)**:
  - Model: Local Ollama daemon running `qwen2.5:7b` (target fallback `qwen3.5:4b`).
  - LLM does: Narrative causal correlation across microservice logs, hypothesis ranking, and human-readable postmortem generation.
  - Plain code does: Telemetry parsing, regex security AST sanitization, deterministic safety policies (blocking destructive actions/change freezes), voice command classification, and HTTP API serving.
- **How it handles uncertainty, errors and bad input**:
  - Unparseable or malformed logs are safely preserved via `UnstructuredParser` fallback rather than dropped.
  - Ollama calls use strict `AbortController` timeouts (default 30s) and fallback to active models or heuristic rule tables if daemon drops.
  - Suspicious prompt injection text is quarantined with boundary tagging.
  - Flaky organizer APIs are wrapped in bounded exponential backoff with random jitter.
- **Biggest design decision, and the alternative you rejected**:
  - *Decision*: Decoupling remediation safety into a deterministic, non-LLM policy engine requiring explicit human-in-the-loop UI confirmation.
  - *Rejected Alternative*: Letting the LLM generate and directly run bash scripts (`exec("rm -rf ...")` or raw shell tools). Rejected because prompt-injected logs or LLM hallucinations could destroy production databases or drop active replicas during an outage.

## 5. What is different or clever here?
1. **Adversarial Injection Defense in Logs**: Instead of blindly feeding raw logs into LLM context, our multi-stage sanitizer identifies instruction-like payloads (`"Ignore previous instructions"`, base64 breakouts) and neuters them with boundary tags.
2. **Deterministic Safety Invariants**: The LLM *proposes* hypotheses, but hardcoded software gates enforce invariants (change-freeze lockout, no destructive commands, no unconfirmed voice remediation).
3. **Hands-Free Natural Voice Assistant**: Built with natural female Indian-English speech synthesis (`Microsoft Neerja Online / en-IN`), audio GC protection, keep-alive heartbeats, and technical jargon translation (`HTTP 504` → *"five zero four"*, `4,200 ms` → *"4200 milliseconds"*).
4. **Hour-3 Zero-Downtime Dynamic Parser Swapping**: Built modular parser interfaces so when organizers flip the log format or declare a change freeze at Hour 3, the engine adapts dynamically without pipeline rewrites.

## 6. Status (be specific)
- **Works**:
  - Full end-to-end evidence ingestion and multi-format log normalization (Syslog, JSON, Apache, Unstructured) with 100% test pass rate.
  - Prompt injection threat quarantine and delimiter sanitization.
  - Local Ollama structured JSON extraction with health checks and timeout recovery.
  - Apple-inspired Notch UI dashboard with light/dark theme, 12-service status grid, incident stream, and detail modals.
  - Real-time hands-free Voice Assistant with natural Indian-English speech output (`en-IN`), jargon cleaner, and voice safety gates.
  - 34 automated unit/integration tests passing across 4 test suites (`npm test` in backend).
  - Live production deployment on Vercel: https://teamrocket-nu.vercel.app/
- **Partly works (and how)**:
  - Official Organizer API integration: The abstract adapter interface (`organizerAdapter.ts`) is designed with retry/backoff, but awaits the final organizer API spec/documentation release to plug in actual URLs and auth tokens.
  - Multi-root-cause correlation graph: Graph DAG is modeled for 12 services; dual-cause ranking works in unit tests, currently being tuned for high-volume 10k log floods.
- **Not built**:
  - Direct Kubernetes cluster mutating controllers (deliberately avoided raw cluster exec for safety).

## 7. How to try it
- **Live Hosted URL**: https://teamrocket-nu.vercel.app/
- **GitHub Repository**: https://github.com/akshitvudutha/teamrocket
```powershell
# Prerequisites: Node.js v20+, Ollama daemon running locally (optional for UI, required for local AI)
# 1. Pull model in Ollama:
ollama pull qwen2.5:7b

# 2. Run backend (Port 5000):
cd backend
npm install
npm run dev

# 3. Run frontend (Port 5173):
# In project root:
npm install
npm run dev

# 4. Run automated test suites (34 tests):
cd backend
npm test
```
- **LLM Provider & Env Vars**:
  - Provider: Local Ollama daemon (`http://localhost:11434`)
  - Env vars: `OLLAMA_HOST=http://localhost:11434`, `TARGET_MODEL=qwen3.5:4b`, `ACTIVE_MODEL=qwen2.5:7b`, `PORT=5000`

## 8. How we built it
- **AI tools used and what you let them do**:
  - Antigravity / OpenCode: Used for rapid scaffolding of TypeScript interfaces, Tailwind CSS styling components, regex parsers for Syslog/Apache, and test fixture generation.
  - What we kept strict control over: System architecture, deterministic safety policies, threat sanitization heuristics, and the 12-service failure propagation rules.
- **What you tested yourself (link any test files or sample inputs in the repo)**:
  - 34 automated tests across 4 test suites:
    - `backend/tests/phase1-ollama.test.ts` (Ollama health, JSON mode, timeout aborts)
    - `backend/tests/phase2-evidence.test.ts` (Log normalization across 4 formats, prompt injection attacks, Hour-3 dynamic parser registration)
    - `backend/tests/voice-assistant.test.ts` (Voice intent matching, safety gate invariant blocking voice remediation)
    - `backend/tests/phase3-voice-synthesis.test.ts` (Voice ranking, fallback hierarchy, jargon regex, sentence chunking)
  - Production build verification: `npm run build` passed with 0 errors.
- **A time you corrected or overrode the AI**:
  - The AI initially suggested allowing the LLM to directly trigger automated remediation via voice commands. We overrode this immediately and instituted a strict safety invariant: voice commands can investigate and explain, but remediation *must* be blocked and routed to a human-in-the-loop visual approval modal with change-freeze verification.
  - In voice synthesis, the AI initially attempted to label an American voice as "Indian English fallback". We rejected and corrected this to maintain strict honesty, implementing genuine locale detection and a clear fallback disclosure badge.
- **Anything not written in this window**:
  - Pre-built code: None. Standard open-source libraries used: React 19, Vite, Tailwind CSS v4, Lucide React, Express, tsx.

## 9. Next 3 hours
1. **Organizer API Live Ingestion**: Bind the abstract adapter to the live challenge endpoints as soon as organizers release endpoints and token format.
2. **Extended Chaos Simulator**: Run live evaluation across all 30 organizer incidents to benchmark dual-cause detection precision and MTTR reduction.
3. **Automated Rollback & Canary Verification**: Wire post-remediation metric polling to automatically detect if a fix fails and trigger safe rollback.
4. **WebSocket Real-Time Incident Stream**: Upgrade from REST polling to live bidirectional WebSocket feeds for microsecond alert dispatch.
