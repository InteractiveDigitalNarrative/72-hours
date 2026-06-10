import { useState, useMemo } from 'react';
import './LightAudit.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDialog } from '../hooks/useDialog';

const ITEMS = [
  { id: 'flashlight',  emoji: '🔦' },
  { id: 'headlamp',    emoji: '💡' },
  { id: 'lantern',     emoji: '🏮' },
  { id: 'candles',     emoji: '🕯️' },
  { id: 'power_bank',  emoji: '🔌' },
];

function computeResult(toggled) {
  const has = (id) => !!toggled[id];

  const gaps = [];
  if (!has('flashlight')) gaps.push('no_flashlight');
  if (!has('headlamp'))   gaps.push('no_handsfree');
  if (!has('lantern'))    gaps.push('no_area');
  if (!has('power_bank')) gaps.push('no_powerbank');

  const tips = [];
  if (has('candles')) tips.push('candle_safety');
  tips.push('battery_rotation');

  return {
    gaps,
    hasFlashlight: has('flashlight'),
    hasHeadlamp:   has('headlamp'),
    hasLantern:    has('lantern'),
    hasCandles:    has('candles'),
    hasPowerBank:  has('power_bank'),
    tips,
  };
}

function LightAudit({ onClose, onCancel }) {
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
    <div className="la-overlay" ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('lightAudit.title')}>
      <div className="la-panel">

        {screen === 1 && (
          <div className="la-screen">
            <div className="la-header">
              <span className="la-icon">🔦</span>
              <h2>{t('lightAudit.title')}</h2>
              <p className="la-subtitle">{t('lightAudit.subtitle')}</p>
            </div>

            <div className="la-note-reminder" dangerouslySetInnerHTML={{
              __html: t('lightAudit.realCheckNote')
            }} />

            <div className="la-items-grid">
              {ITEMS.map(item => {
                const on = !!toggled[item.id];
                return (
                  <button
                    key={item.id}
                    className={`la-item ${on ? 'la-item-on' : ''}`}
                    onClick={() => toggle(item.id)}
                  >
                    <span className="la-item-emoji">{item.emoji}</span>
                    <span className="la-item-name">{t(`lightAudit.items.${item.id}`)}</span>
                    {on && <span className="la-item-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <button className="la-btn-primary" onClick={goToSummary}>
              {t('lightAudit.continueBtn')}
            </button>

            <button className="la-btn-back" onClick={() => { playSfx('close'); onCancel?.(); }}>
              {t('lightAudit.backBtn')}
            </button>
          </div>
        )}

        {screen === 2 && (
          <div className="la-screen">
            <div className="la-header">
              <span className="la-icon">📋</span>
              <h2>{t('lightAudit.summaryTitle')}</h2>
              <p className="la-subtitle">{t('lightAudit.summarySubtitle')}</p>
            </div>

            <div className="la-summary-section la-summary-gaps">
              <div className="la-summary-heading">
                <span className="la-summary-dot la-dot-red" />
                {t('lightAudit.gapsTitle')}
              </div>
              {result.gaps.length === 0 ? (
                <p className="la-summary-empty">{t('lightAudit.gapsEmpty')}</p>
              ) : (
                <ul className="la-summary-list">
                  {result.gaps.map(id => (
                    <li key={id}>
                      <span className="la-summary-bullet">•</span>
                      {t(`lightAudit.gapLabels.${id}`)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result.tips.length > 0 && (
              <div className="la-summary-section la-summary-tips">
                <div className="la-summary-heading">
                  <span className="la-summary-dot la-dot-blue" />
                  {t('lightAudit.tipsTitle')}
                </div>
                <ul className="la-summary-list">
                  {result.tips.map(tip => (
                    <li key={tip}>
                      <span className="la-tip-icon">💡</span>
                      {t(`lightAudit.tipLabels.${tip}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="la-btn-primary" onClick={handleDone}>
              {t('lightAudit.doneBtn')}
            </button>

            <button className="la-btn-back" onClick={() => { playSfx('click'); setScreen(1); }}>
              {t('lightAudit.editBtn')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default LightAudit;
