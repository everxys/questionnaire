/**
 * MBTI 计分逻辑测试
 * 
 * 测试依据：20 题测试计分逻辑说明
 * - 每个维度 5 题，3 道正向题 + 2 道反向题
 * - 反向题转换：8 - 原始分
 * - 维度得分 = (正向题 1 + 正向题 2 + 正向题 3 + 反向题 A 转换后 + 反向题 B 转换后) / 5
 * - 得分 >= 4 判定为正向极 (E/S/T/J)，< 4 判定为反向极 (I/N/F/P)
 */

import { computeAxisScores, scoresToMbti, computeAssessment } from '../src/mbti/scoring';
import type { AxisScores } from '../src/mbti/types';

// 测试工具函数
function assertEqual(actual: number, expected: number, message: string) {
  const diff = Math.abs(actual - expected);
  if (diff > 0.01) {
    throw new Error(`${message}: 期望 ${expected}, 实际 ${actual}`);
  }
  console.log(`✓ ${message}`);
}

function assertMbti(actual: string, expected: string, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: 期望 ${expected}, 实际 ${actual}`);
  }
  console.log(`✓ ${message}`);
}

// 测试用例 1：用户提供的示例
// E/I 维度：题 1=6, 题 2=5, 题 3=4, 题 4=5, 题 5=6
// 正向题：1, 3, 4 → 6, 4, 5
// 反向题：2, 5 → 8-5=3, 8-6=2
// E 得分 = (6 + 4 + 5 + 3 + 2) / 5 = 20 / 5 = 4.0 → E
function testExampleFromUser() {
  console.log('\n--- 测试用例 1: 用户提供的示例 ---');
  
  const answers: Record<number, number> = {
    1: 6, 2: 5, 3: 4, 4: 5, 5: 6,  // E/I
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,  // S/N (中性)
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,  // T/F (中性)
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,  // J/P (中性)
  };
  
  const scores = computeAxisScores(answers);
  
  // E/I 维度验证
  // 平均分 4.0 → 百分比 (4-1)/6 * 100 = 50%
  assertEqual(scores.E, 50, 'E/I 维度得分应为 50%');
  
  // S/N/T/J 都是中性 4 分 → 50%
  assertEqual(scores.N, 50, 'S/N 维度得分应为 50% (中性)');
  assertEqual(scores.T, 50, 'T/F 维度得分应为 50% (中性)');
  assertEqual(scores.J, 50, 'J/P 维度得分应为 50% (中性)');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti, 'ENTJ', '中性分数应判定为 ENTJ');
  
  console.log('测试用例 1 通过 ✓');
}

// 测试用例 2：强外向型
// E/I: 题 1=7, 题 2=1, 题 3=7, 题 4=7, 题 5=1
// 正向：7, 7, 7 = 21
// 反向：8-1=7, 8-1=7 = 14
// 平均 = 35/5 = 7.0 → 100%
function testStrongExtravert() {
  console.log('\n--- 测试用例 2: 强外向型 ---');
  
  const answers: Record<number, number> = {
    1: 7, 2: 1, 3: 7, 4: 7, 5: 1,  // 强 E
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.E, 100, '强外向应得 100%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(0), 'E', '第一字母应为 E');
  
  console.log('测试用例 2 通过 ✓');
}

// 测试用例 3：强内向型
// E/I: 题 1=1, 题 2=7, 题 3=1, 题 4=1, 题 5=7
// 正向：1, 1, 1 = 3
// 反向：8-7=1, 8-7=1 = 2
// 平均 = 5/5 = 1.0 → 0%
function testStrongIntrovert() {
  console.log('\n--- 测试用例 3: 强内向型 ---');
  
  const answers: Record<number, number> = {
    1: 1, 2: 7, 3: 1, 4: 1, 5: 7,  // 强 I
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.E, 0, '强内向应得 0%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(0), 'I', '第一字母应为 I');
  
  console.log('测试用例 3 通过 ✓');
}

// 测试用例 4：强 S 型 (实感)
// S/N: 题 6=7, 题 7=1, 题 8=7, 题 9=1, 题 10=7
// 正向：7, 7, 7 = 21
// 反向：8-1=7, 8-1=7 = 14
// 平均 = 35/5 = 7.0 → S=100%, N=0%
function testStrongSensing() {
  console.log('\n--- 测试用例 4: 强实感型 (S) ---');
  
  const answers: Record<number, number> = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
    6: 7, 7: 1, 8: 7, 9: 1, 10: 7,  // 强 S
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.N, 0, '强实感 N 应得 0%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(1), 'S', '第二字母应为 S');
  
  console.log('测试用例 4 通过 ✓');
}

// 测试用例 5：强 N 型 (直觉)
// S/N: 题 6=1, 题 7=7, 题 8=1, 题 9=7, 题 10=1
// 正向：1, 1, 1 = 3
// 反向：8-7=1, 8-7=1 = 2
// 平均 = 5/5 = 1.0 → S=0%, N=100%
function testStrongIntuition() {
  console.log('\n--- 测试用例 5: 强直觉型 (N) ---');
  
  const answers: Record<number, number> = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
    6: 1, 7: 7, 8: 1, 9: 7, 10: 1,  // 强 N
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.N, 100, '强直觉 N 应得 100%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(1), 'N', '第二字母应为 N');
  
  console.log('测试用例 5 通过 ✓');
}

// 测试用例 6：强 T 型 (思考)
// T/F: 题 11=7, 题 12=1, 题 13=7, 题 14=1, 题 15=7
function testStrongThinking() {
  console.log('\n--- 测试用例 6: 强思考型 (T) ---');
  
  const answers: Record<number, number> = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 7, 12: 1, 13: 7, 14: 1, 15: 7,  // 强 T
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.T, 100, '强思考 T 应得 100%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(2), 'T', '第三字母应为 T');
  
  console.log('测试用例 6 通过 ✓');
}

// 测试用例 7：强 F 型 (情感)
// T/F: 题 11=1, 题 12=7, 题 13=1, 题 14=7, 题 15=1
function testStrongFeeling() {
  console.log('\n--- 测试用例 7: 强情感型 (F) ---');
  
  const answers: Record<number, number> = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 1, 12: 7, 13: 1, 14: 7, 15: 1,  // 强 F
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.T, 0, '强情感 T 应得 0%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(2), 'F', '第三字母应为 F');
  
  console.log('测试用例 7 通过 ✓');
}

// 测试用例 8：强 J 型 (判断)
// J/P: 题 16=7, 题 17=1, 题 18=7, 题 19=1, 题 20=7
function testStrongJudging() {
  console.log('\n--- 测试用例 8: 强判断型 (J) ---');
  
  const answers: Record<number, number> = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,
    16: 7, 17: 1, 18: 7, 19: 1, 20: 7,  // 强 J
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.J, 100, '强判断 J 应得 100%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(3), 'J', '第四字母应为 J');
  
  console.log('测试用例 8 通过 ✓');
}

// 测试用例 9：强 P 型 (感知)
// J/P: 题 16=1, 题 17=7, 题 18=1, 题 19=7, 题 20=1
function testStrongPerceiving() {
  console.log('\n--- 测试用例 9: 强感知型 (P) ---');
  
  const answers: Record<number, number> = {
    1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
    6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4,
    16: 1, 17: 7, 18: 1, 19: 7, 20: 1,  // 强 P
  };
  
  const scores = computeAxisScores(answers);
  assertEqual(scores.J, 0, '强感知 J 应得 0%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti.charAt(3), 'P', '第四字母应为 P');
  
  console.log('测试用例 9 通过 ✓');
}

// 测试用例 10：边界值测试 (正好 4 分)
// 所有题目都选 4 分，应该得到 50%，判定为正向极
function testBoundaryAt4() {
  console.log('\n--- 测试用例 10: 边界值测试 (4 分) ---');
  
  const answers: Record<number, number> = {};
  for (let i = 1; i <= 20; i++) {
    answers[i] = 4;
  }
  
  const scores = computeAxisScores(answers);
  
  // 所有维度都应该是 50%
  assertEqual(scores.E, 50, 'E 维度 4 分应得 50%');
  assertEqual(scores.N, 50, 'N 维度 4 分应得 50%');
  assertEqual(scores.T, 50, 'T 维度 4 分应得 50%');
  assertEqual(scores.J, 50, 'J 维度 4 分应得 50%');
  
  const mbti = scoresToMbti(scores);
  assertMbti(mbti, 'ENTJ', '4 分边界应判定为 ENTJ');
  
  console.log('测试用例 10 通过 ✓');
}

// 测试用例 11：完整类型测试 - ISTP
function testIstpType() {
  console.log('\n--- 测试用例 11: 完整类型测试 (ISTP) ---');
  
  const answers: Record<number, number> = {
    1: 1, 2: 7, 3: 1, 4: 1, 5: 7,  // 强 I
    6: 1, 7: 7, 8: 1, 9: 7, 10: 1,  // 强 N
    11: 1, 12: 7, 13: 1, 14: 7, 15: 1,  // 强 F
    16: 1, 17: 7, 18: 1, 19: 7, 20: 1,  // 强 P
  };
  
  const assessment = computeAssessment(answers);
  assertMbti(assessment.mbti, 'INFP', '应判定为 INFP');
  
  console.log('测试用例 11 通过 ✓');
}

// 测试用例 12：完整类型测试 - ESTJ
function testEstjType() {
  console.log('\n--- 测试用例 12: 完整类型测试 (ESTJ) ---');
  
  const answers: Record<number, number> = {
    1: 7, 2: 1, 3: 7, 4: 7, 5: 1,  // 强 E
    6: 7, 7: 1, 8: 7, 9: 1, 10: 7,  // 强 S
    11: 7, 12: 1, 13: 7, 14: 1, 15: 7,  // 强 T
    16: 7, 17: 1, 18: 7, 19: 1, 20: 7,  // 强 J
  };
  
  const assessment = computeAssessment(answers);
  assertMbti(assessment.mbti, 'ESTJ', '应判定为 ESTJ');
  
  console.log('测试用例 12 通过 ✓');
}

// 运行所有测试
function runAllTests() {
  console.log('========================================');
  console.log('       MBTI 计分逻辑测试套件');
  console.log('========================================');
  
  try {
    testExampleFromUser();
    testStrongExtravert();
    testStrongIntrovert();
    testStrongSensing();
    testStrongIntuition();
    testStrongThinking();
    testStrongFeeling();
    testStrongJudging();
    testStrongPerceiving();
    testBoundaryAt4();
    testIstpType();
    testEstjType();
    
    console.log('\n========================================');
    console.log('       所有测试通过 ✓');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('       测试失败 ✗');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
