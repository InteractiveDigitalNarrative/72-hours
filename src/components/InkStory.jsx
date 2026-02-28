// InkStory.jsx - Component that integrates Ink.js story engine with React

import { useState, useEffect, useRef } from 'react';
import './InkStory.css';
import PhoneKeypad from './PhoneKeypad';
import CallResult from './CallResult';
import TimeBar from './TimeBar';
import StoreOverlay from './StoreOverlay';
import WaterCalculation from './WaterCalculation';
import ConsequenceCard from './ConsequenceCard';
import EndingScreen from './EndingScreen';
import CrisisScreen from './CrisisScreen';
import FamilySetup from './FamilySetup';
import { useAudioContext } from '../context/AudioContext';

// Prep hub choice metadata — icon, description, and the Ink variable to check for completion
const PREP_CHOICE_META = {
  water:      { icon: '💧', description: 'The taps are still running — but if the power goes out, the electric pump stops. Fill containers now before you lose access.', timeRange: '5–33 min', gameVar: 'prep_water' },
  food:       { icon: '🍞', description: 'The fridge will stop working when the power cuts. Stock up on canned goods and dry food that doesn\'t need cooking or refrigeration.', timeRange: '~10 min', gameVar: 'prep_food' },
  heat:       { icon: '🔥', description: 'Central heating runs on electricity. If the grid fails, temperatures will drop fast — especially at night. Have a backup heat source ready.', timeRange: '3–22 min', gameVar: 'prep_heat' },
  light:      { icon: '🔦', description: 'When the lights go out, your phone becomes your only torch — and it drains fast. A flashlight with spare batteries keeps you safe without burning your battery.', timeRange: '3–9 min', gameVar: 'prep_light' },
  info:       { icon: '📻', description: 'The internet and mobile networks may go down. A battery-powered radio is the only reliable way to receive emergency broadcasts and official updates.', timeRange: '2–8 min', gameVar: 'prep_info' },
  radio:      { icon: '📻', description: 'The internet and mobile networks may go down. A battery-powered radio is the only reliable way to receive emergency broadcasts and official updates.', timeRange: '2–8 min', gameVar: 'prep_info' },
  medication: { icon: '💊', description: 'Pharmacies may close and roads may be impassable. If anyone in your household depends on regular medication, make sure you have enough to last the storm.', timeRange: '2–7 min', gameVar: 'prep_medication' },
  meds:       { icon: '💊', description: 'Pharmacies may close and roads may be impassable. If anyone in your household depends on regular medication, make sure you have enough to last the storm.', timeRange: '2–7 min', gameVar: 'prep_medication' },
  shop:       { icon: '🛒', description: 'Buy water, food, and batteries at the grocery store.' },
  store:      { icon: '🛒', description: 'Buy water, food, and batteries at the grocery store.' },
  done:       { icon: '✅', description: 'Stop preparing and face the oncoming storm.' },
  finish:     { icon: '✅', description: 'Stop preparing and face the oncoming storm.' },
  ready:      { icon: '✅', description: 'Stop preparing and face the oncoming storm.' },
};

const HUB_KEYWORDS = Object.keys(PREP_CHOICE_META);

const getPrepChoiceMeta = (text) => {
  const lower = text.toLowerCase();
  for (const [key, meta] of Object.entries(PREP_CHOICE_META)) {
    if (lower.includes(key)) return meta;
  }
  return { icon: '▶', description: '' };
};

// Strip emoji characters from a string (so the Ink choice text label stays clean)
const stripEmoji = (text) =>
  text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]+\s*/gu, '').trim();

