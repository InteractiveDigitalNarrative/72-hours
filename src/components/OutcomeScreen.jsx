import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './OutcomeScreen.css';

const ACCENTS = {
  good:    '#3a9e52',
  partial: '#2d6fbb',
  delayed: '#b86b10',
  bad:     '#a02020',
};

const ICONS = { good: '✓', partial: '~', delayed: '⏱', bad: '✗' };

const LINE_DELAY_MS = 1100;
const FIRST_LINE_DELAY_MS = 600;

function OutcomeScreen({ endingType, household, onContinue }) {
  const { t } = useTranslation();
  const type = endingType ?? 'bad';
  const accent = ACCENTS[type] ?? ACCENTS.bad;
  const icon = ICONS[type] ?? ICONS.bad;
  const headline = t(`outcomeScreen.${type}.headline`);

  const elderlyName = household?.elderlyRelation || 'your relative';
  const { hasElderly, hasChildren } = household ?? {};

  // Pick the right variant for this household
  let variant;
  if (type === 'good') {
    if (hasElderly && hasChildren) variant = 'elderlyAndChildren';
    else if (hasElderly) variant = 'elderly';
    else if (hasChildren) variant = 'children';
    else variant = 'solo';
  } else if (type === 'bad') {
    if (hasElderly) variant = 'elderly';
    else if (hasChildren) variant = 'children';
    else variant = 'solo';
  } else {
    variant = hasElderly ? 'elderly' : 'default';
  }

  const rawLines = t(`outcomeScreen.${type}.${variant}`);
  const lines = (Array.isArray(rawLines) ? rawLines : []).map(
    line => line.replace(/\{\{elderlyName\}\}/g, elderlyName)
  );

  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers = [];
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), FIRST_LINE_DELAY_MS + i * LINE_DELAY_MS)
      );
    });
    timers.push(
      setTimeout(() => setShowButton(true), FIRST_LINE_DELAY_MS + lines.length * LINE_DELAY_MS + 300)
    );
    return () => timers.forEach(clearTimeout);
  }, [lines.length]);

  return (
    <div className="outcome-overlay" style={{ '--outcome-accent': accent }}>
      <div className="outcome-glow" />

      <div className="outcome-content">
        <div className="outcome-icon-wrap">
          <span className="outcome-icon">{icon}</span>
        </div>

        <h2 className="outcome-headline">{headline}</h2>

        <div className="outcome-lines">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`outcome-line ${i < visibleLines ? 'visible' : ''}`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className={`outcome-btn-wrap ${showButton ? 'visible' : ''}`}>
          <button className="outcome-btn" onClick={onContinue}>
            {t('outcomeScreen.seeResults')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OutcomeScreen;
