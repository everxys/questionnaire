import type { AxisScores, MbtiType, UserAssessment } from './types';

type DimensionKey = 'E' | 'S' | 'T' | 'J';

type QuestionDimensionRule = {
  id: number;
  dimension: DimensionKey;
  reverse: boolean;
};

const QUESTION_RULES: QuestionDimensionRule[] = [
  // E/I (E+ 3, reverse 2)
  { id: 1, dimension: 'E', reverse: false },
  { id: 2, dimension: 'E', reverse: true },
  { id: 3, dimension: 'E', reverse: false },
  { id: 4, dimension: 'E', reverse: false },
  { id: 5, dimension: 'E', reverse: true },

  // S/N (S+ 3, reverse 2)
  { id: 6, dimension: 'S', reverse: false },
  { id: 7, dimension: 'S', reverse: true },
  { id: 8, dimension: 'S', reverse: false },
  { id: 9, dimension: 'S', reverse: true },
  { id: 10, dimension: 'S', reverse: false },

  // T/F (T+ 3, reverse 2)
  { id: 11, dimension: 'T', reverse: false },
  { id: 12, dimension: 'T', reverse: true },
  { id: 13, dimension: 'T', reverse: false },
  { id: 14, dimension: 'T', reverse: true },
  { id: 15, dimension: 'T', reverse: false },

  // J/P (J+ 3, reverse 2)
  { id: 16, dimension: 'J', reverse: false },
  { id: 17, dimension: 'J', reverse: true },
  { id: 18, dimension: 'J', reverse: false },
  { id: 19, dimension: 'J', reverse: true },
  { id: 20, dimension: 'J', reverse: false },
];

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function clampLikert(value: number): number {
  return Math.max(1, Math.min(7, value));
}

function toPercentFromLikertAverage(avg: number): number {
  const clamped = Math.max(1, Math.min(7, avg));
  return clampScore(Math.round(((clamped - 1) / 6) * 100));
}

export function computeAxisScores(answers: Record<number, number>): AxisScores {
  const sums: Record<DimensionKey, number> = { E: 0, S: 0, T: 0, J: 0 };
  const counts: Record<DimensionKey, number> = { E: 0, S: 0, T: 0, J: 0 };

  for (const { id, dimension, reverse } of QUESTION_RULES) {
    const raw = clampLikert(answers[id] ?? 4);
    const scored = reverse ? 8 - raw : raw;
    sums[dimension] += scored;
    counts[dimension] += 1;
  }

  const avgE = counts.E === 0 ? 4 : sums.E / counts.E;
  const avgS = counts.S === 0 ? 4 : sums.S / counts.S;
  const avgT = counts.T === 0 ? 4 : sums.T / counts.T;
  const avgJ = counts.J === 0 ? 4 : sums.J / counts.J;

  const ePercent = toPercentFromLikertAverage(avgE);
  const sPercent = toPercentFromLikertAverage(avgS);
  const tPercent = toPercentFromLikertAverage(avgT);
  const jPercent = toPercentFromLikertAverage(avgJ);

  const nPercent = clampScore(100 - sPercent);

  const scores: AxisScores = {
    E: ePercent,
    N: nPercent,
    T: tPercent,
    J: jPercent,
  };

  return scores;
}

export function scoresToMbti(scores: AxisScores): MbtiType {
  const e = scores.E >= 50 ? 'E' : 'I';
  const n = scores.N >= 50 ? 'N' : 'S';
  const t = scores.T >= 50 ? 'T' : 'F';
  const j = scores.J >= 50 ? 'J' : 'P';
  return `${e}${n}${t}${j}` as MbtiType;
}

export function computeAssessment(answers: Record<number, number>): UserAssessment {
  const scores = computeAxisScores(answers);
  const mbti = scoresToMbti(scores);
  return { mbti, scores };
}

export function computeSimilarityPercent(user: AxisScores, persona: AxisScores): number {
  const avgDiff =
    (Math.abs(user.E - persona.E) +
      Math.abs(user.N - persona.N) +
      Math.abs(user.T - persona.T) +
      Math.abs(user.J - persona.J)) /
    4;
  return clampScore(Math.round(100 - avgDiff));
}
