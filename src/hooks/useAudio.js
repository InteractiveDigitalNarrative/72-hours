// useAudio.js — ambient crossfade + dedicated wind layer + Web Audio SFX synthesis
import { useRef, useState, useCallback, useEffect } from 'react';

const BASE_URL = import.meta.env.BASE_URL;

// Main ambient track source paths (relative to BASE_URL)
// 'storm' is removed — wind is now a separate always-on layer
const AMBIENT_SRCS = {
  menu:  'Sound/Menu.mp3',
  prep:  'Sound/PreparationMusic.mp3',
  radio: 'Sound/radio_noise_loop.wav',
  outro: 'Sound/outro-music.mp3',
};

// Target playback volumes per main ambient track
const AMBIENT_VOL = {
  menu:  0.45,
  prep:  0.5,
  radio: 0.5,
  outro: 0.7,
};

// Wind volumes mapped to the three weather stages (15 / 48 / 85 km/h)
const WIND_VOLS = [0.07, 0.28, 0.52];

const FADE_MS = 1400; // ambient crossfade duration in ms
const WIND_FADE_MS = 2500; // wind volume transition — slower for natural feel

export function useAudio() {
  const [muted, setMuted] = useState(
    () => localStorage.getItem('soundMuted') === 'true'
  );
  const mutedRef = useRef(muted);

  // ── Main ambient: two Audio elements for crossfading (A / B slots) ──────────
  const audioARef = useRef(null);
  const audioBRef = useRef(null);
  const activeSlotRef = useRef('a');
  const currentTrackRef = useRef(null);
  const fadeTimersRef = useRef([]);

  // ── Dedicated wind layer ─────────────────────────────────────────────────────
  const windAudioRef = useRef(null);
  const windTargetVolRef = useRef(0); // desired vol (ignoring mute)
  const windFadeTimerRef = useRef(null);

  // ── Web Audio context for SFX ────────────────────────────────────────────────
  const audioCtxRef = useRef(null);

  // Initialise all audio elements once
  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.volume = 0;
    audioARef.current = a;

    const b = new Audio();
    b.loop = true;
    b.volume = 0;
    audioBRef.current = b;

    const w = new Audio(BASE_URL + 'Sound/wind%20woosh%20loop.ogg');
    w.loop = true;
    w.volume = 0;
    windAudioRef.current = w;
    // Do NOT call play() here — autoplay is blocked before a user gesture.
    // setWindVolume() will start it after the first interaction.

    return () => {
      a.pause();
      b.pause();
      w.pause();
      fadeTimersRef.current.forEach(clearInterval);
      if (windFadeTimerRef.current) clearInterval(windFadeTimerRef.current);
    };
  }, []);

  const getSlotAudio = (slot) =>
    slot === 'a' ? audioARef.current : audioBRef.current;

  // Animate an audio element's volume from `from` → `to` over `duration` ms
  const fadeVolume = (el, from, to, duration, timerBucket, onComplete) => {
    if (!el) return;
    const steps = 30;
    const stepMs = duration / steps;
    const delta = (to - from) / steps;
    let step = 0;
    el.volume = Math.max(0, Math.min(1, from));

    const id = setInterval(() => {
      step++;
      el.volume = Math.max(0, Math.min(1, from + delta * step));
      if (step >= steps) {
        clearInterval(id);
        el.volume = Math.max(0, Math.min(1, to));
        if (timerBucket) {
          timerBucket.current = timerBucket.current?.filter?.((x) => x !== id);
        }
        onComplete?.();
      }
    }, stepMs);

    if (Array.isArray(timerBucket?.current)) {
      timerBucket.current.push(id);
    }
    return id;
  };

  // ── Wind volume control ──────────────────────────────────────────────────────

  // Smoothly transition wind to a new volume level (0–1).
  // Stores the target so mute/unmute can restore it correctly.
  const setWindVolume = useCallback((targetVol) => {
    windTargetVolRef.current = targetVol;
    const wind = windAudioRef.current;
    if (!wind) return;

    // Start the loop on first call — by now the user has interacted with the page
    if (wind.paused) {
      wind.play().catch((e) => console.warn('[Wind] play blocked:', e));
    }

    // Clear any in-progress wind fade
    if (windFadeTimerRef.current) {
      clearInterval(windFadeTimerRef.current);
      windFadeTimerRef.current = null;
    }

    const effectiveVol = mutedRef.current ? 0 : targetVol;
    const from = wind.volume;
    const to = effectiveVol;
    if (Math.abs(to - from) < 0.001) return;

    const steps = 30;
    const stepMs = WIND_FADE_MS / steps;
    const delta = (to - from) / steps;
    let step = 0;
    wind.volume = Math.max(0, Math.min(1, from));

    windFadeTimerRef.current = setInterval(() => {
      step++;
      wind.volume = Math.max(0, Math.min(1, from + delta * step));
      if (step >= steps) {
        clearInterval(windFadeTimerRef.current);
        windFadeTimerRef.current = null;
        wind.volume = Math.max(0, Math.min(1, to));
      }
    }, stepMs);
  }, []);

  // ── Main ambient crossfade ───────────────────────────────────────────────────

  const playAmbient = useCallback((trackKey) => {
    if (trackKey === currentTrackRef.current) return;
    currentTrackRef.current = trackKey;

    const currSlot = activeSlotRef.current;
    const nextSlot = currSlot === 'a' ? 'b' : 'a';
    const currAudio = getSlotAudio(currSlot);
    const nextAudio = getSlotAudio(nextSlot);
    if (!currAudio || !nextAudio) return;

    if (!trackKey) {
      fadeVolume(currAudio, currAudio.volume, 0, FADE_MS, fadeTimersRef, () => currAudio.pause());
      return;
    }

    const targetVol = mutedRef.current ? 0 : (AMBIENT_VOL[trackKey] ?? 0.3);

    nextAudio.src = BASE_URL + AMBIENT_SRCS[trackKey];
    nextAudio.volume = 0;
    activeSlotRef.current = nextSlot;

    nextAudio.play().catch((e) => console.warn('[Audio] play blocked:', e));
    fadeVolume(nextAudio, 0, targetVol, FADE_MS, fadeTimersRef);

    if (currAudio.src && !currAudio.paused) {
      fadeVolume(currAudio, currAudio.volume, 0, FADE_MS, fadeTimersRef, () => {
        currAudio.pause();
        currAudio.src = '';
      });
    }
  }, []);

  // ── Mute / unmute ────────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      localStorage.setItem('soundMuted', String(next));

      // Apply to main ambient
      const currAudio = getSlotAudio(activeSlotRef.current);
      if (currAudio && currentTrackRef.current) {
        currAudio.volume = next ? 0 : (AMBIENT_VOL[currentTrackRef.current] ?? 0.3);
      }

      // Apply to wind layer
      if (windAudioRef.current) {
        windAudioRef.current.volume = next ? 0 : windTargetVolRef.current;
      }

      return next;
    });
  }, []);

  // ── SFX (Web Audio API) ──────────────────────────────────────────────────────

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSfx = useCallback(
    (name, options = {}) => {
      if (mutedRef.current) return;
      try {
        const ctx = getAudioCtx();
        sfxFns[name]?.(ctx, options);
      } catch (e) {
        console.warn('[SFX]', e);
      }
    },
    [getAudioCtx]
  );

  return { muted, toggleMute, playAmbient, playSfx, setWindVolume, WIND_VOLS };
}

