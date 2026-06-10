import { useState, useMemo } from 'react';
import './HomeSetup.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDialog } from '../hooks/useDialog';

const ITEMS = [
  { id: 'apartment',      emoji: '🏢' },
  { id: 'exposed_layout', emoji: '🌡️' },
  { id: 'old_windows',    emoji: '🪟' },
  { id: 'balcony_door',   emoji: '🚪' },
  { id: 'exposed_pipes',  emoji: '🧊' },
  { id: 'wood_stove',     emoji: '🪵' },
];

function computeResult(toggled) {
  const has = (id) => !!toggled[id];

  const weakSpots = [];
  if (has('old_windows'))    weakSpots.push('old_windows');
  if (has('balcony_door'))   weakSpots.push('balcony_door');
  if (has('exposed_layout')) weakSpots.push('exposed_layout');

  const tips = [];
  if (!has('wood_stove'))    tips.push('no_stove_aspirational');
  if (has('apartment'))      tips.push('apartment_neighbors');

  return {
    weakSpots,
    needsPipeInsulation: has('exposed_pipes'),
    highHeatLoss: !has('apartment') || has('exposed_layout'),
    hasStove: has('wood_stove'),
    tips,
  };
}

function HomeSetup({ onClose, onCancel }) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();
  const dialogRef = useDialog({ onEscape: onCancel });
  const [screen, setScreen] = useState(1);
  const [toggled, setToggled] = useState({});

  const result = useMemo(() => computeResult(toggled), [toggled]);

  const toggle = (id) => {
    playSfx('click');
    setToggled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const goToSummary = () => {
    playSfx('click');
    setScreen(2);
  };

  const handleDone = () => {
    playSfx('close');
    onClose?.(result);
  };

  return (
    <div className="hs-overlay" ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('homeSetup.title')}>
      <div className="hs-panel">

        {screen === 1 && (
          <div className="hs-screen">
            <div className="hs-header">
              <span className="hs-icon">🏠</span>
              <h2>{t('homeSetup.title')}</h2>
              <p className="hs-subtitle">{t('homeSetup.subtitle')}</p>
            </div>

            <div className="hs-note-reminder" dangerouslySetInnerHTML={{
              __html: t('homeSetup.realCheckNote')
            }} />

            <div className="hs-items-grid">
              {ITEMS.map(item => {
                const on = !!toggled[item.id];
                return (
                  <button
                    key={item.id}
                    className={`hs-item ${on ? 'hs-item-on' : ''}`}
                    onClick={() => toggle(item.id)}
                  >
                    <span className="hs-item-emoji">{item.emoji}</span>
                    <span className="hs-item-name">{t(`homeSetup.items.${item.id}`)}</span>
                    {on && <span className="hs-item-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <button className="hs-btn-primary" onClick={goToSummary}>
              {t('homeSetup.continueBtn')}
            </button>

            <button className="hs-btn-back" onClick={() => { playSfx('close'); onCancel?.(); }}>
              {t('homeSetup.backBtn')}
            </button>
          </div>
        )}

        {screen === 2 && (
          <div className="hs-screen">
            <div className="hs-header">
              <span className="hs-icon">📋</span>
              <h2>{t('homeSetup.summaryTitle')}</h2>
              <p className="hs-subtitle">{t('homeSetup.summarySubtitle')}</p>
            </div>

            <div className="hs-summary-section hs-summary-weak">
              <div className="hs-summary-heading">
                <span className="hs-summary-dot hs-dot-red" />
                {t('homeSetup.weakSpotsTitle')}
              </div>
              {result.weakSpots.length === 0 && !result.needsPipeInsulation ? (
                <p className="hs-summary-empty">{t('homeSetup.weakSpotsEmpty')}</p>
              ) : (
                <ul className="hs-summary-list">
                  {result.weakSpots.map(id => (
                    <li key={id}>
                      <span className="hs-summary-bullet">•</span>
                      {t(`homeSetup.weakSpotLabels.${id}`)}
                    </li>
                  ))}
                  {result.needsPipeInsulation && (
                    <li>
                      <span className="hs-summary-bullet">•</span>
                      {t('homeSetup.weakSpotLabels.exposed_pipes')}
                    </li>
                  )}
                </ul>
              )}
            </div>

            {result.tips.length > 0 && (
              <div className="hs-summary-section hs-summary-tips">
                <div className="hs-summary-heading">
                  <span className="hs-summary-dot hs-dot-blue" />
                  {t('homeSetup.tipsTitle')}
                </div>
                <ul className="hs-summary-list">
                  {result.tips.map(tip => (
                    <li key={tip}>
                      <span className="hs-tip-icon">💡</span>
                      {t(`homeSetup.tipLabels.${tip}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="hs-btn-primary" onClick={handleDone}>
              {t('homeSetup.doneBtn')}
            </button>

            <button className="hs-btn-back" onClick={() => { playSfx('click'); setScreen(1); }}>
              {t('homeSetup.editBtn')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default HomeSetup;
