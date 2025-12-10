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

/**
 * 将 MIDI 编号转换为频率
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * 获取音名的 MIDI 编号
 */
export function noteToMidi(note: string, octave: number): number {
  const noteIndex = NOTE_STRINGS.indexOf(note);
  if (noteIndex === -1) return 0;
  return (octave + 1) * 12 + noteIndex;
}

