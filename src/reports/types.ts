export type ReportParagraphs = string[];

export type ReportItem = {
  title: string;
  paragraphs: ReportParagraphs;
};

export type ReportPersonaBlock = {
  title: string;
  tagline?: string;
  bio: ReportParagraphs;
};

export type ReportOtherPersonaBlock = {
  personaId: string;
  title: string;
  tagline?: string;
  paragraphs: ReportParagraphs;
  resonancePoint?: string;
};

export type MbtiPersonaReportVariant = {
  mainPersona: ReportPersonaBlock;
  resonanceTitle: string;
  resonance: ReportItem[];
  learningTitle: string;
  learning: ReportItem[];
  otherTitle: string;
  otherPersonas: ReportOtherPersonaBlock[];
  axisInsights?: {
    ei: string;
    sn: string;
    tf: string;
    jp: string;
  };
  strengthsTitle?: string;
  strengths?: string[];
  growthTitle?: string;
  growth?: string[];
};

export type MbtiTypeReport = {
  code: string;
  nickname: string;
  rarity?: string;
};

export type MbtiReport = {
  mbti: string;
  type: MbtiTypeReport;
  mainByPersonaId: Record<string, MbtiPersonaReportVariant>;
};
