// 调式定义：大调和小调的音阶
export interface Scale {
  name: string;
  notes: string[];
  category?: 'major' | 'minor'; // 用于分类
}

/**
 * 将降号表示的音符转换为升号表示（统一使用系统标准格式）
 * 映射关系：
 * - Db -> C#
 * - Eb -> D#
 * - Gb -> F#
 * - Ab -> G#
 * - Bb -> A#
 * - E# -> F
 */
function normalizeNoteName(note: string): string {
  const noteMap: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
    'E#': 'F'
  };
  return noteMap[note] || note;
}

/**
 * 标准化调式的所有音符名称
 */
function normalizeScaleNotes(notes: string[]): string[] {
  return notes.map(normalizeNoteName);
}

// ========== 大调 (按五度圈顺序：升号方向) ==========
export const C_MAJOR: Scale = {
  name: 'C大调',
  notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  category: 'major'
};

export const G_MAJOR: Scale = {
  name: 'G大调',
  notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  category: 'major'
};

export const D_MAJOR: Scale = {
  name: 'D大调',
  notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  category: 'major'
};

export const A_MAJOR: Scale = {
  name: 'A大调',
  notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  category: 'major'
};

export const E_MAJOR: Scale = {
  name: 'E大调',
  notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  category: 'major'
};

export const B_MAJOR: Scale = {
  name: 'B大调',
  notes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  category: 'major'
};

export const F_SHARP_MAJOR: Scale = {
  name: 'F#大调',
  notes: normalizeScaleNotes(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']),
  category: 'major'
};

export const DB_MAJOR: Scale = {
  name: 'Db大调',
  notes: normalizeScaleNotes(['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']),
  category: 'major'
};

export const AB_MAJOR: Scale = {
  name: 'Ab大调',
  notes: normalizeScaleNotes(['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']),
  category: 'major'
};

export const EB_MAJOR: Scale = {
  name: 'Eb大调',
  notes: normalizeScaleNotes(['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']),
  category: 'major'
};

export const BB_MAJOR: Scale = {
  name: 'Bb大调',
  notes: normalizeScaleNotes(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']),
  category: 'major'
};

export const F_MAJOR: Scale = {
  name: 'F大调',
  notes: normalizeScaleNotes(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']),
  category: 'major'
};

// ========== 小调 (自然小调，按五度圈顺序) ==========
export const A_MINOR: Scale = {
  name: 'A小调',
  notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  category: 'minor'
};

export const E_MINOR: Scale = {
  name: 'E小调',
  notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
  category: 'minor'
};

export const B_MINOR: Scale = {
  name: 'B小调',
  notes: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
  category: 'minor'
};

export const F_SHARP_MINOR: Scale = {
  name: 'F#小调',
  notes: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
  category: 'minor'
};

export const C_SHARP_MINOR: Scale = {
  name: 'C#小调',
  notes: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
  category: 'minor'
};

export const G_SHARP_MINOR: Scale = {
  name: 'G#小调',
  notes: ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'],
  category: 'minor'
};

export const D_SHARP_MINOR: Scale = {
  name: 'D#小调',
  notes: normalizeScaleNotes(['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#']),
  category: 'minor'
};

export const BB_MINOR: Scale = {
  name: 'Bb小调',
  notes: normalizeScaleNotes(['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab']),
  category: 'minor'
};

export const F_MINOR: Scale = {
  name: 'F小调',
  notes: normalizeScaleNotes(['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb']),
  category: 'minor'
};

export const C_MINOR: Scale = {
  name: 'C小调',
  notes: normalizeScaleNotes(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']),
  category: 'minor'
};

export const G_MINOR: Scale = {
  name: 'G小调',
  notes: normalizeScaleNotes(['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F']),
  category: 'minor'
};

export const D_MINOR: Scale = {
  name: 'D小调',
  notes: normalizeScaleNotes(['D', 'E', 'F', 'G', 'A', 'Bb', 'C']),
  category: 'minor'
};

// 所有大调
export const ALL_MAJOR_SCALES: Scale[] = [
  C_MAJOR,
  G_MAJOR,
  D_MAJOR,
  A_MAJOR,
  E_MAJOR,
  B_MAJOR,
  F_SHARP_MAJOR,
  DB_MAJOR,
  AB_MAJOR,
  EB_MAJOR,
  BB_MAJOR,
  F_MAJOR
];

// 所有小调
export const ALL_MINOR_SCALES: Scale[] = [
  A_MINOR,
  E_MINOR,
  B_MINOR,
  F_SHARP_MINOR,
  C_SHARP_MINOR,
  G_SHARP_MINOR,
  D_SHARP_MINOR,
  BB_MINOR,
  F_MINOR,
  C_MINOR,
  G_MINOR,
  D_MINOR
];

// 所有调式（保持向后兼容）
export const ALL_SCALES: Scale[] = [
  ...ALL_MAJOR_SCALES,
  ...ALL_MINOR_SCALES
];

// 默认选项：所有音符
export const ALL_NOTES: Scale = {
  name: '所有音符',
  notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
};

