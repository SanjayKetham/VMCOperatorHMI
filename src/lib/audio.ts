class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeSpindleOsc: OscillatorNode | null = null;
  private activeSpindleGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.activeSpindleGain) {
      this.activeSpindleGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playCheck() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.25);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playClamp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public startSpindleSound(rpm: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.activeSpindleOsc) {
      this.updateSpindleRPM(rpm);
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.activeSpindleOsc = this.ctx.createOscillator();
      this.activeSpindleGain = this.ctx.createGain();

      const baseFreq = 80 + (rpm / 12000) * 300;
      this.activeSpindleOsc.type = "sawtooth";
      this.activeSpindleOsc.frequency.setValueAtTime(baseFreq, now);

      this.activeSpindleGain.gain.setValueAtTime(0.01, now);
      this.activeSpindleGain.gain.linearRampToValueAtTime(0.12, now + 0.5);

      this.activeSpindleOsc.connect(this.activeSpindleGain);
      this.activeSpindleGain.connect(this.ctx.destination);

      this.activeSpindleOsc.start(now);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public updateSpindleRPM(rpm: number) {
    if (!this.ctx || !this.activeSpindleOsc) return;
    const baseFreq = 80 + (rpm / 12000) * 300;
    this.activeSpindleOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);
  }

  public stopSpindleSound() {
    if (!this.ctx || !this.activeSpindleOsc || !this.activeSpindleGain) return;
    try {
      const now = this.ctx.currentTime;
      this.activeSpindleGain.gain.setTargetAtTime(0, now, 0.1);
      setTimeout(() => {
        if (this.activeSpindleOsc) {
          try { this.activeSpindleOsc.stop(); } catch {}
          this.activeSpindleOsc.disconnect();
          this.activeSpindleOsc = null;
          this.activeSpindleGain = null;
        }
      }, 200);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playAlarm() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }
}

export const soundEngine = new SoundEngine();
