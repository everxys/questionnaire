import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { content } from '../config/content';
import { formatTemplate } from '../utils/template';
import { getOrCreateDeviceId } from '../utils/deviceId';
import { verifyCaptchaCode } from '../services/captcha';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const captcha = content.landing.captcha;
  const subtitle = formatTemplate(content.landing.subtitleTemplate, {
    count: content.questionnaire.questions.length,
  });

  const existingToken = useMemo(() => {
    if (!captcha.enabled) return null;
    try {
      return localStorage.getItem(captcha.tokenStorageKey);
    } catch {
      return null;
    }
  }, [captcha.enabled, captcha.tokenStorageKey]);

  const codeLength = Math.max(1, Math.min(10, Math.floor(captcha.codeLength || 5)));
  const [code, setCode] = useState<string[]>(Array.from({ length: codeLength }, () => ''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasExistingToken = typeof existingToken === 'string' && existingToken.trim().length > 0;
  const [verified, setVerified] = useState<boolean>(hasExistingToken);
  const [justVerified, setJustVerified] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleStart = async () => {
    if (!captcha.enabled) {
      onStart();
      return;
    }

    setError(null);
    setJustVerified(false);

    if (verified) {
      onStart();
      return;
    }

    const merged = code.join('').trim().toUpperCase();
    if (merged.length !== codeLength) return;

    setIsVerifying(true);
    try {
      const deviceId = getOrCreateDeviceId(captcha.deviceIdStorageKey);
      const res = await verifyCaptchaCode({
        verifyUrl: captcha.verifyUrl,
        code: merged,
        deviceId,
        timeoutMs: captcha.timeoutMs,
        retry409Once: captcha.retry409Once,
      });

      if (res.ok) {
        try {
          localStorage.setItem(captcha.tokenStorageKey, res.token);
        } catch {
          // ignore
        }
        setVerified(true);
        setJustVerified(true);
        onStart();
        return;
      }

      if (res.status && res.status >= 500) {
        setError(captcha.serverTip);
        return;
      }

      if (res.status === 400) {
        setError(captcha.invalidTip);
        return;
      }

      setError(captcha.networkTip);
    } finally {
      setIsVerifying(false);
    }
  };

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
          <h2 className="text-primary/70 text-sm font-medium tracking-[0.2em] uppercase">{content.landing.brand}</h2>
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
            {content.landing.title}
          </h1>
          <p className="text-primary/60 text-base font-normal tracking-wide font-sans">
            {subtitle}
          </p>
        </div>

        {/* Captcha Gate */}
        {captcha.enabled && (
          <div className="mt-12 w-full">
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-primary/10 p-6 shadow-sm">
              <p className="text-primary/70 text-sm font-medium mb-3">{captcha.title}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full min-w-0 flex-1">
                  <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${codeLength}, minmax(0, 1fr))` }}>
                    {code.map((value, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        value={value}
                        inputMode="text"
                        autoComplete="one-time-code"
                        maxLength={1}
                        onChange={(e) => {
                          const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          const nextChar = raw.slice(-1);

                          setCode((prev) => {
                            if (prev[index] === nextChar) return prev;
                            const next = [...prev];
                            next[index] = nextChar;
                            return next;
                          });

                          if (nextChar && index < codeLength - 1) {
                            inputRefs.current[index + 1]?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !code[index] && index > 0) {
                            inputRefs.current[index - 1]?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
                          if (!pasted) return;
                          e.preventDefault();
                          const chars = pasted.slice(0, codeLength).split('');
                          setCode((prev) => {
                            const next = [...prev];
                            for (let i = 0; i < codeLength; i += 1) {
                              next[i] = chars[i] ?? '';
                            }
                            return next;
                          });
                          const nextIndex = Math.min(chars.length, codeLength - 1);
                          inputRefs.current[nextIndex]?.focus();
                        }}
                        aria-label={`${captcha.title} ${index + 1}`}
                        className="h-12 w-full rounded-xl border border-primary/15 bg-white text-center text-primary font-bold tracking-widest placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    ))}
                  </div>
                  {captcha.placeholder && (
                    <p className="text-xs text-primary/40 mt-2">例如：{captcha.placeholder}</p>
                  )}
                </div>
                <button
                  onClick={handleStart}
                  disabled={isVerifying || (!verified && code.join('').trim().length !== codeLength)}
                  className={`w-full sm:w-auto h-12 px-5 rounded-full text-white font-bold shadow-lg active:scale-95 transition-transform whitespace-nowrap text-sm ${
                    isVerifying || (!verified && code.join('').trim().length !== codeLength)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-accent hover:bg-accent/90 cursor-pointer'
                  }`}
                >
                  {isVerifying ? captcha.verifyingText : captcha.verifyButtonText}
                </button>
              </div>
              {justVerified && (
                <p className="text-xs text-primary/60 mt-3">{captcha.verifiedTip}</p>
              )}
              {error && (
                <p className="text-xs text-red-600 mt-3">{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Start Button */}
        {!captcha.enabled && (
          <div className="mt-16 w-full flex justify-center">
            <button
              onClick={onStart}
              className="bg-accent hover:bg-accent/90 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{content.landing.startButtonText}</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Decorative Ink Line */}
        <div className="mt-12 w-24 h-px bg-primary/10"></div>
      </main>

      {/* Footer Information */}
      <footer className="pb-12 px-4 text-center z-10">
        <p className="text-primary/40 text-xs tracking-widest font-light">
          {content.landing.footerNote}
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
