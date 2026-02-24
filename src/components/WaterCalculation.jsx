import { useState } from 'react';
import './WaterCalculation.css';

const PEOPLE = 2;
const DAYS = 3;
const L_PER_PERSON_DAY = 3;
const CORRECT = PEOPLE * DAYS * L_PER_PERSON_DAY; // 18

const OPTIONS = [
  {
    value: 6,
    label: '6 litres',
    correct: false,
    ridiculous: false,
    feedback: `That's only enough for one person for ${DAYS} days. You need to account for every member of your household.`,
  },
  {
    value: CORRECT,
    label: `${CORRECT} litres`,
    correct: true,
    ridiculous: false,
    feedback: `Exactly right. ${L_PER_PERSON_DAY}L × ${PEOPLE} people × ${DAYS} days = ${CORRECT} litres. Your household is well prepared.`,
  },
  {
    value: 12,
    label: '12 litres',
    correct: false,
    ridiculous: false,
    feedback: `Close, but that uses 2L per person per day. The guideline is ${L_PER_PERSON_DAY}L — don't forget the extra litre for cooking and hygiene.`,
  },
  {
    value: 100,
    label: '100 litres',
    correct: false,
    ridiculous: true,
    feedback: `That's more than most households use in a week of normal life. You need enough to survive, not to fill a paddling pool.`,
  },
];

function WaterCalculation({ onClose }) {
  const [screen, setScreen] = useState(1);
  const [selected, setSelected] = useState(null);
  const [measuredLitres, setMeasuredLitres] = useState('');

  const handleSelect = (opt) => {
    setSelected(opt);
  };

  const handleMeasuredChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { setMeasuredLitres(''); return; }
    const val = parseInt(raw, 10);
    setMeasuredLitres(isNaN(val) || val < 0 ? '' : val);
  };

  // After a wrong pick: keep the correct option enabled so the player can
  // still choose 18L. Disable everything once they get it right.
  const isDisabled = (opt) => {
    if (!selected) return false;
    if (selected.correct) return true;   // got it right → lock all
    if (opt.correct) return false;       // correct option stays clickable
    return true;                         // other wrong options locked
  };

  // Fade wrong options that aren't selected, but never fade the correct
  // option while the player still has a chance to pick it.
  const isFaded = (opt) => {
    if (!selected || selected.value === opt.value) return false;
    if (!selected.correct && opt.correct) return false; // keep 18L visible
    return true;
  };

  return (
    <div className="wc-overlay">
      <div className="wc-panel">

        {/* ── SCREEN 1: Formula ─────────────────────────── */}
        {screen === 1 && (
          <div className="wc-screen">
            <div className="wc-header">
              <span className="wc-icon">💧</span>
              <h2>Water Preparation</h2>
              <p className="wc-subtitle">Do you know how much you actually need?</p>
            </div>

            <div className="wc-info-block">
              <p className="wc-text">
                Emergency guidelines recommend storing <strong>{L_PER_PERSON_DAY} litres</strong> of water
                per person per day.
              </p>

              <div className="wc-formula-box">
                <div className="wc-formula-row">
                  <div className="wc-formula-cell">
                    <span className="wc-formula-value">{L_PER_PERSON_DAY}L</span>
                    <span className="wc-formula-caption">per person/day</span>
                  </div>
                  <span className="wc-formula-op">×</span>
                  <div className="wc-formula-cell">
                    <span className="wc-formula-value">{PEOPLE}</span>
                    <span className="wc-formula-caption">people</span>
                  </div>
                  <span className="wc-formula-op">×</span>
                  <div className="wc-formula-cell">
                    <span className="wc-formula-value">{DAYS}</span>
                    <span className="wc-formula-caption">days</span>
                  </div>
                  <span className="wc-formula-op">=</span>
                  <div className="wc-formula-cell wc-formula-unknown">
                    <span className="wc-formula-value">?</span>
                    <span className="wc-formula-caption">litres needed</span>
                  </div>
                </div>
              </div>

              <p className="wc-text">
                Your household has <strong>{PEOPLE} people</strong>. The storm is forecast
                to last up to <strong>{DAYS} days</strong>. How much water should you store?
              </p>

              <div className="wc-note-reminder">
                🗒️ <strong>Write this down</strong> — you may need this formula later in the game.
              </div>
            </div>

            <button className="wc-btn-primary" onClick={() => setScreen(2)}>
              Test your knowledge →
            </button>
          </div>
        )}

        {/* ── SCREEN 3: Kitchen measurement ─────────────── */}
        {screen === 3 && (
          <div className="wc-screen">
            <div className="wc-header">
              <span className="wc-icon">🚰</span>
              <h2>Check Your Water Supply</h2>
              <p className="wc-subtitle">Go to your kitchen right now</p>
            </div>

            <div className="wc-info-block">
              <p className="wc-text">
                Look around your kitchen. Count any water you already have stored — bottles, jugs, pitchers, kettles, or any other containers.
              </p>
              <p className="wc-text">
                How many litres do you currently have at home?
              </p>
              <div className="wc-input-group">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={measuredLitres}
                  onChange={handleMeasuredChange}
                  className="wc-number-input"
                />
                <span className="wc-input-unit">litres</span>
              </div>
              <p className="wc-text wc-text-hint">
                Enter 0 if you have nothing stored — that's okay, we'll work with what we have.
              </p>
            </div>

            <button className="wc-btn-primary" onClick={() => onClose(selected?.correct ?? false, measuredLitres === '' ? 0 : Number(measuredLitres))}>
              Continue →
            </button>
          </div>
        )}

        {/* ── SCREEN 2: Quiz ────────────────────────────── */}
        {screen === 2 && (
          <div className="wc-screen">
            <div className="wc-header">
              <span className="wc-icon">🧮</span>
              <h2>How much water do you need?</h2>
              <p className="wc-subtitle">
                {L_PER_PERSON_DAY}L × {PEOPLE} people × {DAYS} days = ?
              </p>
            </div>

            <div className="wc-options">
              {OPTIONS.map((opt) => {
                const isSelected = selected?.value === opt.value;
                const stateClass = isSelected
                  ? opt.correct ? 'wc-option-correct' : 'wc-option-wrong'
                  : '';

                return (
                  <button
                    key={opt.value}
                    className={[
                      'wc-option',
                      stateClass,
                      isFaded(opt) ? 'wc-option-faded' : '',
                    ].join(' ')}
                    onClick={() => handleSelect(opt)}
                    disabled={isDisabled(opt)}
                  >
                    <span className="wc-option-label">{opt.label}</span>
                    {isSelected && (
                      <span className="wc-option-feedback">{opt.feedback}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <button className="wc-btn-primary" onClick={() => setScreen(3)}>
                {selected.correct ? 'Check your water supply →' : 'Continue anyway →'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default WaterCalculation;
