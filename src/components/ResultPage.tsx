import React from 'react';
import { motion } from 'motion/react';
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
        <div className="relative">
          <img alt={topMatch.persona.name} className="w-full aspect-square object-cover object-top" src={topMatch.persona.imageUrl} />
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
  assessment,
  topMatch,
  otherMatches,
}: {
  onRestart: () => void;
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
          <div className="relative">
            <img
              alt={topMatch.persona.name}
              className="w-full aspect-square object-cover object-top"
              src={topMatch.persona.imageUrl}
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
                  <img alt={person.persona.name} className="w-full h-full object-cover" src={person.persona.imageUrl} />
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
        <button className="flex-[1.5] py-3 px-4 rounded-full bg-accent text-white font-bold text-sm shadow-lg active:opacity-90 transition-opacity cursor-pointer">
          {result.shareButtonText}
        </button>
      </footer>
    </motion.div>
  );
}

export default function ResultPage({ onRestart, assessment }: ResultPageProps) {
  const result = content.result;
  const personas = getPersonasForMbti(assessment.mbti);
  const ranked = rankPersonas(assessment, personas as Persona[], {
    softmaxTau: result.matchSoftmaxTau,
    otherSimilarCount: result.detail.otherSimilarCount,
  });
  const { top: topMatch, others: otherMatches } = pickTopAndOthers(ranked, result.detail.otherSimilarCount);

  const report = getMbtiReport(assessment.mbti);
  const variant = topMatch ? report?.mainByPersonaId?.[topMatch.persona.id] : null;

  if (topMatch && variant) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24 bg-tea-white text-primary font-sans">
        <Header onRestart={onRestart} />
        <ReportResultLayout assessment={assessment} topMatch={topMatch} otherMatches={otherMatches} variant={variant} />
        <footer className="fixed bottom-0 left-0 right-0 bg-tea-white/95 backdrop-blur-lg border-t border-primary/10 p-4 flex gap-4 max-w-md mx-auto">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-full border-2 border-primary text-primary font-bold text-sm active:bg-primary active:text-white transition-colors cursor-pointer"
          >
            {result.restartButtonText}
          </button>
          <button className="flex-[1.5] py-3 px-4 rounded-full bg-accent text-white font-bold text-sm shadow-lg active:opacity-90 transition-opacity cursor-pointer">
            {result.shareButtonText}
          </button>
        </footer>
      </motion.div>
    );
  }

  return <LegacyResultLayout onRestart={onRestart} assessment={assessment} topMatch={topMatch} otherMatches={otherMatches} />;
}
