// Web Audio API Procedural Ambient Sound Engine for 6 Detective Worlds

import { WorldId } from '../types';

export type AmbientWorldId = WorldId;

export interface WorldSoundscapeMeta {
  id: AmbientWorldId;
  name: string;
  emoji: string;
  soundscapeTitle: string;
  description: string;
  audioFeatures: string[];
  themeColor: string;
  borderColor: string;
  bgGradient: string;
}

export const WORLD_SOUNDSCAPES: WorldSoundscapeMeta[] = [
  {
    id: 'disaster-city',
    name: 'Disaster City',
    emoji: '🏙️',
    soundscapeTitle: 'City Sirens & Urban Rain',
    description: 'Distant police sirens, urban traffic rumble, and continuous light rain showers.',
    audioFeatures: ['Emergency Siren Sweep', 'Low Urban Rumble', 'Rainfall Noise Filter'],
    themeColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-950/30 to-slate-900',
  },
  {
    id: 'mystery-island',
    name: 'Mystery Island',
    emoji: '🏝️',
    soundscapeTitle: 'Ocean Waves & Sea Breeze',
    description: 'Rhythmic ocean wave swells washing ashore with gentle tropical coastal winds.',
    audioFeatures: ['12s Tidal Wave Swells', 'High-Pass Ocean Hiss', 'Warm Sea Wind'],
    themeColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgGradient: 'from-cyan-950/30 to-slate-900',
  },
  {
    id: 'space-station',
    name: 'Space Station',
    emoji: '🚀',
    soundscapeTitle: 'Sci-Fi Reactor Hum',
    description: 'Resonant sub-bass nuclear reactor pulses and futuristic station thruster hums.',
    audioFeatures: ['55Hz Sub-Bass Reactor', 'Sawtooth Plasma Hum', 'LFO Resonance'],
    themeColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgGradient: 'from-purple-950/30 to-slate-900',
  },
  {
    id: 'fantasy-kingdom',
    name: 'Fantasy Kingdom',
    emoji: '🏰',
    soundscapeTitle: 'Enchanted Forest & Chimes',
    description: 'Mystical woodland breeze whispering through leaves accompanied by magical chime sparkles.',
    audioFeatures: ['Woodland Pink Noise', 'Pentatonic Chime Sparkles', 'Enchanted Reverberation'],
    themeColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgGradient: 'from-emerald-950/30 to-slate-900',
  },
  {
    id: 'moon-base',
    name: 'Moon Base',
    emoji: '🌕',
    soundscapeTitle: 'Cosmic Void & Lunar Thruster',
    description: 'Deep spatial vacuum rumble, solar wind filters, and oxygen regulator pulses.',
    audioFeatures: ['Deep Void Resonance', 'Solar Wind Filter', 'Regulator Pressure Pulse'],
    themeColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgGradient: 'from-blue-950/30 to-slate-900',
  },
  {
    id: 'time-dimension',
    name: 'Time Dimension',
    emoji: '⏳',
    soundscapeTitle: 'Clockwork Gears & Temporal Echoes',
    description: 'Rhythmic clock mechanism ticking, brass gear friction, and temporal phase shifts.',
    audioFeatures: ['120 BPM Clockwork Ticks', '140Hz Brass Gear Hum', 'Temporal Phase Sweep'],
    themeColor: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgGradient: 'from-rose-950/30 to-slate-900',
  },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentWorld: AmbientWorldId | null = null;
  private activeMasterGain: GainNode | null = null;
  private activeNodes: Array<AudioNode> = [];
  private activeTimers: Array<number> = [];
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const seconds = 4;
      const bufferSize = this.ctx.sampleRate * seconds;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.activeMasterGain && this.ctx) {
      this.activeMasterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVolume * 0.4,
        this.ctx.currentTime
      );
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.activeMasterGain && this.ctx) {
      this.activeMasterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVolume * 0.4,
        this.ctx.currentTime
      );
    }
  }

  public getCurrentWorld(): AmbientWorldId | null {
    return this.currentWorld;
  }

  public stop() {
    if (this.activeMasterGain && this.ctx) {
      try {
        this.activeMasterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
      } catch (e) {
        // ignore
      }
    }

    this.activeTimers.forEach((t) => window.clearInterval(t));
    this.activeTimers = [];

    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch (e) {
          // ignore
        }
      });
      this.activeNodes = [];
      this.activeMasterGain = null;
      this.currentWorld = null;
    }, 180);
  }

  public playWorld(worldId: AmbientWorldId) {
    if (this.currentWorld === worldId) return; // already playing
    this.stop();

    setTimeout(() => {
      this.initCtx();
      if (!this.ctx) return;

      this.currentWorld = worldId;
      const masterGain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0 : this.masterVolume * 0.35,
        now + 0.3
      );
      masterGain.connect(this.ctx.destination);
      this.activeMasterGain = masterGain;

      switch (worldId) {
        case 'disaster-city':
          this.buildDisasterCitySoundscape(masterGain);
          break;
        case 'mystery-island':
          this.buildMysteryIslandSoundscape(masterGain);
          break;
        case 'space-station':
          this.buildSpaceStationSoundscape(masterGain);
          break;
        case 'fantasy-kingdom':
          this.buildFantasyKingdomSoundscape(masterGain);
          break;
        case 'moon-base':
          this.buildMoonBaseSoundscape(masterGain);
          break;
        case 'time-dimension':
          this.buildTimeDimensionSoundscape(masterGain);
          break;
      }
    }, 200);
  }

  // 1. Disaster City: Urban Rain, Sirens, Traffic Rumble
  private buildDisasterCitySoundscape(master: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Urban rain noise
    const noiseBuf = this.getNoiseBuffer();
    if (noiseBuf) {
      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = noiseBuf;
      rainSource.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(320, now);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.12, now);

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);
      rainSource.start(now);
      this.activeNodes.push(rainSource, rainFilter, rainGain);
    }

    // Traffic sub rumble
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(55, now);
    rumbleGain.gain.setValueAtTime(0.15, now);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(master);
    rumbleOsc.start(now);
    this.activeNodes.push(rumbleOsc, rumbleGain);

    // Periodic Siren Sweeps
    const triggerSiren = () => {
      if (!this.ctx || this.currentWorld !== 'disaster-city') return;
      const t = this.ctx.currentTime;
      const sirenOsc = this.ctx.createOscillator();
      const sirenGain = this.ctx.createGain();

      sirenOsc.type = 'triangle';
      sirenOsc.frequency.setValueAtTime(500, t);
      sirenOsc.frequency.linearRampToValueAtTime(800, t + 0.8);
      sirenOsc.frequency.linearRampToValueAtTime(500, t + 1.6);

      sirenGain.gain.setValueAtTime(0.001, t);
      sirenGain.gain.linearRampToValueAtTime(0.04, t + 0.2);
      sirenGain.gain.linearRampToValueAtTime(0.001, t + 1.6);

      sirenOsc.connect(sirenGain);
      sirenGain.connect(master);
      sirenOsc.start(t);
      sirenOsc.stop(t + 1.6);
    };

    triggerSiren();
    const timer = window.setInterval(triggerSiren, 7000);
    this.activeTimers.push(timer);
  }

  // 2. Mystery Island: Ocean Waves Swells & Sea Wind
  private buildMysteryIslandSoundscape(master: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const noiseBuf = this.getNoiseBuffer();
    if (noiseBuf) {
      const waveSource = this.ctx.createBufferSource();
      waveSource.buffer = noiseBuf;
      waveSource.loop = true;

      const waveFilter = this.ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(200, now);

      const waveGain = this.ctx.createGain();
      waveGain.gain.setValueAtTime(0.03, now);

      waveSource.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(master);
      waveSource.start(now);
      this.activeNodes.push(waveSource, waveFilter, waveGain);

      // Modulate waves filter & volume like ocean tides (8s cycle)
      const animateWave = () => {
        if (!this.ctx || this.currentWorld !== 'mystery-island') return;
        const t = this.ctx.currentTime;
        waveFilter.frequency.cancelScheduledValues(t);
        waveGain.gain.cancelScheduledValues(t);

        waveFilter.frequency.setValueAtTime(200, t);
        waveFilter.frequency.linearRampToValueAtTime(750, t + 3.5);
        waveFilter.frequency.linearRampToValueAtTime(200, t + 7.5);

        waveGain.gain.setValueAtTime(0.03, t);
        waveGain.gain.linearRampToValueAtTime(0.18, t + 3.5);
        waveGain.gain.linearRampToValueAtTime(0.03, t + 7.5);
      };

      animateWave();
      const timer = window.setInterval(animateWave, 8000);
      this.activeTimers.push(timer);
    }

    // Coastal breeze hum
    const breezeOsc = this.ctx.createOscillator();
    const breezeGain = this.ctx.createGain();
    breezeOsc.type = 'sine';
    breezeOsc.frequency.setValueAtTime(180, now);
    breezeGain.gain.setValueAtTime(0.05, now);

    breezeOsc.connect(breezeGain);
    breezeGain.connect(master);
    breezeOsc.start(now);
    this.activeNodes.push(breezeOsc, breezeGain);
  }

  // 3. Space Station: Sub-bass Reactor & Sci-Fi Plasma Hums
  private buildSpaceStationSoundscape(master: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sub-bass reactor core
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subGain.gain.setValueAtTime(0.18, now);

    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start(now);
    this.activeNodes.push(subOsc, subGain);

    // Harmonic pulse
    const harmOsc = this.ctx.createOscillator();
    const harmGain = this.ctx.createGain();
    harmOsc.type = 'triangle';
    harmOsc.frequency.setValueAtTime(110, now);
    harmGain.gain.setValueAtTime(0.08, now);

    harmOsc.connect(harmGain);
    harmGain.connect(master);
    harmOsc.start(now);
    this.activeNodes.push(harmOsc, harmGain);

    // Sci-Fi plasma resonance sweep
    const sawOsc = this.ctx.createOscillator();
    const sawFilter = this.ctx.createBiquadFilter();
    const sawGain = this.ctx.createGain();

    sawOsc.type = 'sawtooth';
    sawOsc.frequency.setValueAtTime(165, now);

    sawFilter.type = 'lowpass';
    sawFilter.Q.setValueAtTime(4, now);
    sawFilter.frequency.setValueAtTime(250, now);

    sawGain.gain.setValueAtTime(0.05, now);

    sawOsc.connect(sawFilter);
    sawFilter.connect(sawGain);
    sawGain.connect(master);
    sawOsc.start(now);
    this.activeNodes.push(sawOsc, sawFilter, sawGain);

    // Filter LFO animation
    const animateFilter = () => {
      if (!this.ctx || this.currentWorld !== 'space-station') return;
      const t = this.ctx.currentTime;
      sawFilter.frequency.cancelScheduledValues(t);
      sawFilter.frequency.setValueAtTime(250, t);
      sawFilter.frequency.linearRampToValueAtTime(500, t + 2);
      sawFilter.frequency.linearRampToValueAtTime(250, t + 4);
    };

    animateFilter();
    const timer = window.setInterval(animateFilter, 4000);
    this.activeTimers.push(timer);
  }

  // 4. Fantasy Kingdom: Enchanted Forest Breeze & Chime Sparkles
  private buildFantasyKingdomSoundscape(master: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Soft forest wind
    const noiseBuf = this.getNoiseBuffer();
    if (noiseBuf) {
      const windSource = this.ctx.createBufferSource();
      windSource.buffer = noiseBuf;
      windSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(450, now);
      windFilter.Q.setValueAtTime(2, now);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.06, now);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(master);
      windSource.start(now);
      this.activeNodes.push(windSource, windFilter, windGain);
    }

    // Magical pentatonic chime sparkles
    const pentatonicNotes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
    const triggerChime = () => {
      if (!this.ctx || this.currentWorld !== 'fantasy-kingdom') return;
      const t = this.ctx.currentTime;
      const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];

      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t);

      chimeGain.gain.setValueAtTime(0.001, t);
      chimeGain.gain.linearRampToValueAtTime(0.08, t + 0.05);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(master);
      chimeOsc.start(t);
      chimeOsc.stop(t + 1.8);
    };

    triggerChime();
    const timer = window.setInterval(triggerChime, 3200);
    this.activeTimers.push(timer);
  }

  // 5. Moon Base: Deep Void Drone & Solar Wind Filter
  private buildMoonBaseSoundscape(master: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep spatial void drone
    const voidOsc = this.ctx.createOscillator();
    const voidGain = this.ctx.createGain();
    voidOsc.type = 'sine';
    voidOsc.frequency.setValueAtTime(42, now);
    voidGain.gain.setValueAtTime(0.2, now);

    voidOsc.connect(voidGain);
    voidGain.connect(master);
    voidOsc.start(now);
    this.activeNodes.push(voidOsc, voidGain);

    // Highpass solar wind
    const noiseBuf = this.getNoiseBuffer();
    if (noiseBuf) {
      const solarSource = this.ctx.createBufferSource();
      solarSource.buffer = noiseBuf;
      solarSource.loop = true;

      const solarFilter = this.ctx.createBiquadFilter();
      solarFilter.type = 'highpass';
      solarFilter.frequency.setValueAtTime(1400, now);

      const solarGain = this.ctx.createGain();
      solarGain.gain.setValueAtTime(0.025, now);

      solarSource.connect(solarFilter);
      solarFilter.connect(solarGain);
      solarGain.connect(master);
      solarSource.start(now);
      this.activeNodes.push(solarSource, solarFilter, solarGain);
    }
  }

  // 6. Time Dimension: Clockwork Gears & Ticking
  private buildTimeDimensionSoundscape(master: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Brass gear hum
    const gearOsc = this.ctx.createOscillator();
    const gearGain = this.ctx.createGain();
    gearOsc.type = 'triangle';
    gearOsc.frequency.setValueAtTime(140, now);
    gearGain.gain.setValueAtTime(0.08, now);

    gearOsc.connect(gearGain);
    gearGain.connect(master);
    gearOsc.start(now);
    this.activeNodes.push(gearOsc, gearGain);

    // 120 BPM Clockwork ticks
    const triggerTick = () => {
      if (!this.ctx || this.currentWorld !== 'time-dimension') return;
      const t = this.ctx.currentTime;

      const tickOsc = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();

      tickOsc.type = 'sine';
      tickOsc.frequency.setValueAtTime(950, t);
      tickOsc.frequency.exponentialRampToValueAtTime(200, t + 0.025);

      tickGain.gain.setValueAtTime(0.09, t);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      tickOsc.connect(tickGain);
      tickGain.connect(master);
      tickOsc.start(t);
      tickOsc.stop(t + 0.025);
    };

    triggerTick();
    const timer = window.setInterval(triggerTick, 500); // every 500ms = 120 BPM
    this.activeTimers.push(timer);
  }
}

export const ambientEngine = new AmbientSoundEngine();