function InkStory({ onReturnToMenu }) {
  // ============================================
  // AUDIO
  // ============================================
  const { muted, toggleMute, playAmbient, playSfx, setWindVolume, WIND_VOLS } = useAudioContext();

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

  // ============================================
  // LOAD INK.JS AND INITIALIZE STORY
  // ============================================
  useEffect(() => {
    // This runs once when component mounts

    console.log('Loading Ink.js story...');

    // STEP 1: Load the ink.js library
    const inkScript = document.createElement('script');
    inkScript.src = import.meta.env.BASE_URL + 'ink/ink.js';  // Path to ink.js in public folder
    inkScript.async = true;

    inkScript.onload = () => {
      console.log('Ink.js loaded!');

      // STEP 2: Load your compiled story (72Hours.js)
      const storyScript = document.createElement('script');
      storyScript.src = import.meta.env.BASE_URL + 'ink/72Hours.js';  // Path to your story in public folder
      storyScript.async = true;

      storyScript.onload = () => {
        console.log('Story file loaded!');

        // STEP 3: Initialize the story
        // After 72Hours.js loads, it creates a global variable called storyContent
        if (window.storyContent) {
          // Create new Ink story instance
          const story = new window.inkjs.Story(window.storyContent);

          // Store it in our ref
          storyRef.current = story;

          // STEP 4: Get first chunk of story
          continueStory();

          // Mark as loaded
          setStoryLoaded(true);
        } else {
          console.error('Story content not found!');
        }
      };

      storyScript.onerror = () => {
        console.error('Failed to load story file!');
      };

      // Add story script to page
      document.body.appendChild(storyScript);
    };

    inkScript.onerror = () => {
      console.error('Failed to load Ink.js!');
    };

    // Add ink.js script to page
    document.body.appendChild(inkScript);

    // Cleanup function - runs when component unmounts
    return () => {
      // Remove scripts when component is destroyed
      if (inkScript.parentNode) {
        inkScript.parentNode.removeChild(inkScript);
      }
    };
  }, []); // Empty array = run once on mount

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

  // Wind volume tracks weather stage — fades to 0 at the ending screen
  useEffect(() => {
    setWindVolume(showEndingScreen ? 0 : (WIND_VOLS[weatherStage] ?? WIND_VOLS[0]));
  }, [weatherStage, showEndingScreen, setWindVolume, WIND_VOLS]);

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
      shop_visited: story.variablesState["shop_visited"],
      // Heat sub-vars
      heat_pipes: story.variablesState["heat_pipes"],
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

    // Keep calling Continue() while there's more content
    while (story.canContinue) {
      const text = story.Continue();  // Get next line
      lines.push(text);

      // Process tags for this line
      const tags = story.currentTags;
      console.log('Tags:', tags);  // Debug log

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
    continueStory();
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
    { key: 'prep_water', icon: '💧', label: 'Water' },
    { key: 'prep_food', icon: '🍞', label: 'Food' },
    { key: 'prep_heat', icon: '🔥', label: 'Heat' },
    { key: 'prep_light', icon: '🔦', label: 'Light' },
    { key: 'prep_info', icon: '📻', label: 'Info' },
    { key: 'prep_medication', icon: '💊', label: 'Meds' },
  ];

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
  //   0 = preparation phase  →  cold but calm
  //   1 = done preparation   →  storm arriving
  //   2 = 3:47 AM / crisis   →  power out, worst conditions
  const WEATHER_STAGES = [
    { temp: -8,  wind: 15 },
    { temp: -15, wind: 48 },
    { temp: -22, wind: 85 },
  ];
  const { temp: displayTemp, wind: windSpeed } = WEATHER_STAGES[weatherStage];
  const tempClass = displayTemp >= -12 ? 'temp-mild' : displayTemp >= -18 ? 'temp-cold' : 'temp-freezing';
  const windClass = windSpeed < 30 ? 'wind-calm' : windSpeed < 60 ? 'wind-strong' : 'wind-severe';

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
                title={`${cat.label}: ${gameVars[cat.key] === 0 ? 'Not prepared' : gameVars[cat.key] === 1 ? 'Basic' : 'Thorough'}`}
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

      {/* Shopping List - visible during preparation when items added */}
      {!!gameVars.in_preparation && (!!gameVars.shop_water || !!gameVars.shop_food || !!gameVars.shop_batteries) && !gameVars.shop_visited && (
        <div className="shopping-list">
          <div className="shopping-list-header">🛒 Shopping List</div>
          <ul className="shopping-list-items">
            {!!gameVars.shop_water && <li>💧 Bottled water ({gameVars.shop_water_amount}L)</li>}
            {!!gameVars.shop_food && <li>🍞 Emergency food</li>}
            {!!gameVars.shop_batteries && <li>🔋 Batteries</li>}
          </ul>
        </div>
      )}

      <div className={`story-wrapper ${textSpeed === 'instant' ? 'text-instant' : ''} ${atPrepHub ? 'prep-hub-mode' : ''}`}>
        {!storyLoaded ? (
          <p>Loading your story...</p>
        ) : (
          <>
            {/* Story text — glass panel (only if there's visible text) */}
            {storyText.some((line) => line.trim() !== '') && (
              <div className={`story-content${atPrepHub ? ' story-content-fixed' : ''}`}>
                <div className="story-text">
                  {storyText.map((line, index) => (
                    <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
                  ))}
                </div>
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
                          <div
                            key={index}
                            className={[
                              'prep-choice-card',
                              isDone     ? 'prep-choice-done'     : '',
                              isLocked   ? 'prep-choice-locked'   : '',
                              isExpanded ? 'prep-choice-expanded' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            {/* Always-visible header row */}
                            <div
                              className="prep-card-header"
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
                                <button className="prep-card-prepare-btn" onClick={handleCardClick}>
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
                  {choices.map((choice, index) => (
                    <button
                      key={index}
                      className="choice-btn"
                      onClick={() => handleChoiceClick(index)}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              )
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
                <div className="sms-contact">GovtInfo</div>
                <div className="sms-contact-sub">National Crisis Management Centre</div>
              </div>
              <div className="sms-time">now</div>
            </div>
            <div className="sms-body">
              <div className="sms-bubble sms-bubble-govt">
                <span className="sms-alert-tag">⚠ STORM ALERT</span>
                A severe storm warning has been issued for your region. Significant power outages, disrupted water supply, and road closures are anticipated in the coming hours.
                <br /><br />
                Secure adequate supplies of drinking water, non-perishable food, medications, emergency lighting, and a heat source. Stay indoors and monitor official broadcast channels for further instructions.
                <br /><br />
                <span className="sms-ref">Ref: NCM-{new Date().getFullYear()}-STORM · Do not reply</span>
              </div>
            </div>
            <button className="sms-close-btn" onClick={handleSMSClose}>
              Acknowledge
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
              <h3>Emergency Broadcast</h3>
              <div className="broadcast-content">
                <p className="broadcast-static">[STATIC CRACKLE]</p>
                <p>This is an emergency broadcast from the National Crisis Center.</p>
                <p>A severe storm is affecting coastal regions. Power outages have been reported across multiple districts.</p>
                <p>Stay indoors. Conserve phone battery. Check on elderly neighbors if safe to do so.</p>
                <p className="broadcast-static">[STATIC CRACKLE]</p>
              </div>
            </div>

            {/* ── Right: emergency numbers reference ── */}
            <div className="radio-broadcast-right">
              <h4 className="broadcast-numbers-title">Emergency Numbers</h4>
              <div className="broadcast-number-item">
                <span className="broadcast-number">112</span>
                <span className="broadcast-number-desc">Life-threatening emergency</span>
              </div>
              <div className="broadcast-number-item">
                <span className="broadcast-number">1220</span>
                <span className="broadcast-number-desc">Family doctor / health advice</span>
              </div>
              <div className="broadcast-number-item">
                <span className="broadcast-number">1247</span>
                <span className="broadcast-number-desc">Rescue coordination</span>
              </div>
              <div className="broadcast-number-item">
                <span className="broadcast-number">1343</span>
                <span className="broadcast-number-desc">Power outage reporting</span>
              </div>
              <p className="broadcast-hint">🗒️ Write these numbers down — you may need them later.</p>
            </div>

            {/* ── Button spans full width ── */}
            <button className="broadcast-close-btn" onClick={handleRadioBroadcastClose}>
              Continue
            </button>

          </div>
        </div>
      )}

      {/* Water Calculation Quiz */}
      {showWaterCalc && (
        <WaterCalculation familySize={household.size} onClose={handleWaterCalcClose} />
      )}

      {/* Store Overlay */}
      {showStore && (
        <StoreOverlay
          shopWater={storeOpenedDirectly ? true : gameVars.shop_water}
          shopFood={storeOpenedDirectly ? true : gameVars.shop_food}
          shopBatteries={storeOpenedDirectly ? true : gameVars.shop_batteries}
          shopWaterAmount={storeOpenedDirectly ? (gameVars.shop_water_amount || 10) : gameVars.shop_water_amount}
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

      {/* Floating Settings Button */}
      <div className="settings-fab-container">
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-row">
              <span className="settings-label">Sound</span>
              <button
                className={`settings-toggle ${muted ? 'off' : 'on'}`}
                onClick={() => { playSfx('click'); toggleMute(); }}
                title={muted ? 'Sound: Off' : 'Sound: On'}
              >
                {muted ? '🔇 Off' : '🔊 On'}
              </button>
            </div>
            <div className="settings-row">
              <span className="settings-label">Text Animation</span>
              <button
                className={`settings-toggle ${textSpeed === 'instant' ? 'off' : 'on'}`}
                onClick={() => { playSfx('click'); toggleTextSpeed(); }}
                title={textSpeed === 'slow' ? 'Text: Animated' : 'Text: Instant'}
              >
                {textSpeed === 'slow' ? '▸ On' : '▸▸ Off'}
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
