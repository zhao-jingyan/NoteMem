import { GuitarString } from '../types';
import { noteToMidi } from './noteUtils';

// 标准吉他调弦 (E2, A2, D3, G3, B3, E4)
export const GUITAR_STRINGS: GuitarString[] = [
  { index: 0, name: "1弦 (E)", openNote: "E", openMidi: noteToMidi("E", 4) },
  { index: 1, name: "2弦 (B)", openNote: "B", openMidi: noteToMidi("B", 3) },
  { index: 2, name: "3弦 (G)", openNote: "G", openMidi: noteToMidi("G", 3) },
  { index: 3, name: "4弦 (D)", openNote: "D", openMidi: noteToMidi("D", 3) },
  { index: 4, name: "5弦 (A)", openNote: "A", openMidi: noteToMidi("A", 2) },
  { index: 5, name: "6弦 (E)", openNote: "E", openMidi: noteToMidi("E", 2) },
];

/**
 * 根据弦和品位计算 MIDI 编号
 */
export function getMidiFromStringAndFret(stringIndex: number, fret: number): number {
  const guitarString = GUITAR_STRINGS[stringIndex];
  return guitarString.openMidi + fret;
}

/**
 * 根据 MIDI 编号和弦索引计算品位
 */
export function getFretFromMidi(midi: number, stringIndex: number): number {
  const guitarString = GUITAR_STRINGS[stringIndex];
  return midi - guitarString.openMidi;
}

