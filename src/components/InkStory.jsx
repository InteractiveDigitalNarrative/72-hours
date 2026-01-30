// InkStory.jsx - Component that integrates Ink.js story engine with React

import { useState, useEffect, useRef } from 'react';
import './InkStory.css';
import PhoneKeypad from './PhoneKeypad';
import CallResult from './CallResult';
import TimeBar from './TimeBar';

function InkStory() {
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
    inkScript.src = '/ink/ink.js';  // Path to ink.js in public folder
    inkScript.async = true;

    inkScript.onload = () => {
      console.log('Ink.js loaded!');

      // STEP 2: Load your compiled story (72Hours.js)
      const storyScript = document.createElement('script');
      storyScript.src = '/ink/72Hours.js';  // Path to your story in public folder
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

        // Check for RADIO_BROADCAST tag
        if (tag === 'RADIO_BROADCAST') {
          console.log('Showing radio broadcast');
          setShowRadioBroadcast(true);
          // Stop processing - don't show choices until broadcast is closed
          setStoryText(lines);
          setChoices([]); // Hide choices while broadcast is showing
          return; // Exit early - story will continue after broadcast closes
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
  // RADIO BROADCAST HANDLER
  // ============================================

  const handleRadioBroadcastClose = () => {
    setShowRadioBroadcast(false);
    // Now continue the story to show the next choices
    continueStory();
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
            </div>
            <button className="broadcast-close-btn" onClick={handleRadioBroadcastClose}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InkStory;
