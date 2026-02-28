import { useEffect } from 'react';
import './StormArrival.css';
import { useAudioContext } from '../context/AudioContext';

const BASE_URL = import.meta.env.BASE_URL;

function StormArrival({ onDismiss }) {
  const { muted } = useAudioContext();

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

      {/* Rain streaks */}
      <div className="storm-rain" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} className="rain-drop" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.2}s`,
            animationDuration: `${0.5 + Math.random() * 0.4}s`,
            opacity: 0.3 + Math.random() * 0.5,
          }} />
        ))}
      </div>

      {/* Lightning flashes */}
      <div className="storm-lightning" aria-hidden="true" />

      {/* Shake wrapper + content */}
      <div className="storm-shake">
        <div className="storm-content">
          <p className="storm-time">3:47 AM</p>
          <p className="storm-label">The storm has arrived.</p>
        </div>
      </div>
    </div>
  );
}

export default StormArrival;
