import type { MbtiType, UserAssessment } from '../mbti/types';

const MBTI_TYPES: ReadonlySet<MbtiType> = new Set([
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFP',
  'ESTJ',
  'ESFP',
  'ISTP',
  'ISFJ',
  'ESTP',
  'ESFJ',
]);

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return `${base64}${pad}`;
}

export function encodeAssessmentForUrl(assessment: UserAssessment): string {
  const payload = [assessment.mbti, assessment.scores.E, assessment.scores.N, assessment.scores.T, assessment.scores.J];
  return toBase64Url(btoa(JSON.stringify(payload)));
}

export function decodeAssessmentFromUrlParam(value: string): UserAssessment | null {
  try {
    const json = atob(fromBase64Url(value));
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 5) return null;
    const [mbti, e, n, t, j] = parsed as [unknown, unknown, unknown, unknown, unknown];
    if (typeof mbti !== 'string' || !MBTI_TYPES.has(mbti as MbtiType)) return null;
    const nums = [e, n, t, j].map((v) => (typeof v === 'number' ? v : Number.NaN));
    if (nums.some((v) => !Number.isFinite(v))) return null;

    return {
      mbti: mbti as MbtiType,
      scores: { E: nums[0], N: nums[1], T: nums[2], J: nums[3] },
    };
  } catch {
    return null;
  }
}

export function buildResultShareUrl(assessment: UserAssessment, baseHref?: string): string {
  const href = baseHref ?? (typeof window !== 'undefined' ? window.location.href : 'https://example.com/');
  const url = new URL(href);
  url.searchParams.set('r', encodeAssessmentForUrl(assessment));
  return url.toString();
}

export function readAssessmentFromCurrentUrl(): UserAssessment | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const value = url.searchParams.get('r');
  if (!value) return null;
  return decodeAssessmentFromUrlParam(value);
}

export function stripResultParamFromCurrentUrl(): string {
  const url = new URL(typeof window !== 'undefined' ? window.location.href : 'https://example.com/');
  url.searchParams.delete('r');
  return url.toString();
}

