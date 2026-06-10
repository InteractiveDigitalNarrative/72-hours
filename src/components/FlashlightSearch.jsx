import { useState, useEffect, useRef, useMemo } from 'react';
import './FlashlightSearch.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';
import { useDialog } from '../hooks/useDialog';

// Fixed hiding spots in the dark room (positions in %)
const SPOTS = [
  { id: 'bedside',      x: 76, y: 30 },
  { id: 'hallway',      x: 20, y: 22 },
  { id: 'coat',         x: 14, y: 56 },
  { id: 'junk_drawer',  x: 38, y: 74 },
  { id: 'coffee_table', x: 64, y: 66 },
];

// Map the Ink flashlight_spot to a scene spot id
function knownSpotId(knownSpot) {
  if (knownSpot === 'bedside') return 'bedside';
  if (knownSpot === 'hallway') return 'hallway';
  return null;
}

function FlashlightSearch({ hasFlashlight, knownSpot = 'none', onClose }) {
  const { t } = useTranslation();
  const { playSfx } = useAudioContext();
  const dialogRef = useDialog();

  const hintId = knownSpotId(knownSpot);

  // Where the flashlight actually is this run
  const flashlightId = useMemo(() => {
    if (!hasFlashlight) return null;
    if (hintId) return hintId;
    return 'junk_drawer'; // no known spot → buried in clutter
  }, [hasFlashlight, hintId]);

  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [searched, setSearched] = useState({});
  const [lastReveal, setLastReveal] = useState(null);
  const [found, setFound] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const sceneRef = useRef(null);
  const doneRef = useRef(false);    // overlay is closing
  const stoppedRef = useRef(false); // timer frozen (found or gave up)

  // Real-time "seconds in the dark" timer
  useEffect(() => {
    startRef.current = Date.now();
    const iv = setInterval(() => {
      if (!stoppedRef.current) {
        const secs = (Date.now() - startRef.current) / 1000;
        elapsedRef.current = secs;
        setElapsed(secs);
      }
    }, 100);
    return () => clearInterval(iv);
  }, []);

  const moveGlow = (clientX, clientY) => {
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    setGlow({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseMove = (e) => moveGlow(e.clientX, e.clientY);
  const handleTouchMove = (e) => {
    const tch = e.touches[0];
    if (tch) moveGlow(tch.clientX, tch.clientY);
  };

  const finish = (result) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onClose?.(result);
  };

  const searchSpot = (id) => {
    if (found || doneRef.current) return;

    if (id === flashlightId) {
      playSfx('success');
      stoppedRef.current = true; // freeze the timer; player taps Continue
      setFound(true);
      return;
    }

    // A decoy spot
    playSfx('click');
    setSearched(prev => ({ ...prev, [id]: true }));
    setLastReveal(id);
  };

  const proceed = () => {
    playSfx('click');
    const seconds = Math.max(1, Math.round(elapsedRef.current));
    finish({ seconds, foundIt: true, usedKnownSpot: !!hintId });
  };

  const giveUp = () => {
    playSfx('fail');
    stoppedRef.current = true;
    const seconds = Math.max(1, Math.round(elapsedRef.current));
    finish({ seconds, foundIt: false, usedKnownSpot: false });
  };

  // The phone fallback is always reachable after a few seconds, so the
  // player can never get stuck — and giving up to use the phone is realistic.
  const canGiveUp = !found && elapsed >= 5;

  const secondsLabel = Math.floor(elapsed);

  // A reminder of where YOU left it — your own memory, not a marker on the map
  const reminderKey = knownSpot === 'none' ? 'none' : knownSpot;

  return (
    <div className="fs-overlay" ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('flashlightSearch.title')}>
      <div className="fs-panel">
        <div className="fs-topbar">
          <span className="fs-title">🌑 {t('flashlightSearch.title')}</span>
          <span className={`fs-timer ${elapsed >= 12 ? 'fs-timer-hot' : ''}`}>
            ⏱ {secondsLabel}s {t('flashlightSearch.inTheDark')}
          </span>
        </div>

        {!found && (
          <p className={`fs-instruction ${reminderKey !== 'none' ? 'fs-remind-known' : ''}`}>
            {t(`flashlightSearch.remind.${reminderKey}`)}
          </p>
        )}

        <div
          ref={sceneRef}
          className={`fs-scene ${found ? 'fs-scene-found' : ''}`}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{ '--gx': `${glow.x}%`, '--gy': `${glow.y}%` }}
        >
          {/* Hiding spots */}
          {SPOTS.map(spot => {
            const isSearched = !!searched[spot.id];
            const isTheLight = found && spot.id === flashlightId;
            return (
              <button
                key={spot.id}
                className={`fs-spot ${isSearched ? 'fs-spot-searched' : ''} ${isTheLight ? 'fs-spot-found' : ''}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onClick={() => searchSpot(spot.id)}
                disabled={found}
              >
                <span className="fs-spot-emoji">
                  {isTheLight ? '🔦' : (isSearched ? '·' : '▢')}
                </span>
                <span className="fs-spot-label">{t(`flashlightSearch.spots.${spot.id}`)}</span>
              </button>
            );
          })}

          {/* Darkness mask — lit hole follows the glow */}
          {!found && <div className="fs-darkness" />}
        </div>

        {/* Reveal log */}
        {!found && lastReveal && (
          <p className="fs-reveal">— {t(`flashlightSearch.reveals.${lastReveal}`)}</p>
        )}

        {found && (
          <>
            <p className="fs-found-msg">
              {hintId
                ? t('flashlightSearch.foundKnown')
                : t('flashlightSearch.foundFumble')}
            </p>
            <button className="fs-continue" onClick={proceed}>
              {t('flashlightSearch.continue')}
            </button>
          </>
        )}

        {canGiveUp && (
          <button className="fs-giveup" onClick={giveUp}>
            📱 {t('flashlightSearch.giveUp')}
          </button>
        )}
      </div>
    </div>
  );
}

export default FlashlightSearch;
