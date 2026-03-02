import { useState } from 'react';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultPage from './components/ResultPage';
import { Page } from './types';
import type { UserAssessment } from './mbti/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [assessment, setAssessment] = useState<UserAssessment | null>(null);

  const handleStart = () => {
    setAssessment(null);
    setCurrentPage('questionnaire');
  };
  const handleComplete = (nextAssessment: UserAssessment) => {
    setAssessment(nextAssessment);
    setCurrentPage('result');
  };
  const handleRestart = () => {
    setAssessment(null);
    setCurrentPage('landing');
  };
  const handleBackToLanding = () => setCurrentPage('landing');

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
