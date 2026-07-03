import './LightNote.css';
import { useTranslation } from '../hooks/useTranslation';

function LightNote({ lightResult, done, listed }) {
  const { t } = useTranslation();

  if (!lightResult) return null;

  const {
    hasFlashlight, hasHeadlamp, hasLantern, hasPowerBank, hasCandles,
  } = lightResult;

  const chips = [];

  // Flashlight + batteries are the core for everyone
  chips.push({
    key: 'fresh_batteries',
    label: hasFlashlight
      ? t('lightNote.chips.fresh_batteries')
      : t('lightNote.chips.get_flashlight'),
    covered: !!done?.batteries,
    listed: !!listed?.batteries || !!listed?.flashlight,
  });

  if (!hasHeadlamp) {
    chips.push({
      key: 'get_handsfree',
      label: t('lightNote.chips.get_handsfree'),
      covered: !!done?.headlamp,
      listed: !!listed?.headlamp,
    });
  }

  if (!hasLantern) {
    chips.push({
      key: 'get_area',
      label: t('lightNote.chips.get_area'),
      covered: !!done?.lantern,
      listed: !!listed?.lantern,
    });
  }

  if (!hasPowerBank) {
    chips.push({
      key: 'charge_powerbank',
      label: t('lightNote.chips.charge_powerbank'),
      covered: !!done?.powerbank,
      listed: !!listed?.powerbank,
    });
  }

  // Making light last 72 hours matters for everyone, regardless of what they own
  chips.push({
    key: 'make_it_last',
    label: t('lightNote.chips.make_it_last'),
    covered: !!done?.rationing,
  });

  if (chips.length === 0) return null;

  // Both "prepped" and "on the shopping list" count as handled.
  const handled = chips.filter(c => c.covered || c.listed).length;

  return (
    <div className="light-note">
      <div className="light-note-header">
        <span className="light-note-title">🔦 {t('lightNote.title')}</span>
        <span className="light-note-progress">
          {handled} / {chips.length} {t('lightNote.covered')}
        </span>
      </div>

      <div className="light-note-chips">
        {chips.map(chip => {
          const state = chip.covered ? 'covered' : chip.listed ? 'listed' : 'open';
          return (
            <span
              key={chip.key}
              className={`light-note-chip light-note-chip-${state}`}
            >
              <span className="light-note-check">
                {state === 'covered' ? '✓' : state === 'listed' ? '🛒' : '○'}
              </span>
              <span className="light-note-chip-text">
                {chip.label}
                {state === 'listed' && (
                  <span className="light-note-chip-tag"> · {t('lightNote.onList')}</span>
                )}
              </span>
            </span>
          );
        })}
      </div>

      {hasCandles && (
        <div className="light-note-tip">
          🕯️ {t('lightNote.tips.candle_safety')}
        </div>
      )}

      <div className="light-note-write">
        🗒️ {t('lightNote.writeDown')}
      </div>
    </div>
  );
}

export default LightNote;
