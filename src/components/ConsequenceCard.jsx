import './ConsequenceCard.css';
import { useTranslation } from '../hooks/useTranslation';

const CATEGORY_ICONS = { light: '🔦', heat: '🔥', water: '💧', food: '🍞', info: '📻', medication: '💊' };
const GAME_VARS = { light: 'prep_light', heat: 'prep_heat', water: 'prep_water', food: 'prep_food', info: 'prep_info', medication: 'prep_medication' };
const LEVEL_COLOR = { 0: '#e74c3c', 1: '#ff9933', 2: '#4caf50' };

export default function ConsequenceCard({ category, gameVars }) {
  const { t } = useTranslation();

  const gameVar = GAME_VARS[category];
  if (!gameVar) return null;

  const level = Math.min(2, Math.max(0, gameVars[gameVar] || 0));
  const result = t(`consequenceCard.categories.${category}.results.${level}`);
  const label = t(`consequenceCard.categories.${category}.label`);
  const levelLabel = t(`consequenceCard.levelLabels.${level}`);
  const color = LEVEL_COLOR[level];

  if (!result) return null;

  return (
    <div className="cq-card" style={{ '--cq-color': color }}>
      <div className="cq-header">
        <span className="cq-icon">{CATEGORY_ICONS[category]}</span>
        <div className="cq-title-block">
          <span className="cq-label">{label}</span>
          <span className="cq-level-label" style={{ color }}>{levelLabel}</span>
        </div>
        <div className="cq-dots">
          {[0, 1].map(i => (
            <span key={i} className={`cq-dot ${i < level ? 'filled' : ''}`} style={i < level ? { background: color } : {}} />
          ))}
        </div>
      </div>

      <div className="cq-prepared">
        {t('consequenceCard.youPrepared')} <strong>{result.prepared}</strong>
      </div>

      <div className="cq-consequence" style={{ color }}>
        {level === 2 && <span className="cq-check">✓ </span>}
        {result.consequence}
      </div>

      {result.tip && (
        <div className="cq-tip">💡 {result.tip}</div>
      )}
    </div>
  );
}
