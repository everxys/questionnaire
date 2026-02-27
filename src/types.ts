export type Page = 'landing' | 'questionnaire' | 'result';

export interface Question {
  id: number;
  text: string;
}

export const QUESTIONS: Question[] = [
  { id: 1, text: "您对目前的工作环境和团队氛围感到满意吗？" },
  { id: 2, text: "在面对重大决策时，您倾向于依赖直觉还是数据分析？" },
  { id: 3, text: "您是否认为为了长远目标，牺牲短期利益是值得的？" },
  { id: 4, text: "在团队合作中，您更倾向于担任领导者还是执行者？" },
  { id: 5, text: "您如何看待规则？是必须严格遵守的铁律，还是可以灵活变通的指南？" },
  { id: 6, text: "当遇到挫折时，您是倾向于反思自己还是指责环境？" },
  { id: 7, text: "您是否享受在公众面前演讲或表达自己的观点？" },
  { id: 8, text: "对于历史，您更关注宏大的叙事还是个人的命运？" },
  { id: 9, text: "您认为一个人的成功主要取决于天赋还是努力？" },
  { id: 10, text: "在人际交往中，您更看重真诚还是礼貌？" },
  { id: 11, text: "您是否愿意为了维护自己的原则而得罪他人？" },
  { id: 12, text: "您对未来充满信心，还是常常感到焦虑？" },
];
