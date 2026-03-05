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

export default function QuestionnairePage({
  onComplete,
  onBack,
}: QuestionnairePageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questions = content.questionnaire.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const progress =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      onComplete(computeAssessment(answers));
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const selectedValue = answers[currentQuestion.id];

  const buttons = [
    { value: 1, colorClass: 'bg-[#C23B2A]' },
    { value: 2, colorClass: 'bg-[#D46A5E]' },
    { value: 3, colorClass: 'bg-[#E69991]' },
    { value: 4, colorClass: 'bg-[#D1D5DB]' },
    { value: 5, colorClass: 'bg-[#8EBFA5]' },
    { value: 6, colorClass: 'bg-[#569476]' },
    { value: 7, colorClass: 'bg-[#2D6A4F]' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-screen bg-white text-slate-900 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-center p-4 justify-between bg-white shrink-0">
        <button
          onClick={handlePrev}
          className="text-primary size-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>
        <h2 className="text-primary text-lg font-bold flex-1 text-center pr-10 font-serif">
          {content.questionnaire.headerTitle}
        </h2>
      </header>

      {/* Progress */}
      <div className="px-6 py-3 shrink-0">
        <div className="flex justify-between items-end mb-2">
          <span className="text-primary/60 text-xs uppercase tracking-wider">
            {content.questionnaire.progressLabel}
          </span>
          <span className="text-primary text-sm font-bold">
            {formatTemplate(
              content.questionnaire.progressTemplate,
              {
                current: currentQuestionIndex + 1,
                total: totalQuestions,
              }
            )}
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-between px-6 pt-4 pb-4 items-center">
        {/* Question */}
        <div className="w-full max-w-md text-center">
          <motion.h1
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-serif text-lg sm:text-xl font-semibold leading-snug text-primary"
          >
            {currentQuestion.text}
          </motion.h1>

          <p className="text-slate-400 text-xs mt-3 tracking-widest uppercase">
            {content.questionnaire.hint}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col items-center w-full space-y-4 mt-4">
          <div className="flex items-center justify-center w-full gap-2 px-2 py-2">
            {buttons.map((btn) => {
              const isSelected =
                selectedValue === btn.value;

              return (
                <button
                  key={btn.value}
                  onClick={() =>
                    handleSelect(btn.value)
                  }
                  className={`
                    w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-all duration-200
                    ${btn.colorClass}
                    ${
                      isSelected
                        ? 'scale-110 shadow-[0_0_0_3px_rgba(34,197,94,0.35)]'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }
                  `}
                  aria-label={formatTemplate(
                    content.questionnaire
                      .rateAriaLabelTemplate,
                    { value: btn.value }
                  )}
                />
              );
            })}
          </div>

          <div className="flex justify-between w-full max-w-[320px] px-2">
            <span className="text-[11px] text-slate-400">
              {content.questionnaire.scaleLeftLabel}
            </span>
            <span className="text-[11px] text-slate-400">
              {content.questionnaire.scaleRightLabel}
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 flex gap-3 bg-white border-t border-slate-100 shrink-0">
        <button
          onClick={handlePrev}
          className="flex-1 h-11 flex items-center justify-center rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/5"
        >
          {content.questionnaire.prevButtonText}
        </button>

        <button
          onClick={handleNext}
          disabled={selectedValue === undefined}
          className={`
            flex-1 h-11 flex items-center justify-center rounded-full text-white text-sm font-bold transition-all active:scale-95
            ${
              selectedValue !== undefined
                ? 'bg-accent shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {currentQuestionIndex ===
          totalQuestions - 1
            ? content.questionnaire
                .resultButtonText
            : content.questionnaire
                .nextButtonText}
        </button>
      </footer>

      {/* Safe Area */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </motion.div>
  );
}