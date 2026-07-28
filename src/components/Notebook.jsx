import './Notebook.css';
import { useNotebook } from '../context/NotebookContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDialog } from '../hooks/useDialog';

// Emoji per section tab — quick visual anchor.
const SECTION_EMOJI = {
  numbers:  '☎️',
  supplies: '🛒',
  home:     '🏠',
  meds:     '💊',
  other:    '📝',
};

function Notebook() {
  const { t } = useTranslation();
  const {
    visibleSections, sections, setSection,
    isOpen, close, activeSection, setActiveSection, nudgeSection,
  } = useNotebook();

  const dialogRef = useDialog({ onEscape: close });

  if (!isOpen) return null;

  // Never point at a section that isn't unlocked yet.
  const active = visibleSections.includes(activeSection)
    ? activeSection
    : (visibleSections[visibleSections.length - 1] || 'other');
  const onlyScratch = visibleSections.length <= 1;

  return (
    <div className="nb-overlay" onClick={close}>
      <div
        className="nb-panel"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('notebook.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nb-header">
          <span className="nb-title">🗒️ {t('notebook.title')}</span>
          <button className="nb-close" onClick={close} aria-label={t('notebook.close')}>×</button>
        </div>

        <p className="nb-subtitle">{t('notebook.subtitle')}</p>

        <div className="nb-tabs" role="tablist">
          {visibleSections.map(key => (
            <button
              key={key}
              role="tab"
              aria-selected={active === key}
              className={[
                'nb-tab',
                active === key ? 'nb-tab-active' : '',
                nudgeSection === key ? 'nb-tab-nudged' : '',
                (sections[key] || '').trim() ? 'nb-tab-filled' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setActiveSection(key)}
            >
              <span className="nb-tab-emoji">{SECTION_EMOJI[key]}</span>
              <span className="nb-tab-label">{t(`notebook.sections.${key}.label`)}</span>
            </button>
          ))}
        </div>

        {onlyScratch && (
          <p className="nb-hint">{t('notebook.topicsHint')}</p>
        )}

        <textarea
          key={active}
          className="nb-textarea"
          value={sections[active] || ''}
          onChange={(e) => setSection(active, e.target.value)}
          placeholder={t(`notebook.sections.${active}.placeholder`)}
          autoFocus
        />

        <div className="nb-footer">
          <span className="nb-saved">{t('notebook.autosaved')}</span>
        </div>
      </div>
    </div>
  );
}

export default Notebook;
