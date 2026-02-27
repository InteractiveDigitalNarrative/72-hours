// Menu.jsx - Main menu component for Storm Alert game

// STEP 1: IMPORTS
// Import React and the useState hook (for managing state)
import React, { useState } from 'react';
import './Menu.css';
import { useAudioContext } from '../context/AudioContext';

// STEP 2: COMPONENT FUNCTION
// This component receives 3 props from its parent:
// - onStartGame: function to call when user clicks "Start"
// - onContinueGame: function to call when user clicks "Continue"
// - hasSavedGame: boolean - true if there's a saved game
function Menu({ onStartGame, onContinueGame, hasSavedGame }) {

  const [showAbout, setShowAbout] = useState(false);
  const { playSfx } = useAudioContext();

  const handleStartClick = () => {
    playSfx('open');
    onStartGame();
  };

  const handleContinueClick = () => {
    playSfx('open');
    onContinueGame();
  };

  const handleAboutClick = () => {
    playSfx('open');
    setShowAbout(true);
  };

  const handleCloseAbout = () => {
    playSfx('close');
    setShowAbout(false);
  };

  // STEP 5: RETURN JSX (What the component displays)
  return (
    <>
      {/* Fragment <> </> lets us return multiple elements without adding extra div */}

      {/* MAIN MENU CONTAINER */}
      <div className="menu-container">
        <div className="menu-content">

          {/* HEADER SECTION */}
          <div className="menu-header">
            <div className="emergency-badge">EMERGENCY PROTOCOL</div>
            <h1 className="menu-title">STORM ALERT</h1>
            <p className="menu-subtitle">Crisis Management Simulation</p>
          </div>

          {/* BUTTONS SECTION */}
          <div className="menu-buttons">

            {/* START BUTTON - Always visible */}
            <button onClick={handleStartClick} className="menu-btn primary">
              <span className="btn-icon">▶</span>
              <span className="btn-text">START MISSION</span>
            </button>

            {/* CONTINUE BUTTON - Only show if hasSavedGame is true */}
            {hasSavedGame && (
              <button onClick={handleContinueClick} className="menu-btn secondary">
                <span className="btn-icon">↻</span>
                <span className="btn-text">CONTINUE</span>
              </button>
            )}

            {/* ABOUT BUTTON - Always visible */}
            <button onClick={handleAboutClick} className="menu-btn secondary">
              <span className="btn-icon">ℹ</span>
              <span className="btn-text">ABOUT</span>
            </button>
          </div>

          {/* FOOTER SECTION */}
          <div className="menu-footer">
            <p className="tagline">Every decision counts. Time is running out.</p>
          </div>
        </div>

        {/* Background overlay */}
        <div className="menu-overlay"></div>
      </div>

      {/* ABOUT MODAL - Only shows when showAbout is true */}
      {showAbout && (
        <div className="modal">
          <div className="modal-content">
            {/* Close button (X) */}
            <span className="close-modal" onClick={handleCloseAbout}>&times;</span>

            <h2>About Storm Alert</h2>
            <p>
              In Storm Alert, every decision matters.
              As an emergency response coordinator, you must manage resources, make tough choices,
              and save as many lives as possible.
            </p>
            <p>
              Navigate complex scenarios, balance competing needs, and experience the challenges
              of real disaster management.
            </p>

            {/* Got It button */}
            <button className="menu-btn primary" onClick={handleCloseAbout}>
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// STEP 4: EXPORT
// Make this component available to import in other files
export default Menu;
