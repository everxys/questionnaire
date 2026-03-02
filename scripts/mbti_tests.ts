import assert from 'node:assert/strict';
import { content } from '../src/config/content';
import { pickTopAndOthers, rankPersonas } from '../src/mbti/matching';
import { computeAssessment, computeAxisScores } from '../src/mbti/scoring';
import type { MbtiType, UserAssessment } from '../src/mbti/types';
import { getPersonasForMbti } from '../src/personas';

/**
 * This test suite is intentionally written without Jest/Vitest to keep the
 * project dependency-free. It uses `node:assert/strict` and exits with non-zero
 * code on failure (so CI can catch it).
 *
 * What we test:
 * 1) The 20-question questionnaire + reverse-scoring produces the expected MBTI.
 * 2) The matching pipeline (raw similarity + softmax "match%") produces:
 *    - a deterministic "main persona" (Top1)
 *    - exactly 2 "other similar" personas
 *    - match percents that sum to 100 and are within [0, 100]
 */

type AnswerMap = Record<number, number>;
type DimensionKey = 'E' | 'S' | 'T' | 'J';

/**
 * Question IDs for each dimension in the 20-question test.
 * Forward questions score as-is; reverse questions score as (8 - choice).
 *
 * Source: src/mbti/scoring.ts (QUESTION_RULES) and your product spec.
 */
const QUESTION_IDS: Record<DimensionKey, { forward: number[]; reverse: number[] }> = {
  E: { forward: [1, 3, 4], reverse: [2, 5] },
  S: { forward: [6, 8, 10], reverse: [7, 9] },
  T: { forward: [11, 13, 15], reverse: [12, 14] },
  J: { forward: [16, 18, 20], reverse: [17, 19] },
};

const ALL_MBTI: MbtiType[] = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
];

function test(name: string, fn: () => void) {
  try {
    fn();
    process.stdout.write(`PASS ${name}\n`);
  } catch (err) {
    process.stderr.write(`FAIL ${name}\n`);
    throw err;
  }
}

function buildExtremeAnswersForMbti(mbti: MbtiType): AnswerMap {
  /**
   * We construct answers so that:
   * - If the target side is the "positive pole" (E/S/T/J), we answer:
   *   forward questions = 7, reverse questions = 1
   * - If the target side is the "negative pole" (I/N/F/P), we answer:
   *   forward questions = 1, reverse questions = 7
   *
   * With reverse scoring applied, this guarantees per-dimension average >= 4
   * for the chosen pole, and < 4 for the opposite pole.
   */
  const answers: AnswerMap = {};
  const [ei, sn, tf, jp] = mbti.split('') as ['I' | 'E', 'S' | 'N', 'T' | 'F', 'J' | 'P'];

  const setDimension = (dimension: DimensionKey, positive: boolean) => {
    const { forward, reverse } = QUESTION_IDS[dimension];
    for (const q of forward) answers[q] = positive ? 7 : 1;
    for (const q of reverse) answers[q] = positive ? 1 : 7;
  };

  setDimension('E', ei === 'E');
  setDimension('S', sn === 'S');
  setDimension('T', tf === 'T');
  setDimension('J', jp === 'J');
  return answers;
}

function assertAxisScoreExtremes(answers: AnswerMap, expected: MbtiType) {
  /**
   * Sanity-check that reverse scoring is working as intended.
   * For our extreme answers, each expected pole should land near the ends.
   */
  const scores = computeAxisScores(answers);

  const [ei, sn, tf, jp] = expected.split('') as ['I' | 'E', 'S' | 'N', 'T' | 'F', 'J' | 'P'];
  assert.ok(ei === 'E' ? scores.E >= 80 : scores.E <= 20, `E score unexpected for ${expected}: ${scores.E}`);
  assert.ok(sn === 'N' ? scores.N >= 80 : scores.N <= 20, `N score unexpected for ${expected}: ${scores.N}`);
  assert.ok(tf === 'T' ? scores.T >= 80 : scores.T <= 20, `T score unexpected for ${expected}: ${scores.T}`);
  assert.ok(jp === 'J' ? scores.J >= 80 : scores.J <= 20, `J score unexpected for ${expected}: ${scores.J}`);
}

function assertMatchingOutput(assessment: UserAssessment, mbti: MbtiType) {
  const personas = getPersonasForMbti(mbti);
  assert.equal(personas.length, 3, `Expected 3 personas for ${mbti}, got ${personas.length}`);

  const ranked = rankPersonas(assessment, personas, {
    softmaxTau: content.result.matchSoftmaxTau,
    otherSimilarCount: content.result.detail.otherSimilarCount,
  });

  // Ranked should be in descending raw-similarity order.
  for (let i = 1; i < ranked.length; i += 1) {
    assert.ok(
      ranked[i - 1].similarityPercent >= ranked[i].similarityPercent,
      `Rank order broken for ${mbti}: ranked[${i - 1}] < ranked[${i}]`,
    );
  }

  const { top, others } = pickTopAndOthers(ranked, content.result.detail.otherSimilarCount);
  assert.ok(top, `Missing top match for ${mbti}`);
  assert.equal(others.length, 2, `Expected 2 other matches for ${mbti}, got ${others.length}`);

  // Softmax output should be a valid 0..100 distribution that sums to 100.
  const sum = ranked.reduce((acc, p) => acc + p.matchPercent, 0);
  assert.equal(sum, 100, `Match percents should sum to 100 for ${mbti}, got ${sum}`);
  for (const p of ranked) {
    assert.ok(p.matchPercent >= 0 && p.matchPercent <= 100, `Invalid matchPercent for ${mbti}: ${p.matchPercent}`);
    assert.ok(
      p.similarityPercent >= 0 && p.similarityPercent <= 100,
      `Invalid similarityPercent for ${mbti}: ${p.similarityPercent}`,
    );
  }

  // "Main persona" should have the highest match%.
  assert.ok(
    top.matchPercent >= others[0].matchPercent && top.matchPercent >= others[1].matchPercent,
    `Top matchPercent should be highest for ${mbti}`,
  );

  // Others should be distinct and not include the main persona.
  const otherIds = others.map((x) => x.persona.id);
  assert.equal(new Set(otherIds).size, 2, `Other personas should be distinct for ${mbti}`);
  assert.ok(!otherIds.includes(top.persona.id), `Other personas should not include top for ${mbti}`);
}

function runAll() {
  for (const mbti of ALL_MBTI) {
    test(`Assessment MBTI + matching (${mbti})`, () => {
      // Keep "global invariants" inside each MBTI test so the suite has exactly
      // 16 test cases (one per MBTI type), as requested.
      assert.equal(content.questionnaire.questions.length, 20, 'Question count must be 20');
      assert.equal(content.result.detail.otherSimilarCount, 2, 'Other similar count must be 2');

      const answers = buildExtremeAnswersForMbti(mbti);
      assertAxisScoreExtremes(answers, mbti);

      const assessment = computeAssessment(answers);
      assert.equal(assessment.mbti, mbti, `MBTI mismatch: expected ${mbti}, got ${assessment.mbti}`);

      assertMatchingOutput(assessment, mbti);
    });
  }
}

runAll();
console.log(`OK: ${ALL_MBTI.length} MBTI cases passed`);
