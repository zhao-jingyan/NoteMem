<template>
  <div class="bg-gray-800 rounded-lg p-6 text-center">
    <div class="text-gray-400 text-sm mb-2">当前检测到的音</div>
    <div class="text-4xl font-bold text-green-400 mb-2">
      {{ currentNote.note }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { NoteInfo } from '../types';

defineProps<{
  currentNote: NoteInfo;
}>();
</script>

