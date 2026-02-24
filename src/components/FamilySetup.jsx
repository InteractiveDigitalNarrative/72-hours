import { useState } from 'react';
import './FamilySetup.css';

function FamilySetup({ onClose }) {
  const [extras, setExtras] = useState([]);
  const [showElderlyForm, setShowElderlyForm] = useState(false);
  const [elderlyName, setElderlyName] = useState('');

  const hasElderly = extras.some(m => m.type === 'elderly');

  const addAdult = () => {
    setExtras(prev => [...prev, { type: 'adult' }]);
    setShowElderlyForm(false);
  };

  const addChild = () => {
    setExtras(prev => [...prev, { type: 'child' }]);
    setShowElderlyForm(false);
  };

  const handleElderlyClick = () => {
    setShowElderlyForm(true);
    setElderlyName('');
  };

  const addElderly = () => {
    const relation = elderlyName.trim();
    if (!relation) return;
    setExtras(prev => [...prev, { type: 'elderly', relation }]);
    setShowElderlyForm(false);
    setElderlyName('');
  };

  const removeExtra = (index) => {
    setExtras(prev => prev.filter((_, i) => i !== index));
  };

  const householdSize = 1 + extras.length;

  const getMemberLabel = (m) => {
    if (m.type === 'adult') return 'Partner / Adult';
    if (m.type === 'elderly') return m.relation || 'Elderly relative';
    return 'Child';
  };

  const getMemberTypeTag = (m) => {
    if (m.type === 'adult') return 'adult';
    if (m.type === 'elderly') return 'elderly';
    return 'child';
  };

  return (
    <div className="fs-overlay">
      <div className="fs-panel">

        <div className="fs-header">
          <span className="fs-icon">👥</span>
          <h2>Who's in your household?</h2>
          <p className="fs-subtitle">This shapes your preparation plan and the crisis you'll face.</p>
        </div>

        {/* Household member list */}
        <div className="fs-member-list">
          <div className="fs-member-row fs-member-you">
            <span className="fs-member-name">You</span>
            <span className="fs-member-tag fs-tag-you">always present</span>
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
            + Adult / Partner
          </button>
          {!hasElderly && (
            <button className="fs-add-btn fs-add-elderly" onClick={handleElderlyClick}>
              + Elderly or Dependent
            </button>
          )}
          <button className="fs-add-btn fs-add-child" onClick={addChild}>
            + Child
          </button>
        </div>

        {/* Elderly name form */}
        {showElderlyForm && (
          <div className="fs-elderly-form">
            <label className="fs-elderly-label">What should we call them?</label>
            <input
              className="fs-elderly-input"
              type="text"
              value={elderlyName}
              onChange={e => setElderlyName(e.target.value)}
              placeholder="e.g. Grandmother, Mom, Uncle"
              onKeyDown={e => { if (e.key === 'Enter') addElderly(); }}
              autoFocus
            />
            <p className="fs-elderly-hint">Hint: e.g. Grandmother, Mom, Partner</p>
            <button
              className="fs-elderly-add-btn"
              onClick={addElderly}
              disabled={!elderlyName.trim()}
            >
              Add to household
            </button>
          </div>
        )}

        <button className="fs-done-btn" onClick={() => onClose({ extras })}>
          Done — Start Preparing
        </button>

      </div>
    </div>
  );
}

export default FamilySetup;
