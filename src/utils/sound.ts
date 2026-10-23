// Web Audio API Procedural Synthesizer for Kitchen & Waiter alerts
// Works reliably across all browsers without external asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'running') {
          this.isUnlocked = true;
        }
      }
    }
  }

  public async unlock(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        this.isUnlocked = true;
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
        return false;
      }
    } else {
      this.isUnlocked = true;
    }
    return this.isUnlocked;
  }

  public isAudioReady(): boolean {
    return this.isUnlocked && this.ctx !== null && this.ctx.state === 'running';
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // Play a loud kitchen order bell (brass chime resonance)
  public playNewOrderSound() {
    if (this.isMuted) return;
    this.unlock().then((ok) => {
      if (!ok || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Two-chime resonant frequencies
      const frequencies = [880, 1760, 2640];
      frequencies.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const peak = (this.volume * 0.4) / (idx + 1);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 1.3);
      });

      // Second strike 160ms later for classic double bell
      setTimeout(() => {
        if (!this.ctx) return;
        const now2 = this.ctx.currentTime;
        [1046.5, 2093].forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now2);
          gain.gain.setValueAtTime(this.volume * 0.35, now2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now2 + 1.4);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now2);
          osc.stop(now2 + 1.5);
        });
      }, 160);
    });
  }

  // Play order ready chime (sweet ascending triad)
  public playReadyOrderSound() {
    if (this.isMuted) return;
    this.unlock().then((ok) => {
      if (!ok || !this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const baseTime = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const time = baseTime + i * 0.12;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + 0.85);
      });
    });
  }

  // Play urgent notification for bill requests, cancellations, assistance
  public playUrgentAlertSound() {
    if (this.isMuted) return;
    this.unlock().then((ok) => {
      if (!ok || !this.ctx) return;
      const baseTime = this.ctx.currentTime;
      // 3 pulses
      [0, 0.22, 0.44].forEach((offset) => {
        const time = baseTime + offset;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, time);
        osc.frequency.exponentialRampToValueAtTime(600, time + 0.15);

        gain.gain.setValueAtTime(this.volume * 0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + 0.2);
      });
    });
  }

  // General notification ping
  public playNotificationSound() {
    if (this.isMuted) return;
    this.unlock().then((ok) => {
      if (!ok || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    });
  }
}

export const soundManager = new SoundManager();
