## 2026-02-28

- 将问卷标题、问题、结果页文案抽离到 `src/config/content.json`
- 结果页人物改为配置驱动：按匹配度取 Top1 + 另外 2 位
- 新增 16 个 MBTI 角色库（每类 3 人），并在结果页按你的四维分数计算相似度（越低越像）后排序展示
- 相似度改为百分比（越高越像）：`100 - (|ΔE|+|ΔN|+|ΔT|+|ΔJ|)/4`
- 为了拉开 Top1/Top2/Top3 差距，新增 softmax 归一化“匹配度%”（不改人物库分数），可用 `matchSoftmaxTau` 调节：`src/config/content/result.json`
- 将 `src/config/content.json` 拆分为 3 份：`src/config/content/landing.json`、`src/config/content/questionnaire.json`、`src/config/content/result.json`
- 从 `C:\\Users\\Administrator\\Downloads\\性格测试.xlsx` 导入 16 型 × 3 人到 `src/personas/mbti/*.json`，并提供可重复导入脚本 `scripts/import_personas_from_xlsx.py`
- 问卷升级为 20 题版本（每维度 5 题，含反向题），计分改为 1–7 反向计分后取均值，再映射为 0–100 维度分数：`src/mbti/scoring.ts`
- 首页新增可选验证码门禁（用于付费后发码），可通过 `src/config/content/landing.json` 的 `captcha.enabled` 开关启用/关闭
- 修复验证码跨域：前端改走同源 `/api/captcha/verify`，开发环境由 Vite 代理到第三方；生产可用 `npm run start` 的 Express 代理
- 新增 16 个 MBTI 用例的自动化测试（断言 MBTI、主魂、匹配度与其他相似角色）：`npm run test:mbti`

## 2026-03-01

- 结果页新增“报告式”展示（主魂 + 深度解析 + 另外两位人物 + 四维雷达图 + 优势/成长功课），按匹配排序展示：`src/components/ResultPage.tsx`
- 结果页「四维雷达图」增加 SVG 视窗留白，避免维度文字被边框裁切：`src/components/ResultPage.tsx`
- 首页验证码「验证通过」提示仅在本次校验成功后展示，避免未校验就出现：`src/components/LandingPage.tsx`
- 清理未使用的全局成长建议文案（`result.detail.growthTitle/growthItems`），并让结果页兼容其缺省：`src/config/content/result.json`、`src/components/ResultPage.tsx`
- 新增 INTJ 文案数据库（按“主魂”人物区分版本），其余 MBTI 暂沿用旧结果页布局：`src/reports/mbti/INTJ.json`
 - 新增 INTP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/INTP.json`
 - 新增 ENTJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ENTJ.json`
 - 新增 ENTP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ENTP.json`
- 新增 INFJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/INFJ.json`
 - 新增 INFP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/INFP.json`
 - 新增 ENFJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ENFJ.json`
 - 新增 ENFP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ENFP.json`
 - 新增 ISTJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ISTJ.json`
 - 新增 ISFJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ISFJ.json`
 - 新增 ESFJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ESFJ.json`
 - 新增 ISTP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ISTP.json`
 - 新增 ESTP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ESTP.json`
 - 新增 ISFP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ISFP.json`
 - 新增 ESFP 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ESFP.json`
 - 新增 ESTJ 文案数据库（按“主魂”人物区分版本）：`src/reports/mbti/ESTJ.json`
 - 报告结果页支持每个“主魂版本”自定义四维解读文案：`src/components/ResultPage.tsx`

## 2026-03-02

- 修复生产环境验证码校验 404：Vercel 部署补齐同源 API（`/api/captchas/verify` + 兼容 `/api/captcha/verify`）转发到第三方 `/api/verify`：`api/captchas/verify.ts`、`api/captcha/verify.ts`
