import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultPage from './components/ResultPage';
import { Page } from './types';
import type { UserAssessment } from './mbti/types';
import { buildResultShareUrl, readAssessmentFromCurrentUrl, stripResultParamFromCurrentUrl } from './utils/resultLink';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [assessment, setAssessment] = useState<UserAssessment | null>(null);

  useEffect(() => {
    const restored = readAssessmentFromCurrentUrl();
    if (restored) {
      setAssessment(restored);
      setCurrentPage('result');
    }
  }, []);

  const handleStart = () => {
    try {
      window.history.replaceState(null, '', stripResultParamFromCurrentUrl());
    } catch {
      // ignore
    }
    setAssessment(null);
    setCurrentPage('questionnaire');
  };
  const handleComplete = (nextAssessment: UserAssessment) => {
    try {
      window.history.replaceState(null, '', buildResultShareUrl(nextAssessment));
    } catch {
      // ignore
    }
    setAssessment(nextAssessment);
    setCurrentPage('result');
  };
  const handleRestart = () => {
    try {
      window.history.replaceState(null, '', stripResultParamFromCurrentUrl());
    } catch {
      // ignore
    }
    setAssessment(null);
    setCurrentPage('landing');
  };
  const handleBackToLanding = () => {
    try {
      window.history.replaceState(null, '', stripResultParamFromCurrentUrl());
    } catch {
      // ignore
    }
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-tea-white">
      {currentPage === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      {currentPage === 'questionnaire' && (
        <QuestionnairePage 
          onComplete={handleComplete} 
          onBack={handleBackToLanding}
        />
      )}
      {currentPage === 'result' && (
        assessment && <ResultPage onRestart={handleRestart} assessment={assessment} />
      )}
    </div>
  );
}
