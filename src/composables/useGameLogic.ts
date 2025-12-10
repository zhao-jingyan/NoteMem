import { ref } from 'vue';
import { NOTE_STRINGS } from '../utils/noteUtils';
import { GUITAR_STRINGS, getFretFromMidi } from '../utils/guitarData';
import { noteToMidi } from '../utils/noteUtils';
import { NoteInfo } from '../types';

export function useGameLogic() {
  const targetStringIndex = ref(5); // 默认 6 弦 (E弦, 索引5)
  const targetNoteName = ref('G');
  const targetOctave = ref(3);
  const isCorrect = ref(false);
  const correctDuration = ref(0);
  const requiredCorrectDuration = 500; // 需要保持正确 500ms

  // 生成随机题目
  const generateNextQuestion = () => {
    // 随机选择一根弦
    targetStringIndex.value = Math.floor(Math.random() * 6);
    
    // 随机选择一个音名
    const randomNoteIndex = Math.floor(Math.random() * NOTE_STRINGS.length);
    targetNoteName.value = NOTE_STRINGS[randomNoteIndex];
    
    // 根据弦和可能的品位范围确定八度
    const string = GUITAR_STRINGS[targetStringIndex.value];
    const openMidi = string.openMidi;
    const randomFret = Math.floor(Math.random() * 12) + 1; // 1-12品
    const targetMidi = openMidi + randomFret;
    targetOctave.value = Math.floor(targetMidi / 12) - 1;
    
    isCorrect.value = false;
    correctDuration.value = 0;
  };

  // 检查答案是否正确
  const checkAnswer = (currentNote: NoteInfo) => {
    if (currentNote.note === '-' || !currentNote.frequency) {
      isCorrect.value = false;
      correctDuration.value = 0;
      return false;
    }

    const targetMidi = noteToMidi(targetNoteName.value, targetOctave.value);
    const currentMidi = noteToMidi(currentNote.note, currentNote.octave);
    
    // 允许一个半音的误差（考虑调音不准确）
    const midiDiff = Math.abs(targetMidi - currentMidi);
    
    if (midiDiff <= 1) {
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
    targetOctave,
    isCorrect,
    generateNextQuestion,
    checkAnswer,
    calculateDetectedFret
  };
}

