// InkStory.jsx - Component that integrates Ink.js story engine with React

import { useState, useEffect, useRef } from 'react';
import './InkStory.css';
import PhoneKeypad from './PhoneKeypad';
import CallResult from './CallResult';
import TimeBar from './TimeBar';
import ShoppingList from './ShoppingList';
import StoreOverlay from './StoreOverlay';
import WaterCalculation from './WaterCalculation';
import ConsequenceCard from './ConsequenceCard';
import EndingScreen from './EndingScreen';
import CrisisScreen from './CrisisScreen';
import StormArrival from './StormArrival';
// import BreakingNews from './BreakingNews'; // Breaking News section disabled
import OutcomeScreen from './OutcomeScreen';
import FamilySetup from './FamilySetup';
import PantryCheck from './PantryCheck';
import GoCheck from './GoCheck';
import HomeSetup from './HomeSetup';
import HeatNote from './HeatNote';
import LightAudit from './LightAudit';
import LightNote from './LightNote';
import FlashlightSearch from './FlashlightSearch';
import RumorSort from './RumorSort';
import CabinetCheck from './CabinetCheck';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNotebook } from '../context/NotebookContext';

// localStorage key for the in-progress save (bump the suffix if the shape changes)
export const SAVE_KEY = 'storm_save_v1';

// DEV-ONLY scene jumps for quick testing of a slice without playing the intro.
// Use ?scene=<key> in the URL (dev build only). Each preset seeds a sensible
// household + ink vars, sets the weather stage, then jumps to an Ink knot.
// Add new slices here as needed.
// Real-time "go and look" actions. `flatCost` is what the player pays if they
// estimate instead of going, and doubles as the cap on the real-time charge, so
// checking honestly is never more expensive than guessing — see GoCheck.jsx.
// `next` is what opens once the time has been charged. `minAway` is how long
// "I'm back" stays locked, set to roughly the fastest anyone could plausibly
// do that particular errand.
const GO_CHECK_TASKS = {
  kitchen:    { flatCost: 10, minAway: 45, next: 'pantry' },
  flashlight: { flatCost: 3,  minAway: 30, next: 'story'  },
  radio:      { flatCost: 3,  minAway: 30, next: 'story'  },
  home:       { flatCost: 5,  minAway: 60, next: 'home'   },
  // Unlike the others this gate comes *after* its mini-game: the drill teaches
  // what to look for (expired / running low / needs cold), then the player
  // applies those criteria to their own medicines.
  medicines:  { flatCost: 3,  minAway: 45, next: 'story' },
  // Driven from inside WaterCalculation rather than by a tag, so it has no
  // `next` — the overlay decides what follows.
  water:      { flatCost: 3,  minAway: 45 },
};

const DEV_SCENES = {
  // Crisis night, solo player who prepared NO light → flashlight search + drained phone
  'crisis-nolight': {
    path: 'wake_up', weather: 2,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, has_elderly: false, has_children: false, heard_broadcast: true, light_flashlight: false },
  },
  // Crisis night, solo player who DID prepare a flashlight in a known spot
  'crisis-light': {
    path: 'wake_up', weather: 2,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, has_elderly: false, has_children: false, heard_broadcast: true,
            light_flashlight: true, flashlight_spot: 2, light_batteries: true, light_rationing: true },
  },
  // Straight to the medicine Cabinet Check overlay
  'cabinet-check': {
    path: 'category_medication', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, in_preparation: true },
  },
  // Straight to the Pantry Check overlay (Kitchen Report)
  'pantry-check': {
    path: 'food_kitchen_result', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, in_preparation: true },
  },
  // Preparation hub — click the Water card to reach the water calculation
  'prep-hub': {
    path: 'preparation_hub', weather: 1,
    household: { size: 2, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 2, in_preparation: true },
  },
  // Light hub with the flashlight fetch available (audit already done)
  'flashlight-fetch': {
    path: 'light_hub', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, in_preparation: true, light_audit_done: true, owns_flashlight: true },
  },
  // Info hub with the radio fetch available (rumor drill already done)
  'radio-fetch': {
    path: 'info_hub', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, in_preparation: true, info_drill_done: true },
  },
  // Straight to the Light Audit overlay (what light do you have)
  'light-audit': {
    path: 'category_light', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, in_preparation: true },
  },
  // Straight to the Home Setup overlay (building + heating + weak spots)
  'home-setup': {
    path: 'category_heat', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1 },
  },
  // Straight to the TV breaking-news overlay (storm warning)
  'breaking-news': {
    path: 'tv_start', weather: 1,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1 },
  },
  // Straight into the flashlight search overlay, NO light prepared (instant)
  'flashlight-nolight': {
    path: 'reach_for_light', weather: 2,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, has_elderly: false, has_children: false, light_flashlight: false },
  },
  // Straight into the flashlight search overlay, light prepared in a known spot
  'flashlight-light': {
    path: 'reach_for_light', weather: 2,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, has_elderly: false, has_children: false,
            light_flashlight: true, flashlight_spot: 2, light_batteries: true },
  },
  // Straight to the power-outage emergency call with a drained phone (1343)
  'call-power': {
    path: 'call_power_outage', weather: 2,
    household: { size: 1, elderlyRelation: null, hasElderly: false, hasChildren: false },
    vars: { family_size: 1, has_elderly: false, has_children: false, heard_broadcast: true, phone_drained: true },
  },
  // Per-category ConsequenceCard overlay (report panel after each prep phase) — well prepared
  'consequence-light': {
    path: 'crisis_night', weather: 2,
    household: { size: 2, elderlyRelation: 'Grandma', hasElderly: true, hasChildren: false },
    vars: {
      family_size: 2, has_elderly: true, has_children: false, prep_light: 2,
      light_flashlight: true, search_found: true, search_known_spot: true,
      search_seconds: 2, light_batteries: true, light_rationing: true,
    },
  },
  // Same overlay, underprepared — check the red/level-0 variant too
  'consequence-light-bad': {
    path: 'crisis_night', weather: 2,
    household: { size: 2, elderlyRelation: 'Grandma', hasElderly: true, hasChildren: false },
    vars: { family_size: 2, has_elderly: true, has_children: false, prep_light: 0 },
  },
  // Final ending/report screen, mixed prep levels
  'ending-screen': {
    path: 'ending_summary', weather: 2,
    household: { size: 2, elderlyRelation: 'Grandma', hasElderly: true, hasChildren: false },
    vars: {
      family_size: 2, has_elderly: true, has_children: false,
      prep_light: 2, prep_heat: 1, prep_water: 2, prep_food: 1, prep_info: 0, prep_medication: 2,
      total_prep: 8, ending_type: 'partial', call_outcome: 'help_partial', dialed_number: '1220',
    },
  },
};

// Structural prep-choice data — translatable text comes from t() at render time
const PREP_CHOICE_ICONS = {
  water: '💧', food: '🍞', heat: '🔥', light: '🔦', info: '📻', radio: '📻',
  medication: '💊', meds: '💊', shop: '🛒', store: '🛒', done: '✅', finish: '✅', ready: '✅',
};
const PREP_CHOICE_VARS = {
  water: 'prep_water', food: 'prep_food', heat: 'prep_heat', light: 'prep_light',
  info: 'prep_info', radio: 'prep_info', medication: 'prep_medication', meds: 'prep_medication',
};
// Alias map for t() keys (radio→info, meds→medication, store→shop, finish/ready→done)
const PREP_T_KEY = {
  water: 'water', food: 'food', heat: 'heat', light: 'light', info: 'info', radio: 'info',
  medication: 'medication', meds: 'medication', shop: 'shop', store: 'shop', done: 'done', finish: 'done', ready: 'done',
};

const HUB_KEYWORDS = Object.keys(PREP_CHOICE_ICONS);

const getPrepChoiceKey = (text) => {
  const lower = text.toLowerCase();
  for (const key of Object.keys(PREP_CHOICE_ICONS)) {
    if (lower.includes(key)) return key;
  }
  return null;
};

// Strip emoji characters from a string (so the Ink choice text label stays clean)
const stripEmoji = (text) =>
  text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]+\s*/gu, '').trim();

// Split a leading emoji from the rest of the choice text for separate rendering
const splitChoiceIcon = (text) => {
  const match = text.match(/^([\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]+)\s*/u);
  return match
    ? { icon: match[1], label: text.slice(match[0].length) }
    : { icon: null, label: text };
};

