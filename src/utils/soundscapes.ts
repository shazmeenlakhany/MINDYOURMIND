// Procedural Audio Engine using Web Audio API
// No external MP3 downloads required - zero latency, zero failure risk

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private brownGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private gammaGain: GainNode | null = null;

  private brownSource: AudioBufferSourceNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private gammaOsc: OscillatorNode | null = null;
  private gammaMod: OscillatorNode | null = null;

  private isPlaying = false;
  private currentVolume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate 5-second loopable Brown noise buffer
  private createBrownNoiseBuffer(): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * 5;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5; // Gain compensation
    }
    return buffer;
  }

  // Generate 5-second loopable Rain buffer
  private createRainBuffer(): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * 5;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;

      // Random droplet click spikes
      const droplet = Math.random() < 0.003 ? (Math.random() - 0.5) * 1.5 : 0;
      data[i] = pink * 0.09 + droplet * 0.12;
    }
    return buffer;
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public startSoundscape(mode: 'brown' | 'rain' | 'gamma') {
    this.stopSoundscape();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (mode === 'brown') {
      const brownBuf = this.createBrownNoiseBuffer();
      this.brownSource = this.ctx.createBufferSource();
      this.brownSource.buffer = brownBuf;
      this.brownSource.loop = true;

      // Lowpass filter for deep warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.brownGain = this.ctx.createGain();
      this.brownGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.brownSource.connect(filter);
      filter.connect(this.brownGain);
      this.brownGain.connect(this.masterGain);
      this.brownSource.start();
    } else if (mode === 'rain') {
      const rainBuf = this.createRainBuffer();
      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = rainBuf;
      this.rainSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

      this.rainSource.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      this.rainSource.start();
    } else if (mode === 'gamma') {
      // 40Hz Gamma frequency modulation for high cognitive flow
      const carrierFreq = 200; // Soothing low hum
      this.gammaOsc = this.ctx.createOscillator();
      this.gammaOsc.type = 'sine';
      this.gammaOsc.frequency.setValueAtTime(carrierFreq, this.ctx.currentTime);

      // 40Hz tremolo modulation
      this.gammaMod = this.ctx.createOscillator();
      this.gammaMod.type = 'sine';
      this.gammaMod.frequency.setValueAtTime(40, this.ctx.currentTime);

      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.gammaGain = this.ctx.createGain();
      this.gammaGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      this.gammaMod.connect(modGain.gain);
      this.gammaOsc.connect(this.gammaGain);
      this.gammaGain.connect(this.masterGain);

      this.gammaOsc.start();
      this.gammaMod.start();
    }

    this.isPlaying = true;
  }

  public stopSoundscape() {
    try {
      if (this.brownSource) {
        this.brownSource.stop();
        this.brownSource.disconnect();
        this.brownSource = null;
      }
      if (this.rainSource) {
        this.rainSource.stop();
        this.rainSource.disconnect();
        this.rainSource = null;
      }
      if (this.gammaOsc) {
        this.gammaOsc.stop();
        this.gammaOsc.disconnect();
        this.gammaOsc = null;
      }
      if (this.gammaMod) {
        this.gammaMod.stop();
        this.gammaMod.disconnect();
        this.gammaMod = null;
      }
    } catch {
      // safe cleanup
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Play a soft Tibetan singing bowl harmonic chime
  public playBowlChime() {
    this.initContext();
    if (!this.ctx) return;

    const fundamental = 392; // G4 warm tone
    const partials = [1, 2.76, 5.4, 8.9];
    const weights = [0.6, 0.25, 0.12, 0.05];

    const now = this.ctx.currentTime;
    const chimeMaster = this.ctx.createGain();
    chimeMaster.gain.setValueAtTime(this.currentVolume * 0.8, now);
    chimeMaster.connect(this.ctx.destination);

    partials.forEach((mult, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * mult, now);

      gain.gain.setValueAtTime(weights[index], now);
      // Gentle 4.5 second exponential resonance ring
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(chimeMaster);

      osc.start(now);
      osc.stop(now + 4.6);
    });
  }
}

export const soundscapes = new SoundscapeEngine();
