import { useState } from 'react';
import './RumorSort.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDialog } from '../hooks/useDialog';

// The feed. `correct` is the intended verdict; `channel` tags the source style.
const MESSAGES = [
  { id: 'gov_alert',     correct: 'trust',  official: true },
  { id: 'water_poison',  correct: 'ignore', official: false },
  { id: 'free_fuel',     correct: 'verify', official: false },
  { id: 'radio_advice',  correct: 'trust',  official: true },
  { id: 'chain_forward', correct: 'ignore', official: false },
  { id: 'bridge_photo',  correct: 'verify', official: false },
];

const VERDICTS = [
  { id: 'trust',  emoji: '✅' },
  { id: 'verify', emoji: '🔍' },
  { id: 'ignore', emoji: '🚫' },
];

function RumorSort({ onClose }) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();
  const dialogRef = useDialog();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const msg = MESSAGES[index];
  const isLast = index === MESSAGES.length - 1;
  const wasRight = picked === msg.correct;

  const choose = (verdict) => {
    if (picked) return;
    setPicked(verdict);
    if (verdict === msg.correct) {
      playSfx('success');
      setCorrectCount(c => c + 1);
    } else {
      playSfx('fail');
    }
  };

  const next = () => {
    playSfx('click');
    if (isLast) {
      setShowSummary(true);
    } else {
      setIndex(i => i + 1);
      setPicked(null);
    }
  };

  const handleDone = () => {
    playSfx('close');
    onClose?.({ correct: correctCount, total: MESSAGES.length });
  };

  if (showSummary) {
    const total = MESSAGES.length;
    return (
      <div className="rs-overlay" ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('rumorSort.summaryTitle')}>
        <div className="rs-panel">
          <div className="rs-header">
            <span className="rs-icon">📡</span>
            <h2>{t('rumorSort.summaryTitle')}</h2>
          </div>

          <div className="rs-score">
            <span className="rs-score-num">{correctCount}<span className="rs-score-den">/{total}</span></span>
            <span className="rs-score-label">{t('rumorSort.scoreLabel')}</span>
          </div>

          <div className="rs-takeaway" dangerouslySetInnerHTML={{ __html: t('rumorSort.takeaway') }} />

          <button className="rs-btn-primary" onClick={handleDone}>
            {t('rumorSort.done')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-overlay" ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('rumorSort.title')}>
      <div className="rs-panel">
        <div className="rs-header">
          <span className="rs-icon">📡</span>
          <h2>{t('rumorSort.title')}</h2>
          <p className="rs-subtitle">{t('rumorSort.subtitle')}</p>
        </div>

        <div className="rs-progress">
          {MESSAGES.map((m, i) => (
            <span key={m.id} className={`rs-dot ${i === index ? 'rs-dot-on' : ''} ${i < index ? 'rs-dot-done' : ''}`} />
          ))}
        </div>

        <div className={`rs-message ${msg.official ? 'rs-message-official' : ''}`}>
          <div className="rs-message-meta">
            <span className="rs-channel">{t(`rumorSort.messages.${msg.id}.channel`)}</span>
            {msg.official && <span className="rs-badge">{t('rumorSort.officialBadge')}</span>}
          </div>
          <p className="rs-message-text">{t(`rumorSort.messages.${msg.id}.text`)}</p>
        </div>

        {!picked ? (
          <div className="rs-verdicts">
            {VERDICTS.map(v => (
              <button
                key={v.id}
                className={`rs-verdict rs-verdict-${v.id}`}
                onClick={() => choose(v.id)}
              >
                <span className="rs-verdict-emoji">{v.emoji}</span>
                {t(`rumorSort.verdicts.${v.id}`)}
              </button>
            ))}
          </div>
        ) : (
          <div className="rs-feedback">
            <p className={`rs-feedback-verdict ${wasRight ? 'rs-right' : 'rs-wrong'}`}>
              {wasRight ? '✓ ' : '✗ '}
              {wasRight ? t('rumorSort.correct') : t('rumorSort.incorrect')}
              {!wasRight && (
                <span className="rs-answer">
                  {' '}— {t('rumorSort.shouldBe')} {t(`rumorSort.verdicts.${msg.correct}`)}
                </span>
              )}
            </p>
            <p className="rs-why">{t(`rumorSort.messages.${msg.id}.why`)}</p>
            <button className="rs-btn-primary" onClick={next}>
              {isLast ? t('rumorSort.seeResult') : t('rumorSort.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RumorSort;
