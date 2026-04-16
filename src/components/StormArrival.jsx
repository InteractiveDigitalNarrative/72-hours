import { useEffect } from 'react';
import './StormArrival.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

const BASE_URL = import.meta.env.BASE_URL;

function StormArrival({ onDismiss }) {
  const { muted } = useAudioContext();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4200);

    if (!muted) {
      const thunder = new Audio(BASE_URL + 'Sound/thunder.mp3');
      thunder.volume = 0.85;
      thunder.play().catch(() => {});
    }

    return () => clearTimeout(timer);
  }, [onDismiss, muted]);

  return (
    <div className="storm-arrival">
      <div
        className="storm-bg"
        style={{ backgroundImage: `url(${BASE_URL}Images/winter-storm.jpg)` }}
      />

      {/* Whiteout fog layer */}
      <div className="storm-fog" aria-hidden="true" />

      {/* Blizzard snowflakes */}
      <div className="storm-snow" aria-hidden="true">
        {Array.from({ length: 300 }, (_, i) => {
          const size = 1.5 + Math.random() * 5;
          return (
            <span key={i} className="snow-flake" style={{
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.2 + Math.random() * 1.8}s`,
              opacity: 0.5 + Math.random() * 0.5,
              '--drift': `${-40 + Math.random() * 15}vw`,
            }} />
          );
        })}
      </div>

      {/* Lightning flashes */}
      <div className="storm-lightning" aria-hidden="true" />

      {/* Shake wrapper + content */}
      <div className="storm-shake">
        <div className="storm-content">
          <p className="storm-time">{t('stormArrival.time')}</p>
          <p className="storm-label">{t('stormArrival.label')}</p>
        </div>
      </div>
    </div>
  );
}

export default StormArrival;
