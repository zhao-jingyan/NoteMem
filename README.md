# NoteMem

notemem 是一个吉他/贝斯训练软件，通过随机给定一个音名，要求用户在指定弦上演奏相应的音符，正确后进入下一题。

## 功能

- [ ] 随机生成一个音名
- [ ] 显示当前的弦和品位
- [ ] 显示当前的音符

通过声卡获取用户输入，对音高做平滑处理，可以做一个指板可视化的功能。

既然你选择了 Vue 3 + TypeScript + Vite，这是一个非常稳健且高效的组合。Vue 3 的 Composition API（组合式 API）非常适合用来封装音频逻辑和游戏状态，将复杂的逻辑从 UI 组件中剥离出来。

下面是一个专为 notemem 设计的项目架构蓝图，包含了目录结构、核心逻辑封装和可视化组件的实现思路。

1. 项目初始化

首先，使用 Vite 创建项目：

Bash
npm create vite@latest notemem -- --template vue-ts
cd notemem
npm install
# 推荐安装 TailwindCSS 用于快速布局（可选，但推荐）
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# 安装音频处理库（这里以 ml5 为例，也可以用 lighter 的 pitchfinder）
npm install ml5
2. 目录结构设计 (Project Structure)

我们采用 "逻辑与视图分离" 的架构。音频处理和游戏逻辑放在 composables（Hooks）中，纯数学计算放在 utils 中。

Plaintext
src/
├── assets/          # 静态资源
├── components/      # UI 组件
│   ├── Fretboard.vue      # 指板可视化核心组件 (SVG)
│   ├── PitchMonitor.vue   # 实时音高/调音表显示
│   └── GameControls.vue   # 开始/暂停/难度选择
├── composables/     # 组合式函数 (核心逻辑)
│   ├── useAudioContext.ts # 管理麦克风权限和 AudioContext
│   ├── usePitchDetector.ts# 音高检测 + 平滑算法
│   └── useGameLogic.ts    # 题目生成、判定逻辑
├── utils/           # 工具函数
│   ├── noteUtils.ts       # 频率转音名、MIDI转换算法
│   └── guitarData.ts      # 吉他弦、调弦数据定义
├── types/           # TS 类型定义
│   └── index.ts
├── App.vue
└── main.ts
3. 核心代码实现

A. 工具函数 (src/utils/noteUtils.ts)

这是最基础的物理层，处理频率到音名的数学转换。

TypeScript
// src/utils/noteUtils.ts

export const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * 将频率转换为 MIDI 音符编号
 * 公式: n = 69 + 12 * log2(f / 440)
 */
export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

/**
 * 从频率获取音名和误差
 */
export function getNoteFromFrequency(frequency: number) {
  const midiNum = frequencyToMidi(frequency);
  const noteIndex = Math.round(midiNum); // 最近的整数 MIDI 码
  const centsOff = Math.floor((midiNum - noteIndex) * 100); // 误差(音分)
  
  const noteName = NOTE_STRINGS[noteIndex % 12];
  const octave = Math.floor(noteIndex / 12) - 1;

  return {
    note: noteName,
    octave: octave,
    centsOff: centsOff, // 用于 UI 显示指针偏移
    frequency: frequency
  };
}
B. 音高检测 Composable (src/composables/usePitchDetector.ts)

这里封装了音频采集、ml5 调用以及平滑处理算法。

TypeScript
// src/composables/usePitchDetector.ts
import { ref, onUnmounted } from 'vue';
import ml5 from 'ml5';
import { getNoteFromFrequency } from '../utils/noteUtils';

