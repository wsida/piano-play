<script setup lang="ts">
import { displayRangeLabel } from "@/constants/keyboard";
import type { KeyboardMode } from "@/types/piano";

defineProps<{
  mode: KeyboardMode;
  volume: number;
  reverb: number;
  sustain: boolean;
}>();

const emit = defineEmits<{
  modeChange: [mode: KeyboardMode];
  volumeChange: [value: number];
  reverbChange: [value: number];
  sustainChange: [enabled: boolean];
}>();

const parseRangeValue = (event: Event): number => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return 0;
  }
  return Number(target.value);
};
</script>

<template>
  <section class="controls" aria-label="演奏控制">
    <div class="mode-switch" role="group" aria-label="键盘模式">
      <button
        type="button"
        class="mode-btn"
        :class="{ active: mode === 'compact' }"
        @click="emit('modeChange', 'compact')"
      >
        31 键中音区
      </button>
      <button
        type="button"
        class="mode-btn"
        :class="{ active: mode === 'full' }"
        @click="emit('modeChange', 'full')"
      >
        88 键全键盘
      </button>
      <span class="range">{{ displayRangeLabel(mode) }}</span>
    </div>

    <label class="slider">
      <span>音量</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="volume"
        @input="emit('volumeChange', parseRangeValue($event))"
      />
    </label>

    <label class="slider">
      <span>混响</span>
      <input
        type="range"
        min="0"
        max="0.7"
        step="0.01"
        :value="reverb"
        @input="emit('reverbChange', parseRangeValue($event))"
      />
    </label>

    <button
      type="button"
      class="sustain"
      :class="{ active: sustain }"
      @pointerdown.prevent="emit('sustainChange', true)"
      @pointerup="emit('sustainChange', false)"
      @pointerleave="emit('sustainChange', false)"
    >
      延音 · Space
    </button>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.4rem;
  justify-content: space-between;
}

.mode-switch {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.mode-btn,
.sustain {
  border: 1px solid rgba(232, 210, 160, 0.28);
  background: rgba(255, 255, 255, 0.04);
  color: #efe6d4;
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.mode-btn.active,
.sustain.active {
  background: linear-gradient(180deg, #f3d7a1, #c9a15a);
  color: #2a1d10;
  border-color: transparent;
}

.range {
  color: rgba(239, 230, 212, 0.62);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
}

.slider {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 160px;
  color: rgba(239, 230, 212, 0.78);
  font-size: 0.85rem;
}

.slider input {
  accent-color: #d4b06a;
  width: 110px;
}
</style>
