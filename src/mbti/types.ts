export type MbtiAxis = 'E' | 'N' | 'T' | 'J';

export type AxisScores = Record<MbtiAxis, number>;

export type MbtiType =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFP'
  | 'ESTJ'
  | 'ESFP'
  | 'ISTP'
  | 'ISFJ'
  | 'ESTP'
  | 'ESFJ';

export type UserAssessment = {
  mbti: MbtiType;
  scores: AxisScores;
};

export type Persona = {
  id: string;
  name: string;
  imageUrl: string;
  intro: string;
  analysis: string;
  scores: AxisScores;
};

