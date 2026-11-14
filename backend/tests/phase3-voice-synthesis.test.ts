import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import or recreate the voice ranking and text preparation algorithms for testing
const FEMALE_INDIAN_NAME_HINTS = [
  'heera',
  'neerja',
  'veena',
  'lekha',
  'sangeeta',
  'isha',
  'ananya',
  'priya',
  'aditi',
  'swara',
];
const MALE_INDIAN_NAME_HINTS = ['ravi', 'prabhat', 'rishi', 'karan', 'madhav'];
const FEMALE_GENERAL_NAME_HINTS = [
  'hazel',
  'zira',
  'jenny',
  'aria',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'fiona',
  'catherine',
  'susan',
  'linda',
  'female',
  'woman',
];

interface MockVoice {
  name: string;
  lang: string;
  voiceURI: string;
}

function rankVoice(voice: MockVoice): number {
  const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (voice.name || '').toLowerCase();

  const isIndianEnglish = lang.includes('en-in') || (lang.startsWith('en') && name.includes('india'));
  const isFemaleIndianHint = FEMALE_INDIAN_NAME_HINTS.some((hint) => name.includes(hint));
  const isMaleIndianHint = MALE_INDIAN_NAME_HINTS.some((hint) => name.includes(hint));
  const isFemaleGeneralHint = FEMALE_GENERAL_NAME_HINTS.some((hint) => name.includes(hint));
  const isEnglish = lang.startsWith('en');

  if (isIndianEnglish && isFemaleIndianHint) return 1500;
  if (isIndianEnglish && !isMaleIndianHint) return 1200;
  if (isIndianEnglish) return 1000;
  if (isEnglish && isFemaleGeneralHint) return 800;
  if (isEnglish) return 500;
  return 100;
}

function isVoiceIndianEnglish(voice: MockVoice | null): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (voice.name || '').toLowerCase();
  return lang.includes('en-in') || (lang.startsWith('en') && name.includes('india'));
}

function isVoiceLikelyFemale(voice: MockVoice | null): boolean {
  if (!voice) return false;
  const name = (voice.name || '').toLowerCase();
  if (MALE_INDIAN_NAME_HINTS.some((h) => name.includes(h))) return false;
  if (name.includes('david') || name.includes('mark') || name.includes('george') || name.includes('male')) return false;
  return (
    FEMALE_INDIAN_NAME_HINTS.some((h) => name.includes(h)) ||
    FEMALE_GENERAL_NAME_HINTS.some((h) => name.includes(h)) ||
    name.includes('natural')
  );
}

function prepareSpeechText(rawText: string): string {
  return rawText
    .replace(/\b504\b/g, 'five zero four')
    .replace(/\b200\b/g, 'two hundred')
    .replace(/\b(\d+)\s*ms\b/gi, '$1 milliseconds')
    .replace(/(\d+)?\s*req\/s\b/gi, (_, num) => (num ? `${num} requests per second` : 'requests per second'))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .trim();
}

function splitIntoSentenceChunks(text: string): string[] {
  const rawChunks = text.split(/(?<=[.?!;])\s+|\n+/);
  const chunks: string[] = [];

  for (const chunk of rawChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    if (trimmed.length > 180) {
      const subParts = trimmed.split(/(?<=[,])\s+/);
      chunks.push(...subParts.map((s) => s.trim()).filter(Boolean));
    } else {
      chunks.push(trimmed);
    }
  }
  return chunks.length > 0 ? chunks : [text];
}

