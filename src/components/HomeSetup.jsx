import { useState, useMemo } from 'react';
import './HomeSetup.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDialog } from '../hooks/useDialog';

// Building type — a fixed fact about where you live (pick one).
const BUILDINGS = [
  { id: 'apartment', emoji: '🏢' },
  { id: 'detached',  emoji: '🏠' },
  { id: 'terraced',  emoji: '🏘️' },
  { id: 'rural',     emoji: '🏡' },
];

// Heating system — determines what fails in the outage (pick one).
const HEATINGS = [
  { id: 'district', emoji: '♨️' },
  { id: 'electric', emoji: '🔌' },
  { id: 'wood_gas', emoji: '🪵' },
];

// Things you can toggle that are true about the place (some fixable, some not).
const ITEMS = [
  { id: 'old_windows',    emoji: '🪟' },
  { id: 'balcony_door',   emoji: '🚪' },
  { id: 'exposed_layout', emoji: '🌡️' },
  { id: 'exposed_pipes',  emoji: '🧊' },
];

function computeResult(building, heating, toggled) {
  const has = (id) => !!toggled[id];

  // Weak spots you can actually do something about before the storm.
  const weakSpots = [];
  if (has('old_windows'))  weakSpots.push('old_windows');
  if (has('balcony_door')) weakSpots.push('balcony_door');

  // Fixed structural facts you cannot change — only plan around.
  const fixed = [];
  if (building === 'detached') fixed.push('detached');
  if (building === 'rural')    fixed.push('rural');
  if (has('exposed_layout'))   fixed.push('exposed_layout');

  const hasStove = heating === 'wood_gas';
  const highHeatLoss =
    building === 'detached' || building === 'rural' || has('exposed_layout');

  const tips = [];
  if (!hasStove)             tips.push('no_stove_aspirational');
  if (building === 'apartment') tips.push('apartment_neighbors');

  return {
    building,
    heating,
    weakSpots,
    fixed,
    needsPipeInsulation: has('exposed_pipes'),
    highHeatLoss,
    hasStove,
    tips,
  };
}

function HomeSetup({ onClose, onCancel }) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();
  const dialogRef = useDialog({ onEscape: onCancel });
  const [screen, setScreen] = useState(1);
  const [building, setBuilding] = useState(null);
  const [heating, setHeating] = useState(null);
  const [toggled, setToggled] = useState({});

  const result = useMemo(
    () => computeResult(building, heating, toggled),
    [building, heating, toggled]
  );

  const canContinue = !!building && !!heating;

  const toggle = (id) => {
    playSfx('click');
    setToggled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pick = (setter) => (id) => {
    playSfx('click');
    setter(id);
  };

  const goToSummary = () => {
    if (!canContinue) return;
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

            <div className="hs-group-label">{t('homeSetup.buildingTitle')}</div>
            <div className="hs-items-grid">
              {BUILDINGS.map(item => (
                <button
                  key={item.id}
                  className={`hs-item ${building === item.id ? 'hs-item-on' : ''}`}
                  onClick={() => pick(setBuilding)(item.id)}
                >
                  <span className="hs-item-emoji">{item.emoji}</span>
                  <span className="hs-item-name">{t(`homeSetup.buildingTypes.${item.id}`)}</span>
                  {building === item.id && <span className="hs-item-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="hs-group-label">{t('homeSetup.heatingTitle')}</div>
            <div className="hs-items-grid">
              {HEATINGS.map(item => (
                <button
                  key={item.id}
                  className={`hs-item ${heating === item.id ? 'hs-item-on' : ''}`}
                  onClick={() => pick(setHeating)(item.id)}
                >
                  <span className="hs-item-emoji">{item.emoji}</span>
                  <span className="hs-item-name">{t(`homeSetup.heatingTypes.${item.id}`)}</span>
                  {heating === item.id && <span className="hs-item-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="hs-group-label">{t('homeSetup.itemsTitle')}</div>
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

            <button className="hs-btn-primary" onClick={goToSummary} disabled={!canContinue}>
              {canContinue ? t('homeSetup.continueBtn') : t('homeSetup.continueHint')}
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

            {result.fixed.length > 0 && (
              <div className="hs-summary-section hs-summary-fixed">
                <div className="hs-summary-heading">
                  <span className="hs-summary-dot hs-dot-amber" />
                  {t('homeSetup.fixedTitle')}
                </div>
                <ul className="hs-summary-list">
                  {result.fixed.map(id => (
                    <li key={id}>
                      <span className="hs-summary-bullet">•</span>
                      {t(`homeSetup.fixedLabels.${id}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
