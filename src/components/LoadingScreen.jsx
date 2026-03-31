// LoadingScreen.jsx — preloads all audio + images, then lets the user enter
import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './LoadingScreen.css';

const BASE_URL = import.meta.env.BASE_URL;

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

const IMAGE_ASSETS = ['Images/winter-storm.jpg'];

const TOTAL = AUDIO_ASSETS.length + IMAGE_ASSETS.length;

export default function LoadingScreen({ onEnter }) {
  const { t } = useTranslation();
  const STATUS_LINES = t('loadingScreen.statusLines');
  const [loaded, setLoaded]       = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  // Cycle through status lines while loading
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_LINES.length);
    }, 1600);
    return () => clearInterval(id);
  }, [STATUS_LINES.length]);

  useEffect(() => {
    const done = () => setLoaded((n) => n + 1);
    const elements = [];

    AUDIO_ASSETS.forEach((src) => {
      const a = new Audio();
      a.preload = 'auto';
      a.addEventListener('canplay', done, { once: true });
      a.addEventListener('error',   done, { once: true });
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
      style={{ backgroundImage: `url(${BASE_URL}Images/winter-storm.jpg)` }}
    >
      {/* Layered overlays for depth */}
      <div className="loading-overlay" />
      <div className="loading-scanlines" />
      <div className="loading-vignette" />

      <div className="loading-card">
        {/* Title */}
        <div className="loading-title-block">
          <h1 className="loading-title">{t('loadingScreen.title').split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}</h1>
          <p className="loading-tagline">{t('loadingScreen.tagline')}</p>
        </div>

        {/* Divider */}
        <div className="loading-divider" />

        {/* Progress area */}
        <div className="loading-progress-area">
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="loading-status">
            {ready ? t('loadingScreen.ready') : STATUS_LINES[statusIdx]}
          </p>
        </div>

        {/* Enter button */}
        <button
          className={`loading-enter-btn${ready ? ' ready' : ''}`}
          onClick={ready ? onEnter : undefined}
          disabled={!ready}
        >
          {ready ? t('loadingScreen.enter') : `${progress}%`}
        </button>

      </div>

      {/* EU funding logo */}
      <div className="loading-eu-logo">
        <img src={`${BASE_URL}Images/EULogo.jpg`} alt="Co-funded by the European Union" />
      </div>
    </div>
  );
}
