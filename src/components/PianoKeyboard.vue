<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import {
  COMPUTER_LABEL_BY_NOTE,
  whiteKeyIndexBeforeBlack,
} from "@/constants/keyboard";
import type { KeyboardMode, PianoKeyDefinition } from "@/types/piano";

const props = defineProps<{
  keys: PianoKeyDefinition[];
  mode: KeyboardMode;
  activeNotes: ReadonlySet<string>;
  enabled: boolean;
}>();

const emit = defineEmits<{
  attack: [note: string, velocity: number];
  release: [note: string];
}>();

const boardRef = ref<HTMLElement | null>(null);
const pointerNote = ref<string | null>(null);
const pointerActive = ref(false);

const whiteKeys = computed(() => props.keys.filter((key) => !key.isBlack));
const blackKeys = computed(() => props.keys.filter((key) => key.isBlack));

const blackPositions = computed(() => {
  const whites = whiteKeys.value.length;
  return new Map(
    blackKeys.value.map((key) => {
      const whiteIndex = whiteKeyIndexBeforeBlack(props.keys, key);
      const percent = ((whiteIndex + 1) / whites) * 100;
      return [key.note, percent] as const;
    }),
  );
});

const velocityFromPoint = (clientY: number, el: HTMLElement): number => {
  const rect = el.getBoundingClientRect();
  const ratio = (clientY - rect.top) / Math.max(rect.height, 1);
  return Math.min(1, Math.max(0.18, 0.35 + ratio * 0.65));
};

const keyFromPoint = (clientX: number, clientY: number): HTMLElement | null => {
  const hit = document.elementFromPoint(clientX, clientY);
  if (!(hit instanceof Element)) {
    return null;
  }
  const keyEl = hit.closest("[data-note]");
  return keyEl instanceof HTMLElement ? keyEl : null;
};

const playNoteAt = (clientX: number, clientY: number): void => {
  if (!props.enabled) {
    return;
  }
  const keyEl = keyFromPoint(clientX, clientY);
  const note = keyEl?.dataset.note;
  if (!keyEl || !note) {
    return;
  }
  if (pointerNote.value === note) {
    return;
  }
  if (pointerNote.value) {
    emit("release", pointerNote.value);
  }
  pointerNote.value = note;
  emit("attack", note, velocityFromPoint(clientY, keyEl));
};

const endPointer = (): void => {
  if (pointerNote.value) {
    emit("release", pointerNote.value);
    pointerNote.value = null;
  }
  pointerActive.value = false;
  window.removeEventListener("pointermove", onWindowPointerMove);
  window.removeEventListener("pointerup", endPointer);
  window.removeEventListener("pointercancel", endPointer);
};

const onWindowPointerMove = (event: PointerEvent): void => {
  if (!pointerActive.value) {
    return;
  }
  playNoteAt(event.clientX, event.clientY);
};

const onPointerDown = (event: PointerEvent): void => {
  if (event.button !== 0 && event.pointerType === "mouse") {
    return;
  }
  pointerActive.value = true;
  playNoteAt(event.clientX, event.clientY);
  window.addEventListener("pointermove", onWindowPointerMove);
  window.addEventListener("pointerup", endPointer);
  window.addEventListener("pointercancel", endPointer);
};

watch(
  () => props.mode,
  async (mode) => {
    await nextTick();
    const board = boardRef.value;
    if (!board) {
      return;
    }
    if (mode === "full") {
      const middle = board.querySelector('[data-note="C4"]');
      if (middle instanceof HTMLElement) {
        middle.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      }
    } else {
      board.scrollLeft = 0;
    }
  },
);

onUnmounted(() => {
  endPointer();
});
</script>

<template>
  <div
    ref="boardRef"
    class="board"
    :class="mode"
    @pointerdown="onPointerDown"
  >
    <div class="whites">
      <button
        v-for="key in whiteKeys"
        :key="key.midi"
        type="button"
        class="key white"
        :class="{ active: activeNotes.has(key.note) }"
        :data-note="key.note"
        :aria-label="key.note"
        :disabled="!enabled"
        tabindex="-1"
      >
        <span class="note">{{ key.note }}</span>
        <span v-if="COMPUTER_LABEL_BY_NOTE.get(key.note)" class="hint">
          {{ COMPUTER_LABEL_BY_NOTE.get(key.note) }}
        </span>
      </button>
    </div>

    <div class="blacks">
      <button
        v-for="key in blackKeys"
        :key="key.midi"
        type="button"
        class="key black"
        :class="{ active: activeNotes.has(key.note) }"
        :data-note="key.note"
        :aria-label="key.note"
        :disabled="!enabled"
        tabindex="-1"
        :style="{ left: `${blackPositions.get(key.note) ?? 0}%` }"
      >
        <span v-if="mode === 'compact'" class="hint">
          {{ COMPUTER_LABEL_BY_NOTE.get(key.note) }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.board {
  position: relative;
  user-select: none;
  touch-action: none;
  border-radius: 0 0 18px 18px;
  background: linear-gradient(180deg, #2a2118, #120e0b);
  padding: 12px 12px 18px;
  overflow-x: auto;
  box-shadow: inset 0 10px 18px rgba(0, 0, 0, 0.35);
}

.whites {
  display: flex;
  min-width: 100%;
}

.board.compact .whites {
  height: 230px;
}

.board.full .whites {
  height: 188px;
  min-width: 1480px;
}

.key {
  position: relative;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

.key:disabled {
  cursor: default;
}

.white {
  flex: 1 0 0;
  min-width: 36px;
  margin: 0 1px;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(180deg, #fffaf1 0%, #e8dfd0 86%, #cfc3b0 100%);
  box-shadow: inset 0 -8px 0 rgba(90, 70, 40, 0.12), 0 8px 10px rgba(0, 0, 0, 0.25);
  color: #6b5b45;
}

.board.full .white {
  min-width: 26px;
}

.white.active {
  background: linear-gradient(180deg, #ffe7b0, #e0b25c);
  transform: translateY(2px);
}

.blacks {
  position: absolute;
  inset: 12px 12px auto;
  height: 58%;
  pointer-events: none;
}

.black {
  pointer-events: auto;
  position: absolute;
  top: 0;
  width: 3.2%;
  height: 100%;
  transform: translateX(-50%);
  border-radius: 0 0 6px 6px;
  background: linear-gradient(180deg, #4a4038 0%, #161210 70%, #000 100%);
  box-shadow: 0 8px 10px rgba(0, 0, 0, 0.45);
  z-index: 2;
  color: #d9c8a6;
}

.board.compact .black {
  width: 3.6%;
}

.board.full .black {
  width: 1.45%;
}

.black.active {
  background: linear-gradient(180deg, #d7b36a, #8a6a32);
}

.note,
.hint {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.note {
  bottom: 10px;
  font-size: 0.7rem;
  opacity: 0.72;
}

.board.full .note {
  font-size: 0.58rem;
}

.white .hint {
  bottom: 28px;
  font-size: 0.68rem;
  opacity: 0.4;
}

.black .hint {
  bottom: 8px;
  font-size: 0.62rem;
  opacity: 0.7;
}

.board.full .white .hint {
  display: none;
}
</style>
