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

  const selectedValue = answers[currentQuestion.id];

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

  const buttons = [
    { value: 1, color: 'bg-[#C23B2A]' },
    { value: 2, color: 'bg-[#D46A5E]' },
    { value: 3, color: 'bg-[#E69991]' },
    { value: 4, color: 'bg-[#D1D5DB]' },
    { value: 5, color: 'bg-[#8EBFA5]' },
    { value: 6, color: 'bg-[#569476]' },
    { value: 7, color: 'bg-[#2D6A4F]' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-[100dvh] bg-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-center p-4 justify-between shrink-0">
        <button
          onClick={handlePrev}
          className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <h2 className="text-lg font-bold flex-1 text-center pr-10 font-serif">
          {content.questionnaire.headerTitle}
        </h2>
      </header>

      {/* Progress */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex justify-between mb-2">
          <span className="text-xs uppercase text-slate-400">
            {content.questionnaire.progressLabel}
          </span>
          <span className="text-sm font-bold">
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
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.h1
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-lg sm:text-xl font-semibold leading-snug max-w-md"
        >
          {currentQuestion.text}
        </motion.h1>

        <p className="text-xs text-slate-400 mt-3 uppercase tracking-widest">
          {content.questionnaire.hint}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
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
                  w-10 aspect-square shrink-0 rounded-full transition-all
                  ${btn.color}
                  ${
                    isSelected
                      ? 'scale-110 shadow-[0_0_0_3px_rgba(0,0,0,0.2)]'
                      : 'opacity-80 hover:opacity-100'
                  }
                `}
              />
            );
          })}
        </div>

        <div className="flex justify-between w-full max-w-xs mt-4 text-xs text-slate-400">
          <span>
            {content.questionnaire.scaleLeftLabel}
          </span>
          <span>
            {content.questionnaire.scaleRightLabel}
          </span>
        </div>
      </main>

      {/* Footer Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
        <button
          onClick={handlePrev}
          className="flex-1 h-11 rounded-full border text-sm font-bold"
        >
          {content.questionnaire.prevButtonText}
        </button>

        <button
          onClick={handleNext}
          disabled={selectedValue === undefined}
          className={`
            flex-1 h-11 rounded-full text-white text-sm font-bold
            ${
              selectedValue !== undefined
                ? 'bg-accent'
                : 'bg-gray-300'
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
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </motion.div>
  );
}