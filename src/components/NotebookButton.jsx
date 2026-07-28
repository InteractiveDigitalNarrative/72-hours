import './NotebookButton.css';
import { useNotebook } from '../context/NotebookContext';
import { useTranslation } from '../hooks/useTranslation';

// Floating notebook button — available on the menu and throughout the game.
// Pulses and shows a "note this down" pill when the story nudges the player.
function NotebookButton() {
  const { t } = useTranslation();
  const { open, isOpen, nudgeSection, hasContent } = useNotebook();

  if (isOpen) return null;

  return (
    <div className="nbtn-wrap">
      {nudgeSection && (
        <button
          className="nbtn-pill"
          onClick={() => open(nudgeSection)}
        >
          🗒️ {t('notebook.nudge')}
          <span className="nbtn-pill-section">
            {t(`notebook.sections.${nudgeSection}.label`)}
          </span>
        </button>
      )}
      <button
        className={`nbtn-fab ${nudgeSection ? 'nbtn-fab-nudged' : ''} ${hasContent ? 'nbtn-fab-filled' : ''}`}
        onClick={() => open()}
        aria-label={t('notebook.open')}
        title={t('notebook.open')}
      >
        🗒️
      </button>
    </div>
  );
}

export default NotebookButton;
