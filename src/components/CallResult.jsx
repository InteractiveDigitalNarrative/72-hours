// CallResult.jsx - Shows the consequence of the emergency call

import { useEffect } from 'react';
import './PhoneKeypad.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

function CallResult({ dialedNumber, scenario, attempts = 0, onContinue, onRetry }) {
  const { t } = useTranslation();

  const scenarioData = t(`callResult.scenarios.${scenario}`) || t('callResult.scenarios.grandmother_emergency');
  const consequence = scenarioData[dialedNumber] || scenarioData['default'];

  const attemptsUsed = attempts + 1;
  const canRetry = consequence.allowRetry && attempts < 2;
  const isLastChance = consequence.allowRetry && attempts === 1;

  const { playSfx } = useAudioContext();
  useEffect(() => {
    if (consequence.type === 'success') {
      playSfx('success');
    } else {
      playSfx('fail');
    }
  }, [consequence.type, playSfx]);

  return (
    <div className="call-result-overlay">
      <div className={`call-result ${consequence.type}`}>
        <div className="call-result-icon">{consequence.icon}</div>
        <h3>{consequence.title}</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{consequence.message}</p>

        {consequence.allowRetry && (
          <p className="call-attempt-counter">
            {t('callResult.attemptCounter', { current: attemptsUsed })}
            {isLastChance && <span className="last-chance"> {t('callResult.lastChance')}</span>}
          </p>
        )}

        {canRetry ? (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="continue-btn" onClick={() => { playSfx('click'); onRetry(); }}>
              {t('callResult.tryAgain')}
            </button>
            <button className="continue-btn secondary-btn" onClick={() => { playSfx('close'); onContinue('no_help'); }}>
              {t('callResult.giveUp')}
            </button>
          </div>
        ) : consequence.allowRetry ? (
          <button className="continue-btn" onClick={() => { playSfx('click'); onContinue('no_help'); }}>
            {t('callResult.continue')}
          </button>
        ) : (
          <button className="continue-btn" onClick={() => { playSfx('click'); onContinue(consequence.outcome); }}>
            {t('callResult.continue')}
          </button>
        )}
      </div>
    </div>
  );
}

export default CallResult;
