<template>
  <div class="w-full max-w-2xl bg-slate-700 rounded-lg p-6 shadow-lg">
    <h2 class="text-xl font-bold mb-4 text-center">筛选设置</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 调式选择 -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-gray-300">
          调式选择
        </label>
        <select 
          v-model="selectedScaleName"
          @change="onScaleChange"
          class="w-full px-4 py-2 bg-slate-600 rounded-lg border border-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isListening"
        >
          <option :value="allNotes.name">{{ allNotes.name }}</option>
          <optgroup label="大调 (Major)">
            <option 
              v-for="scale in majorScales" 
              :key="scale.name" 
              :value="scale.name"
            >
              {{ scale.name }}
            </option>
          </optgroup>
          <optgroup label="小调 (Minor)">
            <option 
              v-for="scale in minorScales" 
              :key="scale.name" 
              :value="scale.name"
            >
              {{ scale.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- 琴弦选择 -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-gray-300">
          琴弦选择
        </label>
        <select 
          v-model="selectedStringIndex"
          @change="onStringChange"
          class="w-full px-4 py-2 bg-slate-600 rounded-lg border border-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isListening"
        >
          <option value="-1">所有琴弦</option>
          <option 
            v-for="string in guitarStrings" 
            :key="string.index" 
            :value="string.index"
          >
            {{ string.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ALL_MAJOR_SCALES, ALL_MINOR_SCALES, ALL_NOTES } from '../utils/scaleUtils';
import { GUITAR_STRINGS } from '../utils/guitarData';

const props = defineProps<{
  isListening: boolean;
  selectedScaleName?: string;
  selectedStringIndex?: number | null;
}>();

const emit = defineEmits<{
  'scale-change': [scaleName: string, notes: string[]];
  'string-change': [stringIndex: number | null];
}>();

const allNotes = ALL_NOTES;
const majorScales = ALL_MAJOR_SCALES;
const minorScales = ALL_MINOR_SCALES;
const guitarStrings = GUITAR_STRINGS;

// 所有调式的扁平列表（用于查找）
const allScales = [ALL_NOTES, ...ALL_MAJOR_SCALES, ...ALL_MINOR_SCALES];

const selectedScaleName = ref(props.selectedScaleName || ALL_NOTES.name);
const selectedStringIndex = ref(props.selectedStringIndex ?? -1);

// 将 null/undefined 转换为 -1（用于内部状态，-1 表示"所有琴弦"）
const normalizeStringIndex = (value: number | null | undefined): number => {
  return value ?? -1;
};

const onScaleChange = () => {
  const selectedScale = allScales.find(s => s.name === selectedScaleName.value) || ALL_NOTES;
  emit('scale-change', selectedScale.name, selectedScale.notes);
};

const onStringChange = () => {
  const stringIndex = selectedStringIndex.value === -1 ? null : selectedStringIndex.value;
  emit('string-change', stringIndex);
};

// 监听外部传入的值变化
watch(() => props.selectedScaleName, (newVal) => {
  if (newVal && newVal !== selectedScaleName.value) {
    selectedScaleName.value = newVal;
  }
});

watch(() => props.selectedStringIndex, (newVal) => {
  const normalized = normalizeStringIndex(newVal);
  if (normalized !== selectedStringIndex.value) {
    selectedStringIndex.value = normalized;
  }
});

// 组件挂载时初始化筛选条件
onMounted(() => {
  onScaleChange();
  onStringChange();
});
</script>

