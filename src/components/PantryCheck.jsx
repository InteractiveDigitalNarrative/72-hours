import { useState, useMemo } from 'react';
import './PantryCheck.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

const ITEMS = [
  { id: 'bread',      emoji: '🍞', spoils: true  },
  { id: 'canned',     emoji: '🥫', spoils: false },
  { id: 'nuts_pb',    emoji: '🥜', spoils: false },
  { id: 'produce',    emoji: '🍎', spoils: true  },
  { id: 'dairy',      emoji: '🥛', spoils: true  },
  { id: 'frozen',     emoji: '🧊', spoils: true  },
  { id: 'kid_snacks', emoji: '🍪', spoils: false },
  { id: 'soft_food',  emoji: '🍯', spoils: false },
];

function computeResult(toggled, household) {
  const has = (id) => !!toggled[id];

  const coverage = {
    shelf_stable_protein: has('canned') || has('nuts_pb'),
    no_cook_food:         has('nuts_pb') || has('kid_snacks') || has('soft_food'),
    kid_snack:            has('kid_snacks'),
    soft_food:            has('soft_food'),
  };

  const gaps = [];
  if (!coverage.shelf_stable_protein) gaps.push('shelf_stable_protein');
  if (!coverage.no_cook_food)         gaps.push('no_cook_food');
  if (household?.hasChildren && !coverage.kid_snack) gaps.push('kid_snack');
  if (household?.hasElderly  && !coverage.soft_food) gaps.push('soft_food');

  const useFirst = ITEMS.filter(it => it.spoils && has(it.id)).map(it => it.id);

  return { gaps, useFirst };
}

function PantryCheck({ household = {}, onClose, onCancel }) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();
  const [screen, setScreen] = useState(1);
  const [toggled, setToggled] = useState({});

  const result = useMemo(() => computeResult(toggled, household), [toggled, household]);

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

  const elderlyRelation = household?.elderlyRelation;

  return (
    <div className="pc-overlay">
      <div className="pc-panel">

        {screen === 1 && (
          <div className="pc-screen">
            <div className="pc-header">
              <span className="pc-icon">🔍</span>
              <h2>{t('pantry.title')}</h2>
              <p className="pc-subtitle">{t('pantry.subtitle')}</p>
            </div>

            <div className="pc-note-reminder" dangerouslySetInnerHTML={{
              __html: t('pantry.realCheckNote')
            }} />

            <div className="pc-items-grid">
              {ITEMS.map(item => {
                const on = !!toggled[item.id];
                return (
                  <button
                    key={item.id}
                    className={`pc-item ${on ? 'pc-item-on' : ''}`}
                    onClick={() => toggle(item.id)}
                  >
                    <span className="pc-item-emoji">{item.emoji}</span>
                    <span className="pc-item-name">{t(`pantry.items.${item.id}`)}</span>
                    {on && <span className="pc-item-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <button className="pc-btn-primary" onClick={goToSummary}>
              {t('pantry.continueBtn')}
            </button>

            <button className="pc-btn-back" onClick={() => { playSfx('close'); onCancel?.(); }}>
              {t('pantry.backBtn')}
            </button>
          </div>
        )}

        {screen === 2 && (
          <div className="pc-screen">
            <div className="pc-header">
              <span className="pc-icon">📋</span>
              <h2>{t('pantry.summaryTitle')}</h2>
              <p className="pc-subtitle">{t('pantry.summarySubtitle')}</p>
            </div>

            <div className="pc-summary-section pc-summary-spoil">
              <div className="pc-summary-heading">
                <span className="pc-summary-dot pc-dot-yellow" />
                {t('pantry.useFirstTitle')}
              </div>
              {result.useFirst.length === 0 ? (
                <p className="pc-summary-empty">{t('pantry.useFirstEmpty')}</p>
              ) : (
                <ul className="pc-summary-list">
                  {result.useFirst.map(id => (
                    <li key={id}>
                      <span className="pc-summary-item-emoji">
                        {ITEMS.find(i => i.id === id)?.emoji}
                      </span>
                      {t(`pantry.items.${id}`)}
                      <span className="pc-summary-reason">
                        {t(`pantry.spoilReason.${id}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pc-summary-section pc-summary-gap">
              <div className="pc-summary-heading">
                <span className="pc-summary-dot pc-dot-red" />
                {t('pantry.gapsTitle')}
              </div>
              {result.gaps.length === 0 ? (
                <p className="pc-summary-empty">{t('pantry.gapsEmpty')}</p>
              ) : (
                <ul className="pc-summary-list">
                  {result.gaps.map(gap => (
                    <li key={gap}>
                      <span className="pc-summary-bullet">•</span>
                      {gap === 'soft_food' && elderlyRelation
                        ? t('pantry.gapLabels.soft_food_named', { name: elderlyRelation })
                        : t(`pantry.gapLabels.${gap}`)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {household?.hasElderly && (
              <div className="pc-med-reminder">
                💊 {t('pantry.medReminder', { name: elderlyRelation || t('pantry.elderlyFallback') })}
              </div>
            )}

            <button className="pc-btn-primary" onClick={handleDone}>
              {t('pantry.doneBtn')}
            </button>

            <button className="pc-btn-back" onClick={() => { playSfx('click'); setScreen(1); }}>
              {t('pantry.editBtn')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PantryCheck;
