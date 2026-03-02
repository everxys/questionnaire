import type { MbtiType } from '../mbti/types';
import type { MbtiReport } from './types';

import ENTJ from './mbti/ENTJ.json';
import ENFJ from './mbti/ENFJ.json';
import ENFP from './mbti/ENFP.json';
import ESFJ from './mbti/ESFJ.json';
import ENTP from './mbti/ENTP.json';
import ESTP from './mbti/ESTP.json';
import ESFP from './mbti/ESFP.json';
import INFJ from './mbti/INFJ.json';
import INFP from './mbti/INFP.json';
import ISFP from './mbti/ISFP.json';
import INTJ from './mbti/INTJ.json';
import INTP from './mbti/INTP.json';
import ISFJ from './mbti/ISFJ.json';
import ISTP from './mbti/ISTP.json';
import ISTJ from './mbti/ISTJ.json';
import ESTJ from './mbti/ESTJ.json';

const REPORTS: Partial<Record<MbtiType, MbtiReport>> = {
  ENTJ: ENTJ as MbtiReport,
  ENFJ: ENFJ as MbtiReport,
  ENFP: ENFP as MbtiReport,
  ENTP: ENTP as MbtiReport,
  ESFJ: ESFJ as MbtiReport,
  ESFP: ESFP as MbtiReport,
  ESTJ: ESTJ as MbtiReport,
  ESTP: ESTP as MbtiReport,
  INFJ: INFJ as MbtiReport,
  INFP: INFP as MbtiReport,
  ISFP: ISFP as MbtiReport,
  INTJ: INTJ as MbtiReport,
  INTP: INTP as MbtiReport,
  ISFJ: ISFJ as MbtiReport,
  ISTP: ISTP as MbtiReport,
  ISTJ: ISTJ as MbtiReport,
};

export function getMbtiReport(mbti: MbtiType): MbtiReport | null {
  return REPORTS[mbti] ?? null;
}
