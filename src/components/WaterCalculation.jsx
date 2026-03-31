import { useState } from 'react';
import './WaterCalculation.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

function WaterCalculation({ familySize = 2, onClose, onCancel }) {
  const { playSfx } = useAudioContext();
  const { t } = useTranslation();
  const PEOPLE = familySize;
  const DAYS = 3;
  const L_PER_PERSON_DAY = 3;
  const CORRECT = PEOPLE * DAYS * L_PER_PERSON_DAY;

  const OPTIONS = [
    {
      value: PEOPLE * L_PER_PERSON_DAY,
      label: `${PEOPLE * L_PER_PERSON_DAY} ${t('waterCalc.screen3Unit')}`,
      correct: false,
      feedback: t('waterCalc.feedbackOneDay', { days: DAYS }),
    },
    {
      value: CORRECT,
      label: `${CORRECT} ${t('waterCalc.screen3Unit')}`,
      correct: true,
      feedback: t('waterCalc.feedbackCorrect', { lPerDay: L_PER_PERSON_DAY, people: PEOPLE, days: DAYS, total: CORRECT }),
    },
    {
      value: PEOPLE * 2 * DAYS,
      label: `${PEOPLE * 2 * DAYS} ${t('waterCalc.screen3Unit')}`,
      correct: false,
      feedback: t('waterCalc.feedbackTwoL', { lPerDay: L_PER_PERSON_DAY }),
    },
    {
      value: 100,
      label: `100 ${t('waterCalc.screen3Unit')}`,
      correct: false,
      ridiculous: true,
      feedback: t('waterCalc.feedbackRidiculous'),
    },
  ].filter((opt, i, arr) =>
    arr.findIndex(o => o.value === opt.value) === i
  );

  const [screen, setScreen] = useState(1);
  const [selected, setSelected] = useState(null);
  const [measuredLitres, setMeasuredLitres] = useState('');

  const handleSelect = (opt) => {
    playSfx(opt.correct ? 'success' : 'fail');
    setSelected(opt);
  };

  const handleMeasuredChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { setMeasuredLitres(''); return; }
    const val = parseInt(raw, 10);
    setMeasuredLitres(isNaN(val) || val < 0 ? '' : val);
  };

  const isDisabled = (opt) => {
    if (!selected) return false;
    if (selected.correct) return true;
    if (opt.correct) return false;
    return true;
  };

  const isFaded = (opt) => {
    if (!selected || selected.value === opt.value) return false;
    if (!selected.correct && opt.correct) return false;
    return true;
  };

  const isAre = PEOPLE === 1 ? t('waterCalc.is') : t('waterCalc.are');
  const personPeople = PEOPLE === 1 ? t('waterCalc.person') : t('waterCalc.people');

  return (
    <div className="wc-overlay">
      <div className="wc-panel">

        {/* ── SCREEN 1: Hint ────────────────────────────── */}
        {screen === 1 && (
          <div className="wc-screen">
            <div className="wc-header">
              <span className="wc-icon">💧</span>
              <h2>{t('waterCalc.screen1Title')}</h2>
              <p className="wc-subtitle">{t('waterCalc.screen1Subtitle')}</p>
            </div>

            <div className="wc-info-block">
              <p className="wc-text" dangerouslySetInnerHTML={{
                __html: t('waterCalc.screen1Text', { isAre, people: PEOPLE, personPeople, days: DAYS })
              }} />
              <p className="wc-text">{t('waterCalc.screen1Text2')}</p>

              <div className="wc-note-reminder" dangerouslySetInnerHTML={{
                __html: t('waterCalc.screen1Note')
              }} />
            </div>

            <button className="wc-btn-primary" onClick={() => { playSfx('click'); setScreen(2); }}>
              {t('waterCalc.screen1Btn')}
            </button>

            <button className="wc-btn-back" onClick={() => { playSfx('close'); onCancel?.(); }}>
              {t('waterCalc.screen1Back')}
            </button>
          </div>
        )}

        {/* ── SCREEN 3: Kitchen measurement ─────────────── */}
        {screen === 3 && (
          <div className="wc-screen">
            <div className="wc-header">
              <span className="wc-icon">🚰</span>
              <h2>{t('waterCalc.screen3Title')}</h2>
              <p className="wc-subtitle">{t('waterCalc.screen3Subtitle')}</p>
            </div>

            <div className="wc-info-block">
              <p className="wc-text">{t('waterCalc.screen3Text')}</p>
              <p className="wc-text">{t('waterCalc.screen3Text2')}</p>
              <div className="wc-input-group">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={measuredLitres}
                  onChange={handleMeasuredChange}
                  className="wc-number-input"
                />
                <span className="wc-input-unit">{t('waterCalc.screen3Unit')}</span>
              </div>
              <p className="wc-text wc-text-hint">{t('waterCalc.screen3Hint')}</p>
            </div>

            <button className="wc-btn-primary" onClick={() => { playSfx('click'); onClose(selected?.correct ?? false, measuredLitres === '' ? 0 : Number(measuredLitres)); }}>
              {t('waterCalc.screen3Btn')}
            </button>
          </div>
        )}

        {/* ── SCREEN 2: Quiz ────────────────────────────── */}
        {screen === 2 && (
          <div className="wc-screen">
            <div className="wc-header">
              <span className="wc-icon">🧮</span>
              <h2>{t('waterCalc.screen2Title')}</h2>
              <p className="wc-subtitle">{t('waterCalc.screen2Subtitle')}</p>
            </div>

            <div className="wc-note-reminder" dangerouslySetInnerHTML={{
              __html: t('waterCalc.screen2Note')
            }} />

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
              <button className="wc-btn-primary" onClick={() => { playSfx('click'); setScreen(3); }}>
                {selected.correct ? t('waterCalc.screen2BtnCorrect') : t('waterCalc.screen2BtnWrong')}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default WaterCalculation;
