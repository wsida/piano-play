export const PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type PitchClass = (typeof PITCH_CLASSES)[number];

export type KeyboardMode = "compact" | "full";

export interface PianoKeyDefinition {
  readonly midi: number;
  readonly note: string;
  readonly pitchClass: PitchClass;
  readonly octave: number;
  readonly isBlack: boolean;
}

export interface ComputerBinding {
  readonly code: string;
  readonly label: string;
  readonly note: string;
}