export function usePitchDetector() {
  const audioContext = ref<AudioContext | null>(null);
  const isListening = ref(false);
  const currentFrequency = ref(0);
  const currentNote = ref({ note: '-', octave: 0, centsOff: 0 });
  
  // 平滑队列
  const bufferSize = 5;
  const frequencyBuffer: number[] = [];

  let pitchModel: any;
  let micStream: MediaStream | null = null;

  // 核心：平滑算法 (中值滤波 + 移动平均)
  const getSmoothedFrequency = (freq: number): number => {
    // 1. 过滤掉无效或过低的噪音
    if (!freq || freq < 60) return 0; // 吉他最低音 E2 约为 82Hz，贝斯需放宽到 40Hz

    frequencyBuffer.push(freq);
    if (frequencyBuffer.length > bufferSize) {
      frequencyBuffer.shift();
    }

    // 2. 中值滤波：排序后取中间值，消除突变噪点
    const sorted = [...frequencyBuffer].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return median;
  };

  const startListening = async () => {
    if (!navigator.mediaDevices) return;

    // 必须由用户手势触发
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // 初始化 ML5 Pitch Detection
    pitchModel = ml5.pitchDetection(
      './model/', // 需要下载 crepe 模型文件放到 public 目录
      audioContext.value, 
      micStream, 
      modelLoaded
    );
  };

  const modelLoaded = () => {
    console.log('Model Loaded!');
    isListening.value = true;
    getPitch();
  };

  const getPitch = () => {
    if (!isListening.value) return;

    pitchModel.getPitch((err: any, frequency: number) => {
      if (frequency) {
        // 应用平滑处理
        const smoothFreq = getSmoothedFrequency(frequency);
        currentFrequency.value = smoothFreq;
        
        // 转换数据供 UI 使用
        if (smoothFreq > 0) {
            currentNote.value = getNoteFromFrequency(smoothFreq);
        }
      }
      // 递归调用
      getPitch();
    });
  };

  const stopListening = () => {
    isListening.value = false;
    micStream?.getTracks().forEach(track => track.stop());
    audioContext.value?.close();
  };

  onUnmounted(() => {
    stopListening();
  });

  return {
    startListening,
    stopListening,
    isListening,
    currentNote, // 响应式数据，UI 直接绑定这个
    currentFrequency
  };
}
C. 指板组件 (src/components/Fretboard.vue)

使用 SVG 绘制，确保在不同屏幕尺寸下都能完美显示。

代码段
<template>
  <div class="w-full overflow-x-auto">
    <svg viewBox="0 0 1000 220" class="w-full h-auto bg-gray-900 rounded-lg shadow-xl">
      <g v-for="i in 12" :key="`fret-${i}`">
        <line 
          :x1="calcFretPos(i)" y1="10" 
          :x2="calcFretPos(i)" y2="210" 
          stroke="#888" stroke-width="2" 
        />
        <circle v-if="[3,5,7,9].includes(i)" :cx="calcFretCenter(i)" cy="110" r="5" fill="#555" />
        <g v-if="i === 12">
            <circle :cx="calcFretCenter(i)" cy="80" r="5" fill="#555" />
            <circle :cx="calcFretCenter(i)" cy="140" r="5" fill="#555" />
        </g>
      </g>

      <g v-for="(str, index) in 6" :key="`str-${index}`">
        <line 
          x1="0" :y1="stringY(index)" 
          x2="1000" :y2="stringY(index)" 
          :stroke="index === activeStringIndex ? '#eab308' : '#ccc'" 
          :stroke-width="1 + index * 0.5" 
          class="transition-colors duration-300"
        />
      </g>

      <circle 
        v-if="userDetectedFret >= 0"
        :cx="calcFretCenter(userDetectedFret)" 
        :cy="stringY(activeStringIndex)" 
        r="12" 
        fill="rgba(34, 197, 94, 0.8)"
        class="animate-pulse"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props 接收父组件的游戏状态
const props = defineProps<{
  activeStringIndex: number; // 当前题目指定的弦 (0-5)
  userDetectedFret: number;  // 用户当前弹到的品位 (-1 表示未检测到)
}>();

// 计算品位距离 (基于吉他 17.817 常数)
const calcFretPos = (n: number) => {
    const scaleLen = 1000;
    return scaleLen - (scaleLen / Math.pow(2, n / 12));
}

