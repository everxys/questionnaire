import React from 'react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen items-center justify-between bg-tea-white text-primary overflow-hidden relative"
    >
      {/* Background Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwfgZpUMGsSn05hQ-RIxEnuTpq992c_wt_opwVXwlbgfuc0JpRtBi3GOnB3Pr1digfs5ZtF1uSskkvUyT0WKYkKDu97oHwhmSG8yGBckdjD5_GcWCcd6U-IuTWDe6gUBvpsUd6Elhu6H1_VBO9Mx32VGMNBZhEer8Kalvxhvd0bChVwt7uQ_rBuzGpK5k10-e4ixoJHCODUT0nd0yYf33f4mtFJeVAKs_Qnp9E7mpvgHWjSD2VhVJdzcRiMh4NH2gS6bqHWI0KqZCh')" }}
      />

      {/* Top Navigation / Logo */}
      <header className="w-full flex justify-center pt-12 z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">local_library</span>
          </div>
          <h2 className="text-primary/70 text-sm font-medium tracking-[0.2em] uppercase">轻心理 · 历史人格</h2>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-md z-10">
        {/* Decorative Element */}
        <div className="w-full h-48 relative mb-8 flex items-center justify-center opacity-40">
          <svg className="w-full h-full text-primary/20 fill-current" viewBox="0 0 400 200">
            <path d="M0,160 Q100,60 200,140 T400,100 V200 H0 Z"></path>
            <path d="M50,180 Q150,100 250,160 T450,120 V200 H50 Z" opacity="0.5"></path>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-tea-white via-transparent to-transparent"></div>
        </div>

        <div className="text-center space-y-4 relative z-10">
          <h1 className="text-primary text-[32px] font-bold leading-tight tracking-tight font-serif">
            测测你是哪个历史人物
          </h1>
          <p className="text-primary/60 text-base font-normal tracking-wide font-sans">
            12道选择题 · 还原你的性格底色
          </p>
        </div>

        {/* Start Button */}
        <div className="mt-16 w-full flex justify-center">
          <button 
            onClick={onStart}
            className="bg-accent hover:bg-accent/90 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>开始探索</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>

        {/* Decorative Ink Line */}
        <div className="mt-12 w-24 h-px bg-primary/10"></div>
      </main>

      {/* Footer Information */}
      <footer className="pb-12 px-4 text-center z-10">
        <p className="text-primary/40 text-xs tracking-widest font-light">
          基于16型人格 × 历史人物数据库
        </p>
        <div className="mt-8 flex justify-center opacity-30">
          <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary/40 text-2xl">eco</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
