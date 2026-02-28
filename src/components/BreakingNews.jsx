import { useState, useEffect } from 'react';
import './BreakingNews.css';

const LINES = [
  'Severe storm warning for coastal Estonia.',
  'Wind speeds up to 120 km/h expected tonight.',
  'Storm arrives at 22:00.',
];

const TICKER_TEXT =
  '⚠  STORM WARNING ISSUED FOR ALL COASTAL REGIONS  •  RESIDENTS ADVISED TO PREPARE  •  STAY INDOORS AFTER 21:00  •  POWER OUTAGES EXPECTED  •  EMERGENCY SERVICES ON STANDBY  •  ';

function BreakingNews({ onContinue }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers = [];
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 900 + i * 900));
    });
    timers.push(setTimeout(() => setShowButton(true), 900 + LINES.length * 900 + 200));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bn-overlay">
      <div className="bn-screen">

        {/* CRT scan lines */}
        <div className="bn-scanlines" aria-hidden="true" />

        {/* Top bar */}
        <div className="bn-topbar">
          <span className="bn-channel">ETV 1</span>
          <span className="bn-live">● LIVE</span>
        </div>

        {/* Breaking news banner */}
        <div className="bn-banner">
          <span className="bn-banner-icon">⚠</span>
          <span className="bn-banner-text">BREAKING NEWS</span>
        </div>

        {/* News content */}
        <div className="bn-content">
          {LINES.map((line, i) => (
            <p
              key={i}
              className={`bn-line bn-line-${i} ${i < visibleLines ? 'visible' : ''}`}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Continue button */}
        <div className={`bn-continue-wrap ${showButton ? 'visible' : ''}`}>
          <button className="bn-continue-btn" onClick={onContinue}>
            Continue
          </button>
        </div>

        {/* Ticker */}
        <div className="bn-ticker">
          <span className="bn-ticker-label">ALERT</span>
          <div className="bn-ticker-track">
            <span>{TICKER_TEXT}{TICKER_TEXT}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreakingNews;
