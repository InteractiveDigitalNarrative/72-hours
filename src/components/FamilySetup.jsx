import { useState } from 'react';
import './FamilySetup.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

function FamilySetup({ onClose }) {
  const [extras, setExtras] = useState([]);
  const [showElderlyForm, setShowElderlyForm] = useState(false);
  const [elderlyName, setElderlyName] = useState('');
  const { playSfx } = useAudioContext();
  const { t } = useTranslation();

  const hasElderly = extras.some(m => m.type === 'elderly');

  const addAdult = () => {
    playSfx('purchase');
    setExtras(prev => [...prev, { type: 'adult' }]);
    setShowElderlyForm(false);
  };

  const addChild = () => {
    playSfx('purchase');
    setExtras(prev => [...prev, { type: 'child' }]);
    setShowElderlyForm(false);
  };

  const handleElderlyClick = () => {
    playSfx('open');
    setShowElderlyForm(true);
    setElderlyName('');
  };

  const addElderly = () => {
    const relation = elderlyName.trim();
    if (!relation) return;
    playSfx('purchase');
    setExtras(prev => [...prev, { type: 'elderly', relation }]);
    setShowElderlyForm(false);
    setElderlyName('');
  };

  const removeExtra = (index) => {
    playSfx('close');
    setExtras(prev => prev.filter((_, i) => i !== index));
  };

  const householdSize = 1 + extras.length;

  const getMemberLabel = (m) => {
    if (m.type === 'adult') return t('familySetup.adultLabel');
    if (m.type === 'elderly') return m.relation || t('familySetup.elderlyLabel');
    return t('familySetup.childLabel');
  };

  const getMemberTypeTag = (m) => {
    if (m.type === 'adult') return t('familySetup.adultTag');
    if (m.type === 'elderly') return t('familySetup.elderlyTag');
    return t('familySetup.childTag');
  };

  return (
    <div className="fs-overlay">
      <div className="fs-panel">

        <div className="fs-header">
          <span className="fs-icon">👥</span>
          <h2>{t('familySetup.heading')}</h2>
          <p className="fs-subtitle">{t('familySetup.subtitle')}</p>
        </div>

        {/* Household member list */}
        <div className="fs-member-list">
          <div className="fs-member-row fs-member-you">
            <span className="fs-member-name">{t('familySetup.you')}</span>
            <span className="fs-member-tag fs-tag-you">{t('familySetup.alwaysPresent')}</span>
          </div>
          {extras.map((m, i) => (
            <div key={i} className={`fs-member-row fs-member-type-${m.type}`}>
              <span className="fs-member-name">{getMemberLabel(m)}</span>
              <span className={`fs-member-tag fs-tag-${m.type}`}>{getMemberTypeTag(m)}</span>
              <button className="fs-remove-btn" onClick={() => removeExtra(i)} aria-label="Remove">×</button>
            </div>
          ))}
        </div>

        {/* Add member buttons */}
        <div className="fs-add-buttons">
          <button className="fs-add-btn" onClick={addAdult}>
            {t('familySetup.addAdult')}
          </button>
          {!hasElderly && (
            <button className="fs-add-btn fs-add-elderly" onClick={handleElderlyClick}>
              {t('familySetup.addElderly')}
            </button>
          )}
          <button className="fs-add-btn fs-add-child" onClick={addChild}>
            {t('familySetup.addChild')}
          </button>
        </div>

        {/* Elderly name form */}
        {showElderlyForm && (
          <div className="fs-elderly-form">
            <label className="fs-elderly-label">{t('familySetup.elderlyQuestion')}</label>
            <input
              className="fs-elderly-input"
              type="text"
              value={elderlyName}
              onChange={e => setElderlyName(e.target.value)}
              placeholder={t('familySetup.elderlyPlaceholder')}
              onKeyDown={e => { if (e.key === 'Enter') addElderly(); }}
              autoFocus
            />
            <p className="fs-elderly-hint">{t('familySetup.elderlyHint')}</p>
            <button
              className="fs-elderly-add-btn"
              onClick={addElderly}
              disabled={!elderlyName.trim()}
            >
              {t('familySetup.addToHousehold')}
            </button>
          </div>
        )}

        <button className="fs-done-btn" onClick={() => { playSfx('open'); onClose({ extras }); }}>
          {t('familySetup.done')}
        </button>

      </div>
    </div>
  );
}

export default FamilySetup;
