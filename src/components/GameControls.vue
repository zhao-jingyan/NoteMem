<template>
  <div class="flex flex-col items-center space-y-4">
    <button 
      v-if="!isListening"
      @click="onStart" 
      class="px-8 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition text-lg font-semibold"
    >
      点击开始 (开启麦克风)
    </button>
    <button 
      v-else
      @click="onStop" 
      class="px-8 py-3 bg-red-600 rounded-lg hover:bg-red-500 transition text-lg font-semibold"
    >
      停止
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isListening: boolean;
}>();

const emit = defineEmits<{
  start: [];
  stop: [];
}>();

const onStart = () => emit('start');
const onStop = () => emit('stop');
</script>

