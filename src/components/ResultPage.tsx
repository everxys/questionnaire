import React from 'react';
import { motion } from 'motion/react';

interface ResultPageProps {
  onRestart: () => void;
}

export default function ResultPage({ onRestart }: ResultPageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen pb-24 bg-tea-white text-primary font-sans"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-tea-white/90 backdrop-blur-md px-4 py-4 flex items-center border-b border-primary/10">
        <button onClick={onRestart} aria-label="Go back" className="p-2 -ml-2 text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight font-serif">人格测试报告</h1>
        <div className="w-10"></div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Hero Match Card */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative">
            <img 
              alt="Emperor Qin Shi Huang Portrait" 
              className="w-full aspect-square object-cover object-top" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXU_IfTPFKNJWquNTcXL8wSZnv_tPVU_8RGte3fbB0ZitKDzeLtHAqr7EIIawUtsZlYFeay1rO2BFinClG4W_-jywjjLWnc5971xImF_rbCoRFZYemZVgeyU3uU93fvx1_KHxYOMkOGRwHPL7aR4g-_OLzi9SQsN3A7P4EsLyjrIhoziOHQM-c63yVKwhbJ2OXagSEP1yyD4FMTavwnYa79SYZh5qcUAP0WU5r2OoTqmKeMh3pSxV6lsm6jY1HveXUfh8Kzh3hN_x3"
            />
            <div className="absolute bottom-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              相似度 94%
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 font-serif">秦始皇 (嬴政)</h2>
            <p className="text-primary/80 text-sm italic mb-4">大一统中国的首位皇帝，以宏伟的愿景和坚定的意志著称于世。</p>
            <div className="bg-tea-white/50 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-sm leading-relaxed">
                你的性格与秦始皇高度相似。你拥有卓越的战略眼光和将混沌转化为秩序的铁腕意志。正如始皇帝一般，你不仅是在梦想未来，你是在用精准和权威构建未来。
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Comparison */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold px-1 border-l-4 border-accent ml-1 font-serif">详细对比</h3>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <h4 className="font-bold text-lg text-accent font-serif">性格对比分析</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-bold mb-1 flex items-center text-primary">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> 目标设定
                </h5>
                <p className="text-sm text-primary/90 leading-relaxed pl-4">
                  你拥有“大一统”的思维模式。在他人看到障碍的地方，你看到的是一个需要精简和掌控的大型系统组件。
                </p>
              </div>
              <div>
                <h5 className="font-bold mb-1 flex items-center text-primary">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> 执行力
                </h5>
                <p className="text-sm text-primary/90 leading-relaxed pl-4">
                  果断且高效。你更注重结果而非情感，确保项目以最优的速度向前推进。
                </p>
              </div>
              <div>
                <h5 className="font-bold mb-1 flex items-center text-primary">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span> 人才管理
                </h5>
                <p className="text-sm text-primary/90 leading-relaxed pl-4">
                  你信奉功绩制。像秦朝的法家理念一样，你欣赏清晰的架构、基于表现的奖励以及逻辑严密的层级。
                </p>
              </div>
            </div>
          </div>

          {/* Growth Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-lg text-accent mb-4 font-serif">可以学习的地方</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">1</div>
                <div>
                  <p className="font-bold text-sm">柔化沟通方式</p>
                  <p className="text-xs text-primary/70 mt-1">直率是优点，但融入同理心可以减少与合作伙伴之间不必要的摩擦。</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">2</div>
                <div>
                  <p className="font-bold text-sm">接受不完美的过程</p>
                  <p className="text-xs text-primary/70 mt-1">并非所有事物都需要达到“长城”级别的永久性。学会重视迭代的进步，而非即刻的完美。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other Similar Personalities */}
          <h4 className="font-bold text-lg text-accent mb-4 mt-6 font-serif">其他相似人格</h4>
          <div className="space-y-4">
            {/* Kangxi */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4">
              <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10">
                <img alt="康熙" className="w-full h-full object-cover" src="https://picsum.photos/seed/kangxi/200/200" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-primary">康熙</h5>
                  <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">相似度 88%</span>
                </div>
                <p className="text-[11px] text-primary/70 leading-tight">
                  你和康熙一样，有着超越年龄的沉稳和规划能力。你少年老成，善于从全局出发，把复杂的事情一件件理顺。
                </p>
              </div>
            </div>
            {/* Han Wudi */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4">
              <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10">
                <img alt="汉武帝" className="w-full h-full object-cover" src="https://picsum.photos/seed/hanwudi/200/200" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-primary">汉武帝</h5>
                  <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">相似度 70%</span>
                </div>
                <p className="text-[11px] text-primary/70 leading-tight">
                  你和汉武帝一样，是那个敢于说“我要”的人。你要开疆拓土，你要改变格局，你要让所有人看到你的能力。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personality Analysis */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold px-1 border-l-4 border-accent ml-1 font-serif">个人性格深度解析</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-primary/60 font-bold mb-1">你的性格类型</p>
              <h4 className="text-3xl font-bold text-primary font-serif">ENTJ - 指挥官</h4>
            </div>
            
            <div className="space-y-4">
              {[
                { label: '外向 (E)', value: 78, desc: '你从与人交流和推动事情中获得能量。' },
                { label: '直觉 (N)', value: 82, desc: '你看重未来的可能性，善于从宏观角度思考问题。' },
                { label: '思维 (T)', value: 86, desc: '你做决定时，逻辑和效率是第一位的。' },
                { label: '判断 (J)', value: 90, desc: '你喜欢有条不紊的生活和工作。' }
              ].map((item, idx) => (
                <div key={idx} className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.value}%` }}></div>
                  </div>
                  <p className="text-xs text-primary/70 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
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
          重新测试
        </button>
        <button className="flex-[1.5] py-3 px-4 rounded-full bg-accent text-white font-bold text-sm shadow-lg active:opacity-90 transition-opacity cursor-pointer">
          分享结果
        </button>
      </footer>
    </motion.div>
  );
}
