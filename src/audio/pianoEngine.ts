import * as Tone from "tone";

const SAMPLE_BASE_URL = "https://tonejs.github.io/audio/salamander/";

const SAMPLE_URLS: Record<string, string> = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
  C7: "C7.mp3",
  "D#7": "Ds7.mp3",
  "F#7": "Fs7.mp3",
  A7: "A7.mp3",
  C8: "C8.mp3",
};

export class PianoEngine {
  private sampler: Tone.Sampler | null = null;
  private reverb: Tone.Reverb | null = null;
  private loadPromise: Promise<void> | null = null;
  private readonly heldNotes = new Set<string>();
  private readonly sustainedNotes = new Set<string>();
  private sustainPedal = false;
  private disposed = false;

  public async init(): Promise<void> {
    if (this.disposed) {
      throw new Error("PianoEngine has been disposed");
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.createGraph();
    return this.loadPromise;
  }

  public async resume(): Promise<void> {
    await Tone.start();
    if (Tone.getContext().state !== "running") {
      await Tone.getContext().resume();
    }
  }

  public get isReady(): boolean {
    return this.sampler !== null && !this.disposed;
  }

  public noteOn(note: string, velocity: number): void {
    if (!this.sampler) {
      return;
    }

    const clamped = clamp(velocity, 0.05, 1);
    this.heldNotes.add(note);
    this.sustainedNotes.delete(note);
    this.sampler.triggerAttack(note, Tone.now(), clamped);
  }

  public noteOff(note: string): void {
    if (!this.sampler) {
      return;
    }

    this.heldNotes.delete(note);
    if (this.sustainPedal) {
      this.sustainedNotes.add(note);
      return;
    }
    this.sampler.triggerRelease(note, Tone.now());
  }

  public setSustain(enabled: boolean): void {
    this.sustainPedal = enabled;
    if (enabled || !this.sampler) {
      return;
    }

    for (const note of this.sustainedNotes) {
      if (!this.heldNotes.has(note)) {
        this.sampler.triggerRelease(note, Tone.now());
      }
    }
    this.sustainedNotes.clear();
  }

  public releaseAll(): void {
    if (!this.sampler) {
      return;
    }

    const sounding = new Set<string>([...this.heldNotes, ...this.sustainedNotes]);
    for (const note of sounding) {
      this.sampler.triggerRelease(note, Tone.now());
    }
    this.heldNotes.clear();
    this.sustainedNotes.clear();
  }

  public setVolume(linear: number): void {
    const db = Tone.gainToDb(clamp(linear, 0, 1));
    Tone.getDestination().volume.rampTo(db, 0.05);
  }

  public setReverbWet(wet: number): void {
    if (!this.reverb) {
      return;
    }
    this.reverb.wet.rampTo(clamp(wet, 0, 1), 0.08);
  }

  public dispose(): void {
    this.disposed = true;
    this.releaseAll();
    this.sampler?.dispose();
    this.reverb?.dispose();
    this.sampler = null;
    this.reverb = null;
    this.loadPromise = null;
  }

  private async createGraph(): Promise<void> {
    await Tone.start();

    const reverb = new Tone.Reverb({
      decay: 2.8,
      preDelay: 0.02,
      wet: 0.18,
    });
    await reverb.generate();

    const sampler = await new Promise<Tone.Sampler>((resolve, reject) => {
      const instance = new Tone.Sampler({
        urls: SAMPLE_URLS,
        release: 1.2,
        baseUrl: SAMPLE_BASE_URL,
        onload: () => {
          resolve(instance);
        },
        onerror: (error) => {
          reject(error);
        },
      });
    });

    sampler.connect(reverb);
    reverb.toDestination();

    this.sampler = sampler;
    this.reverb = reverb;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