// ─── Web Audio SFX Synthesis ─────────────────────────────────────────────────

function tone(ctx, freq, type, t0, dur, peak) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  g.gain.setValueAtTime(peak, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Standard DTMF frequencies for phone keypad
const DTMF = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

const sfxFns = {
  // Phone keypad digit press — authentic DTMF dual tones
  dtmf(ctx, { digit }) {
    const freqs = DTMF[digit];
    if (!freqs) return;
    const now = ctx.currentTime;
    freqs.forEach((f) => tone(ctx, f, 'sine', now, 0.12, 0.12));
  },

  // Soft UI click for story choices
  click(ctx) {
    tone(ctx, 1100, 'sine', ctx.currentTime, 0.055, 0.07);
  },

  // File-based open/close SFX
  open() {
    const a = new Audio(BASE_URL + 'Sound/open.ogg');
    a.volume = 0.6;
    a.play().catch(() => {});
  },

  close() {
    const a = new Audio(BASE_URL + 'Sound/close.ogg');
    a.volume = 0.6;
    a.play().catch(() => {});
  },

  // Three-note ascending chime — correct call
  success(ctx) {
    const now = ctx.currentTime;
    [[523, 0], [659, 0.13], [784, 0.26]].forEach(([f, d]) =>
      tone(ctx, f, 'sine', now + d, 0.45, 0.1)
    );
  },

  // Descending sawtooth buzz — wrong call
  fail(ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
    osc.type = 'sawtooth';
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.55);
  },

  // Two-note ding — item added to basket
  purchase(ctx) {
    const now = ctx.currentTime;
    tone(ctx, 880, 'sine', now, 0.1, 0.08);
    tone(ctx, 1108, 'sine', now + 0.09, 0.12, 0.06);
  },

  // ── Preparation category SFX ─────────────────────────────────────────────

  prep_water() {
    const a = new Audio(BASE_URL + 'Sound/water.wav');
    a.volume = 0.6;
    a.play().catch(() => {});
  },

  prep_food() {
    const a = new Audio(BASE_URL + 'Sound/rustle.flac');
    a.volume = 0.65;
    a.play().catch(() => {});
  },

  prep_heat() {
    const PEAK_VOL = 0.6;
    const FADE_SEC = 1.5;
    const a = new Audio(BASE_URL + 'Sound/fire.ogg');
    a.volume = PEAK_VOL;
    a.addEventListener('loadedmetadata', () => {
      a.play().catch(() => {});
      const delay = Math.max(0, (a.duration - FADE_SEC) * 1000);
      setTimeout(() => {
        const steps = 30;
        const stepMs = (FADE_SEC * 1000) / steps;
        let step = 0;
        const id = setInterval(() => {
          step++;
          a.volume = Math.max(0, PEAK_VOL * (1 - step / steps));
          if (step >= steps) clearInterval(id);
        }, stepMs);
      }, delay);
    }, { once: true });
  },

  // Flashlight — sharp mechanical double-click
  prep_light(ctx) {
    const now = ctx.currentTime;
    [0, 0.08].forEach((delay) => {
      tone(ctx, 2200, 'square', now + delay, 0.018, 0.12);
      tone(ctx, 600,  'sine',   now + delay, 0.03,  0.06);
    });
  },

  // Radio — filtered white noise burst (static)
  prep_info(ctx) {
    const now = ctx.currentTime;
    const len = ctx.sampleRate * 0.32;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2800;
    filter.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.35);
  },

  // Medication — three quick pill-rattle bursts
  prep_medication(ctx) {
    const now = ctx.currentTime;
    [0, 0.09, 0.18].forEach((delay) => {
      const len = Math.floor(ctx.sampleRate * 0.07);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14, now + delay);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);
      src.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      src.start(now + delay);
      src.stop(now + delay + 0.08);
    });
  },
};
