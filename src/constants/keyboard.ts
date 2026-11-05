import type {
  ComputerBinding,
  KeyboardMode,
  PianoKeyDefinition,
  PitchClass,
} from "@/types/piano";
import { PITCH_CLASSES } from "@/types/piano";

/** Standard acoustic piano: A0 (MIDI 21) – C8 (MIDI 108). */
export const FULL_RANGE = { startMidi: 21, endMidi: 108 } as const;

/**
 * Mid-register 31-key layout: C3 (MIDI 48) – F#5 (MIDI 78).
 * 18 white keys + 13 black keys.
 */
export const COMPACT_RANGE = { startMidi: 48, endMidi: 78 } as const;

const BLACK_PITCHES = new Set<PitchClass>(["C#", "D#", "F#", "G#", "A#"]);

export function midiToNoteName(midi: number): string {
  const pitchIndex = ((midi % 12) + 12) % 12;
  const pitchClass = PITCH_CLASSES[pitchIndex];
  if (pitchClass === undefined) {
    throw new Error(`Invalid MIDI pitch class for ${midi}`);
  }
  const octave = Math.floor(midi / 12) - 1;
  return `${pitchClass}${octave}`;
}

export function createKeyDefinition(midi: number): PianoKeyDefinition {
  const pitchIndex = ((midi % 12) + 12) % 12;
  const pitchClass = PITCH_CLASSES[pitchIndex];
  if (pitchClass === undefined) {
    throw new Error(`Invalid MIDI pitch class for ${midi}`);
  }

  return {
    midi,
    note: `${pitchClass}${Math.floor(midi / 12) - 1}`,
    pitchClass,
    octave: Math.floor(midi / 12) - 1,
    isBlack: BLACK_PITCHES.has(pitchClass),
  };
}

export function buildKeys(startMidi: number, endMidi: number): PianoKeyDefinition[] {
  if (endMidi < startMidi) {
    throw new Error("endMidi must be greater than or equal to startMidi");
  }

  const keys: PianoKeyDefinition[] = [];
  for (let midi = startMidi; midi <= endMidi; midi += 1) {
    keys.push(createKeyDefinition(midi));
  }
  return keys;
}

export function keysForMode(mode: KeyboardMode): PianoKeyDefinition[] {
  const range = mode === "compact" ? COMPACT_RANGE : FULL_RANGE;
  return buildKeys(range.startMidi, range.endMidi);
}

export function displayRangeLabel(mode: KeyboardMode): string {
  const range = mode === "compact" ? COMPACT_RANGE : FULL_RANGE;
  const count = mode === "compact" ? 31 : 88;
  return `${count} 键 · ${midiToNoteName(range.startMidi)} – ${midiToNoteName(range.endMidi)}`;
}

/**
 * Computer-keyboard bindings covering the 31-key mid register.
 * Lower row plays C3–B3; upper row plays C4–F#5.
 */
export const COMPUTER_BINDINGS: readonly ComputerBinding[] = [
  { code: "KeyZ", label: "Z", note: "C3" },
  { code: "KeyS", label: "S", note: "C#3" },
  { code: "KeyX", label: "X", note: "D3" },
  { code: "KeyD", label: "D", note: "D#3" },
  { code: "KeyC", label: "C", note: "E3" },
  { code: "KeyV", label: "V", note: "F3" },
  { code: "KeyG", label: "G", note: "F#3" },
  { code: "KeyB", label: "B", note: "G3" },
  { code: "KeyH", label: "H", note: "G#3" },
  { code: "KeyN", label: "N", note: "A3" },
  { code: "KeyJ", label: "J", note: "A#3" },
  { code: "KeyM", label: "M", note: "B3" },
  { code: "KeyQ", label: "Q", note: "C4" },
  { code: "Digit2", label: "2", note: "C#4" },
  { code: "KeyW", label: "W", note: "D4" },
  { code: "Digit3", label: "3", note: "D#4" },
  { code: "KeyE", label: "E", note: "E4" },
  { code: "KeyR", label: "R", note: "F4" },
  { code: "Digit5", label: "5", note: "F#4" },
  { code: "KeyT", label: "T", note: "G4" },
  { code: "Digit6", label: "6", note: "G#4" },
  { code: "KeyY", label: "Y", note: "A4" },
  { code: "Digit7", label: "7", note: "A#4" },
  { code: "KeyU", label: "U", note: "B4" },
  { code: "KeyI", label: "I", note: "C5" },
  { code: "Digit9", label: "9", note: "C#5" },
  { code: "KeyO", label: "O", note: "D5" },
  { code: "Digit0", label: "0", note: "D#5" },
  { code: "KeyP", label: "P", note: "E5" },
  { code: "BracketLeft", label: "[", note: "F5" },
  { code: "Equal", label: "=", note: "F#5" },
] as const;

export const COMPUTER_NOTE_BY_CODE: ReadonlyMap<string, string> = new Map(
  COMPUTER_BINDINGS.map((binding) => [binding.code, binding.note]),
);

export const COMPUTER_LABEL_BY_NOTE: ReadonlyMap<string, string> = new Map(
  COMPUTER_BINDINGS.map((binding) => [binding.note, binding.label]),
);

export function whiteKeyIndexBeforeBlack(
  keys: readonly PianoKeyDefinition[],
  blackKey: PianoKeyDefinition,
): number {
  let whiteIndex = -1;
  for (const key of keys) {
    if (!key.isBlack) {
      whiteIndex += 1;
    }
    if (key.midi === blackKey.midi) {
      return whiteIndex;
    }
  }
  throw new Error(`Black key ${blackKey.note} was not found`);
}

const compactKeys = keysForMode("compact");
const fullKeys = keysForMode("full");

if (compactKeys.length !== 31) {
  throw new Error(`Compact layout must have 31 keys, received ${compactKeys.length}`);
}

if (fullKeys.length !== 88) {
  throw new Error(`Full layout must have 88 keys, received ${fullKeys.length}`);
}

if (COMPUTER_BINDINGS.length !== 31) {
  throw new Error("Computer bindings must cover all 31 compact keys");
}
