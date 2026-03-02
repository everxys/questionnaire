import type { Persona, UserAssessment } from './types';
import { computeSimilarityPercent } from './scoring';
import { softmaxPercents } from './softmax';

export type RankedPersona = {
  persona: Persona;
  similarityPercent: number;
  matchPercent: number;
};

type MatchOptions = {
  softmaxTau: number;
  otherSimilarCount: number;
};

export function rankPersonas(
  assessment: UserAssessment,
  personas: Persona[],
  options: MatchOptions,
): RankedPersona[] {
  const rankedBase = personas
    .map((persona) => ({
      persona,
      similarityPercent: computeSimilarityPercent(assessment.scores, persona.scores),
    }))
    .sort((a, b) => b.similarityPercent - a.similarityPercent);

  const matchPercents = softmaxPercents(
    rankedBase.map((p) => p.similarityPercent),
    options.softmaxTau,
  );

  return rankedBase.map((item, index) => ({
    ...item,
    matchPercent: matchPercents[index] ?? 0,
  }));
}

export function pickTopAndOthers(
  ranked: RankedPersona[],
  otherSimilarCount: number,
): { top: RankedPersona | null; others: RankedPersona[] } {
  if (ranked.length === 0) return { top: null, others: [] };
  const top = ranked[0];
  const others = ranked.slice(1, 1 + otherSimilarCount);
  return { top, others };
}

