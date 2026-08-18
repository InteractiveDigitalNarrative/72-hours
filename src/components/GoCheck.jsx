import { useState, useEffect, useRef } from 'react';
import './GoCheck.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

// Real-time "go and look" gate.
//
// The game keeps telling players to physically check their home. A flat time
// cost can't tell an honest look from a click-through, so this charges the
// actual minutes spent away instead — capped at `flatCost` so it can never be
// worse than the old flat charge, and floored at 1 so an instant click still
// costs something.
//
// Opting out ("I can't check right now") charges the full flat cost: guessing
// is the expensive option, knowing is the cheap one. That keeps the incentive
// pointed at the behaviour the game is actually trying to teach, and keeps it
// playable for anyone who can't get up and walk around mid-session.

const MIN_COST = 1;

// "I'm back" stays locked for a bit, because otherwise the cheapest route
// through the game is to click it instantly and go nowhere — cheaper even than
// opting out. This can't make anyone actually walk to the kitchen, but it does
// stop a reflex click from being the optimal play. The opt-out stays available
// throughout, so nobody who genuinely can't get up is held here.
const DEFAULT_MIN_AWAY_SECONDS = 45;

const TASK_ICONS = {
  kitchen:    '🚶',
  flashlight: '🔦',
  radio:      '📻',
  water:      '🚰',
  medicines:  '💊',
  home:       '🏠',
};

// Elapsed time comes from wall-clock deltas, never from counting ticks:
// background tabs get their timers throttled to ~1/min and a sleeping machine
// stops them entirely, both of which would undercount a real trip away.
function costFor(elapsedMs, flatCost) {
  const minutes = Math.round(elapsedMs / 60000);
  return Math.max(MIN_COST, Math.min(flatCost, minutes));
}

function formatClock(elapsedMs) {
  const total = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function GoCheck({
  task = 'kitchen',
  flatCost = 10,
  minAwaySeconds = DEFAULT_MIN_AWAY_SECONDS,
  onBack,
  onSkip,
}) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();

  const startedAt = useRef(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current);
    }, 500);
    return () => clearInterval(id);
  }, []);

  const cost = costFor(elapsedMs, flatCost);
  const capped = cost >= flatCost;

  const lockRemainingSec = Math.ceil(Math.max(0, minAwaySeconds * 1000 - elapsedMs) / 1000);
  const locked = lockRemainingSec > 0;

  const handleBack = () => {
    if (locked) return;
    playSfx('success');
    onBack?.(costFor(Date.now() - startedAt.current, flatCost));
  };

  const handleSkip = () => {
    playSfx('click');
    onSkip?.(flatCost);
  };

  return (
    <div className="gc-overlay" role="dialog" aria-modal="true" aria-label={t('goCheck.title')}>
      <div className="gc-panel">
        <div className="gc-header">
          <span className="gc-icon">{TASK_ICONS[task] || TASK_ICONS.kitchen}</span>
          <h2>{t('goCheck.title')}</h2>
          <p className="gc-subtitle">{t(`goCheck.tasks.${task}.subtitle`)}</p>
        </div>

        <div className="gc-body">{t(`goCheck.tasks.${task}.body`)}</div>

        <div className="gc-clock-block">
          <div className="gc-clock-label">{t('goCheck.away')}</div>
          <div className="gc-clock" aria-live="off">{formatClock(elapsedMs)}</div>
          <div className={`gc-cost ${capped ? 'gc-cost-capped' : ''}`} aria-live="polite">
            {t('goCheck.cost', { minutes: cost })}
            {capped && <span className="gc-cost-cap"> {t('goCheck.cappedTag')}</span>}
          </div>
        </div>

        <button
          className={`gc-btn-primary ${locked ? 'gc-btn-locked' : ''}`}
          onClick={handleBack}
          disabled={locked}
        >
          {locked
            ? t('goCheck.backBtnLocked', { seconds: lockRemainingSec })
            : t('goCheck.backBtn')}
        </button>

        <button className="gc-btn-skip" onClick={handleSkip}>
          {t('goCheck.skipBtn')}
        </button>
      </div>
    </div>
  );
}