// 计算品位中间位置 (用于放圆点)
const calcFretCenter = (n: number) => {
    if (n === 0) return 10; // 空弦
    const prev = calcFretPos(n - 1);
    const curr = calcFretPos(n);
    return prev + (curr - prev) / 2;
}

const stringY = (index: number) => 30 + index * 30;
</script>
D. 主应用逻辑整合 (App.vue)

代码段
<template>
  <div class="min-h-screen bg-slate-800 text-white flex flex-col items-center p-8">
    <h1 class="text-3xl font-bold mb-8">NoteMem: Guitar Trainer</h1>

    <div class="mb-8 text-center" v-if="isListening">
      <div class="text-gray-400 text-lg">请在第 <span class="text-yellow-400 font-bold text-2xl">{{ targetString }}</span> 弦演奏</div>
      <div class="text-6xl font-bold mt-2 text-green-400">{{ targetNoteName }}</div>
    </div>

    <div class="w-full max-w-4xl mb-8">
      <Fretboard 
        :active-string-index="targetStringIndex"
        :user-detected-fret="calculatedFret" 
      />
    </div>

    <div class="h-16 flex items-center justify-center space-x-4">
      <div v-if="!isListening">
        <button 
          @click="start" 
          class="px-6 py-2 bg-blue-600 rounded hover:bg-blue-500 transition"
        >
          点击开始 (开启麦克风)
        </button>
      </div>
      <div v-else class="text-center">
        <p>当前听到: <span class="text-xl font-mono">{{ currentNote.note }}{{ currentNote.octave }}</span></p>
        <p class="text-sm text-gray-400">频率: {{ currentFrequency.toFixed(1) }} Hz</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePitchDetector } from './composables/usePitchDetector';
import Fretboard from './components/Fretboard.vue';

const { startListening, isListening, currentNote, currentFrequency } = usePitchDetector();

// 游戏状态
const targetStringIndex = ref(5); // 默认 6 弦 (E弦, 索引5)
const targetNoteName = ref('G');

// 开始逻辑
const start = async () => {
    await startListening();
    generateNextQuestion();
};

const generateNextQuestion = () => {
    // 这里写生成随机音符的逻辑
    // 简单示例：固定让弹 G
    targetNoteName.value = 'G';
};

// 计算逻辑：根据当前听到的音，反推在当前弦上的品位
const calculatedFret = computed(() => {
    // 这里需要根据 targetStringIndex 的空弦音，结合 currentNote 算出差值
    // 这是一个简化示例，实际需要完整的吉他音高映射表
    if (currentNote.value.note === '-') return -1;
    // ... 实际逻辑: (DetectedMidi - OpenStringMidi) = Fret
    return 3; // 假装算出来是 3 品
});

// 监听答案是否正确
watch(currentNote, (newNote) => {
    if (newNote.note === targetNoteName.value) {
        console.log("正确！准备下一题");
        // 这里可以加一个防抖，确保用户保持了 0.5s 才算对
    }
});
</script>
4. 接下来的开发建议

模型文件：如果使用 ml5.js，你需要去 GitHub 下载 crepe 模型的文件夹（model/），并将其放入 Vue 项目的 public/ 目录下，否则加载会失败。

Audio Context 策略：浏览器禁止自动播放音频或自动开启麦克风。一定要做一个显式的“开始”按钮来触发 audioContext.resume()。

贝斯支持：贝斯的频率很低（E1 约 41Hz），很多普通的 Pitch Detection 库在 60Hz 以下表现很差。如果这是你的重点，建议研究 AutoCorrelation (自相关) 算法的原生实现，而不是完全依赖通用的 ML 模型，或者寻找专门针对低频优化的 WASM 模块。

这个框架利用了 Vue 3 的响应式特性，让 UI 能够丝滑地跟随用户的演奏变化，非常适合这种交互式教学软件。