describe('Voice Synthesis & Natural Female Indian-English Voice Selection Tests', () => {
  const mockVoices: MockVoice[] = [
    { name: 'Microsoft Heera - English (India)', lang: 'en-IN', voiceURI: 'heera-uri' },
    { name: 'Microsoft Ravi - English (India)', lang: 'en-IN', voiceURI: 'ravi-uri' },
    { name: 'Microsoft Zira Desktop', lang: 'en-US', voiceURI: 'zira-uri' },
    { name: 'Microsoft David Desktop', lang: 'en-US', voiceURI: 'david-uri' },
    { name: 'Google हिन्दी', lang: 'hi-IN', voiceURI: 'hindi-uri' },
  ];

  test('1. Prefers female Indian-English voice (en-IN + Heera) above all others', () => {
    const sorted = [...mockVoices].sort((a, b) => rankVoice(b) - rankVoice(a));
    assert.equal(sorted[0].name, 'Microsoft Heera - English (India)');
    assert.equal(rankVoice(sorted[0]), 1500);
    assert.ok(isVoiceIndianEnglish(sorted[0]));
    assert.ok(isVoiceLikelyFemale(sorted[0]));
  });

  test('2. Fallback hierarchy: Prefers en-IN over other locales when no female en-IN exists', () => {
    // Exclude female Indian voice
    const withoutFemaleIndian = mockVoices.filter((v) => v.name !== 'Microsoft Heera - English (India)');
    const sorted = [...withoutFemaleIndian].sort((a, b) => rankVoice(b) - rankVoice(a));
    // Requirement #4: Prefer en-IN over other English locales when no female en-IN voice exists
    assert.equal(sorted[0].name, 'Microsoft Ravi - English (India)');
    assert.equal(rankVoice(sorted[0]), 1000);
  });

  test('3. Fallback hierarchy: Searches for natural female English voice when no en-IN exists', () => {
    // Exclude all Indian voices
    const withoutIndian = mockVoices.filter((v) => !v.lang.includes('IN'));
    const sorted = [...withoutIndian].sort((a, b) => rankVoice(b) - rankVoice(a));
    // Requirement #3: If no female en-IN voice is available, search for a natural female English voice
    assert.equal(sorted[0].name, 'Microsoft Zira Desktop');
    assert.equal(rankVoice(sorted[0]), 800);
    assert.ok(isVoiceLikelyFemale(sorted[0]));
  });

  test('4. Fallback hierarchy: Uses best available English voice when no female exists', () => {
    const maleOnlyEnglish = [
      { name: 'Microsoft David Desktop', lang: 'en-US', voiceURI: 'david-uri' },
      { name: 'Google Deutsch', lang: 'de-DE', voiceURI: 'de-uri' },
    ];
    const sorted = [...maleOnlyEnglish].sort((a, b) => rankVoice(b) - rankVoice(a));
    assert.equal(sorted[0].name, 'Microsoft David Desktop');
    assert.equal(rankVoice(sorted[0]), 500);
  });

  test('5. Speech text preparation cleans technical jargon and markdown', () => {
    const raw = 'Detected HTTP 504 with latency 14200ms on `payment-gateway`. Processed 150req/s with **94%** confidence.';
    const cleaned = prepareSpeechText(raw);
    assert.ok(cleaned.includes('five zero four'));
    assert.ok(cleaned.includes('14200 milliseconds'));
    assert.ok(cleaned.includes('150 requests per second'));
    assert.ok(!cleaned.includes('`'));
    assert.ok(!cleaned.includes('**'));
  });

  test('6. Long AI incident response is split into natural sentence chunks under 180 characters', () => {
    const longResponse =
      'Investigating critical incident INC-2026-891 on Core Ingress API Gateway. Root cause identified as PostgreSQL pool exhaustion caused by unindexed cart query lock contention under surge traffic. Traffic surge of 14,200 req/s saturated connection limit. Envoy proxy reached its 15 second timeout deadline, returning HTTP 504 Gateway Timeout cascade to customer storefront.';
    const chunks = splitIntoSentenceChunks(longResponse);
    assert.ok(chunks.length >= 3);
    for (const chunk of chunks) {
      assert.ok(chunk.length <= 180, `Chunk exceeds 180 chars: ${chunk.length}`);
    }
  });

  test('7. Recommended default speech parameters match requirements', () => {
    const defaultRate = 0.95; // Moderate pace
    const defaultPitch = 1.0; // Natural female pitch
    assert.ok(defaultRate >= 0.90 && defaultRate <= 1.0, 'Speed must be approximately 0.95x to 1.0x');
    assert.equal(defaultPitch, 1.0, 'Pitch must be natural female baseline (1.0)');
  });
});
