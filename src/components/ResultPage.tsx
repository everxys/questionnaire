import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { content } from '../config/content';
import { formatTemplate } from '../utils/template';
import type { Persona, UserAssessment } from '../mbti/types';
import { getPersonasForMbti } from '../personas';
import { pickTopAndOthers, rankPersonas } from '../mbti/matching';
import { getMbtiReport } from '../reports';
import type { MbtiPersonaReportVariant, ReportItem, ReportOtherPersonaBlock } from '../reports/types';

interface ResultPageProps {
  onRestart: () => void;
  assessment: UserAssessment;
}

function Header({ onRestart }: { onRestart: () => void }) {
  const result = content.result;
  return (
    <header className="sticky top-0 z-50 bg-tea-white/90 backdrop-blur-md px-4 py-4 flex items-center border-b border-primary/10">
      <button onClick={onRestart} aria-label={result.backAriaLabel} className="p-2 -ml-2 text-primary">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 className="flex-1 text-center text-lg font-bold tracking-tight font-serif">{result.headerTitle}</h1>
      <div className="w-10"></div>
    </header>
  );
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

function createFallbackPosterPng(args: { mbti: string; personaName?: string; matchPercent?: number }): string {
  const w = 1080;
  const h = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#fff7f1');
  bg.addColorStop(1, '#ffffff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
  ctx.font = 'bold 56px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText('测评结果', 80, 150);

  ctx.fillStyle = 'rgba(20, 20, 20, 0.65)';
  ctx.font = '32px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText('轻心理 · 历史人格', 80, 210);

  ctx.fillStyle = 'rgba(212, 83, 83, 0.95)';
  ctx.font = 'bold 96px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(args.mbti, 80, 360);

  ctx.fillStyle = 'rgba(20, 20, 20, 0.75)';
  ctx.font = 'bold 52px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  const persona = args.personaName ? `最像你：${args.personaName}` : '最像你：—';
  ctx.fillText(persona, 80, 470);

  ctx.fillStyle = 'rgba(20, 20, 20, 0.55)';
  ctx.font = '36px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  if (typeof args.matchPercent === 'number') {
    ctx.fillText(`匹配度：${args.matchPercent}%`, 80, 545);
  }

  ctx.fillStyle = 'rgba(20, 20, 20, 0.35)';
  ctx.font = '28px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText('打开链接查看完整报告', 80, h - 120);
  ctx.fillText(typeof window !== 'undefined' ? window.location.origin : '', 80, h - 70);

  return canvas.toDataURL('image/png');
}

function ShareSheet({
  open,
  busy,
  hint,
  onClose,
  onShareWeChat,
  onSaveImage,
}: {
  open: boolean;
  busy: 'wechat' | 'image' | null;
  hint: string | null;
  onClose: () => void;
  onShareWeChat: () => void;
  onSaveImage: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          data-share-ui="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl p-5 border border-primary/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-primary/10 rounded-full mx-auto mb-4" />
            <h4 className="text-base font-bold text-primary text-center font-serif">分享你的结果</h4>
            <p className="text-xs text-primary/60 text-center mt-1">可分享到微信，或保存为图片</p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={onShareWeChat}
                disabled={busy !== null}
                className={`h-12 rounded-2xl font-bold text-sm border ${
                  busy !== null ? 'bg-gray-100 text-primary/40 border-primary/10 cursor-not-allowed' : 'bg-white text-primary border-primary/20 active:bg-primary/5'
                }`}
              >
                {busy === 'wechat' ? '处理中…' : '分享到微信'}
              </button>
              <button
                onClick={onSaveImage}
                disabled={busy !== null}
                className={`h-12 rounded-2xl font-bold text-sm ${
                  busy !== null ? 'bg-gray-200 text-white/70 cursor-not-allowed' : 'bg-accent text-white active:opacity-90'
                }`}
              >
                {busy === 'image' ? '生成中…' : '保存为截图'}
              </button>
            </div>

            {hint ? <p className="text-xs text-primary/60 mt-4 text-center">{hint}</p> : null}

            <button onClick={onClose} className="w-full h-11 mt-5 rounded-2xl bg-primary/5 text-primary font-bold text-sm active:bg-primary/10">
              取消
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PercentBar({ percent }: { percent: number }) {
  const blocks = 10;
  const filled = Math.max(0, Math.min(blocks, Math.round((percent / 100) * blocks)));
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" aria-label={`similarity ${percent}%`}>
        {Array.from({ length: blocks }).map((_, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`inline-block w-2.5 h-2.5 rounded-sm ${i < filled ? 'bg-accent' : 'bg-primary/10'}`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-accent">{percent}%</span>
    </div>
  );
}

function RadarDiamond({
  topLabel,
  rightLabel,
  bottomLabel,
  leftLabel,
  topPercent,
  rightPercent,
  bottomPercent,
  leftPercent,
}: {
  topLabel: string;
  rightLabel: string;
  bottomLabel: string;
  leftLabel: string;
  topPercent: number;
  rightPercent: number;
  bottomPercent: number;
  leftPercent: number;
}) {
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const padding = 56;

  const clamp = (v: number) => Math.max(0, Math.min(100, v)) / 100;
  const pt = (dx: number, dy: number, percent: number) => {
    const r = radius * clamp(percent);
    return `${center + dx * r},${center + dy * r}`;
  };

  const poly = [
    pt(0, -1, topPercent),
    pt(1, 0, rightPercent),
    pt(0, 1, bottomPercent),
    pt(-1, 0, leftPercent),
  ].join(' ');

  const grid = (scale: number) =>
    [
      `${center},${center - radius * scale}`,
      `${center + radius * scale},${center}`,
      `${center},${center + radius * scale}`,
      `${center - radius * scale},${center}`,
    ].join(' ');

  return (
    <svg
      viewBox={`${-padding} ${-padding} ${size + padding * 2} ${size + padding * 2}`}
      className="w-full max-w-[260px] mx-auto overflow-visible"
    >
      <polygon points={grid(1)} fill="none" stroke="rgba(20, 20, 20, 0.08)" strokeWidth="2" />
      <polygon points={grid(0.66)} fill="none" stroke="rgba(20, 20, 20, 0.06)" strokeWidth="2" />
      <polygon points={grid(0.33)} fill="none" stroke="rgba(20, 20, 20, 0.05)" strokeWidth="2" />
      <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(20, 20, 20, 0.06)" strokeWidth="2" />
      <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(20, 20, 20, 0.06)" strokeWidth="2" />
      <polygon points={poly} fill="rgba(212, 83, 83, 0.18)" stroke="rgba(212, 83, 83, 0.9)" strokeWidth="2" />

      <text x={center} y={center - radius - 12} textAnchor="middle" className="fill-primary/70 text-[12px] font-bold">
        {topLabel}
      </text>
      <text x={center + radius + 14} y={center + 4} textAnchor="middle" className="fill-primary/70 text-[12px] font-bold">
        {rightLabel}
      </text>
      <text x={center} y={center + radius + 24} textAnchor="middle" className="fill-primary/70 text-[12px] font-bold">
        {bottomLabel}
      </text>
      <text x={center - radius - 14} y={center + 4} textAnchor="middle" className="fill-primary/70 text-[12px] font-bold">
        {leftLabel}
      </text>
    </svg>
  );
}

function ReportItems({ items }: { items: ReportItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.title}>
          <h5 className="font-bold mb-1 flex items-center text-primary">
            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> {item.title}
          </h5>
          <div className="space-y-2 pl-4">
            {item.paragraphs.map((p) => (
              <p key={p} className="text-sm text-primary/90 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function findOtherBlock(variant: MbtiPersonaReportVariant, personaId: string): ReportOtherPersonaBlock | null {
  return variant.otherPersonas.find((p) => p.personaId === personaId) ?? null;
}

function axisDisplay(assessment: UserAssessment) {
  const result = content.result;
  const axes = Object.fromEntries(result.personality.axes.map((a) => [a.key, a])) as Record<
    'E' | 'N' | 'T' | 'J',
    (typeof result.personality.axes)[number]
  >;

  const [ei, sn, tf, jp] = assessment.mbti.split('') as ['E' | 'I', 'N' | 'S', 'T' | 'F', 'J' | 'P'];

  const eiPercent = ei === 'E' ? assessment.scores.E : 100 - assessment.scores.E;
  const snPercent = sn === 'N' ? assessment.scores.N : 100 - assessment.scores.N;
  const tfPercent = tf === 'T' ? assessment.scores.T : 100 - assessment.scores.T;
  const jpPercent = jp === 'J' ? assessment.scores.J : 100 - assessment.scores.J;

  return {
    ei: {
      label: ei === 'E' ? '外向 (E)' : '内向 (I)',
      percent: eiPercent,
      desc: ei === 'E' ? axes.E.highDesc : axes.E.lowDesc,
    },
    sn: {
      label: sn === 'N' ? '直觉 (N)' : '实感 (S)',
      percent: snPercent,
      desc: sn === 'N' ? axes.N.highDesc : axes.N.lowDesc,
    },
    tf: {
      label: tf === 'T' ? '思考 (T)' : '情感 (F)',
      percent: tfPercent,
      desc: tf === 'T' ? axes.T.highDesc : axes.T.lowDesc,
    },
    jp: {
      label: jp === 'J' ? '判断 (J)' : '知觉 (P)',
      percent: jpPercent,
      desc: jp === 'J' ? axes.J.highDesc : axes.J.lowDesc,
    },
  };
}

function ReportResultLayout({
  assessment,
  topMatch,
  otherMatches,
  variant,
}: {
  assessment: UserAssessment;
  topMatch: { persona: Persona; similarityPercent: number; matchPercent: number };
  otherMatches: { persona: Persona; similarityPercent: number; matchPercent: number }[];
  variant: MbtiPersonaReportVariant;
}) {
  const result = content.result;
  const report = getMbtiReport(assessment.mbti);
  const mbtiTitle = report ? `${report.type.code} ${report.type.nickname}` : assessment.mbti;
  const axes = axisDisplay(assessment);
  const otherRoleLabels = ['你的另一面', '异代知音'];

  return (
    <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-bold font-serif">你的人格类型：{mbtiTitle}</h2>
        {report?.type.rarity ? <p className="text-primary/70 text-sm italic">{report.type.rarity}</p> : null}
      </section>

      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* ✅ 修复：移除固定 aspect-square，改用 w-full + object-contain，图片完整显示 */}
        <div className="relative bg-[#f5f0eb] flex items-center justify-center">
          <img
            alt={topMatch.persona.name}
            className="w-full object-contain"
            style={{ maxHeight: '480px' }}
            src={topMatch.persona.imageUrl}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.getAttribute('data-retry')) {
                target.setAttribute('data-retry', 'true');
                target.src = topMatch.persona.imageUrl;
              }
            }}
          />
        </div>
        <div className="p-6 space-y-3">
          <p className="text-xs font-bold tracking-widest text-primary/60">第一部分：与你最相似的历史人物 · 主魂</p>
          <h3 className="text-2xl font-bold font-serif">
            【主魂 · 最像你】{topMatch.persona.name} · {variant.mainPersona.title.split('·')[1]?.trim() ?? ''}
          </h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-primary/70 font-bold">性格相似度</p>
            <PercentBar percent={topMatch.similarityPercent} />
          </div>
          {variant.mainPersona.tagline ? <p className="text-primary/80 text-sm italic">{variant.mainPersona.tagline}</p> : null}
          <div className="space-y-3 pt-2">
            {variant.mainPersona.bio.map((p) => (
              <p key={p} className="text-sm leading-relaxed text-primary/90">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <p className="text-xs font-bold tracking-widest text-primary/60">第二部分：深度解析——你的性格在主魂身上如何闪耀</p>

        <div className="space-y-4">
          <h4 className="font-bold text-lg text-accent font-serif">{variant.resonanceTitle}</h4>
          <ReportItems items={variant.resonance} />
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-lg text-accent font-serif">{variant.learningTitle}</h4>
          <ReportItems items={variant.learning} />
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <p className="text-xs font-bold tracking-widest text-primary/60">第三部分：{variant.otherTitle}</p>
        <div className="space-y-4">
          {otherMatches.map((person, index) => {
            const block = findOtherBlock(variant, person.persona.id);
            const roleLabel = otherRoleLabels[index] ?? '相似人格';
            return (
              <div key={person.persona.id} className="border border-primary/10 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-primary">
                      【{roleLabel}】{person.persona.name} · {block?.title.split('·')[1]?.trim() ?? ''}
                    </h5>
                    <p className="text-xs text-primary/70 mt-1 italic">{block?.tagline ?? person.persona.intro}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <PercentBar percent={person.similarityPercent} />
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  {(block?.paragraphs ?? [person.persona.analysis]).map((p) => (
                    <p key={p} className="text-sm text-primary/90 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {block?.resonancePoint ? (
                    <p className="text-sm text-primary/90 leading-relaxed">
                      <span className="font-bold">共鸣点：</span>
                      {block.resonancePoint}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <p className="text-xs font-bold tracking-widest text-primary/60">第四部分：你的性格画像</p>

        <div className="space-y-3">
          <h4 className="font-bold text-lg text-accent font-serif">四维雷达图</h4>
          <RadarDiamond
            topLabel={axes.ei.label}
            rightLabel={axes.sn.label}
            bottomLabel={axes.tf.label}
            leftLabel={axes.jp.label}
            topPercent={axes.ei.percent}
            rightPercent={axes.sn.percent}
            bottomPercent={axes.tf.percent}
            leftPercent={axes.jp.percent}
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-lg text-accent font-serif">维度深度解读</h4>
          <div className="space-y-3">
            {[
              { key: axes.ei.label, percent: axes.ei.percent, desc: variant.axisInsights?.ei ?? axes.ei.desc },
              { key: axes.sn.label, percent: axes.sn.percent, desc: variant.axisInsights?.sn ?? axes.sn.desc },
              { key: axes.tf.label, percent: axes.tf.percent, desc: variant.axisInsights?.tf ?? axes.tf.desc },
              { key: axes.jp.label, percent: axes.jp.percent, desc: variant.axisInsights?.jp ?? axes.jp.desc },
            ].map((item) => (
              <p key={item.key} className="text-sm text-primary/90 leading-relaxed">
                <span className="font-bold">{item.key} {item.percent}%</span>：{item.desc}
              </p>
            ))}
          </div>
        </div>

        {variant.strengths?.length ? (
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-accent font-serif">{variant.strengthsTitle ?? '你的性格优势'}</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-primary/90">
              {variant.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {variant.growth?.length ? (
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-accent font-serif">{variant.growthTitle ?? '你的成长功课'}</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-primary/90">
              {variant.growth.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!variant.growth?.length && result.detail.growthTitle && result.detail.growthItems?.length ? (
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-accent font-serif">{result.detail.growthTitle}</h4>
            <div className="space-y-4">
              {result.detail.growthItems.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-xs text-primary/70 mt-1">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function LegacyResultLayout({
  onRestart,
  onShare,
  assessment,
  topMatch,
  otherMatches,
}: {
  onRestart: () => void;
  onShare: () => void;
  assessment: UserAssessment;
  topMatch: { persona: Persona; similarityPercent: number; matchPercent: number } | null;
  otherMatches: { persona: Persona; similarityPercent: number; matchPercent: number }[];
}) {
  const result = content.result;

  if (!topMatch) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-tea-white text-primary font-sans">
        <Header onRestart={onRestart} />
        <main className="px-4 py-10 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-primary/80 text-sm">{result.emptyMessage}</p>
          </div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 bg-tea-white text-primary font-sans"
    >
      <Header onRestart={onRestart} />

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Hero Match Card */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* ✅ 修复：className（原代码误写为 class），改用 object-contain 完整显示图片 */}
          <div className="relative bg-[#f5f0eb] flex items-center justify-center">
            <img
              alt={topMatch.persona.name}
              className="w-full object-contain"
              style={{ maxHeight: '480px' }}
              src={topMatch.persona.imageUrl}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.getAttribute('data-retry')) {
                  target.setAttribute('data-retry', 'true');
                  target.src = topMatch.persona.imageUrl;
                }
              }}
            />
            <div className="absolute bottom-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {formatTemplate(result.matchTemplate, { percent: topMatch.matchPercent })}
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 font-serif">{topMatch.persona.name}</h2>
            <p className="text-primary/80 text-sm italic mb-4">{topMatch.persona.intro}</p>
            <p className="text-primary/50 text-xs mb-4">
              {formatTemplate(result.rawSimilarityTemplate, { percent: topMatch.similarityPercent })}
            </p>
            <div className="bg-tea-white/50 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-sm leading-relaxed">{topMatch.persona.analysis}</p>
            </div>
          </div>
        </section>

        {/* Detailed Comparison */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold px-1 border-l-4 border-accent ml-1 font-serif">
            {result.detail.title}
          </h3>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <h4 className="font-bold text-lg text-accent font-serif">
              {result.detail.analysisCardTitle}
            </h4>
            <div className="space-y-4">
              {result.personality.axes.map((axis) => {
                const userValue = assessment.scores[axis.key];
                const personaValue = topMatch.persona.scores[axis.key];
                const diff = Math.abs(userValue - personaValue);
                return (
                  <div key={axis.key}>
                    <h5 className="font-bold mb-1 flex items-center text-primary">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> {axis.label}
                    </h5>
                    <p className="text-sm text-primary/90 leading-relaxed pl-4">
                      {formatTemplate(result.detail.comparisonRowTemplate, {
                        user: userValue,
                        person: personaValue,
                        diff,
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Card */}
          {result.detail.growthTitle && result.detail.growthItems?.length ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-lg text-accent mb-4 font-serif">{result.detail.growthTitle}</h4>
              <div className="space-y-4">
                {result.detail.growthItems.map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.title}</p>
                      {item.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-xs text-primary/70 mt-1">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Other Similar Personalities */}
          <h4 className="font-bold text-lg text-accent mb-4 mt-6 font-serif">{result.detail.otherSimilarTitle}</h4>
          <div className="space-y-4">
            {otherMatches.map((person) => (
              <div key={person.persona.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4">
                <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10">
                  <img
                    alt={person.persona.name}
                    className="w-full h-full object-cover"
                    src={person.persona.imageUrl}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.getAttribute('data-retry')) {
                        target.setAttribute('data-retry', 'true');
                        target.src = person.persona.imageUrl;
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-primary">{person.persona.name}</h5>
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                      {formatTemplate(result.matchTemplate, { percent: person.matchPercent })}
                    </span>
                  </div>
                  <p className="text-[11px] text-primary/70 leading-tight">{person.persona.intro}</p>
                  <p className="text-[10px] text-primary/40 leading-tight mt-1">
                    {formatTemplate(result.rawSimilarityTemplate, { percent: person.similarityPercent })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personality Analysis */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold px-1 border-l-4 border-accent ml-1 font-serif">
            {result.personality.title}
          </h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-primary/60 font-bold mb-1">
                {result.personality.typeLabel}
              </p>
              <h4 className="text-3xl font-bold text-primary font-serif">
                {formatTemplate(result.personality.typeValueTemplate, { mbti: assessment.mbti })}
              </h4>
            </div>

            <div className="space-y-4">
              {result.personality.axes.map((axis) => {
                const value = assessment.scores[axis.key];
                const desc = value >= 50 ? axis.highDesc : axis.lowDesc;
                return (
                  <div key={axis.key} className="mb-6">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{axis.label}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }}></div>
                    </div>
                    <p className="text-xs text-primary/70 mt-2 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-tea-white/95 backdrop-blur-lg border-t border-primary/10 p-4 flex gap-4 max-w-md mx-auto">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-4 rounded-full border-2 border-primary text-primary font-bold text-sm active:bg-primary active:text-white transition-colors cursor-pointer"
        >
          {result.restartButtonText}
        </button>
        <button
          onClick={onShare}
          className="flex-[1.5] py-3 px-4 rounded-full bg-accent text-white font-bold text-sm shadow-lg active:opacity-90 transition-opacity cursor-pointer"
        >
          {result.shareButtonText}
        </button>
      </footer>
    </motion.div>
  );
}

export default function ResultPage({ onRestart, assessment }: ResultPageProps) {
  const result = content.result;
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState<'wechat' | 'image' | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);

  const personas = getPersonasForMbti(assessment.mbti);
  const ranked = rankPersonas(assessment, personas as Persona[], {
    softmaxTau: result.matchSoftmaxTau,
    otherSimilarCount: result.detail.otherSimilarCount,
  });
  const { top: topMatch, others: otherMatches } = pickTopAndOthers(ranked, result.detail.otherSimilarCount);

  const report = getMbtiReport(assessment.mbti);
  const variant = topMatch ? report?.mainByPersonaId?.[topMatch.persona.id] : null;

  const shareContext = useMemo(() => {
    return {
      mbti: assessment.mbti,
      personaName: topMatch?.persona.name,
      matchPercent: topMatch?.matchPercent,
    };
  }, [assessment.mbti, topMatch?.matchPercent, topMatch?.persona.name]);

  const openShare = () => {
    setShareHint(null);
    setShareOpen(true);
  };

  const handleShareWeChat = async () => {
    if (shareBusy) return;
    setShareBusy('wechat');
    setShareHint(null);
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const title = `我的测评结果：${shareContext.mbti}`;
      const text = shareContext.personaName
        ? `我的人格类型是 ${shareContext.mbti}，最像的历史人物是「${shareContext.personaName}」`
        : `我的人格类型是 ${shareContext.mbti}`;

      if ((navigator as any).share) {
        try {
          await (navigator as any).share({ title, text, url });
          setShareOpen(false);
          return;
        } catch {
          // fall through
        }
      }

      const ok = await copyToClipboard(url);
      setShareHint(ok ? '已复制链接：可在微信里粘贴发送/转发' : '当前浏览器不支持一键分享，请手动复制地址栏链接');
    } finally {
      setShareBusy(null);
    }
  };

  const handleSaveImage = async () => {
    if (shareBusy) return;
    setShareBusy('image');
    setShareHint('正在生成图片…');

    try {
      const node = captureRef.current;
      if (!node) {
        setShareHint('截图失败：未找到页面内容');
        return;
      }

      const { toPng } = await import('html-to-image');

      const baseFilter = (n: Node) => {
        const el = n as any;
        if (el?.dataset?.shareUi === 'true') return false;
        if (typeof el?.closest === 'function' && el.closest('[data-share-ui="true"]')) return false;
        return true;
      };

      const opts = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: baseFilter,
      } as const;

      let dataUrl: string | null = null;
      try {
        dataUrl = await toPng(node, opts);
      } catch {
        try {
          dataUrl = await toPng(node, {
            ...opts,
            filter: (n: Node) => baseFilter(n) && (n as any)?.nodeName !== 'IMG',
          });
          setShareHint('已生成截图（部分头像因跨域被忽略）');
        } catch {
          const fallback = createFallbackPosterPng(shareContext);
          dataUrl = fallback || null;
          setShareHint('已生成简版分享图（用于兼容跨域图片限制）');
        }
      }

      if (!dataUrl) {
        setShareHint('截图失败：请稍后重试');
        return;
      }

      downloadDataUrl(`result-${shareContext.mbti}.png`, dataUrl);
    } finally {
      setShareBusy(null);
    }
  };

  if (topMatch && variant) {
    return (
      <motion.div
        ref={captureRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pb-24 bg-tea-white text-primary font-sans"
      >
        <Header onRestart={onRestart} />
        <ReportResultLayout assessment={assessment} topMatch={topMatch} otherMatches={otherMatches} variant={variant} />
        <footer className="fixed bottom-0 left-0 right-0 bg-tea-white/95 backdrop-blur-lg border-t border-primary/10 p-4 flex gap-4 max-w-md mx-auto">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-full border-2 border-primary text-primary font-bold text-sm active:bg-primary active:text-white transition-colors cursor-pointer"
          >
            {result.restartButtonText}
          </button>
          <button
            onClick={openShare}
            className="flex-[1.5] py-3 px-4 rounded-full bg-accent text-white font-bold text-sm shadow-lg active:opacity-90 transition-opacity cursor-pointer"
          >
            {result.shareButtonText}
          </button>
        </footer>
        <ShareSheet
          open={shareOpen}
          busy={shareBusy}
          hint={shareHint}
          onClose={() => (shareBusy ? null : setShareOpen(false))}
          onShareWeChat={handleShareWeChat}
          onSaveImage={handleSaveImage}
        />
      </motion.div>
    );
  }

  return (
    <div ref={captureRef}>
      <LegacyResultLayout onRestart={onRestart} onShare={openShare} assessment={assessment} topMatch={topMatch} otherMatches={otherMatches} />
      <ShareSheet
        open={shareOpen}
        busy={shareBusy}
        hint={shareHint}
        onClose={() => (shareBusy ? null : setShareOpen(false))}
        onShareWeChat={handleShareWeChat}
        onSaveImage={handleSaveImage}
      />
    </div>
  );
}