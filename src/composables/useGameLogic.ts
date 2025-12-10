import { ref } from 'vue';
import { NOTE_STRINGS } from '../utils/noteUtils';
import { getFretFromMidi } from '../utils/guitarData';
import { noteToMidi } from '../utils/noteUtils';
import { NoteInfo } from '../types';

export function useGameLogic() {
  const targetStringIndex = ref(5); // 默认 6 弦 (E弦, 索引5)
  const targetNoteName = ref('G');
  const isCorrect = ref(false);
  const correctDuration = ref(0);
  const requiredCorrectDuration = 500; // 需要保持正确 500ms

  // 生成随机题目
  const generateNextQuestion = () => {
    // 先重置状态
    isCorrect.value = false;
    correctDuration.value = 0;
    
    // 随机选择一根弦
    targetStringIndex.value = Math.floor(Math.random() * 6);
    
    // 随机选择一个音名
    const randomNoteIndex = Math.floor(Math.random() * NOTE_STRINGS.length);
    targetNoteName.value = NOTE_STRINGS[randomNoteIndex];
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
    generateNextQuestion,
    checkAnswer,
    calculateDetectedFret
  };
}

