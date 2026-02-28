import './ConsequenceCard.css';

const CATEGORIES = {
  light: {
    icon: '🔦', label: 'Light', gameVar: 'prep_light',
    results: {
      0: { prepared: 'Nothing',                       consequence: 'Phone used as a torch — battery dropped to 23% by morning.',       tip: 'Keep a flashlight somewhere everyone knows — save your phone for calls.' },
      1: { prepared: 'Flashlight (weak batteries)',   consequence: 'Dim beam, fading fast. You used it sparingly and hoped it held.',   tip: 'Always keep spare batteries next to your flashlight.' },
      2: { prepared: 'Flashlight + fresh batteries',  consequence: 'Bright and steady all night. Phone battery fully saved.',           tip: null },
    },
  },
  heat: {
    icon: '🔥', label: 'Heat', gameVar: 'prep_heat',
    results: {
      0: { prepared: 'Nothing',                       consequence: 'Breath visible indoors within an hour. Fingers numb by dawn.',      tip: 'Seal windows, prepare a stove, and layer clothing before a storm.' },
      1: { prepared: 'Blankets + sealed drafts',      consequence: 'Cold but survivable. You could see your breath by dawn.',          tip: 'A wood stove is your best backup when central heating fails.' },
      2: { prepared: 'Wood stove + sealed windows',   consequence: 'Room stayed warm all night. Everyone rested.',                     tip: null },
    },
  },
  water: {
    icon: '💧', label: 'Water', gameVar: 'prep_water',
    results: {
      0: { prepared: 'Nothing',                       consequence: 'One half-empty bottle. Not enough for the day.',                   tip: '3L per person per day. Fill every container before the power goes.' },
      1: { prepared: 'Some water stored',             consequence: 'Rationing carefully — small sips, no waste.',                     tip: 'Fill all containers: bottles, pots, even the bathtub for washing.' },
      2: { prepared: 'Plenty stored',                 consequence: 'A full glass for everyone. Supply will last days.',                tip: null },
    },
  },
  food: {
    icon: '🍞', label: 'Food', gameVar: 'prep_food',
    results: {
      0: { prepared: 'Nothing shelf-stable',          consequence: 'Crackers and a tin of sardines. No power means no cooking.',      tip: 'Stock cans, nuts, and energy bars — no fridge or stove needed.' },
      1: { prepared: 'Bread + pantry basics',         consequence: 'Enough for today. The bread won\'t last, and nothing can be heated.', tip: 'Stock food that needs no fridge or stove — think shelf-stable.' },
      2: { prepared: 'Canned food, crackers, energy bars', consequence: 'No cooking needed. Enough to last days without worry.',     tip: null },
    },
  },
  info: {
    icon: '📻', label: 'Information', gameVar: 'prep_info',
    results: {
      0: { prepared: 'Nothing',                       consequence: 'No radio. Phone nearly dead. No idea what\'s happening outside.',  tip: 'A battery radio is your lifeline when internet and power are down.' },
      1: { prepared: 'Radio (weak batteries)',        consequence: 'Signal drifts in and out. You caught fragments — enough to know help is coming.', tip: 'Fresh batteries = clear signal.' },
      2: { prepared: 'Battery radio + fresh batteries', consequence: 'Clear broadcast: power restored within 36 hours. You knew what to expect.', tip: null },
    },
  },
  medication: {
    icon: '💊', label: 'Medication', gameVar: 'prep_medication',
    results: {
      0: { prepared: 'Nothing organized',             consequence: 'Scrambling in the dark — labels unreadable, dose uncertain.',     tip: 'Keep a 7-day supply of prescription meds organized and within reach.' },
      1: { prepared: 'Pills found, not organized',    consequence: 'Hard to read labels by flashlight. You did your best.',           tip: 'Organize by day so anyone can give them — even in the dark.' },
      2: { prepared: 'Pills sorted at bedside',       consequence: 'Morning dose taken without help. No scrambling, no guessing.',    tip: null },
    },
  },
};

const LEVEL_COLOR = { 0: '#e74c3c', 1: '#ff9933', 2: '#4caf50' };
const LEVEL_LABEL = { 0: 'Unprepared', 1: 'Partially prepared', 2: 'Well prepared' };

export default function ConsequenceCard({ category, gameVars }) {
  const data = CATEGORIES[category];
  if (!data) return null;

  const level = Math.min(2, Math.max(0, gameVars[data.gameVar] || 0));
  const result = data.results[level];
  const color  = LEVEL_COLOR[level];

  return (
    <div className="cq-card" style={{ '--cq-color': color }}>
      <div className="cq-header">
        <span className="cq-icon">{data.icon}</span>
        <div className="cq-title-block">
          <span className="cq-label">{data.label}</span>
          <span className="cq-level-label" style={{ color }}>{LEVEL_LABEL[level]}</span>
        </div>
        <div className="cq-dots">
          {[0, 1].map(i => (
            <span key={i} className={`cq-dot ${i < level ? 'filled' : ''}`} style={i < level ? { background: color } : {}} />
          ))}
        </div>
      </div>

      <div className="cq-prepared">
        You prepared: <strong>{result.prepared}</strong>
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
