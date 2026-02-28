import { useState, useEffect } from 'react';
import './OutcomeScreen.css';

const OUTCOMES = {
  good: {
    accent: '#3a9e52',
    icon: '✓',
    headline: 'Help is on the way.',
    lines: ({ hasElderly, hasChildren, elderlyRelation }) => {
      const rel = elderlyRelation || 'your relative';
      if (hasElderly && hasChildren) return [
        'Within the hour, a rescue team arrives.',
        `They stabilize ${rel} on site and check on the children.`,
        '"You did the right thing — calling 1247 brought a team directly to you."',
        'You were prepared. You paid attention. And when it mattered, you knew exactly what to do.',
      ];
      if (hasElderly) return [
        'Within the hour, a medical team arrives.',
        `They check on ${rel} thoroughly. "Dehydrated but stable."`,
        '"You did exactly the right thing calling the health advice line."',
        'You were prepared. You paid attention. And when it mattered, you knew exactly what to do.',
      ];
      if (hasChildren) return [
        'The ambulance arrives in minutes.',
        'The paramedics administer epinephrine immediately.',
        '"You called the right number. A few more minutes and this could have been much worse."',
        'Your child stabilizes. You breathe again.',
      ];
      return [
        'The power company logs your report as a priority area.',
        'By afternoon, a welfare check team arrives.',
        '"Good call using 1343 — that\'s exactly what it\'s for."',
        'The power comes back on by evening.',
      ];
    },
  },
  partial: {
    accent: '#2d6fbb',
    icon: '~',
    headline: 'Help arrived.',
    lines: ({ hasElderly, elderlyRelation }) => {
      const rel = elderlyRelation || 'your relative';
      if (hasElderly) return [
        'Help arrives, though it took a bit longer than necessary.',
        `"They'll be fine," they say. "Though you could have called a more specific number — it would have been faster."`,
        `${rel} is stabilized. You made a reasonable choice, even if not the perfect one.`,
      ];
      return [
        'Help arrives, though it took a bit longer than necessary.',
        'You made a reasonable choice — it got there, just not as fast as it could have been.',
      ];
    },
  },
  delayed: {
    accent: '#b86b10',
    icon: '⏱',
    headline: 'You tied up the lines.',
    lines: ({ hasElderly, elderlyRelation }) => {
      const rel = elderlyRelation || 'your relative';
      if (hasElderly) return [
        'Help arrives, but it took longer than it should have.',
        `"We need to take ${rel} in," they say.`,
        '"Calling 112 for a non-emergency tied up critical resources and delayed your call."',
      ];
      return [
        'Help arrives, but it took longer than it should have.',
        'Calling 112 for a non-emergency tied up critical resources and delayed your situation being handled.',
      ];
    },
  },
  bad: {
    accent: '#a02020',
    icon: '✗',
    headline: 'No one came in time.',
    lines: ({ hasElderly, hasChildren, elderlyRelation }) => {
      const rel = elderlyRelation || 'your relative';
      if (hasElderly) return [
        'You wait. Hours pass.',
        `Eventually, a neighbor with a working car checks on you and takes ${rel} to the hospital.`,
        'They recover — but it was close.',
        'If only you had known the right number to call...',
      ];
      if (hasChildren) return [
        'You wait. Hours pass.',
        'Eventually, a neighbor drives you and your child to the nearest clinic.',
        'It was close.',
        'If only you had known the right number to call...',
      ];
      return [
        'You wait. Hours pass.',
        'Eventually, a welfare worker doing rounds finds you.',
        'You recover — but it took far too long.',
        'If only you had known the right number to call...',
      ];
    },
  },
};

const LINE_DELAY_MS = 1100;
const FIRST_LINE_DELAY_MS = 600;

function OutcomeScreen({ endingType, household, onContinue }) {
  const config = OUTCOMES[endingType] ?? OUTCOMES.bad;
  const lines = config.lines(household ?? {});

  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers = [];
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => setVisibleLines(i + 1),
          FIRST_LINE_DELAY_MS + i * LINE_DELAY_MS
        )
      );
    });
    timers.push(
      setTimeout(
        () => setShowButton(true),
        FIRST_LINE_DELAY_MS + lines.length * LINE_DELAY_MS + 300
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [lines.length]);

  return (
    <div className="outcome-overlay" style={{ '--outcome-accent': config.accent }}>
      <div className="outcome-glow" />

      <div className="outcome-content">
        <div className="outcome-icon-wrap">
          <span className="outcome-icon">{config.icon}</span>
        </div>

        <h2 className="outcome-headline">{config.headline}</h2>

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
            See your results →
          </button>
        </div>
      </div>
    </div>
  );
}

export default OutcomeScreen;
