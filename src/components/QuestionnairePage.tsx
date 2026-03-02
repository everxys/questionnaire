import React, { useState } from 'react';
import { motion } from 'motion/react';
import { content } from '../config/content';
import { formatTemplate } from '../utils/template';
import { computeAssessment } from '../mbti/scoring';
import type { UserAssessment } from '../mbti/types';

interface QuestionnairePageProps {
  onComplete: (assessment: UserAssessment) => void;
  onBack: () => void;
}

export default function QuestionnairePage({ onComplete, onBack }: QuestionnairePageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questions = content.questionnaire.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(computeAssessment(answers));
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const selectedValue = answers[currentQuestion.id];

  // Button configuration based on user requirements
  // Left 3: Red (More red to the left)
  // Middle: Gray
  // Right 3: Green (Darker green to the right)
  const buttons = [
    { value: 1, colorClass: 'bg-[#C23B2A]', size: 'w-12 h-12' }, // Deep Red (Accent)
    { value: 2, colorClass: 'bg-[#D46A5E]', size: 'w-11 h-11' }, // Medium Red
    { value: 3, colorClass: 'bg-[#E69991]', size: 'w-10 h-10' }, // Light Red
    { value: 4, colorClass: 'bg-[#D1D5DB]', size: 'w-9 h-9' },   // Gray
    { value: 5, colorClass: 'bg-[#8EBFA5]', size: 'w-10 h-10' }, // Light Green
    { value: 6, colorClass: 'bg-[#569476]', size: 'w-11 h-11' }, // Medium Green
    { value: 7, colorClass: 'bg-[#2D6A4F]', size: 'w-12 h-12' }, // Deep Green
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen bg-white text-slate-900"
    >
      {/* Header */}
      <header className="flex items-center p-4 justify-between bg-white sticky top-0 z-10">
        <button 
          onClick={handlePrev}
          className="text-primary flex size-10 shrink-0 items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-primary text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 font-serif">
          {content.questionnaire.headerTitle}
        </h2>
      </header>

      {/* Progress */}
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex justify-between items-end">
          <span className="text-primary/60 text-xs font-medium uppercase tracking-wider">{content.questionnaire.progressLabel}</span>
          <p className="text-primary text-sm font-bold leading-none">
            {formatTemplate(content.questionnaire.progressTemplate, {
              current: currentQuestionIndex + 1,
              total: totalQuestions,
            })}
          </p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Area */}
      <main className="flex-1 flex flex-col px-6 pt-12 pb-8 items-center">
        <div className="mb-12 w-full max-w-md">
          <motion.h1 
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-serif text-[22px] font-semibold leading-[1.8] text-primary text-center"
          >
            {currentQuestion.text}
          </motion.h1>
          <p className="text-slate-400 text-xs text-center mt-4 tracking-widest uppercase">{content.questionnaire.hint}</p>
        </div>

        {/* Likert Scale Buttons */}
        <div className="flex flex-col items-center w-full space-y-8">
          <div className="flex items-center justify-center w-full px-2 gap-2 sm:gap-4">
            {buttons.map((btn) => {
              const isSelected = selectedValue === btn.value;
              return (
                <div key={btn.value} className="relative flex items-center justify-center">
                  <button
                    onClick={() => handleSelect(btn.value)}
                    className={`
                      ${btn.size} rounded-full transition-all duration-200 cursor-pointer
                      ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'}
                      ${btn.colorClass}
                      shadow-sm
                    `}
                    aria-label={formatTemplate(content.questionnaire.rateAriaLabelTemplate, { value: btn.value })}
                  />
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div className="flex justify-between w-full max-w-[340px] px-2 mt-2">
            <span className="text-[12px] text-slate-400 font-medium">{content.questionnaire.scaleLeftLabel}</span>
            <span className="text-[12px] text-slate-400 font-medium">{content.questionnaire.scaleRightLabel}</span>
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="p-6 flex gap-4 items-center bg-white border-t border-slate-100 max-w-md mx-auto w-full">
        <button 
          onClick={handlePrev}
          className="flex-1 h-12 flex items-center justify-center rounded-full border border-primary text-primary text-sm font-bold transition-colors hover:bg-primary/5 cursor-pointer"
        >
          {content.questionnaire.prevButtonText}
        </button>
        <button 
          onClick={handleNext}
          disabled={selectedValue === undefined}
          className={`
            flex-1 h-12 flex items-center justify-center rounded-full text-white text-sm font-bold shadow-lg transition-all active:scale-95
            ${selectedValue !== undefined ? 'bg-accent shadow-accent/20 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}
          `}
        >
          {currentQuestionIndex === totalQuestions - 1
            ? content.questionnaire.resultButtonText
            : content.questionnaire.nextButtonText}
        </button>
      </footer>
      
      <div className="h-6 bg-white"></div>
    </motion.div>
  );
}
