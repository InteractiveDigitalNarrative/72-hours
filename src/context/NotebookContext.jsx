import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Digital notebook — structured sections the player fills anytime. Persists to
// its own localStorage key (per playthrough; cleared on a new game). A "nudge"
// lets the story point the player at a section when a 🗒️ moment happens.

const SECTION_KEYS = ['numbers', 'supplies', 'home', 'meds', 'other'];
// 'other' (a free scratch pad) is available from the start; the topical
// sections stay hidden until the game introduces them, so the notebook grows
// with the playthrough instead of handing over a filled-in template.
const ALWAYS_UNLOCKED = ['other'];
const STORAGE_KEY = 'storm_notebook_v2';

const emptySections = () =>
  SECTION_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sections: emptySections(), unlocked: [...ALWAYS_UNLOCKED] };
    const saved = JSON.parse(raw) || {};
    return {
      sections: { ...emptySections(), ...(saved.sections || {}) },
      unlocked: Array.from(new Set([...ALWAYS_UNLOCKED, ...(saved.unlocked || [])])),
    };
  } catch {
    return { sections: emptySections(), unlocked: [...ALWAYS_UNLOCKED] };
  }
}

const NotebookCtx = createContext(null);

export function NotebookProvider({ children }) {
  const initial = loadState();
  const [sections, setSections] = useState(initial.sections);
  const [unlocked, setUnlocked] = useState(initial.unlocked);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('other');
  // Section the story last nudged toward (drives the pulse / "note this" pill)
  const [nudgeSection, setNudgeSection] = useState(null);
  const nudgeTimer = useRef(null);

  // Persist sections + unlocked topics together.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sections, unlocked }));
    } catch { /* ignore */ }
  }, [sections, unlocked]);

  // Sections in canonical order that are currently visible to the player.
  const visibleSections = SECTION_KEYS.filter(k => unlocked.includes(k));

  const setSection = useCallback((key, value) => {
    setSections(prev => ({ ...prev, [key]: value }));
  }, []);

  const unlockSection = useCallback((key) => {
    if (!SECTION_KEYS.includes(key)) return;
    setUnlocked(prev => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const open = useCallback((section) => {
    if (section && SECTION_KEYS.includes(section)) {
      setUnlocked(prev => (prev.includes(section) ? prev : [...prev, section]));
      setActiveSection(section);
    }
    setIsOpen(true);
    setNudgeSection(null);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  // Story introduces a topic — unlock its section and surface a soft nudge.
  const nudge = useCallback((section) => {
    const s = SECTION_KEYS.includes(section) ? section : 'other';
    setUnlocked(prev => (prev.includes(s) ? prev : [...prev, s]));
    setNudgeSection(s);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudgeSection(null), 12000);
  }, []);

  const clear = useCallback(() => {
    setSections(emptySections());
    setUnlocked([...ALWAYS_UNLOCKED]);
    setActiveSection('other');
    setNudgeSection(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const hasContent = SECTION_KEYS.some(k => (sections[k] || '').trim() !== '');

  return (
    <NotebookCtx.Provider
      value={{
        SECTION_KEYS, visibleSections, sections, setSection,
        unlocked, unlockSection,
        isOpen, open, close,
        activeSection, setActiveSection,
        nudgeSection, nudge,
        clear, hasContent,
      }}
    >
      {children}
    </NotebookCtx.Provider>
  );
}

export function useNotebook() {
  return useContext(NotebookCtx);
}
