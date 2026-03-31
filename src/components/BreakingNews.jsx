import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './BreakingNews.css';

function BreakingNews({ onContinue }) {
  const { t } = useTranslation();
  const LINES = t('breakingNews.lines');
  const TICKER_TEXT = t('breakingNews.ticker');

  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers = [];
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 900 + i * 900));
    });
    timers.push(setTimeout(() => setShowButton(true), 900 + LINES.length * 900 + 200));
    return () => timers.forEach(clearTimeout);
  }, [LINES.length]);

  return (
    <div className="bn-overlay">
      <div className="bn-screen">

        <div className="bn-scanlines" aria-hidden="true" />

        <div className="bn-topbar">
          <span className="bn-channel">{t('breakingNews.channel')}</span>
          <span className="bn-live">{t('breakingNews.live')}</span>
        </div>

        <div className="bn-banner">
          <span className="bn-banner-icon">⚠</span>
          <span className="bn-banner-text">{t('breakingNews.banner')}</span>
        </div>

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

        <div className={`bn-continue-wrap ${showButton ? 'visible' : ''}`}>
          <button className="bn-continue-btn" onClick={onContinue}>
            {t('breakingNews.continue')}
          </button>
        </div>

        <div className="bn-ticker">
          <span className="bn-ticker-label">{t('breakingNews.tickerLabel')}</span>
          <div className="bn-ticker-track">
            <span>{TICKER_TEXT}{TICKER_TEXT}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreakingNews;
