# NoteMem - 吉他/贝斯音名记忆训练器

🌐 **在线体验**：[https://zhao-jingyan.github.io/NoteMem/](https://zhao-jingyan.github.io/NoteMem/)

一个基于 Web 的交互式吉他/贝斯训练应用，通过实时音高检测帮助乐手练习指板位置和音名记忆。

> Note: 项目通过 vibe coding 实现，可能存在一些问题，欢迎提 issue。

## 🎸 项目简介

NoteMem 是一个智能音乐训练工具，通过随机生成音名题目，要求用户在指定弦上演奏相应的音符。应用会实时检测你演奏的音高，并在指板上可视化显示位置，答对后自动进入下一题。

## ✨ 核心功能

- **🎯 随机题目生成**：随机指定弦和音名，训练指板记忆
- **🎤 实时音高检测**：使用 YIN 算法进行高精度音高识别
- **📊 指板可视化**：SVG 绘制的指板，实时显示当前演奏位置
- **🎵 音高监控**：实时显示检测到的音符和频率
- **🔄 自动跳转**：答对后自动进入下一题
- **🎚️ 音频处理**：内置增益控制和 Gate 降噪算法

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **开发语言**：TypeScript
- **构建工具**：Vite
- **样式框架**：TailwindCSS
- **音高检测**：pitchfinder (YIN 算法)
- **音频处理**：Web Audio API

## 📁 项目结构

```text
src/
├── components/          # UI 组件
│   ├── Fretboard.vue   # 指板可视化组件
│   ├── PitchMonitor.vue # 音高监控显示
│   └── GameControls.vue # 游戏控制按钮
├── composables/        # 组合式函数（核心逻辑）
│   ├── useAudioContext.ts    # 音频上下文管理
│   ├── usePitchDetector.ts   # 音高检测与平滑处理
│   └── useGameLogic.ts       # 游戏逻辑（题目生成、答案判定）
├── utils/              # 工具函数
│   ├── noteUtils.ts    # 频率转音名、MIDI 转换算法
│   └── guitarData.ts   # 吉他弦、调弦数据定义
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.vue            # 主应用组件
└── main.ts            # 应用入口
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（端口可能不同，请查看终端输出）。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 📖 使用说明

1. **启动应用**：运行 `npm run dev` 后，在浏览器中打开应用
2. **授权麦克风**：点击"点击开始"按钮，浏览器会请求麦克风权限，请允许
3. **开始训练**：
   - 应用会随机生成一个题目（例如：在第 6 弦演奏 G）
   - 在指板上找到对应位置并演奏
   - 应用会实时检测你的音高并在指板上显示位置
   - 保持正确音高 500ms 后自动进入下一题
4. **停止训练**：点击"停止"按钮结束训练

## 🎯 核心算法

### 音高检测

- 使用 **YIN 算法**（pitchfinder 库）进行音高检测
- 支持频率范围：40Hz - 2000Hz（覆盖贝斯和吉他全音域）
- 无需下载模型文件，开箱即用

### 平滑处理

- **中值滤波**：消除突变噪点
- **移动平均**：使用 5 帧缓冲区平滑频率数据
- **Gate 降噪**：基于音量阈值过滤背景噪音

### 音频增强

- **增益控制**：3 倍增益提升，提高检测灵敏度
- **Gate 保持**：音量低于阈值后保持 100ms 输出，避免音符突然消失

## ⚙️ 配置说明

### 音频参数

在 `src/composables/usePitchDetector.ts` 中可以调整以下参数：

- `GAIN_VALUE`：增益倍数（默认 3.0）
- `GATE_THRESHOLD`：音量阈值（默认 0.01）
- `GATE_HOLD_TIME`：Gate 保持时间（默认 100ms）
- `bufferSize`：平滑缓冲区大小（默认 5）

### 判定参数

在 `src/composables/useGameLogic.ts` 中可以调整：

- `requiredCorrectDuration`：需要保持正确的时间（默认 500ms）

## ⚠️ 注意事项

1. **浏览器权限**：应用需要麦克风访问权限，请确保浏览器已授权
2. **HTTPS 要求**：某些浏览器要求 HTTPS 才能访问麦克风（本地开发 localhost 除外）
3. **环境噪音**：建议在安静环境中使用，以获得最佳检测效果
4. **浏览器兼容性**：推荐使用 Chrome、Edge 或 Firefox 最新版本

## 🔧 开发说明

### 代码架构

项目采用 **逻辑与视图分离** 的架构：

- **Composables**：封装音频处理和游戏逻辑，可复用
- **Components**：纯 UI 组件，通过 props 接收数据
- **Utils**：纯函数工具，处理数学计算和数据转换

## 📝 许可证

MIT License

## 🙏 致谢

- [pitchfinder](https://github.com/peterkhayes/pitchfinder) - 优秀的音高检测库
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

**享受你的音乐训练之旅！** 🎵
