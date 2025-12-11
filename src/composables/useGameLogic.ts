import { ref } from 'vue';
import { getFretFromMidi } from '../utils/guitarData';
import { noteToMidi } from '../utils/noteUtils';
import { NoteInfo } from '../types';
import { ALL_NOTES } from '../utils/scaleUtils';

export function useGameLogic() {
  const targetStringIndex = ref(5); // 默认 6 弦 (E弦, 索引5)
  const targetNoteName = ref('G');
  const isCorrect = ref(false);
  const correctDuration = ref(0);
  const requiredCorrectDuration = 500; // 需要保持正确 500ms

  // 筛选条件：可用的音符列表（默认所有音符）
  const availableNotes = ref<string[]>(ALL_NOTES.notes);
  
  // 筛选条件：可用的琴弦索引（null 表示所有琴弦，否则是具体索引）
  const availableStringIndex = ref<number | null>(null);

  // 设置可用的音符列表（根据调式筛选）
  const setAvailableNotes = (notes: string[]) => {
    availableNotes.value = notes;
  };

  // 设置可用的琴弦索引（null 表示所有琴弦）
  const setAvailableStringIndex = (stringIndex: number | null) => {
    availableStringIndex.value = stringIndex;
  };

  // 生成随机题目（根据筛选条件）
  const generateNextQuestion = () => {
    // 先重置状态
    isCorrect.value = false;
    correctDuration.value = 0;
    
    // 根据筛选条件选择琴弦
    if (availableStringIndex.value !== null) {
      // 如果指定了特定琴弦，使用该琴弦
      targetStringIndex.value = availableStringIndex.value;
    } else {
      // 否则随机选择一根弦
      targetStringIndex.value = Math.floor(Math.random() * 6);
    }
    
    // 根据筛选条件选择音符（从可用音符列表中随机选择）
    if (availableNotes.value.length > 0) {
      const randomNoteIndex = Math.floor(Math.random() * availableNotes.value.length);
      targetNoteName.value = availableNotes.value[randomNoteIndex];
    } else {
      // 如果没有可用音符，使用默认值（理论上不应该发生）
      targetNoteName.value = 'C';
    }
  };

  // 检查答案是否正确（只比较音名，不比较八度）
  const checkAnswer = (currentNote: NoteInfo) => {
    if (currentNote.note === '-' || !currentNote.frequency) {
      isCorrect.value = false;
      correctDuration.value = 0;
      return false;
    }

    // 只比较音名，忽略八度
    if (currentNote.note === targetNoteName.value) {
      correctDuration.value += 16; // 假设每帧约16ms
      if (correctDuration.value >= requiredCorrectDuration) {
        isCorrect.value = true;
        return true;
      }
    } else {
      isCorrect.value = false;
      correctDuration.value = 0;
    }
    
    return false;
  };

  // 计算用户当前弹到的品位
  const calculateDetectedFret = (currentNote: NoteInfo): number => {
    if (currentNote.note === '-' || !currentNote.frequency) {
      return -1;
    }

    const currentMidi = noteToMidi(currentNote.note, currentNote.octave);
    const fret = getFretFromMidi(currentMidi, targetStringIndex.value);
    
    // 只显示合理的品位范围 (0-24品)
    if (fret >= 0 && fret <= 24) {
      return fret;
    }
    
    return -1;
  };

  return {
    targetStringIndex,
    targetNoteName,
    isCorrect,
    availableNotes,
    availableStringIndex,
    setAvailableNotes,
    setAvailableStringIndex,
    generateNextQuestion,
    checkAnswer,
    calculateDetectedFret
  };
}

