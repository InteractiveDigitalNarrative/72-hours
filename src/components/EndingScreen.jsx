import './EndingScreen.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

const CATEGORY_KEYS = [
  { key: 'prep_water',      icon: '💧' },
  { key: 'prep_food',       icon: '🍞' },
  { key: 'prep_heat',       icon: '🔥' },
  { key: 'prep_light',      icon: '🔦' },
  { key: 'prep_info',       icon: '📻' },
  { key: 'prep_medication', icon: '💊' },
];

function getCorrectNumber(household) {
  const { hasElderly, hasChildren } = household || {};
  if (hasElderly && hasChildren) return { number: '1247' };
  if (hasElderly)                return { number: '1220' };
  if (hasChildren)               return { number: '112' };
  return                               { number: '1343' };
}

function EndingScreen({ gameVars, endingType, household, callScore, onPlayAgain }) {
  const { playSfx } = useAudioContext();
  const { t } = useTranslation();
  const elderlyName = household?.elderlyRelation || 'your relative';
  const correctEntry = getCorrectNumber(household);

  // Call feedback
  let callFeedbackKey = endingType || 'bad';
  if (callFeedbackKey === 'bad' && household?.hasElderly) callFeedbackKey = 'bad_elderly';
  const callFeedback = t(`endingScreen.callFeedback.${callFeedbackKey}`, {
    number: correctEntry.number,
    elderlyName,
  });

  // Emergency numbers list
  const EMERGENCY_NUMBERS = ['112', '1220', '1247', '1343'].map(num => ({
    number: num,
    desc: t(`endingScreen.emergencyNumbers.${num}`),
    correct: num === correctEntry.number,
  }));

  const totalPrep = gameVars.total_prep || 0;
  const dialedNumber = gameVars.dialed_number || '';
  const callPoints = callScore ?? 0;
  const totalScore = totalPrep + callPoints;

  const getBadge = (score) => {
    if (score >= 13) return { color: '#4caf50', label: t('endingScreen.wellPrepared') };
    if (score >= 9)  return { color: '#6495ed', label: t('endingScreen.partiallyPrepared') };
    if (score >= 5)  return { color: '#ff9933', label: t('endingScreen.underprepared') };
    return { color: '#e74c3c', label: t('endingScreen.unprepared') };
  };
  const badge = getBadge(totalScore);

  // Category results
  const getCatResult = (key, level) => {
    const result = t(`endingScreen.categoryResults.${key}.${level}`);
    if (!result) return {};
    let consequence = result.consequence;
    if (household?.hasElderly && result.consequence_elderly) {
      consequence = result.consequence_elderly.replace('{{elderlyName}}', elderlyName);
    }
    return { ...result, consequence };
  };

  // Takeaways
  const takeaways = [];
  for (const cat of CATEGORY_KEYS) {
    const level = gameVars[cat.key] || 0;
    const result = getCatResult(cat.key, level);
    if (result?.feedback) {
      takeaways.push(result.feedback);
    }
  }
  if (takeaways.length === 0) {
    takeaways.push(t('endingScreen.wellPreparedTakeaway'));
  }
  takeaways.push(t('endingScreen.visitOlevalmis'));

  const renderDots = (level) => (
    <span className="prep-dots">
      {[0, 1].map((i) => (
        <span
          key={i}
          className={`dot ${i < level ? 'filled' : ''}`}
          style={i < level ? { background: levelColor(level) } : {}}
        />
      ))}
    </span>
  );

  const levelColor = (level) => {
    if (level === 0) return '#e74c3c';
    if (level === 1) return '#ff9933';
    return '#4caf50';
  };

  return (
    <div className="ending-overlay">
      <div className="ending-screen">

        {/* Header Badge */}
        <div className="ending-badge" style={{ borderColor: badge.color }}>
          <h2 style={{ color: badge.color }}>{badge.label}</h2>
          <p className="ending-summary">{callFeedback}</p>
        </div>

        {/* Preparation Report Card */}
        <h3 className="section-title">{t('endingScreen.sectionPrep')}</h3>
        <div className="report-grid">
          {CATEGORY_KEYS.map((cat) => {
            const level = gameVars[cat.key] || 0;
            const result = getCatResult(cat.key, level);
            const catLabel = t(`endingScreen.categoryLabels.${cat.key}`);
            return (
              <div
                key={cat.key}
                className="report-card"
                style={{ borderColor: levelColor(level) }}
              >
                <div className="card-header">
                  <span className="card-icon">{cat.icon}</span>
                  <span className="card-label">{catLabel}</span>
                  {renderDots(level)}
                </div>
                <p className="card-consequence">{result.consequence}</p>
                {result.feedback && (
                  <p className="card-feedback">{result.feedback}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Emergency Numbers Reference */}
        <h3 className="section-title">{t('endingScreen.sectionNumbers')}</h3>
        <div className="numbers-box">
          {EMERGENCY_NUMBERS.map((entry) => (
            <div
              key={entry.number}
              className={`number-row ${dialedNumber === entry.number ? 'dialed' : ''} ${entry.correct ? 'correct-number' : ''}`}
            >
              <span className="num">{entry.number}</span>
              <span className="num-desc">{entry.desc}</span>
              {dialedNumber === entry.number && (
                <span className="num-tag">
                  {entry.correct ? t('endingScreen.youCalledThis') : t('endingScreen.youCalledThisWrong')}
                </span>
              )}
              {entry.correct && dialedNumber !== entry.number && (
                <span className="num-tag best">{t('endingScreen.bestChoice')}</span>
              )}
            </div>
          ))}
          <p className="numbers-hint">{t('endingScreen.numbersHint')}</p>
        </div>

        {/* Key Takeaways */}
        <h3 className="section-title">{t('endingScreen.sectionTakeaways')}</h3>
        <ul className="takeaways">
          {takeaways.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>

        {/* Score */}
        <div className="prep-score">
          <span className="score-number">{totalScore}</span>
          <span className="score-label">/ 15</span>
          <div className="score-breakdown">
            <span>{totalPrep} <small>{t('endingScreen.preparation')}</small></span>
            <span>+</span>
            <span>{callPoints} <small>{t('endingScreen.emergencyCall')}</small></span>
          </div>
        </div>

        {/* Play Again */}
        <button className="play-again-btn" onClick={() => { playSfx('open'); onPlayAgain(); }}>
          {t('endingScreen.playAgain')}
        </button>
      </div>
    </div>
  );
}

export default EndingScreen;
