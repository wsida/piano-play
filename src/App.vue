<script setup lang="ts">
import ControlBar from "@/components/ControlBar.vue";
import PianoKeyboard from "@/components/PianoKeyboard.vue";
import { useComputerKeyboard } from "@/composables/useComputerKeyboard";
import { usePiano } from "@/composables/usePiano";
import type { KeyboardMode } from "@/types/piano";

const {
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
  attackFromKeyboard,
  releaseFromKeyboard,
} = usePiano();

useComputerKeyboard({
  onNoteDown: (note) => {
    void start();
    attackFromKeyboard(note);
  },
  onNoteUp: releaseFromKeyboard,
  onSustain: setSustain,
});

const onStart = (): void => {
  void start();
};

const onModeChange = (next: KeyboardMode): void => {
  setMode(next);
};
</script>

<template>
  <div class="app">
    <header class="hero">
      <p class="eyebrow">Vite 4 · Vue 3 · Tone.js</p>
      <h1>钢琴模拟器</h1>
      <p class="lede">
        支持 31 键中音区快速演奏，也可切换完整 88 键三角钢琴音域。电脑键盘映射始终对准中音区。
      </p>
    </header>

    <main class="stage">
      <ControlBar
        :mode="mode"
        :volume="volume"
        :reverb="reverb"
        :sustain="sustain"
        @mode-change="onModeChange"
        @volume-change="setVolume"
        @reverb-change="setReverb"
        @sustain-change="setSustain"
      />

      <PianoKeyboard
        :keys="keys"
        :mode="mode"
        :active-notes="activeNotes"
        :enabled="isReady"
        @attack="attack"
        @release="release"
      />

      <p v-if="loadError" class="error">{{ loadError }}</p>
      <p class="hint">
        鼠标/触控点击琴键发声，按住空格延音。31 键模式显示电脑按键提示：Z–M 与 Q–P。
      </p>
    </main>

    <button
      v-if="!isReady"
      type="button"
      class="gate"
      :disabled="isLoading"
      @click="onStart"
    >
      <span>{{ isLoading ? "正在加载钢琴采样…" : "点击开始演奏" }}</span>
      <small>浏览器需要一次交互来启动音频</small>
    </button>
  </div>
</template>

<style scoped>
.app {
  min-height: 100svh;
  display: grid;
  align-content: center;
  gap: 1.6rem;
  padding: 2rem 1.2rem 2.4rem;
}

.hero {
  text-align: center;
}

.eyebrow {
  margin: 0 0 0.4rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #d4b06a;
  font-size: 0.75rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 620;
}

.lede {
  margin: 0.7rem auto 0;
  max-width: 42rem;
  color: rgba(239, 230, 212, 0.72);
}

.stage {
  display: grid;
  gap: 1rem;
  padding: 1.1rem;
  border: 1px solid rgba(232, 210, 160, 0.16);
  border-radius: 24px;
  background: rgba(18, 13, 10, 0.72);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.hint,
.error {
  margin: 0;
  text-align: center;
  color: rgba(239, 230, 212, 0.58);
  font-size: 0.88rem;
}

.error {
  color: #ffb4a8;
}

.gate {
  position: fixed;
  inset: 0;
  z-index: 20;
  border: 0;
  background: rgba(10, 8, 6, 0.72);
  color: #f7f0e4;
  display: grid;
  place-content: center;
  gap: 0.4rem;
  cursor: pointer;
  font: inherit;
  backdrop-filter: blur(10px);
}

.gate span {
  font-size: 1.4rem;
}

.gate small {
  color: rgba(247, 240, 228, 0.62);
}

.gate:disabled {
  cursor: progress;
}
</style>
