// InkStory.jsx - Component that integrates Ink.js story engine with React

import { useState, useEffect, useRef } from 'react';
import './InkStory.css';
import PhoneKeypad from './PhoneKeypad';
import CallResult from './CallResult';
import TimeBar from './TimeBar';
import StoreOverlay from './StoreOverlay';
import EndingScreen from './EndingScreen';

function InkStory({ onReturnToMenu }) {
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

  // Store overlay state
  const [showStore, setShowStore] = useState(false);

  // Ending screen state
  const [showEndingScreen, setShowEndingScreen] = useState(false);

  // Track game variables from Ink
  const [gameVars, setGameVars] = useState({
    temperature: -18,
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
  // STORY FUNCTIONS
  // ============================================

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

        // Check for PHONE_KEYPAD tag
        if (tag.startsWith('PHONE_KEYPAD:')) {
          const scenario = tag.replace('PHONE_KEYPAD:', '').trim();
          console.log('Showing phone keypad for scenario:', scenario);
          setKeypadScenario(scenario);
          setShowKeypad(true);
        }

        // Check for SMS tag
        if (tag.startsWith('SMS:')) {
          console.log('Showing SMS overlay');
          setShowSMS(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for RADIO_BROADCAST tag
        if (tag === 'RADIO_BROADCAST') {
          console.log('Showing radio broadcast');
          setShowRadioBroadcast(true);
          // Stop processing - don't show choices until broadcast is closed
          setStoryText(lines);
          setChoices([]); // Hide choices while broadcast is showing
          return; // Exit early - story will continue after broadcast closes
        }

        // Check for STORE_SHOPPING tag
        if (tag === 'STORE_SHOPPING') {
          console.log('Showing store overlay');
          setShowStore(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }

        // Check for ENDING_SCREEN tag
        if (tag === 'ENDING_SCREEN') {
          console.log('Showing ending screen');
          setShowEndingScreen(true);
          setStoryText(lines);
          setChoices([]);
          return;
        }
      }
    }

    // Update the story text display
    setStoryText(lines);

    // Read game variables from Ink
    setGameVars({
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
      // Ending tracking
      ending_type: story.variablesState["ending_type"],
      total_prep: story.variablesState["total_prep"],
      call_outcome: story.variablesState["call_outcome"],
      dialed_number: story.variablesState["dialed_number"],
    });

    // Get current choices from Ink
    const currentChoices = story.currentChoices;

    // Update choices display
    setChoices(currentChoices);

    console.log('Story text:', lines);
    console.log('Choices:', currentChoices);
  };

  // Function to handle when user clicks a choice
  const handleChoiceClick = (choiceIndex) => {
    const story = storyRef.current;

    if (!story) return;

    // Tell Ink which choice was selected
    story.ChooseChoiceIndex(choiceIndex);

    // Get next part of story
    continueStory();
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

    // Set the call outcome in Ink so the story can branch
    if (story && story.variablesState) {
      story.variablesState['call_outcome'] = outcome;
      story.variablesState['dialed_number'] = dialedNumber;
    }

    setCallResult(null);
    setDialedNumber('');

    // Continue the story after call result
    continueStory();
  };

  const handleCallRetry = () => {
    setCallResult(null);
    setDialedNumber('');
    setShowKeypad(true);
  };

  // ============================================
  // SMS HANDLER
  // ============================================

  const handleSMSClose = () => {
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
  // STORE OVERLAY HANDLER
  // ============================================

  const handleStoreClose = (basketItems) => {
    setShowStore(false);
    const story = storyRef.current;
    if (!story) return;

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

    for (const [basketId, inkVar] of Object.entries(foodMap)) {
      story.variablesState[inkVar] = basketItems.includes(basketId);
    }

    // If any food was picked, set prep_food
    if (story.variablesState["shop_food"]) {
      story.variablesState["prep_food"] = 2;
    }

    // Continue the story and auto-select the first choice to proceed to checkout
    continueStory();
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
    ...(gameVars.in_preparation ? { paddingTop: '140px' } : {}),
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

  return (
    <div className="ink-story-container" style={containerStyle}>
      {/* Resource Bar - always visible */}
      <div className="resource-bar">
        <div className="temperature">
          🌡️ {gameVars.temperature}°C
        </div>
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

      {/* Time Bar - visible during preparation phase */}
      {!!gameVars.in_preparation && (
        <TimeBar
          currentTime={gameVars.current_time}
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

      <div className="story-content">
        {!storyLoaded ? (
          <p>Loading your story...</p>
        ) : (
          <>
            {/* Story text */}
            <div className="story-text">
              {storyText.map((line, index) => (
                <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </div>

            {/* Choices */}
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
          onContinue={handleCallResultContinue}
          onRetry={handleCallRetry}
        />
      )}

      {/* SMS Overlay */}
      {showSMS && (
        <div className="sms-overlay" onClick={handleSMSClose}>
          <div className="sms-phone" onClick={(e) => e.stopPropagation()}>
            <div className="sms-header">
              <div className="sms-avatar">M</div>
              <div className="sms-contact">Martin</div>
              <div className="sms-time">now</div>
            </div>
            <div className="sms-body">
              <div className="sms-bubble">
                Power's going to be out for days.
              </div>
              <div className="sms-bubble">
                Water. Light. Heat. Meds.
              </div>
              <div className="sms-bubble">
                Check everything NOW.
              </div>
            </div>
            <button className="sms-close-btn" onClick={handleSMSClose}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Radio Broadcast Overlay */}
      {showRadioBroadcast && (
        <div className="radio-broadcast-overlay">
          <div className="radio-broadcast">
            <div className="radio-icon">📻</div>
            <h3>Emergency Broadcast</h3>
            <div className="broadcast-content">
              <p className="broadcast-static">[STATIC CRACKLE]</p>
              <p>This is an emergency broadcast from the National Crisis Center.</p>
              <p>A severe storm is affecting coastal regions. Power outages have been reported across multiple districts.</p>
              <p className="broadcast-numbers">
                <strong>Life-threatening emergency: <span className="number">1-1-2</span></strong>
              </p>
              <p className="broadcast-numbers">
                <strong>Family doctor / health advice: <span className="number">1-2-2-0</span></strong>
              </p>
              <p className="broadcast-numbers">
                <strong>Rescue coordination: <span className="number">1-2-4-7</span></strong>
              </p>
              <p className="broadcast-numbers">
                <strong>Power outage reporting: <span className="number">1-3-4-3</span></strong>
              </p>
              <p>Stay indoors. Conserve phone battery. Check on elderly neighbors if safe to do so.</p>
              <p className="broadcast-static">[STATIC CRACKLE]</p>
              <p className="broadcast-hint">📝 Write these numbers down — you may need them later.</p>
            </div>
            <button className="broadcast-close-btn" onClick={handleRadioBroadcastClose}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Store Overlay */}
      {showStore && (
        <StoreOverlay
          shopWater={gameVars.shop_water}
          shopFood={gameVars.shop_food}
          shopBatteries={gameVars.shop_batteries}
          shopWaterAmount={gameVars.shop_water_amount}
          onClose={handleStoreClose}
        />
      )}

      {/* Ending Screen Overlay */}
      {showEndingScreen && (
        <EndingScreen
          gameVars={gameVars}
          endingType={gameVars.ending_type}
          onPlayAgain={onReturnToMenu}
        />
      )}
    </div>
  );
}

export default InkStory;
