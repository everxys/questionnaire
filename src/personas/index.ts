import type { MbtiType, Persona } from '../mbti/types';

import ENFJ from './mbti/ENFJ.json';
import ENFP from './mbti/ENFP.json';
import ENTJ from './mbti/ENTJ.json';
import ENTP from './mbti/ENTP.json';
import ESFJ from './mbti/ESFJ.json';
import ESFP from './mbti/ESFP.json';
import ESTJ from './mbti/ESTJ.json';
import ESTP from './mbti/ESTP.json';
import INFJ from './mbti/INFJ.json';
import INFP from './mbti/INFP.json';
import INTJ from './mbti/INTJ.json';
import INTP from './mbti/INTP.json';
import ISFJ from './mbti/ISFJ.json';
import ISFP from './mbti/ISFP.json';
import ISTJ from './mbti/ISTJ.json';
import ISTP from './mbti/ISTP.json';

const PERSONAS_BY_MBTI: Record<MbtiType, Persona[]> = {
  ENFJ: ENFJ as Persona[],
  ENFP: ENFP as Persona[],
  ENTJ: ENTJ as Persona[],
  ENTP: ENTP as Persona[],
  ESFJ: ESFJ as Persona[],
  ESFP: ESFP as Persona[],
  ESTJ: ESTJ as Persona[],
  ESTP: ESTP as Persona[],
  INFJ: INFJ as Persona[],
  INFP: INFP as Persona[],
  INTJ: INTJ as Persona[],
  INTP: INTP as Persona[],
  ISFJ: ISFJ as Persona[],
  ISFP: ISFP as Persona[],
  ISTJ: ISTJ as Persona[],
  ISTP: ISTP as Persona[]
};

/**
 * 处理 imageUrl 中的占位符，移除 {} 括号
 * 例如：https://.../{ESTJ_范仲淹.jpg} → https://.../ESTJ_范仲淹.jpg
 */
function processImageUrl(imageUrl: string): string {
  return imageUrl.replace(/\{([^{}]+)\}/g, '$1');
}

export function getPersonasForMbti(mbti: MbtiType): Persona[] {
  const personas = PERSONAS_BY_MBTI[mbti] ?? [];
  // 处理 imageUrl 中的占位符
  return personas.map((persona) => ({
    ...persona,
    imageUrl: processImageUrl(persona.imageUrl),
  }));
}

