import './CrisisScreen.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

function CrisisScreen({ phase, gameVars, household, onContinue }) {
  const { playSfx } = useAudioContext();
  const { t } = useTranslation();
  const elderlyName = household?.elderlyRelation || 'your relative';

  const NIGHT_KEYS = ['light', 'heat'];
  const MORNING_KEYS = ['water', 'medication', 'food', 'info'];

  const isNight = phase === 'night';
  const categoryKeys = isNight ? NIGHT_KEYS : MORNING_KEYS;
  const categoryIcons = { light: '🔦', heat: '🔥', water: '💧', medication: '💊', food: '🍞', info: '📻' };
  const gameVarMap = { light: 'prep_light', heat: 'prep_heat', water: 'prep_water', medication: 'prep_medication', food: 'prep_food', info: 'prep_info' };

  const title = isNight ? t('crisisScreen.nightTitle') : t('crisisScreen.morningTitle');
  const subtitle = isNight ? t('crisisScreen.nightSubtitle') : t('crisisScreen.morningSubtitle');
  const buttonText = isNight ? t('crisisScreen.nightBtn') : t('crisisScreen.morningBtn');

  const getResult = (key, level) => {
    const result = t(`crisisScreen.categories.${key}.results.${level}`);
    if (!result) return { prepared: '', consequence: '', tip: null };
    // Use elderly-specific consequence if available and applicable
    let consequence = result.consequence;
    if (household?.hasElderly && result.consequence_elderly) {
      consequence = result.consequence_elderly.replace('{{elderlyName}}', elderlyName);
    }
    return { ...result, consequence };
  };

  const levelColor = (level) => {
    if (level === 0) return '#e74c3c';
    if (level === 1) return '#ff9933';
    return '#4caf50';
  };

  const renderDots = (level) => (
    <span className="crisis-dots">
      {[0, 1].map((i) => (
        <span
          key={i}
          className={`crisis-dot ${i < level ? 'filled' : ''}`}
          style={i < level ? { background: levelColor(level) } : {}}
        />
      ))}
    </span>
  );

  return (
    <div className="crisis-overlay">
      <div className="crisis-screen">
        <div className="crisis-header">
          <h2 className="crisis-title">{title}</h2>
          <p className="crisis-subtitle">{subtitle}</p>
        </div>

        <div className={`crisis-grid ${isNight ? 'grid-2' : 'grid-4'}`}>
          {categoryKeys.map((key) => {
            const level = gameVars[gameVarMap[key]] || 0;
            const result = getResult(key, level);
            const color = levelColor(level);
            const label = t(`crisisScreen.categories.${key}.label`);
            return (
              <div key={key} className="crisis-card" style={{ borderColor: color }}>
                <div className="crisis-card-top">
                  <span className="crisis-card-icon">{categoryIcons[key]}</span>
                  <span className="crisis-card-label">{label}</span>
                  {renderDots(level)}
                </div>
                <div className="crisis-card-prepared">
                  {t('crisisScreen.youPrepared')} <strong>{result.prepared}</strong>
                </div>
                <div className="crisis-card-consequence" style={{ color }}>
                  {result.consequence}
                </div>
                {result.tip && (
                  <div className="crisis-card-tip">
                    {result.tip}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isNight && gameVars.heat_pipes === false && (
          <div className="crisis-warning">
            {t('crisisScreen.pipeWarning')}
            <span className="crisis-warning-tip">{t('crisisScreen.pipeTip')}</span>
          </div>
        )}

        <button className="crisis-continue-btn" onClick={() => { playSfx('click'); onContinue(); }}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default CrisisScreen;
