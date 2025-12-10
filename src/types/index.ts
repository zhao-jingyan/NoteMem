export interface NoteInfo {
  note: string;
  octave: number;
  centsOff: number;
  frequency: number;
}

export interface GuitarString {
  index: number;
  name: string;
  openNote: string;
  openMidi: number;
}

