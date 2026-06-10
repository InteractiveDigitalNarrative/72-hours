import { useState, useMemo } from 'react';
import './CabinetCheck.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

// Item pool. Distinct emoji per item; `fridge` flags a cold-chain medicine.
// The shelf is assembled from the player's household, so it stays personal.
const POOL = {
  base: [
    { id: 'painkillers', emoji: '💊', correct: 'toss' },
    { id: 'plasters',    emoji: '🩹', correct: 'keep' },
    { id: 'antiseptic',  emoji: '🧴', correct: 'restock' },
  ],
  solo: [
    { id: 'allergy',  emoji: '🤧', correct: 'toss' },
    { id: 'vitamins', emoji: '🟢', correct: 'keep' },
  ],
  elderly: [
    { id: 'bp_pills', emoji: '❤️', correct: 'restock' },
    { id: 'insulin',  emoji: '🧪', correct: 'keep', fridge: true },
  ],
  children: [
    { id: 'fever_syrup', emoji: '🍼', correct: 'restock' },
    { id: 'epipen',      emoji: '💉', correct: 'restock' },
  ],
};

function buildItems(household) {
  const items = [...POOL.base];
  if (household?.hasElderly)  items.push(...POOL.elderly);
  if (household?.hasChildren) items.push(...POOL.children);
  if (!household?.hasElderly && !household?.hasChildren) items.push(...POOL.solo);
  return items;
}

const VERDICTS = [
  { id: 'keep',    emoji: '✅' },
  { id: 'restock', emoji: '🛒' },
  { id: 'toss',    emoji: '🗑️' },
];

const BADGE = { keep: '✓', restock: '⟳', toss: '✗' };

function CabinetCheck({ household, onClose }) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();

  const items = useMemo(() => buildItems(household), [household]);

  const [verdicts, setVerdicts] = useState({});
  const [selected, setSelected] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const checkedCount = Object.keys(verdicts).length;
  const allDone = items.every(it => verdicts[it.id]);
  const selectedItem = items.find(it => it.id === selected);
  const selectedVerdict = selected ? verdicts[selected] : null;

  const pickItem = (id) => {
    playSfx('open');
    setSelected(id);
  };

  const judge = (verdict) => {
    if (!selectedItem || verdicts[selected]) return;
    const right = verdict === selectedItem.correct;
    playSfx(right ? 'success' : 'fail');
    setVerdicts(prev => ({ ...prev, [selected]: verdict }));
  };

  const correctCount = items.filter(it => verdicts[it.id] === it.correct).length;
  const restockList = items.filter(it => it.correct === 'restock' || it.correct === 'toss');

  const finish = () => {
    playSfx('close');
    onClose?.({
      correct: correctCount,
      total: items.length,
      restock: restockList.length,
    });
  };

  if (showSummary) {
    return (
      <div className="cc-overlay">
        <div className="cc-panel">
          <div className="cc-header">
            <span className="cc-icon">🧰</span>
            <h2>{t('cabinetCheck.summaryTitle')}</h2>
          </div>

          <div className="cc-score">
            <span className="cc-score-num">{correctCount}<span className="cc-score-den">/{items.length}</span></span>
            <span className="cc-score-label">{t('cabinetCheck.scoreLabel')}</span>
          </div>

          <div className="cc-restock">
            <div className="cc-restock-head">🛒 {t('cabinetCheck.restockTitle')}</div>
            <ul className="cc-restock-list">
              {restockList.map(it => (
                <li key={it.id}>
                  <span className="cc-restock-emoji">{it.emoji}</span>
                  {t(`cabinetCheck.items.${it.id}.name`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="cc-takeaway" dangerouslySetInnerHTML={{ __html: t('cabinetCheck.takeaway') }} />

          <button className="cc-btn-primary" onClick={finish}>
            {t('cabinetCheck.done')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-overlay">
      <div className="cc-panel">
        <div className="cc-header">
          <span className="cc-icon">🧰</span>
          <h2>{t('cabinetCheck.title')}</h2>
          <p className="cc-subtitle">{t('cabinetCheck.subtitle')}</p>
        </div>

        <div className="cc-progress">{checkedCount} / {items.length}</div>

        <div className="cc-shelf">
          {items.map(it => {
            const v = verdicts[it.id];
            return (
              <button
                key={it.id}
                className={`cc-item ${selected === it.id ? 'cc-item-active' : ''} ${v ? `cc-item-${v}` : ''}`}
                onClick={() => pickItem(it.id)}
              >
                {it.fridge && <span className="cc-frost" title="refrigerated">❄️</span>}
                <span className="cc-item-emoji">{it.emoji}</span>
                <span className="cc-item-name">{t(`cabinetCheck.items.${it.id}.name`)}</span>
                {v && <span className={`cc-item-badge cc-badge-${v}`}>{BADGE[v]}</span>}
              </button>
            );
          })}
        </div>

        {selectedItem ? (
          <div className="cc-inspect">
            <div className="cc-inspect-detail">
              <span className="cc-inspect-name">
                {selectedItem.emoji} {t(`cabinetCheck.items.${selected}.name`)}
              </span>
              <span className="cc-inspect-date">{t(`cabinetCheck.items.${selected}.detail`)}</span>
              {selectedItem.fridge && (
                <span className="cc-inspect-fridge">❄️ {t('cabinetCheck.fridgeTag')}</span>
              )}
            </div>

            {!selectedVerdict ? (
              <div className="cc-verdicts">
                {VERDICTS.map(vd => (
                  <button
                    key={vd.id}
                    className={`cc-verdict cc-verdict-${vd.id}`}
                    onClick={() => judge(vd.id)}
                  >
                    <span className="cc-verdict-emoji">{vd.emoji}</span>
                    {t(`cabinetCheck.verdicts.${vd.id}`)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="cc-feedback">
                <p className={`cc-feedback-verdict ${selectedVerdict === selectedItem.correct ? 'cc-right' : 'cc-wrong'}`}>
                  {selectedVerdict === selectedItem.correct ? '✓ ' : '✗ '}
                  {selectedVerdict === selectedItem.correct
                    ? t('cabinetCheck.correct')
                    : `${t('cabinetCheck.incorrect')} ${t(`cabinetCheck.verdicts.${selectedItem.correct}`)}`}
                </p>
                <p className="cc-why">{t(`cabinetCheck.items.${selected}.why`)}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="cc-hint">{t('cabinetCheck.hint')}</p>
        )}

        {allDone && (
          <button className="cc-btn-primary" onClick={() => { playSfx('click'); setShowSummary(true); }}>
            {t('cabinetCheck.seeList')}
          </button>
        )}
      </div>
    </div>
  );
}

export default CabinetCheck;
