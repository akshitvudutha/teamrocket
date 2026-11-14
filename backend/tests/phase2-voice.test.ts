import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { VoiceAssistantService } from '../src/services/voiceAssistantService.js';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Voice Assistant Engine & Safety Tests', () => {
  const service = new VoiceAssistantService();

  test('1. "Investigate the current incident" triggers incident investigation intent', () => {
    const result = service.processCommand('Investigate the current incident');
    assert.equal(result.intent, 'INVESTIGATE_INCIDENT');
    assert.ok(result.spokenResponse.length > 10);
    assert.equal(result.uiAction.type, 'OPEN_INCIDENT');
    assert.ok(result.uiAction.payload?.incidentId);
  });

  test('2. "Show the root cause" navigates to RCA and summarizes causal chain', () => {
    const result = service.processCommand('Show the root cause of the failure');
    assert.equal(result.intent, 'SHOW_ROOT_CAUSE');
    assert.ok(result.spokenResponse.toLowerCase().includes('hikaricp') || result.spokenResponse.toLowerCase().includes('pool'));
    assert.equal(result.uiAction.type, 'SHOW_MODAL_TAB');
    assert.equal(result.uiAction.payload?.tab, 'rca');
  });

  test('3. "Check payment service health" extracts service telemetry and speaks metrics', () => {
    const result = service.processCommand('Please check payment service health');
    assert.equal(result.intent, 'CHECK_SERVICE_HEALTH');
    assert.ok(result.spokenResponse.includes('Payment Gateway'));
    assert.ok(result.spokenResponse.includes('CRITICAL'));
    assert.equal(result.uiAction.type, 'SELECT_SERVICE');
    assert.equal(result.uiAction.payload?.serviceId, 'svc-payment');
  });

  test('4. "Generate a postmortem" routes to reports and generates summary', () => {
    const result = service.processCommand('Generate a postmortem for this incident');
    assert.equal(result.intent, 'GENERATE_POSTMORTEM');
    assert.equal(result.uiAction.type, 'SWITCH_TAB');
    assert.equal(result.uiAction.payload?.tab, 'reports');
    assert.ok(result.detailedFindings.includes('Post-Mortem'));
  });

  test('5. "Explain the latest incident" synthesizes overview narrative', () => {
    const result = service.processCommand('Explain the latest incident to me');
    assert.equal(result.intent, 'EXPLAIN_INCIDENT');
    assert.ok(result.spokenResponse.length > 20);
    assert.equal(result.uiAction.type, 'OPEN_INCIDENT');
  });

  test('6. SAFETY INVARIANT: Voice commands requesting remediation are strictly BLOCKED', () => {
    const hazardousCommands = [
      'Apply remediation right now and restart payment gateway',
      'Execute remediation script immediately',
      'Deploy fix to production',
      'Kill pod and flush database',
    ];

    for (const cmd of hazardousCommands) {
      const result = service.processCommand(cmd);
      assert.equal(result.intent, 'BLOCKED_REMEDIATION');
      assert.equal(result.safetyProtected, true);
      assert.ok(
        result.spokenResponse.toLowerCase().includes('safety') ||
        result.spokenResponse.toLowerCase().includes('cannot execute remediation'),
        `Should explain safety policy for command: "${cmd}"`
      );
      assert.equal(result.uiAction.type, 'SHOW_MODAL_TAB');
      assert.equal(result.uiAction.payload?.tab, 'remediation');
    }
  });

  test('7. Express /api/voice/command endpoint handles HTTP POST requests', async () => {
    const app = createApp({ voiceService: service });
    let server: Server;

    await new Promise<void>((resolve) => {
      server = app.listen(5098, () => resolve());
    });

    try {
      const res = await fetch('http://localhost:5098/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'Check payment service health' }),
      });

      assert.equal(res.status, 200);
      const data = (await res.json()) as any;
      assert.equal(data.success, true);
      assert.equal(data.result.intent, 'CHECK_SERVICE_HEALTH');
      assert.ok(data.result.spokenResponse);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