function InkStory({ onReturnToMenu, resume = false }) {
  // ============================================
  // AUDIO & TRANSLATION
  // ============================================
  const { muted, toggleMute, playAmbient, playSfx, setWindVolume, switchWindTrack, WIND_VOLS } = useAudioContext();
  const { t, language } = useTranslation();
  const notebook = useNotebook();

  // Build prep choice metadata from translations
  const getPrepChoiceMeta = (text) => {
    const key = getPrepChoiceKey(text);
    if (!key) return { icon: '▶', description: '' };
    const tKey = PREP_T_KEY[key];
    const data = t(`inkStory.prepCategories.${tKey}`);
    return {
      icon: PREP_CHOICE_ICONS[key],
      description: data?.description ?? '',
      timeRange: data?.timeRange,
      gameVar: PREP_CHOICE_VARS[key],
    };
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Track the current story text (array of lines)
  const [storyText, setStoryText] = useState([]);

  // Track available choices (array of choice objects)
  const [choices, setChoices] = useState([]);

  // Track if story is loaded and ready
  const [storyLoaded, setStoryLoaded] = useState(false);

  // Track current background image
  const [background, setBackground] = useState(null);

  // Phone keypad state
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadScenario, setKeypadScenario] = useState(null);
  const [callResult, setCallResult] = useState(null);
  const [dialedNumber, setDialedNumber] = useState('');

  // Radio broadcast state
  const [showRadioBroadcast, setShowRadioBroadcast] = useState(false);

  // SMS overlay state
  const [showSMS, setShowSMS] = useState(false);

  // Consequence card state (shown per crisis knot)
  const [consequenceCard, setConsequenceCard] = useState(null);

  // Water calculation quiz state
  const [showWaterCalc, setShowWaterCalc] = useState(false);
  const [waterCalcPendingIndex, setWaterCalcPendingIndex] = useState(null);

  // Store overlay state
  const [showStore, setShowStore] = useState(false);
  // True when the store was opened via the injected "Go to Shop" button (not from an Ink tag)
  const [storeOpenedDirectly, setStoreOpenedDirectly] = useState(false);
  // Live time cost preview while the store is open
  const [liveStoreCost, setLiveStoreCost] = useState(0);

  // Prep hub: which card is expanded in accordion (mobile)
  const [expandedCard, setExpandedCard] = useState(null);

  // Sleep fade overlay
  const [showSleepFade, setShowSleepFade] = useState(false);
  const [sleepFadingOut, setSleepFadingOut] = useState(false);

  // Outcome screen overlay
  const [showOutcomeScreen, setShowOutcomeScreen] = useState(false);

  // Breaking news overlay (disabled — keeping only official SMS)
  // const [showBreakingNews, setShowBreakingNews] = useState(false);

  // Storm arrival overlay
  const [showStormArrival, setShowStormArrival] = useState(false);

  // Ending screen state
  const [showEndingScreen, setShowEndingScreen] = useState(false);

  // Crisis screen state
  const [crisisPhase, setCrisisPhase] = useState(null); // 'night' or 'morning'

  // Family setup state
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  const [household, setHousehold] = useState({
    size: 2,
    elderlyRelation: 'Grandmother',
    hasElderly: true,
    hasChildren: false,
  });

  // Pantry check state — populated by PantryCheck overlay, consumed by StoreOverlay
  const [showPantryCheck, setShowPantryCheck] = useState(false);

  // Key into GO_CHECK_TASKS while the real-time "go and look" gate is open,
  // null when it isn't.
  const [goCheckTask, setGoCheckTask] = useState(null);
  const [pantryResult, setPantryResult] = useState({ gaps: [], useFirst: [] });

  // Home setup state — populated by HomeSetup overlay, consumed by HeatNote widget
  const [showHomeSetup, setShowHomeSetup] = useState(false);
  const [homeResult, setHomeResult] = useState(null);

  // Light audit state — populated by LightAudit overlay, consumed by LightNote widget
  const [showLightAudit, setShowLightAudit] = useState(false);
  const [lightResult, setLightResult] = useState(null);

  // Crisis-night flashlight search mini-game
  const [showFlashlightSearch, setShowFlashlightSearch] = useState(false);

  // Information "Signal vs Noise" rumor-sorting mini-game
  const [showRumorSort, setShowRumorSort] = useState(false);

  // Medication "Medicine cabinet check" triage mini-game
  const [showCabinetCheck, setShowCabinetCheck] = useState(false);

  // Tracks the current Ink scene (set by tags like HEAT_HUB) so widgets can show/hide
  const [currentScene, setCurrentScene] = useState(null);

  // Text speed: 'slow' (fade-in) or 'instant'
  const [textSpeed, setTextSpeed] = useState(() => {
    return localStorage.getItem('textSpeed') || 'slow';
  });

  const toggleTextSpeed = () => {
    setTextSpeed((prev) => {
      const next = prev === 'slow' ? 'instant' : 'slow';
      localStorage.setItem('textSpeed', next);
      return next;
    });
  };

  const [showSettings, setShowSettings] = useState(false);

  // Track game variables from Ink
  const [gameVars, setGameVars] = useState({
    temperature: -8,
    // Preparation categories (0 = not done, 1 = basic, 2 = thorough)
    prep_water: 0,
    prep_food: 0,
    prep_heat: 0,
    prep_light: 0,
    prep_info: 0,
    prep_medication: 0,
    // Time tracking
    current_time: 1200,
    storm_time: 1320,
    start_time: 1200,
    in_preparation: false,
  });

  // ============================================
  // REF - Special React feature
  // ============================================
  // useRef creates a "box" that holds a value that persists between renders
  // but doesn't cause re-renders when changed (unlike useState)
  // We use it to store the Ink story instance
  const storyRef = useRef(null);

  // History stack for back button
  const historyRef = useRef([]);
  const [historyLength, setHistoryLength] = useState(0);

  // Weather stage: 0 = default, 1 = prep done (storm arriving), 2 = 3:47 AM (crisis)
  const [weatherStage, setWeatherStage] = useState(0);

  // Tracks wrong dials in the current call (resets per call scenario)
  const [callAttempts, setCallAttempts] = useState(0);
  const [callScore, setCallScore] = useState(0);
  const wasPrepActiveRef = useRef(false);

  // Scroll-down hint — the text/choices column can overflow the screen with
  // no visible scrollbar, so we surface a bouncing chevron whenever there's
  // more content below the fold.
  const storyWrapperRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const el = storyWrapperRef.current;
    if (!el) return;

    // Once shown, the hint reserves 42px of bottom padding for itself (see
    // .has-scroll-hint in InkStory.css) so it never sits on top of the last
    // button. That reserved space itself counts as "overflow" — left in the
    // measurement, it would keep the hint stuck on forever. Subtract it back
    // out so we're always comparing the *content's* real height.
    const RESERVED_HINT_SPACE = 42;
    let rafId = null;

    const measure = () => {
      const reserved = el.classList.contains('has-scroll-hint') ? RESERVED_HINT_SPACE : 0;
      const contentHeight = el.scrollHeight - reserved;
      const hasOverflow = contentHeight - el.clientHeight > 8;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
      setShowScrollHint(hasOverflow && !atBottom);
    };

    // A resize fired mid-layout (e.g. content still streaming in) can catch
    // clientHeight/scrollHeight at a transient, inaccurate moment. Defer two
    // frames so we measure after layout has actually settled.
    const scheduleMeasure = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(measure);
      });
    };

    scheduleMeasure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ============================================
  // LOAD INK.JS AND INITIALIZE STORY
  // ============================================
  useEffect(() => {
    // This runs once when component mounts

    // Pick story file and global variable based on language
    const storyFile = language === 'et' ? 'ink/72Hours_et.js' : 'ink/72Hours.js';
    const storyVar  = language === 'et' ? 'storyContentET'    : 'storyContent';

    console.log('Loading Ink.js story...', storyFile);

    // STEP 1: Load the ink.js library
    const inkScript = document.createElement('script');
    inkScript.src = import.meta.env.BASE_URL + 'ink/ink.js';
    inkScript.async = true;

    inkScript.onload = () => {
      console.log('Ink.js loaded!');

      // STEP 2: Load the compiled story.
      // The story is a public/ file pulled in via <script>, which the browser
      // caches and vite does NOT hot-reload. In dev, bust the cache so a
      // recompiled .ink (npm run compile-ink) is always picked up on reload —
      // otherwise you can see stale narrative and think it's a deadend.
      const storyScript = document.createElement('script');
      const bust = import.meta.env.DEV ? `?v=${Date.now()}` : '';
      storyScript.src = import.meta.env.BASE_URL + storyFile + bust;
      storyScript.async = true;

      storyScript.onload = () => {
        console.log('Story file loaded!');

        // STEP 3: Initialize the story
        if (window[storyVar]) {
          const story = new window.inkjs.Story(window[storyVar]);

          storyRef.current = story;

          // Dev: expose the live story so you can jump from the console:
          //   window.story.ChoosePathString('call_power_outage')
          if (import.meta.env.DEV) window.story = story;

          // STEP 4: Either resume a saved game or start from the beginning
          let resumed = false;
          if (resume) {
            try {
              const raw = localStorage.getItem(SAVE_KEY);
              const save = raw ? JSON.parse(raw) : null;
              if (save && save.ink) {
                story.state.LoadJson(save.ink);
                if (save.household) setHousehold(save.household);
                if (typeof save.weatherStage === 'number') setWeatherStage(save.weatherStage);
                if (save.background) setBackground(save.background);
                // Re-sync choices + game vars at the restored choice point,
                // then restore the text that was on screen (same as the Back button).
                continueStory();
                setStoryText(save.text || []);
                resumed = true;
              }
            } catch (e) {
              console.warn('Could not resume saved game:', e);
            }
          }

          if (!resumed) {
            // Dev scene jump: ?scene=<key> skips the intro and lands on a slice.
            const sceneKey = import.meta.env.DEV
              ? new URLSearchParams(window.location.search).get('scene')
              : null;
            const cfg = sceneKey && DEV_SCENES[sceneKey];
            if (cfg) {
              console.log('[dev scene] jumping to', sceneKey, '→', cfg.path);
              if (cfg.household) setHousehold(cfg.household);
              if (typeof cfg.weather === 'number') setWeatherStage(cfg.weather);
              Object.entries(cfg.vars || {}).forEach(([k, v]) => {
                try { story.variablesState[k] = v; } catch (e) { console.warn('[dev scene] var', k, e); }
              });
              try { story.ChoosePathString(cfg.path); }
              catch (e) { console.error('[dev scene] bad path', cfg.path, e); }
            }
            continueStory();
          }

          setStoryLoaded(true);
        } else {
          console.error('Story content not found!');
        }
      };

      storyScript.onerror = () => {
        console.error('Failed to load story file!');
      };

      document.body.appendChild(storyScript);
    };

    inkScript.onerror = () => {
      console.error('Failed to load Ink.js!');
    };

    document.body.appendChild(inkScript);

    return () => {
      if (inkScript.parentNode) {
        inkScript.parentNode.removeChild(inkScript);
      }
    };
  }, []); // Empty array = run once on mount

  // ============================================
  // AUTO-SAVE — checkpoint whenever the story settles on a real choice point.
  // When an overlay is open the story sets choices to [], so guarding on
  // choices.length naturally avoids saving mid-overlay (which couldn't resume).
  useEffect(() => {
    if (!storyLoaded || !storyRef.current) return;
    if (!choices || choices.length === 0) return;
    if (showEndingScreen) return;
    try {
      const save = {
        v: 1,
        lang: language,
        ink: storyRef.current.state.toJson(),
        text: storyText,
        household,
        weatherStage,
        background,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {
      // Storage full / serialisation issue — non-fatal, just skip this save.
      console.warn('Auto-save failed:', e);
    }
  }, [storyText, choices, storyLoaded, showEndingScreen, household, weatherStage, background, language]);

  // Clear the save once the game is over, so "Continue" only offers in-progress runs.
  useEffect(() => {
    if (showEndingScreen) {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    }
  }, [showEndingScreen]);

  // ============================================
  // WEATHER STAGE — advances at two narrative moments:
  //   Stage 1: player finishes preparation (in_preparation flips false)
  //   Stage 2: 3:47 AM / CRISIS_NIGHT tag fires
  useEffect(() => {
    if (gameVars.in_preparation) {
      wasPrepActiveRef.current = true;
    } else if (wasPrepActiveRef.current && weatherStage === 0) {
      // Prep just ended → storm arriving
      setWeatherStage(1);
    }
  }, [gameVars.in_preparation]);

  // ============================================
  // AMBIENT SOUND STATE MACHINE
  //   ending → outro music | radio overlay → radio noise | storm stage → silence (wind carries it) | prep active → electricity | else → room
  useEffect(() => {
    if (showEndingScreen) {
      playAmbient('outro');
    } else if (showRadioBroadcast) {
      playAmbient('radio');
    } else if (weatherStage >= 1) {
      playAmbient(null); // wind layer takes over
    } else if (gameVars.in_preparation) {
      playAmbient('prep');
    } else {
      playAmbient(null); // intro narrative — silent (menu music has already faded)
    }
  }, [weatherStage, gameVars.in_preparation, showEndingScreen, showRadioBroadcast, playAmbient]);

  // Wind volume/track tracks weather stage — switches to wind.wav at storm (stage 2)
  useEffect(() => {
    if (showEndingScreen) {
      setWindVolume(0);
    } else if (weatherStage === 2) {
      switchWindTrack('Sound/wind.wav', WIND_VOLS[2]);
    } else {
      setWindVolume(WIND_VOLS[weatherStage] ?? WIND_VOLS[0]);
    }
  }, [weatherStage, showEndingScreen, setWindVolume, switchWindTrack, WIND_VOLS]);

  // After sleep fade completes, silently advance to wake_up → triggers STORM_ARRIVAL
  useEffect(() => {
    if (!showSleepFade) return;
    const t = setTimeout(() => {
      const story = storyRef.current;
      if (story?.currentChoices.length > 0) {
        story.ChooseChoiceIndex(0);
        continueStory();
      }
    }, 2600);
    return () => clearTimeout(t);
  }, [showSleepFade]);

  // ============================================
  // STORY FUNCTIONS
  // ============================================

  // Helper to read all game variables from Ink
  const readGameVars = (story) => {
    const vars = {
      temperature: story.variablesState["temperature"],
      // Preparation categories
      prep_water: story.variablesState["prep_water"],
      prep_food: story.variablesState["prep_food"],
      prep_heat: story.variablesState["prep_heat"],
      prep_light: story.variablesState["prep_light"],
      prep_info: story.variablesState["prep_info"],
      prep_medication: story.variablesState["prep_medication"],
      // Time tracking
      current_time: story.variablesState["current_time"],
      storm_time: story.variablesState["storm_time"],
      start_time: story.variablesState["start_time"],
      in_preparation: story.variablesState["in_preparation"],
      // Shopping list
      shop_water: story.variablesState["shop_water"],
      shop_water_amount: story.variablesState["shop_water_amount"],
      shop_food: story.variablesState["shop_food"],
      shop_batteries: story.variablesState["shop_batteries"],
      shop_meds: story.variablesState["shop_meds"],
      shop_warm: story.variablesState["shop_warm"],
      shop_flashlight: story.variablesState["shop_flashlight"],
      shop_powerbank: story.variablesState["shop_powerbank"],
      shop_headlamp: story.variablesState["shop_headlamp"],
      shop_lantern: story.variablesState["shop_lantern"],
      shop_matches: story.variablesState["shop_matches"],
      shop_visited: story.variablesState["shop_visited"],
      // Heat sub-vars
      heat_sealed: story.variablesState["heat_sealed"],
      heat_one_room: story.variablesState["heat_one_room"],
      heat_pipes: story.variablesState["heat_pipes"],
      // Light sub-vars
      light_flashlight: story.variablesState["light_flashlight"],
      light_batteries: story.variablesState["light_batteries"],
      light_headlamp: story.variablesState["light_headlamp"],
      light_lantern: story.variablesState["light_lantern"],
      light_powerbank: story.variablesState["light_powerbank"],
      light_rationing: story.variablesState["light_rationing"],
      flashlight_spot: story.variablesState["flashlight_spot"],
      // Ending tracking
      ending_type: story.variablesState["ending_type"],
      total_prep: story.variablesState["total_prep"],
      call_outcome: story.variablesState["call_outcome"],
      dialed_number: story.variablesState["dialed_number"],
    };
    setGameVars(vars);
    return vars;
  };

  // Function to get next story chunk and update display
  const continueStory = () => {
    const story = storyRef.current;

    if (!story) {
      console.error('Story not initialized!');
      return;
    }

    // Get the next chunk of story text
    const lines = [];

    // Reset per-run scene marker; will be re-set by any HEAT_HUB tag in this run
    let sceneThisRun = null;

    // Keep calling Continue() while there's more content
    while (story.canContinue) {
      const text = story.Continue();  // Get next line
      lines.push(text);

      // Process tags for this line
      const tags = story.currentTags;
      console.log('Tags:', tags);  // Debug log

      // Pre-pass: NOTE_PROMPT nudges. Must run BEFORE the main loop because
      // several tag handlers below `return` early (e.g. RADIO_BROADCAST), which
      // would otherwise skip a NOTE_PROMPT tag that comes after them in the knot.
      for (const tag of tags) {
        if (tag.startsWith('NOTE_PROMPT:')) {
          notebook?.nudge(tag.replace('NOTE_PROMPT:', '').trim());
        }
      }

      for (const tag of tags) {
        // Check for BACKGROUND tag
        if (tag.startsWith('BACKGROUND:')) {
          let url = tag.replace('BACKGROUND:', '').trim();

          // Convert relative paths like ../Images/Room.jpg to /Images/Room.jpg
          if (url.startsWith('../')) {
            url = url.replace('../', '/');
          }

          console.log('Setting background:', url);  // Debug log
          setBackground(url);
        }

        // Check for WEATHER_STAGE tag
        if (tag.startsWith('WEATHER_STAGE:')) {
          const stage = parseInt(tag.replace('WEATHER_STAGE:', '').trim(), 10);
          if (!isNaN(stage)) setWeatherStage(stage);
        }

        // Check for SLEEP_FADE tag — slow fade to black before storm
        if (tag === 'SLEEP_FADE') {
          setShowSleepFade(true);
          setStoryText([]);
          setChoices([]);
          return;
        }

        // Check for STORM_ARRIVAL tag — show dramatic overlay
        if (tag === 'STORM_ARRIVAL') {
          setShowStormArrival(true);
        }

        // Check for CONSEQUENCE tag (shows a visual card alongside the narrative)
        if (tag.startsWith('CONSEQUENCE:')) {
          setConsequenceCard(tag.replace('CONSEQUENCE:', '').trim());
        }

        // Check for PHONE_KEYPAD tag
        if (tag.startsWith('PHONE_KEYPAD:')) {
          const scenario = tag.replace('PHONE_KEYPAD:', '').trim();
          console.log('Showing phone keypad for scenario:', scenario);
          setKeypadScenario(scenario);
          setShowKeypad(true);
          setCallAttempts(0);
          playSfx('open');
        }

        // Check for SMS tag
        if (tag.startsWith('SMS:')) {
          console.log('Showing SMS overlay');
          playSfx('open');
          setShowSMS(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for FAMILY_SETUP tag
        if (tag === 'FAMILY_SETUP') {
          console.log('Showing family setup');
          setShowFamilySetup(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // The real-time "go and look" gate fronts every physical check: it
        // charges the time, then opens the overlay (or resumes the story).
        // GO_CHECK: <task> covers the fetch actions that have no overlay.
        if (tag.startsWith('GO_CHECK:')) {
          const task = tag.replace('GO_CHECK:', '').trim();
          console.log('Showing go-check timer for', task);
          setGoCheckTask(task);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        if (tag === 'PANTRY_CHECK') {
          console.log('Showing go-check timer before pantry check');
          setGoCheckTask('kitchen');
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for HOME_SETUP tag
        if (tag === 'HOME_SETUP') {
          console.log('Showing go-check timer before home setup');
          setGoCheckTask('home');
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for HEAT_HUB tag — heat-note widget should appear
        if (tag === 'HEAT_HUB') {
          sceneThisRun = 'heat_hub';
        }

        // Check for LIGHT_AUDIT tag
        if (tag === 'LIGHT_AUDIT') {
          console.log('Showing light audit');
          setShowLightAudit(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for LIGHT_HUB tag — light-note widget should appear
        if (tag === 'LIGHT_HUB') {
          sceneThisRun = 'light_hub';
        }

        // Check for FLASHLIGHT_SEARCH tag — crisis-night dark search mini-game
        if (tag === 'FLASHLIGHT_SEARCH') {
          setShowFlashlightSearch(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for RUMOR_SORT tag — Signal vs Noise mini-game
        if (tag === 'RUMOR_SORT') {
          setShowRumorSort(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for MED_CABINET tag — medicine cabinet triage mini-game
        // The medicine drill runs first and the real-world check follows it —
        // see handleCabinetCheckClose.
        if (tag === 'MED_CABINET') {
          setShowCabinetCheck(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for BREAKING_NEWS tag (disabled — keeping only official SMS)
        // if (tag === 'BREAKING_NEWS') {
        //   setShowBreakingNews(true);
        //   setStoryText([]);
        //   setChoices([]);
        //   return;
        // }

        // Check for RADIO_BROADCAST tag
        if (tag === 'RADIO_BROADCAST') {
          console.log('Showing radio broadcast');
          setShowRadioBroadcast(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for STORE_SHOPPING tag
        if (tag === 'STORE_SHOPPING') {
          console.log('Showing store overlay');
          setShowStore(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for CRISIS_NIGHT tag
        if (tag === 'CRISIS_NIGHT') {
          console.log('Showing crisis night screen');
          readGameVars(story);
          setWeatherStage(2); // 3:47 AM — worst weather
          setCrisisPhase('night');
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for CRISIS_MORNING tag
        if (tag === 'CRISIS_MORNING') {
          console.log('Showing crisis morning screen');
          readGameVars(story);
          setCrisisPhase('morning');
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for ENDING_SCREEN tag
        if (tag === 'ENDING_SCREEN') {
          console.log('Showing ending screen');
          readGameVars(story);
          setShowEndingScreen(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }
      }
    }

    // Remove lines whose text is fully contained within another line in the same batch
    // (prevents the Ink story from echoing the same sentence twice)
    const stripHtml = (s) => s.replace(/<[^>]*>/g, '').trim().toLowerCase();
    const deduped = lines.filter((line, i) => {
      const t = stripHtml(line);
      if (!t) return true;
      return !lines.some((other, j) => {
        if (i === j) return false;
        const o = stripHtml(other);
        return o.length > t.length && o.includes(t);
      });
    });

    // Update the story text display
    setStoryText(deduped);

    // Apply scene marker (e.g. heat_hub) for inline widgets like HeatNote
    setCurrentScene(sceneThisRun);

    // Read game variables from Ink
    readGameVars(story);

    // Get current choices from Ink
    const currentChoices = story.currentChoices;

    // Update choices display
    setChoices(currentChoices);

    console.log('Story text:', lines);
    console.log('Choices:', currentChoices);
  };

  // Function to handle when user clicks a choice
  // sfxName defaults to 'click' but can be overridden by prep cards
  const handleChoiceClick = (choiceIndex, sfxName = 'click') => {
    const story = storyRef.current;

    if (!story) return;

    playSfx(sfxName);

    setConsequenceCard(null);

    // Save current state before making the choice
    historyRef.current.push({
      inkState: story.state.toJson(),
      background,
      storyText,
    });
    setHistoryLength(historyRef.current.length);

    // Tell Ink which choice was selected
    story.ChooseChoiceIndex(choiceIndex);

    // Get next part of story
    continueStory();
  };

  // Back button handler
  const handleBack = () => {
    const story = storyRef.current;
    if (!story || historyRef.current.length === 0) return;
    playSfx('close');

    const prev = historyRef.current.pop();
    setHistoryLength(historyRef.current.length);

    // Restore Ink state
    story.state.LoadJson(prev.inkState);

    // Restore background
    setBackground(prev.background);

    // Dismiss any active overlays
    setShowKeypad(false);
    setKeypadScenario(null);
    setCallResult(null);
    setDialedNumber('');
    setShowRadioBroadcast(false);
    setShowSMS(false);
    setShowStore(false);
    setShowWaterCalc(false);
    setConsequenceCard(null);
    setShowEndingScreen(false);
    setCrisisPhase(null);
    setShowFamilySetup(false);

    // Re-continue to sync choices and game vars, then restore saved text
    continueStory();
    setStoryText(prev.storyText);
  };

  // ============================================
  // PHONE KEYPAD HANDLERS
  // ============================================

  const handlePhoneCall = (number, scenario) => {
    console.log('Dialed number:', number, 'for scenario:', scenario);
    setDialedNumber(number);
    setShowKeypad(false);
    setCallResult({ number, scenario });
  };

  const handlePhoneCancel = () => {
    setShowKeypad(false);
    setKeypadScenario(null);
  };

  const handleCallResultContinue = (outcome) => {
    const story = storyRef.current;

    if (story && story.variablesState) {
      story.variablesState['call_outcome'] = outcome;
      story.variablesState['dialed_number'] = dialedNumber;
    }

    // Score: correct on 1st try = 3, 2nd = 2, 3rd = 1, anything else = 0
    setCallScore(outcome === 'help_success' ? Math.max(1, 3 - callAttempts) : 0);

    setCallResult(null);
    setDialedNumber('');

    // Auto-advance past the [Continue] choice in the call knot, then advance
    // ink through the ending knot (sets ending_type) — OutcomeScreen covers the display
    if (story && story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(0);
    }
    setShowOutcomeScreen(true);
    continueStory();
  };

  const handleOutcomeScreenClose = () => {
    setShowOutcomeScreen(false);
    const story = storyRef.current;
    // Auto-advance past [See your results] → ending_summary → # ENDING_SCREEN
    if (story && story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(0);
      continueStory();
    }
  };

  const handleCallRetry = () => {
    playSfx('open');
    setCallAttempts(prev => prev + 1);
    setCallResult(null);
    setDialedNumber('');
    setShowKeypad(true);
  };

  // ============================================
  // SMS HANDLER
  // ============================================

  const handleSMSClose = () => {
    playSfx('close');
    setShowSMS(false);
    const story = storyRef.current;
    if (!story) return;
    continueStory();
    if (story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(0);
      continueStory();
    }
  };

  // ============================================
  // RADIO BROADCAST HANDLER
  // ============================================

  const handleRadioBroadcastClose = () => {
    playSfx('close');
    setShowRadioBroadcast(false);
    // Continue the story, then auto-select the first choice to skip the extra "Continue"
    const story = storyRef.current;
    if (!story) return;
    continueStory();
    if (story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(0);
      continueStory();
    }
  };

  // ============================================
  // WATER CALCULATION QUIZ HANDLER
  // ============================================

  const handleWaterCalcCancel = () => {
    setShowWaterCalc(false);
    setWaterCalcPendingIndex(null);
  };

  // Time spent away counting containers, charged mid-overlay.
  const handleWaterAwayTime = (minutes) => {
    const story = storyRef.current;
    if (!story) return;
    story.variablesState["current_time"] =
      (story.variablesState["current_time"] || 1200) + minutes;
    readGameVars(story);
  };

  const handleWaterCalcClose = (wasCorrect, measuredLitres = 0) => {
    setShowWaterCalc(false);
    const pendingIndex = waterCalcPendingIndex;
    setWaterCalcPendingIndex(null);

    const story = storyRef.current;
    if (!story) return;

    // Tell the Ink story the quiz has been completed so category_water
    // routes to water_containers_intro instead of its own built-in quiz knot.
    story.variablesState["water_quiz_done"] = true;

    // Store the amount the player measured in their kitchen
    story.variablesState["water_home_measured"] = measuredLitres;
    story.variablesState["water_collected"] = measuredLitres;

    if (pendingIndex !== null) {
      handleChoiceClick(pendingIndex);
    }
  };

  // ============================================
  // FAMILY SETUP HANDLER
  // ============================================

  const handleFamilySetupClose = ({ extras }) => {
    setShowFamilySetup(false);
    const size = 1 + extras.length;
    const elderlyMember = extras.find(m => m.type === 'elderly');
    const elderlyRelation = elderlyMember?.relation?.trim() || null;
    const hasElderly = !!elderlyMember;
    const childrenCount = extras.filter(m => m.type === 'child').length;
    const hasChildren = childrenCount > 0;
    const h = { size, elderlyRelation, hasElderly, hasChildren };
    setHousehold(h);

    const story = storyRef.current;
    if (!story) return;
    story.variablesState["family_size"]      = size;
    story.variablesState["elderly_relation"] = elderlyRelation || "";
    story.variablesState["has_elderly"]      = hasElderly;
    story.variablesState["has_children"]     = hasChildren;
    story.variablesState["children_count"]   = childrenCount;
    story.variablesState["water_target"]     = size * 3 * 3;

    // Continue the story from where it paused to get the remaining text + choices
    continueStory();
  };

  // GO-CHECK (real-time walk-away) HANDLER
  // ============================================
  // Both paths charge time and then open whatever the task leads to; they
  // differ only in what they charge — real minutes away vs the flat cost of
  // estimating instead.
  const applyGoCheckCost = (minutes) => {
    const task = GO_CHECK_TASKS[goCheckTask];
    setGoCheckTask(null);

    const story = storyRef.current;
    if (story) {
      story.variablesState["current_time"] =
        (story.variablesState["current_time"] || 1200) + minutes;
      readGameVars(story);
    }

    switch (task?.next) {
      case 'pantry':  setShowPantryCheck(true);  break;
      case 'home':    setShowHomeSetup(true);    break;
      // 'story' — nothing to open, just resume the narrative
      default:        continueStory();           break;
    }
  };

  // PANTRY CHECK OVERLAY HANDLER
  // ============================================
  const handlePantryClose = ({ gaps, useFirst }) => {
    setShowPantryCheck(false);
    setPantryResult({ gaps: gaps || [], useFirst: useFirst || [] });

    const story = storyRef.current;
    if (!story) return;
    story.variablesState["pantry_checked"]         = true;
    story.variablesState["pantry_gaps_count"]      = (gaps || []).length;
    story.variablesState["pantry_use_first_count"] = (useFirst || []).length;

    continueStory();
  };

  // HOME SETUP OVERLAY HANDLER
  // ============================================
  const handleHomeSetupClose = (result) => {
    setShowHomeSetup(false);
    setHomeResult(result);

    const story = storyRef.current;
    if (!story) return;
    story.variablesState["home_setup_done"]        = true;
    story.variablesState["home_seal_count"]        = (result?.weakSpots || []).length;
    story.variablesState["home_has_exposed_pipes"] = !!result?.needsPipeInsulation;
    story.variablesState["home_high_heat_loss"]    = !!result?.highHeatLoss;
    story.variablesState["home_has_stove"]         = !!result?.hasStove;
    story.variablesState["home_building"]          = result?.building || "";
    story.variablesState["home_heating"]           = result?.heating || "";

    continueStory();
  };

  // LIGHT AUDIT OVERLAY HANDLER
  // ============================================
  const handleLightAuditClose = (result) => {
    setShowLightAudit(false);
    setLightResult(result);

    const story = storyRef.current;
    if (!story) return;
    story.variablesState["light_audit_done"] = true;
    story.variablesState["owns_flashlight"]  = !!result?.hasFlashlight;
    story.variablesState["owns_headlamp"]    = !!result?.hasHeadlamp;
    story.variablesState["owns_lantern"]     = !!result?.hasLantern;
    story.variablesState["owns_candles"]     = !!result?.hasCandles;
    story.variablesState["owns_matches"]     = !!result?.hasMatches;
    story.variablesState["owns_powerbank"]   = !!result?.hasPowerBank;

    continueStory();
  };

  // FLASHLIGHT SEARCH (crisis night) HANDLER
  // ============================================
  const handleFlashlightSearchClose = (result) => {
    setShowFlashlightSearch(false);

    const story = storyRef.current;
    if (!story) return;
    story.variablesState["flashlight_search_done"] = true;
    story.variablesState["search_seconds"]    = result?.seconds ?? 0;
    story.variablesState["search_found"]      = !!result?.foundIt;
    story.variablesState["search_known_spot"] = !!result?.usedKnownSpot;

    continueStory();
  };

  // RUMOR SORT (Signal vs Noise) HANDLER
  // ============================================
  const handleRumorSortClose = (result) => {
    setShowRumorSort(false);

    const story = storyRef.current;
    if (!story) return;
    story.variablesState["info_drill_done"]  = true;
    story.variablesState["info_drill_score"] = result?.correct ?? 0;

    continueStory();
  };

  // CABINET CHECK (medicine triage) HANDLER
  // ============================================
  const handleCabinetCheckClose = (result) => {
    setShowCabinetCheck(false);

    const story = storyRef.current;
    if (story) {
      story.variablesState["med_cabinet_done"]  = true;
      story.variablesState["med_cabinet_score"] = result?.correct ?? 0;
      story.variablesState["med_cabinet_total"] = result?.total ?? 0;
      if ((result?.restock ?? 0) > 0) {
        story.variablesState["shop_meds"] = true;
      }
    }

    // Now that the drill has taught the criteria, send them to their own
    // medicines. The gate resumes the story once the time is charged.
    setGoCheckTask('medicines');
  };

  // STORE OVERLAY HANDLER
  // ============================================

  const handleStoreClose = (basketItems, timeCost = 0) => {
    setShowStore(false);
    setLiveStoreCost(0);
    const story = storyRef.current;
    if (!story) return;

    const direct = storeOpenedDirectly;
    setStoreOpenedDirectly(false);

    const foodMap = {
      canned: 'food_canned',
      crackers: 'food_crackers',
      nuts: 'food_nuts',
      energy_bars: 'food_energy_bars',
      chocolate: 'food_chocolate',
      bread: 'food_longlife_bread',
      honey_jam: 'food_honey_jam',
      dried: 'food_dried',
      frozen: 'food_frozen',
      fresh: 'food_fresh_produce',
      milk: 'food_milk',
      yogurt: 'food_yogurt',
    };

    if (direct) {
      // Store was opened from the injected button — set variables based on what
      // the player actually put in their basket, then stay at the prep hub.

      if (basketItems.includes('water')) {
        const target = story.variablesState["water_target"] || 10;
        story.variablesState["water_collected"] = target;
        story.variablesState["shop_water_amount"] = target;
        story.variablesState["prep_water"] = 2;
      }

      if (basketItems.includes('batteries')) {
        story.variablesState["light_batteries"] = true;
        story.variablesState["info_radio_batteries"] = true;
        story.variablesState["prep_light"] = 2;
        story.variablesState["prep_info"] = 2;
      }

      for (const [basketId, inkVar] of Object.entries(foodMap)) {
        if (basketItems.includes(basketId)) {
          story.variablesState[inkVar] = true;
        }
      }

      const boughtFood = ['canned','crackers','nuts','energy_bars','chocolate','bread','honey_jam','dried'].some(id => basketItems.includes(id));
      if (boughtFood) {
        story.variablesState["prep_food"] = 2;
      }

      story.variablesState["shop_visited"] = true;
      story.variablesState["current_time"] = (story.variablesState["current_time"] || 1200) + timeCost;

      // Refresh the UI to reflect updated prep icons — do NOT advance the story
      readGameVars(story);
      return;
    }

    // Store was opened from an Ink STORE_SHOPPING tag — original flow

    // Set water variables
    if (story.variablesState["shop_water"]) {
      let amount = story.variablesState["water_target"] - story.variablesState["water_collected"];
      if (amount < 0) amount = 0;
      story.variablesState["water_collected"] = story.variablesState["water_collected"] + amount;
      story.variablesState["shop_water_amount"] = amount;
      story.variablesState["prep_water"] = 2;
    }

    // Set battery variables
    if (story.variablesState["shop_batteries"]) {
      story.variablesState["light_batteries"] = true;
      story.variablesState["info_radio_batteries"] = true;
      if (story.variablesState["light_flashlight"]) {
        story.variablesState["prep_light"] = 2;
      }
      if (story.variablesState["info_radio"]) {
        story.variablesState["prep_info"] = 2;
      }
    }

    // Set food variables based on basket
    for (const [basketId, inkVar] of Object.entries(foodMap)) {
      story.variablesState[inkVar] = basketItems.includes(basketId);
    }

    // If any food was picked, set prep_food
    if (story.variablesState["shop_food"]) {
      story.variablesState["prep_food"] = 2;
    }

    // Apply time cost for items grabbed
    story.variablesState["current_time"] = (story.variablesState["current_time"] || 1200) + timeCost;

    // Continue the story and auto-select the first choice to proceed to checkout
    continueStory();
    if (story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(0);
      continueStory();
    }
  };

  // ============================================
  // CRISIS SCREEN HANDLER
  // ============================================

  // Disabled — keeping only official SMS
  // const handleBreakingNewsClose = () => {
  //   setShowBreakingNews(false);
  //   const story = storyRef.current;
  //   if (!story) return;
  //   if (story.currentChoices.length > 0) {
  //     story.ChooseChoiceIndex(0);
  //     continueStory();
  //   }
  // };

  const handleCrisisClose = () => {
    playSfx('click');
    setCrisisPhase(null);
    const story = storyRef.current;
    if (!story) return;
    // Auto-select the first choice (the "Continue" choice in Ink)
    if (story.currentChoices.length > 0) {
      story.ChooseChoiceIndex(0);
      continueStory();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  // Build inline style for background
  // Add extra padding when time bar is visible
  const containerStyle = {
    ...(background ? { backgroundImage: `url(${background})` } : {}),
  };

  // List of preparation categories with their icons and labels
  const categories = [
    { key: 'prep_water', icon: '💧', tKey: 'water' },
    { key: 'prep_food', icon: '🍞', tKey: 'food' },
    { key: 'prep_heat', icon: '🔥', tKey: 'heat' },
    { key: 'prep_light', icon: '🔦', tKey: 'light' },
    { key: 'prep_info', icon: '📻', tKey: 'info' },
    { key: 'prep_medication', icon: '💊', tKey: 'medication' },
  ].map(c => ({ ...c, label: t(`inkStory.prepCategories.${c.tKey}.label`) }));

  // Helper to get preparation level class
  const getPrepClass = (level) => {
    if (level === 0) return '';
    if (level === 1) return 'prep-basic';
    return 'prep-thorough';
  };

  // True only at the main preparation hub.
  // Requires 3+ distinct category keywords AND 4+ choices so sub-menus
  // (which have 2-3 choices and focus on a single category) never trigger the grid.
  const CATEGORY_KEYWORDS = ['water', 'food', 'heat', 'light', 'info', 'radio', 'medication', 'meds'];
  const catKeywordCount = CATEGORY_KEYWORDS.filter(kw =>
    choices.some(c => c.text.toLowerCase().includes(kw))
  ).length;
  const atPrepHub =
    !!gameVars.in_preparation &&
    choices.length >= 4 &&
    catKeywordCount >= 3;

  // True when the storm has arrived (no preparation time left)
  const timeUp = !!gameVars.in_preparation &&
    gameVars.current_time >= gameVars.storm_time;

  // True if a shop/store choice already exists in current Ink choices
  const hasShopChoice = choices.some(
    (c) => c.text.toLowerCase().includes('shop') || c.text.toLowerCase().includes('store')
  );

  // Weather values keyed to narrative stages:
  //   0 = normal / preparation   →  cold but calm
  //   1 = pre-storm              →  dropping fast, wind picking up
  //   2 = during storm / crisis  →  power out, worst conditions
  const WEATHER_STAGES = [
    { temp: -8,  wind: 15,  tempClass: 'temp-normal',   windClass: 'wind-calm' },
    { temp: -15, wind: 48,  tempClass: 'temp-prestorm',  windClass: 'wind-prestorm' },
    { temp: -22, wind: 85,  tempClass: 'temp-storm',     windClass: 'wind-storm' },
  ];
  const { temp: displayTemp, wind: windSpeed, tempClass, windClass } = WEATHER_STAGES[weatherStage] ?? WEATHER_STAGES[0];

  return (
    <div className={`ink-story-container${atPrepHub ? ' prep-hub-container' : ''}`} style={containerStyle}>
      {/* Resource Bar - always visible */}
      <div className="resource-bar">
        <div className="resource-bar-left">
          {historyLength > 0 && (
            <button className="back-btn" onClick={handleBack} title="Go back">
              ←
            </button>
          )}
          <div className={`temperature ${tempClass}`}>
            🌡️ {displayTemp}°C
          </div>
          <div className={`wind-speed ${windClass}`}>
            💨 {windSpeed} km/h
          </div>
        </div>
        <div className="resource-bar-right">
          <div className="resources">
            {categories.map((cat) => (
              <span
                key={cat.key}
                className={`resource-item ${getPrepClass(gameVars[cat.key])}`}
                title={`${cat.label}: ${t(`inkStory.prepStatus.${gameVars[cat.key] || 0}`)}`}
              >
                {cat.icon}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Time Bar - visible during preparation phase */}
      {!!gameVars.in_preparation && (
        <TimeBar
          currentTime={gameVars.current_time + (showStore ? liveStoreCost : 0)}
          stormTime={gameVars.storm_time}
          startTime={gameVars.start_time}
        />
      )}

      {/* Live shopping list — visible during prep, updates as items are added.
          Raised above the store overlay so it can still be cross-checked while shopping. */}
      {!!gameVars.in_preparation && <ShoppingList vars={gameVars} inStore={showStore} />}

      <div
        ref={storyWrapperRef}
        className={`story-wrapper ${textSpeed === 'instant' ? 'text-instant' : ''} ${atPrepHub ? 'prep-hub-mode' : ''} ${showScrollHint ? 'has-scroll-hint' : ''}`}
      >
        {!storyLoaded ? (
          <p>Loading your story...</p>
        ) : (
          <>
            {/* Story text — glass panel (only if there's visible text) */}
            {storyText.some((line) => line.trim() !== '') && (
              <div className={`story-content${atPrepHub ? ' story-content-fixed' : ''}`}>
                <div className="story-text">
                  {(() => {
                    // Group consecutive "✓ …" status lines into one compact chip
                    // row so prep checklists don't take a full paragraph each.
                    const blocks = [];
                    storyText.forEach((line, index) => {
                      const isCheck = /^\s*✓/.test(line.replace(/<[^>]+>/g, ''));
                      const last = blocks[blocks.length - 1];
                      if (isCheck) {
                        const chip = line.replace(/^\s*✓\s*/, '').trim();
                        if (last && last.type === 'chips') last.items.push(chip);
                        else blocks.push({ type: 'chips', items: [chip], key: index });
                      } else {
                        blocks.push({ type: 'p', html: line, key: index });
                      }
                    });
                    return blocks.map((b) =>
                      b.type === 'chips' ? (
                        <div key={b.key} className="prep-status-chips">
                          {b.items.map((c, i) => (
                            <span key={i} className="prep-status-chip">
                              <span className="prep-status-check">✓</span>
                              <span dangerouslySetInnerHTML={{ __html: c }} />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p key={b.key} dangerouslySetInnerHTML={{ __html: b.html }} />
                      )
                    );
                  })()}
                </div>
                {currentScene === 'heat_hub' && (
                  <HeatNote
                    homeResult={homeResult}
                    done={{
                      sealed:  !!gameVars.heat_sealed,
                      pipes:   !!gameVars.heat_pipes,
                      oneRoom: !!gameVars.heat_one_room,
                    }}
                  />
                )}
                {currentScene === 'light_hub' && (
                  <LightNote
                    lightResult={lightResult}
                    done={{
                      batteries: !!gameVars.light_batteries,
                      headlamp:  !!gameVars.light_headlamp,
                      lantern:   !!gameVars.light_lantern,
                      powerbank: !!gameVars.light_powerbank,
                      rationing: !!gameVars.light_rationing,
                    }}
                    listed={{
                      flashlight: !!gameVars.shop_flashlight,
                      batteries:  !!gameVars.shop_batteries,
                      headlamp:   !!gameVars.shop_headlamp,
                      lantern:    !!gameVars.shop_lantern,
                      powerbank:  !!gameVars.shop_powerbank,
                    }}
                  />
                )}
              </div>
            )}

            {/* Consequence card — shown per crisis narrative beat */}
            {consequenceCard && (
              <ConsequenceCard category={consequenceCard} gameVars={gameVars} />
            )}

            {/* Choices — outside the panel */}
            {choices.length > 0 && (
              atPrepHub ? (
                /* Preparation hub: grid + separate shop + done buttons */
                <div className="prep-hub-layout">

                  {/* Storm-arrived warning banner */}
                  {timeUp && (
                    <div className="prep-storm-warning">
                      <span className="prep-storm-warning-icon">🌪</span>
                      <div>
                        <strong>The storm has arrived.</strong>
                        <span> It's too late to prepare or go outside. Take cover and wait it out.</span>
                      </div>
                    </div>
                  )}

                  {/* Category grid — only known prep categories (not shop, done, or unrecognised) */}
                  <div className="prep-choices-grid">
                    {choices
                      .map((choice, index) => ({ choice, index }))
                      .filter(({ choice }) => {
                        const lower = choice.text.toLowerCase();
                        const isCategory = ['water','food','heat','light','info','radio','medication','meds'].some(kw => lower.includes(kw));
                        return isCategory;
                      })
                      .map(({ choice, index }) => {
                        const meta = getPrepChoiceMeta(choice.text);
                        const isDone = meta.gameVar && gameVars[meta.gameVar] > 0;
                        const isLocked = timeUp && !isDone;
                        const handleCardClick = () => {
                          if (isLocked) return;
                          if (meta.gameVar === 'prep_water' && !isDone) {
                            playSfx('prep_water');
                            setWaterCalcPendingIndex(index);
                            setShowWaterCalc(true);
                          } else {
                            handleChoiceClick(index, meta.gameVar || 'click');
                          }
                        };

                        const isExpanded = expandedCard === index;
                        const handleHeaderClick = () => {
                          if (isLocked) return;
                          // Mobile: toggle accordion. Wide: trigger action directly.
                          if (window.innerWidth <= 639) {
                            playSfx(isExpanded ? 'close' : 'open');
                            setExpandedCard(isExpanded ? null : index);
                          } else {
                            handleCardClick();
                          }
                        };

                        return (
                          // Whole card is clickable (header + description area).
                          <div
                            key={index}
                            className={[
                              'prep-choice-card',
                              isDone     ? 'prep-choice-done'     : '',
                              isLocked   ? 'prep-choice-locked'   : '',
                              isExpanded ? 'prep-choice-expanded' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={handleHeaderClick}
                            role={isLocked ? undefined : 'button'}
                            tabIndex={isLocked ? -1 : 0}
                            onKeyDown={(e) => {
                              if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
                                e.preventDefault();
                                handleHeaderClick();
                              }
                            }}
                          >
                            {/* Always-visible header row */}
                            <div className="prep-card-header">
                              <span className="prep-choice-icon">{meta.icon}</span>
                              <div className="prep-card-header-text">
                                <span className="prep-choice-label">{stripEmoji(choice.text)}</span>
                                {meta.timeRange && (
                                  <span className="prep-choice-time">⏱ {meta.timeRange}</span>
                                )}
                              </div>
                              {isDone   && <span className="prep-choice-tick">✓</span>}
                              {isLocked && <span className="prep-choice-lock">🔒</span>}
                              {!isDone && !isLocked && <span className="prep-card-chevron" />}
                            </div>

                            {/* Expandable body: description + action */}
                            <div className="prep-card-body">
                              {meta.description && (
                                <p className="prep-choice-desc">{meta.description}</p>
                              )}
                              {!isDone && !isLocked && (
                                <button
                                  className="prep-card-prepare-btn"
                                  onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                                >
                                  Prepare
                                </button>
                              )}
                              {isDone && (
                                <p className="prep-card-done-msg">✓ Already prepared</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Shop + Done — sticky footer so they're always visible on mobile */}
                  <div className="prep-action-footer">
                    {/* Go to Shop — hidden once the storm arrives */}
                    {!timeUp && (hasShopChoice ? (
                      choices
                        .map((choice, index) => ({ choice, index }))
                        .filter(({ choice }) => {
                          const lower = choice.text.toLowerCase();
                          return lower.includes('shop') || lower.includes('store');
                        })
                        .map(({ choice, index }) => (
                          <button
                            key={index}
                            className="prep-action-btn prep-shop-btn"
                            onClick={() => handleChoiceClick(index)}
                          >
                            🛒 {stripEmoji(choice.text)} <span className="prep-action-time">⏱ 20+ min</span>
                          </button>
                        ))
                    ) : (
                      <button
                        className="prep-action-btn prep-shop-btn"
                        onClick={() => { playSfx('open'); setStoreOpenedDirectly(true); setShowStore(true); }}
                      >
                        🛒 Go to Shop <span className="prep-action-time">⏱ 20+ min</span>
                      </button>
                    ))}

                    {/* Done — full-width button at the very end */}
                    {choices
                      .map((choice, index) => ({ choice, index }))
                      .filter(({ choice }) => {
                        const lower = choice.text.toLowerCase();
                        return lower.includes('done') || lower.includes('finish') || lower.includes('ready');
                      })
                      .map(({ choice, index }) => (
                        <button
                          key={index}
                          className="prep-action-btn prep-done-btn"
                          onClick={() => handleChoiceClick(index)}
                        >
                          ✅ {timeUp ? 'Done Preparing' : choice.text}
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                /* Normal sections: vertical list */
                <div className="choices">
                  {choices.map((choice, index) => {
                    const { icon, label } = splitChoiceIcon(choice.text);
                    return (
                      <button
                        key={index}
                        className="choice-btn"
                        onClick={() => handleChoiceClick(index)}
                      >
                        {icon && <span className="choice-icon">{icon}</span>}
                        <span className="choice-label">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {/* Scroll-down hint — pinned to the bottom of this box, only
                shown while it actually overflows the screen. */}
            {showScrollHint && (
              <div className="scroll-hint" aria-hidden="true">
                <span className="scroll-hint-chevron">⌄ more below</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Phone Keypad Overlay */}
      {showKeypad && (
        <PhoneKeypad
          onCall={handlePhoneCall}
          onCancel={handlePhoneCancel}
          scenario={keypadScenario}
        />
      )}

      {/* Call Result Overlay */}
      {callResult && (
        <CallResult
          dialedNumber={callResult.number}
          scenario={callResult.scenario}
          attempts={callAttempts}
          onContinue={handleCallResultContinue}
          onRetry={handleCallRetry}
        />
      )}

      {/* SMS Overlay */}
      {showSMS && (
        <div className="sms-overlay" onClick={handleSMSClose}>
          <div className="sms-phone" onClick={(e) => e.stopPropagation()}>
            <div className="sms-header">
              <div className="sms-avatar sms-avatar-govt">🛡</div>
              <div className="sms-contact-info">
                <div className="sms-contact">{t('sms.contact')}</div>
                <div className="sms-contact-sub">{t('sms.contactSub')}</div>
              </div>
              <div className="sms-time">{t('sms.time')}</div>
            </div>
            <div className="sms-body">
              <div className="sms-bubble sms-bubble-govt">
                <span className="sms-alert-tag">{t('sms.alertTag')}</span>
                {t('sms.body')}
                <br /><br />
                {t('sms.body2')}
                <br /><br />
                <span className="sms-ref">Ref: NCM-{new Date().getFullYear()}-STORM</span>
              </div>
            </div>
            <button className="sms-close-btn" onClick={handleSMSClose}>
              {t('sms.acknowledge')}
            </button>
          </div>
        </div>
      )}

      {/* Radio Broadcast Overlay */}
      {showRadioBroadcast && (
        <div className="radio-broadcast-overlay">
          <div className="radio-broadcast">

            {/* ── Left: broadcast narrative ── */}
            <div className="radio-broadcast-left">
              <div className="radio-icon">📻</div>
              <h3>{t('radioBroadcast.title')}</h3>
              <div className="broadcast-content">
                <p className="broadcast-static">{t('radioBroadcast.static')}</p>
                <p>{t('radioBroadcast.line1')}</p>
                <p>{t('radioBroadcast.line2')}</p>
                <p>{t('radioBroadcast.line3')}</p>
                <p className="broadcast-static">{t('radioBroadcast.static')}</p>
              </div>
            </div>

            {/* ── Right: emergency numbers reference ── */}
            <div className="radio-broadcast-right">
              <h4 className="broadcast-numbers-title">{t('radioBroadcast.numbersTitle')}</h4>
              <div className="broadcast-number-item">
                <span className="broadcast-number">112</span>
                <span className="broadcast-number-desc">{t('radioBroadcast.number112')}</span>
              </div>
              <div className="broadcast-number-item">
                <span className="broadcast-number">1220</span>
                <span className="broadcast-number-desc">{t('radioBroadcast.number1220')}</span>
              </div>
              <div className="broadcast-number-item">
                <span className="broadcast-number">1247</span>
                <span className="broadcast-number-desc">{t('radioBroadcast.number1247')}</span>
              </div>
              <div className="broadcast-number-item">
                <span className="broadcast-number">1343</span>
                <span className="broadcast-number-desc">{t('radioBroadcast.number1343')}</span>
              </div>
              <p className="broadcast-hint">{t('radioBroadcast.hint')}</p>
            </div>

            {/* ── Button spans full width ── */}
            <button className="broadcast-close-btn" onClick={handleRadioBroadcastClose}>
              {t('radioBroadcast.continue')}
            </button>

          </div>
        </div>
      )}

      {/* Water Calculation Quiz */}
      {showWaterCalc && (
        <WaterCalculation
          familySize={household.size}
          awayFlatCost={GO_CHECK_TASKS.water.flatCost}
          awayMinSeconds={GO_CHECK_TASKS.water.minAway}
          onAwayTime={handleWaterAwayTime}
          onClose={handleWaterCalcClose}
          onCancel={handleWaterCalcCancel}
        />
      )}

      {/* Store Overlay */}
      {showStore && (
        <StoreOverlay
          shopWater={storeOpenedDirectly ? true : gameVars.shop_water}
          shopFood={storeOpenedDirectly ? true : gameVars.shop_food}
          shopBatteries={storeOpenedDirectly ? true : gameVars.shop_batteries}
          shopWaterAmount={storeOpenedDirectly ? (gameVars.shop_water_amount || 10) : gameVars.shop_water_amount}
          shoppingGaps={pantryResult.gaps}
          onClose={handleStoreClose}
          onTimeCostChange={setLiveStoreCost}
        />
      )}

      {/* Crisis Screen Overlay */}
      {crisisPhase && (
        <CrisisScreen
          phase={crisisPhase}
          gameVars={gameVars}
          household={household}
          onContinue={handleCrisisClose}
        />
      )}

      {/* Outcome Screen Overlay */}
      {showOutcomeScreen && (
        <OutcomeScreen
          endingType={gameVars.ending_type}
          household={household}
          onContinue={handleOutcomeScreenClose}
        />
      )}

      {/* Breaking News Overlay (disabled — keeping only official SMS) */}
      {/* {showBreakingNews && (
        <BreakingNews onContinue={handleBreakingNewsClose} />
      )} */}

      {/* Sleep Fade Overlay */}
      {showSleepFade && (
        <div
          className={`sleep-fade-overlay${sleepFadingOut ? ' sleep-fade-out' : ''}`}
          onAnimationEnd={sleepFadingOut ? () => { setShowSleepFade(false); setSleepFadingOut(false); } : undefined}
        />
      )}

      {/* Storm Arrival Overlay */}
      {showStormArrival && (
        <StormArrival onDismiss={() => {
          setShowStormArrival(false);
          if (showSleepFade) setSleepFadingOut(true);
        }} />
      )}

      {/* Ending Screen Overlay */}
      {showEndingScreen && (
        <EndingScreen
          gameVars={gameVars}
          endingType={gameVars.ending_type}
          household={household}
          callScore={callScore}
          onPlayAgain={onReturnToMenu}
        />
      )}

      {/* Family Setup Overlay */}
      {showFamilySetup && (
        <FamilySetup onClose={handleFamilySetupClose} />
      )}

      {/* Go-Check Overlay — real-time gate in front of every physical check */}
      {goCheckTask && (
        <GoCheck
          task={goCheckTask}
          flatCost={GO_CHECK_TASKS[goCheckTask]?.flatCost ?? 10}
          minAwaySeconds={GO_CHECK_TASKS[goCheckTask]?.minAway}
          onBack={applyGoCheckCost}
          onSkip={applyGoCheckCost}
        />
      )}

      {/* Pantry Check Overlay */}
      {showPantryCheck && (
        <PantryCheck
          household={household}
          onClose={handlePantryClose}
          onCancel={() => { setShowPantryCheck(false); continueStory(); }}
        />
      )}

      {/* Home Setup Overlay */}
      {showHomeSetup && (
        <HomeSetup
          onClose={handleHomeSetupClose}
          onCancel={() => { setShowHomeSetup(false); continueStory(); }}
        />
      )}

      {/* Light Audit Overlay */}
      {showLightAudit && (
        <LightAudit
          onClose={handleLightAuditClose}
          onCancel={() => { setShowLightAudit(false); continueStory(); }}
        />
      )}

      {/* Crisis-night flashlight search */}
      {showFlashlightSearch && (
        <FlashlightSearch
          hasFlashlight={!!gameVars.light_flashlight}
          knownSpot={
            gameVars.flashlight_spot === 2 ? 'bedside'
              : gameVars.flashlight_spot === 1 ? 'hallway'
              : 'none'
          }
          onClose={handleFlashlightSearchClose}
        />
      )}

      {/* Information "Signal vs Noise" rumor game */}
      {showRumorSort && (
        <RumorSort onClose={handleRumorSortClose} />
      )}

      {/* Medication "Medicine cabinet check" mini-game */}
      {showCabinetCheck && (
        <CabinetCheck household={household} onClose={handleCabinetCheckClose} />
      )}

      {/* Floating Settings Button */}
      <div className="settings-fab-container">
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-row">
              <span className="settings-label">{t('inkStory.settings.sound')}</span>
              <button
                className={`settings-toggle ${muted ? 'off' : 'on'}`}
                onClick={() => { playSfx('click'); toggleMute(); }}
                title={muted ? t('inkStory.settings.soundOff') : t('inkStory.settings.soundOn')}
              >
                {muted ? t('inkStory.settings.soundOff') : t('inkStory.settings.soundOn')}
              </button>
            </div>
            <div className="settings-row">
              <span className="settings-label">{t('inkStory.settings.textAnimation')}</span>
              <button
                className={`settings-toggle ${textSpeed === 'instant' ? 'off' : 'on'}`}
                onClick={() => { playSfx('click'); toggleTextSpeed(); }}
                title={textSpeed === 'slow' ? t('inkStory.settings.textOn') : t('inkStory.settings.textOff')}
              >
                {textSpeed === 'slow' ? t('inkStory.settings.textOn') : t('inkStory.settings.textOff')}
              </button>
            </div>
          </div>
        )}
        <button
          className={`settings-fab ${showSettings ? 'active' : ''}`}
          onClick={() => { playSfx('click'); setShowSettings((s) => !s); }}
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}

export default InkStory;
