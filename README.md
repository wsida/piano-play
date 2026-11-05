# 钢琴模拟器

基于 Vite 4、Vue 3（`<script setup>`）和 Tone.js 的单页钢琴模拟器，使用严格 TypeScript。

## 键盘模式

- **31 键中音区**：C3 – F♯5，适合电脑键盘快速演奏
- **88 键全键盘**：A0 – C8，标准三角钢琴音域

电脑按键始终映射中音区 31 键：`Z–M` 演奏 C3–B3，`Q–P` / `[` / `=` 演奏 C4–F♯5，空格为延音踏板。

## 本地运行

```bash
npm install
npm run dev
```

首次点击页面后会加载 Salamander 钢琴采样。
