// LoadingScreen.jsx — preloads all audio + images, then lets the user enter
import { useState, useEffect } from 'react';
import './LoadingScreen.css';

const BASE_URL = import.meta.env.BASE_URL;

// Every audio file used anywhere in the game
const AUDIO_ASSETS = [
  'Sound/Menu.mp3',
  'Sound/PreparationMusic.mp3',
  'Sound/radio_noise_loop.wav',
  'Sound/outro-music.mp3',
  'Sound/wind%20woosh%20loop.ogg',
  'Sound/open.ogg',
  'Sound/close.ogg',
  'Sound/water.wav',
  'Sound/fire.ogg',
  'Sound/rustle.flac',
];

const IMAGE_ASSETS = [
  'Images/Room.jpg',
];

const TOTAL = AUDIO_ASSETS.length + IMAGE_ASSETS.length;

export default function LoadingScreen({ onEnter }) {
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let count = 0;

    const done = () => {
      count++;
      setLoaded((n) => n + 1);
    };

    const elements = [];

    AUDIO_ASSETS.forEach((src) => {
      const a = new Audio();
      a.preload = 'auto';
      a.addEventListener('canplay', done, { once: true });
      a.addEventListener('error',    done, { once: true });
      a.src = BASE_URL + src;
      elements.push(a);
    });

    IMAGE_ASSETS.forEach((src) => {
      const img = new Image();
      img.onload  = done;
      img.onerror = done;
      img.src = BASE_URL + src;
      elements.push(img);
    });

    // Failsafe: never hang longer than 10 s
    const timeout = setTimeout(() => setLoaded(TOTAL), 10_000);

    return () => {
      clearTimeout(timeout);
      elements.forEach((el) => { if (el instanceof HTMLAudioElement) el.src = ''; });
    };
  }, []);

  const progress = Math.min(100, Math.round((loaded / TOTAL) * 100));
  const ready    = loaded >= TOTAL;

  return (
    <div
      className="loading-screen"
      style={{ backgroundImage: `url(${BASE_URL}Images/Room.jpg)` }}
    >
      <div className="loading-overlay" />

      <div className="loading-card">
        <div className="loading-badge">EMERGENCY PROTOCOL</div>

        <h1 className="loading-title">STORM ALERT</h1>
        <p className="loading-subtitle">Crisis Management Simulation</p>

        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="loading-status">
          {ready ? 'All systems ready.' : `Loading… ${progress}%`}
        </p>

        <button
          className={`loading-enter-btn${ready ? ' ready' : ''}`}
          onClick={ready ? onEnter : undefined}
          disabled={!ready}
        >
          ENTER
        </button>
      </div>
    </div>
  );
}
