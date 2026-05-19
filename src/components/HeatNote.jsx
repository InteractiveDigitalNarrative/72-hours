import './HeatNote.css';
import { useTranslation } from '../hooks/useTranslation';

function HeatNote({ homeResult, done }) {
  const { t } = useTranslation();

  if (!homeResult) return null;

  const { weakSpots = [], needsPipeInsulation, highHeatLoss, hasStove, tips = [] } = homeResult;

  const chips = [];

  if (weakSpots.length > 0) {
    const items = weakSpots
      .map(id => t(`homeSetup.weakSpotLabels.${id}`))
      .join(', ');
    chips.push({
      key: 'seal_weak_spots',
      label: t('heatNote.chips.seal_weak_spots'),
      detail: items,
      covered: !!done?.sealed,
    });
  }

  if (needsPipeInsulation) {
    chips.push({
      key: 'insulate_pipes',
      label: t('heatNote.chips.insulate_pipes'),
      detail: null,
      covered: !!done?.pipes,
    });
  }

  if (highHeatLoss) {
    chips.push({
      key: 'concentrate_heat',
      label: t('heatNote.chips.concentrate_heat'),
      detail: null,
      covered: !!done?.oneRoom,
    });
  }

  if (chips.length === 0 && tips.length === 0) return null;

  const covered = chips.filter(c => c.covered).length;

  return (
    <div className="heat-note">
      <div className="heat-note-header">
        <span className="heat-note-title">🏠 {t('heatNote.title')}</span>
        {chips.length > 0 && (
          <span className="heat-note-progress">
            {covered} / {chips.length} {t('heatNote.covered')}
          </span>
        )}
      </div>

      {chips.length > 0 && (
        <div className="heat-note-chips">
          {chips.map(chip => (
            <span
              key={chip.key}
              className={`heat-note-chip ${chip.covered ? 'heat-note-chip-covered' : ''}`}
            >
              <span className="heat-note-check">{chip.covered ? '✓' : '○'}</span>
              <span className="heat-note-chip-text">
                {chip.label}
                {chip.detail && <span className="heat-note-chip-detail">: {chip.detail}</span>}
              </span>
            </span>
          ))}
        </div>
      )}

      {!hasStove && (
        <div className="heat-note-tip">
          💡 {t('heatNote.tips.no_stove')}
        </div>
      )}
    </div>
  );
}

export default HeatNote;
