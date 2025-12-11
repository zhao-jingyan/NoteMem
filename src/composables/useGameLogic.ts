import { ref } from 'vue';
import { getFretFromMidi } from '../utils/guitarData';
import { noteToMidi } from '../utils/noteUtils';
import { NoteInfo } from '../types';
import { ALL_NOTES } from '../utils/scaleUtils';

export function useGameLogic() {
  const targetStringIndex = ref(5); // 默认 6 弦 (E弦, 索引5)
  const targetNoteName = ref('G');
  const isCorrect = ref(false);
  const correctStartTime = ref<number | null>(null); // 音高开始正确的时间戳
  const requiredCorrectDuration = 100; // 需要保持正确 100ms 才能判定为正确

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
    correctStartTime.value = null;
    
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
  // 需要音高持续正确 100ms 才能判定为正确，避免误触
  const checkAnswer = (currentNote: NoteInfo) => {
    // 如果已经判定为正确，保持状态不变（避免在等待期间因为音高变化而重置）
    if (isCorrect.value) {
      return true;
    }

    if (currentNote.note === '-' || !currentNote.frequency) {
      // 音高无效，重置计时
      correctStartTime.value = null;
      return false;
    }

    const now = Date.now();

    // 只比较音名，忽略八度
    if (currentNote.note === targetNoteName.value) {
      // 音高正确
      if (correctStartTime.value === null) {
        // 开始计时
        correctStartTime.value = now;
      } else {
        // 检查持续时间是否达到要求
        const duration = now - correctStartTime.value;
        if (duration >= requiredCorrectDuration) {
          isCorrect.value = true;
          return true;
        }
      }
    } else {
      // 音高不正确，重置计时
      correctStartTime.value = null;
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

