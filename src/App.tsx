import { useState } from 'react';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionnairePage';
import ResultPage from './components/ResultPage';
import { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const handleStart = () => setCurrentPage('questionnaire');
  const handleComplete = () => setCurrentPage('result');
  const handleRestart = () => setCurrentPage('landing');
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
        <ResultPage onRestart={handleRestart} />
      )}
    </div>
  );
}
