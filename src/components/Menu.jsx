// Menu.jsx - Main menu component for Storm Alert game

import React, { useState } from 'react';
import './Menu.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

const BASE_URL = import.meta.env.BASE_URL;

// STEP 2: COMPONENT FUNCTION
// This component receives 3 props from its parent:
// - onStartGame: function to call when user clicks "Start"
// - onContinueGame: function to call when user clicks "Continue"
// - hasSavedGame: boolean - true if there's a saved game
function Menu({ onStartGame, onContinueGame, hasSavedGame }) {

  const [showAbout, setShowAbout] = useState(false);
  const { playSfx } = useAudioContext();
  const { t } = useTranslation();

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
            <h1 className="menu-title">{t('menu.title').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}</h1>
            <p className="menu-subtitle">{t('menu.subtitle')}</p>
          </div>

          {/* BUTTONS SECTION */}
          <div className="menu-buttons">

            <button onClick={handleStartClick} className="menu-btn primary">
              <span className="btn-icon">▶</span>
              <span className="btn-text">{t('menu.start')}</span>
            </button>

            {hasSavedGame && (
              <button onClick={handleContinueClick} className="menu-btn secondary">
                <span className="btn-icon">↻</span>
                <span className="btn-text">{t('menu.continue')}</span>
              </button>
            )}

            <button onClick={handleAboutClick} className="menu-btn secondary">
              <span className="btn-icon">ℹ</span>
              <span className="btn-text">{t('menu.about')}</span>
            </button>
          </div>

          <div className="menu-footer">
            <p className="tagline">{t('menu.tagline')}</p>
          </div>
        </div>

        {/* Background overlay */}
        <div className="menu-overlay"></div>
      </div>

      {/* EU funding logo - fixed at bottom of viewport */}
      <div className="menu-eu-logo">
        <img src={`${BASE_URL}Images/EULogo.jpg`} alt="Co-funded by the European Union" />
      </div>

      {/* ABOUT MODAL - Only shows when showAbout is true */}
      {showAbout && (
        <div className="modal">
          <div className="modal-content">
            {/* Close button (X) */}
            <span className="close-modal" onClick={handleCloseAbout}>&times;</span>

            <h2>{t('menu.aboutTitle')}</h2>
            <p>{t('menu.aboutP1')}</p>
            <p>{t('menu.aboutP2')}</p>

            {/* EU Logo */}
            <div className="modal-eu-logo">
              <img src={`${BASE_URL}Images/EULogo.jpg`} alt="Co-funded by the European Union" />
            </div>

            {/* Got It button */}
            <button className="menu-btn primary" onClick={handleCloseAbout}>
              {t('menu.gotIt')}
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
