<template>
  <div class="min-h-screen bg-slate-800 text-white flex flex-col items-center p-8">
    <h1 class="text-3xl font-bold mb-8">NoteMem: Guitar Trainer</h1>

    <!-- 筛选器组件 -->
    <div class="w-full max-w-2xl mb-8">
      <FilterControls 
        :is-listening="isListening"
        :selected-scale-name="selectedScaleName"
        :selected-string-index="selectedStringIndex"
        @scale-change="handleScaleChange"
        @string-change="handleStringChange"
      />
    </div>

    <div class="mb-8 text-center" v-if="isListening">
      <div class="text-gray-400 text-lg mb-2">
        请在第 <span class="text-yellow-400 font-bold text-2xl">{{ targetString }}</span> 弦演奏
      </div>
      <div class="text-6xl font-bold mt-2 text-green-400">{{ targetNoteName }}</div>
      <div v-if="isCorrect" class="mt-4 text-2xl text-green-500 animate-pulse">
        ✓ 正确！准备下一题...
      </div>
    </div>

    <div class="w-full max-w-4xl mb-8">
      <Fretboard 
        :active-string-index="targetStringIndex"
        :user-detected-fret="calculatedFret" 
      />
    </div>

    <div class="w-full max-w-md mb-8">
      <PitchMonitor 
        :current-note="currentNote"
        :current-frequency="currentFrequency"
      />
    </div>

    <GameControls 
      :is-listening="isListening"
      @start="start"
      @stop="stop"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { usePitchDetector } from './composables/usePitchDetector';
import { useGameLogic } from './composables/useGameLogic';
import { GUITAR_STRINGS } from './utils/guitarData';
import { NoteInfo } from './types';
import Fretboard from './components/Fretboard.vue';
import PitchMonitor from './components/PitchMonitor.vue';
import GameControls from './components/GameControls.vue';
import FilterControls from './components/FilterControls.vue';
import { ALL_NOTES } from './utils/scaleUtils';

const { startListening, stopListening, isListening, currentNote, currentFrequency } = usePitchDetector();
const { 
  targetStringIndex, 
  targetNoteName, 
  isCorrect,
  setAvailableNotes,
  setAvailableStringIndex,
  generateNextQuestion, 
  checkAnswer, 
  calculateDetectedFret 
} = useGameLogic();

// 筛选器状态
const selectedScaleName = ref(ALL_NOTES.name);
const selectedStringIndex = ref<number | null>(null);

// 处理调式变化
const handleScaleChange = (scaleName: string, notes: string[]) => {
  selectedScaleName.value = scaleName;
  setAvailableNotes(notes);
};

// 处理琴弦变化
const handleStringChange = (stringIndex: number | null) => {
  selectedStringIndex.value = stringIndex;
  setAvailableStringIndex(stringIndex);
};

// 用于跟踪自动跳转的定时器
let autoNextTimer: ReturnType<typeof setTimeout> | null = null;

// 计算逻辑：根据当前听到的音，反推在当前弦上的品位
const calculatedFret = computed(() => {
  return calculateDetectedFret(currentNote.value);
});

// 显示目标弦名称
const targetString = computed(() => {
  return GUITAR_STRINGS[targetStringIndex.value].name;
});

// 开始逻辑
const start = async () => {
  try {
    await startListening();
    generateNextQuestion();
  } catch (error) {
    console.error('启动失败:', error);
    alert('无法访问麦克风，请检查权限设置');
  }
};

const stop = () => {
  // 清除自动跳转定时器
  if (autoNextTimer) {
    clearTimeout(autoNextTimer);
    autoNextTimer = null;
  }
  stopListening();
};

// 监听答案是否正确
watch(currentNote, (newNote: NoteInfo) => {
  if (isListening.value) {
    checkAnswer(newNote);
  }
}, { deep: true });

// 监听 isCorrect 状态变化，当答案正确时自动跳转
watch(isCorrect, (newValue: boolean) => {
  if (newValue && isListening.value) {
    // 清除之前的定时器（如果存在）
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
    }
    // 延迟一下再进入下一题，让用户看到反馈
    autoNextTimer = setTimeout(() => {
      if (isCorrect.value && isListening.value) {
        generateNextQuestion();
        autoNextTimer = null;
      }
    }, 500);
  }
});
</script>

