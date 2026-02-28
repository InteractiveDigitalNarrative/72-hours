import './CrisisScreen.css';
import { useAudioContext } from '../context/AudioContext';

function CrisisScreen({ phase, gameVars, household, onContinue }) {
  const { playSfx } = useAudioContext();
  const elderlyName = household?.elderlyRelation || 'your relative';

  const NIGHT_CATEGORIES = [
    {
      key: 'prep_light', icon: '🔦', label: 'Light',
      results: {
        0: { prepared: 'Nothing', consequence: 'Phone flashlight drains battery to 47%', tip: 'Keep a flashlight in a spot everyone knows — save your phone for calls.' },
        1: { prepared: 'Flashlight (weak batteries)', consequence: 'Dim beam, fading fast', tip: 'Always keep spare batteries next to your flashlight.' },
        2: { prepared: 'Flashlight + fresh batteries', consequence: 'Bright beam cuts through the dark. Phone battery saved.', tip: null },
      },
    },
    {
      key: 'prep_heat', icon: '🔥', label: 'Heat',
      results: {
        0: { prepared: 'Nothing', consequence: 'Breath visible indoors. Fingers go numb.', tip: 'Seal windows, prepare a stove, layer clothing before a storm.' },
        1: { prepared: 'Blankets + some sealing', consequence: 'Cold but bearable. By dawn, you see your breath.', tip: 'A wood stove is your best backup when central heating fails.' },
        2: {
          prepared: 'Wood stove + sealed windows',
          consequence: household?.hasElderly
            ? `Room stays warm all night. ${elderlyName} sleeps comfortably.`
            : 'Room stays warm all night. Everyone sleeps comfortably.',
          tip: null,
        },
      },
    },
  ];

  const MORNING_CATEGORIES = [
    {
      key: 'prep_water', icon: '💧', label: 'Water',
      results: {
        0: {
          prepared: 'Nothing',
          consequence: household?.hasElderly
            ? `One half-empty bottle. ${elderlyName} gets it. You go thirsty.`
            : 'One half-empty bottle. Rationed carefully — not enough.',
          tip: '3L per person per day. Fill every container before the power goes.',
        },
        1: { prepared: 'Some water stored', consequence: 'Rationing carefully. Small sips only.', tip: 'Fill all containers: bottles, pots, even the bathtub for washing.' },
        2: { prepared: 'Plenty of water stored', consequence: 'A glass for everyone. Supply lasts days.', tip: null },
      },
    },
    {
      key: 'prep_medication', icon: '💊', label: 'Medication',
      results: {
        0: { prepared: 'Nothing', consequence: 'Scrambling in the dark. Can\'t read the label. Unsure of dosage.', tip: 'Prescription meds first. Keep a 7-day supply organized by day.' },
        1: { prepared: 'Pills found, not organized', consequence: 'Labels hard to read in the dark. One pill or two?', tip: 'Organize by day so anyone can give them — even in the dark.' },
        2: {
          prepared: 'Pills organized by day, at bedside',
          consequence: household?.hasElderly
            ? `${elderlyName} takes their dose independently. No help needed.`
            : 'Medication organized and within reach. No scrambling in the dark.',
          tip: null,
        },
      },
    },
    {
      key: 'prep_food', icon: '🍞', label: 'Food',
      results: {
        0: { prepared: 'Nothing', consequence: 'Stale crackers and a bruised apple for two.', tip: 'No power = no fridge, no stove. Stock cans, nuts, energy bars.' },
        1: { prepared: 'Bread + pantry basics', consequence: 'Enough for today. Bread goes stale tomorrow.', tip: 'Stock food that needs no fridge or stove — think shelf-stable.' },
        2: { prepared: 'Canned food, crackers, energy bars', consequence: 'No cooking needed. Enough for days.', tip: null },
      },
    },
    {
      key: 'prep_info', icon: '📻', label: 'Information',
      results: {
        0: { prepared: 'Nothing', consequence: 'No radio. Phone dying. No news.', tip: 'A battery radio is your lifeline. Did you note the emergency numbers?' },
        1: { prepared: 'Radio (weak batteries)', consequence: 'Signal fades in and out. Fragments only.', tip: 'Fresh batteries = clear signal. A working radio keeps you informed.' },
        2: { prepared: 'Battery radio + phone charged', consequence: 'Clear broadcast: power back in 36 hours. You stay calm.', tip: null },
      },
    },
  ];

  const isNight = phase === 'night';
  const categories = isNight ? NIGHT_CATEGORIES : MORNING_CATEGORIES;
  const title = isNight ? '3:47 AM — The Night' : 'Morning — No Power';
  const subtitle = isNight
    ? 'The power is out. The storm has taken down the lines.'
    : 'The taps are dead. The fridge is warming. The stove won\'t turn on.';
  const buttonText = isNight ? 'Morning comes...' : 'Continue';

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
          {categories.map((cat) => {
            const level = gameVars[cat.key] || 0;
            const result = cat.results[level] || cat.results[0];
            const color = levelColor(level);
            return (
              <div key={cat.key} className="crisis-card" style={{ borderColor: color }}>
                <div className="crisis-card-top">
                  <span className="crisis-card-icon">{cat.icon}</span>
                  <span className="crisis-card-label">{cat.label}</span>
                  {renderDots(level)}
                </div>
                <div className="crisis-card-prepared">
                  You prepared: <strong>{result.prepared}</strong>
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
            ⚠️ You hear a creak from the pipes — they could freeze and burst.
            <span className="crisis-warning-tip">A slow drip helps: moving water freezes slower.</span>
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
