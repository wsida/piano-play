import { computed, onUnmounted, ref, shallowRef } from "vue";
import { PianoEngine } from "@/audio/pianoEngine";
import { keysForMode } from "@/constants/keyboard";
import type { KeyboardMode } from "@/types/piano";

export function usePiano() {
  const engine = new PianoEngine();
  const mode = ref<KeyboardMode>("compact");
  const keys = computed(() => keysForMode(mode.value));
  const activeNotes = shallowRef<ReadonlySet<string>>(new Set());
  const volume = ref(0.78);
  const reverb = ref(0.18);
  const sustain = ref(false);
  const isReady = ref(false);
  const isLoading = ref(false);
  const loadError = ref<string | null>(null);
  const pointerNotes = new Set<string>();
  const keyboardNotes = new Set<string>();

  const syncActive = (): void => {
    activeNotes.value = new Set([...pointerNotes, ...keyboardNotes]);
  };

  const start = async (): Promise<void> => {
    if (isLoading.value) {
      return;
    }
    if (isReady.value) {
      await engine.resume();
      return;
    }

    isLoading.value = true;
    loadError.value = null;
    try {
      await engine.init();
      engine.setVolume(volume.value);
      engine.setReverbWet(reverb.value);
      isReady.value = true;
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : "音频引擎初始化失败";
    } finally {
      isLoading.value = false;
    }
  };

  const setMode = (next: KeyboardMode): void => {
    if (mode.value === next) {
      return;
    }
    releaseAll();
    mode.value = next;
  };

  const setVolume = (value: number): void => {
    volume.value = value;
    if (engine.isReady) {
      engine.setVolume(value);
    }
  };

  const setReverb = (value: number): void => {
    reverb.value = value;
    if (engine.isReady) {
      engine.setReverbWet(value);
    }
  };

  const setSustain = (enabled: boolean): void => {
    sustain.value = enabled;
    engine.setSustain(enabled);
  };

  const attack = (note: string, velocity = 0.82): void => {
    if (!isReady.value) {
      return;
    }
    pointerNotes.add(note);
    syncActive();
    engine.noteOn(note, velocity);
  };

  const release = (note: string): void => {
    pointerNotes.delete(note);
    if (!keyboardNotes.has(note)) {
      engine.noteOff(note);
    }
    syncActive();
  };

  const attackFromKeyboard = (note: string): void => {
    if (!isReady.value || keyboardNotes.has(note)) {
      return;
    }
    keyboardNotes.add(note);
    syncActive();
    engine.noteOn(note, 0.86);
  };

  const releaseFromKeyboard = (note: string): void => {
    keyboardNotes.delete(note);
    if (!pointerNotes.has(note)) {
      engine.noteOff(note);
    }
    syncActive();
  };

  const releaseAll = (): void => {
    engine.releaseAll();
    pointerNotes.clear();
    keyboardNotes.clear();
    syncActive();
  };

  onUnmounted(() => {
    engine.dispose();
  });

  return {
    mode,
    keys,
    activeNotes,
    volume,
    reverb,
    sustain,
    isReady,
    isLoading,
    loadError,
    start,
    setMode,
    setVolume,
    setReverb,
    setSustain,
    attack,
    release,
    releaseAll,
    attackFromKeyboard,
    releaseFromKeyboard,
  };
}
