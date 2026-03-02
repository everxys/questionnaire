import landing from './content/landing.json';
import questionnaire from './content/questionnaire.json';
import result from './content/result.json';

export type Question = {
  id: number;
  text: string;
};

export type ContentConfig = {
  landing: {
    brand: string;
    title: string;
    subtitleTemplate: string;
    startButtonText: string;
    footerNote: string;
    captcha: {
      enabled: boolean;
      verifyUrl: string;
      codeLength: number;
      timeoutMs: number;
      retry409Once: boolean;
      deviceIdStorageKey: string;
      tokenStorageKey: string;
      title: string;
      placeholder: string;
      verifyButtonText: string;
      verifyingText: string;
      invalidTip: string;
      serverTip: string;
      networkTip: string;
      verifiedTip: string;
    };
  };
  questionnaire: {
    headerTitle: string;
    progressLabel: string;
    progressTemplate: string;
    hint: string;
    scaleLeftLabel: string;
    scaleRightLabel: string;
    prevButtonText: string;
    nextButtonText: string;
    resultButtonText: string;
    rateAriaLabelTemplate: string;
    questions: Question[];
  };
  result: {
    backAriaLabel: string;
    headerTitle: string;
    matchTemplate: string;
    rawSimilarityTemplate: string;
    matchSoftmaxTau: number;
    emptyMessage: string;
    detail: {
      title: string;
      analysisCardTitle: string;
      comparisonRowTemplate: string;
      growthTitle?: string;
      growthItems?: { title: string; paragraphs: string[] }[];
      otherSimilarTitle: string;
      otherSimilarCount: number;
    };
    personality: {
      title: string;
      typeLabel: string;
      typeValueTemplate: string;
      axes: {
        key: 'E' | 'N' | 'T' | 'J';
        label: string;
        highDesc: string;
        lowDesc: string;
      }[];
    };
    restartButtonText: string;
    shareButtonText: string;
  };
};

export const content = {
  landing,
  questionnaire,
  result,
} as ContentConfig;
