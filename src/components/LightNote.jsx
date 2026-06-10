import './LightNote.css';
import { useTranslation } from '../hooks/useTranslation';

function LightNote({ lightResult, done }) {
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
  });

  if (!hasHeadlamp) {
    chips.push({
      key: 'get_handsfree',
      label: t('lightNote.chips.get_handsfree'),
      covered: !!done?.headlamp,
    });
  }

  if (!hasLantern) {
    chips.push({
      key: 'get_area',
      label: t('lightNote.chips.get_area'),
      covered: !!done?.lantern,
    });
  }

  if (!hasPowerBank) {
    chips.push({
      key: 'charge_powerbank',
      label: t('lightNote.chips.charge_powerbank'),
      covered: !!done?.powerbank,
    });
  }

  // Making light last 72 hours matters for everyone, regardless of what they own
  chips.push({
    key: 'make_it_last',
    label: t('lightNote.chips.make_it_last'),
    covered: !!done?.rationing,
  });

  if (chips.length === 0) return null;

  const covered = chips.filter(c => c.covered).length;

  return (
    <div className="light-note">
      <div className="light-note-header">
        <span className="light-note-title">🔦 {t('lightNote.title')}</span>
        <span className="light-note-progress">
          {covered} / {chips.length} {t('lightNote.covered')}
        </span>
      </div>

      <div className="light-note-chips">
        {chips.map(chip => (
          <span
            key={chip.key}
            className={`light-note-chip ${chip.covered ? 'light-note-chip-covered' : ''}`}
          >
            <span className="light-note-check">{chip.covered ? '✓' : '○'}</span>
            <span className="light-note-chip-text">{chip.label}</span>
          </span>
        ))}
      </div>

      {hasCandles && (
        <div className="light-note-tip">
          🕯️ {t('lightNote.tips.candle_safety')}
        </div>
      )}
    </div>
  );
}

export default LightNote;
