<template>
  <div class="min-h-screen bg-slate-800 text-white flex flex-col items-center p-8">
    <h1 class="text-3xl font-bold mb-8">NoteMem: Guitar Trainer</h1>

    <div class="mb-8 text-center" v-if="isListening">
      <div class="text-gray-400 text-lg mb-2">
        请在第 <span class="text-yellow-400 font-bold text-2xl">{{ targetString }}</span> 弦演奏
      </div>
      <div class="text-6xl font-bold mt-2 text-green-400">{{ targetNoteName }}{{ targetOctave }}</div>
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
      @next-question="handleNextQuestion"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePitchDetector } from './composables/usePitchDetector';
import { useGameLogic } from './composables/useGameLogic';
import { GUITAR_STRINGS } from './utils/guitarData';
import Fretboard from './components/Fretboard.vue';
import PitchMonitor from './components/PitchMonitor.vue';
import GameControls from './components/GameControls.vue';

const { startListening, stopListening, isListening, currentNote, currentFrequency } = usePitchDetector();
const { 
  targetStringIndex, 
  targetNoteName, 
  targetOctave,
  isCorrect,
  generateNextQuestion, 
  checkAnswer, 
  calculateDetectedFret 
} = useGameLogic();

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
  stopListening();
};

const handleNextQuestion = () => {
  generateNextQuestion();
};

// 监听答案是否正确
watch(currentNote, (newNote) => {
  if (isListening.value) {
    const correct = checkAnswer(newNote);
    if (correct && !isCorrect.value) {
      // 延迟一下再进入下一题，让用户看到反馈
      setTimeout(() => {
        if (isCorrect.value) {
          generateNextQuestion();
        }
      }, 1000);
    }
  }
}, { deep: true });
</script>

