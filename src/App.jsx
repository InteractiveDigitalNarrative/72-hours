// App.jsx - Main application component

import { useState, useEffect } from 'react';
import Menu from './components/Menu.jsx';
import InkStory, { SAVE_KEY } from './components/InkStory.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import LanguageSelect from './components/LanguageSelect.jsx';
import Demography from './components/Demography.jsx';
import { AudioProvider, useAudioContext } from './context/AudioContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import './App.css';

function AppContent() {
  const { setLanguage } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState('language');
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [resume, setResume] = useState(false);

  const { playAmbient } = useAudioContext();

  // DEV: ?scene=<key> skips the intro UI and drops straight into the game,
  // where InkStory jumps to the matching slice (see DEV_SCENES in InkStory).
  // Optional ?lang=et. Dev build only.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('scene')) return;
    setLanguage(params.get('lang') === 'et' ? 'et' : 'en');
    setCurrentScreen('game');
  }, [setLanguage]);

  // Play menu ambient whenever we return to the menu (user has already interacted by then)
  useEffect(() => {
    if (currentScreen === 'menu') {
      playAmbient('menu');
    }
  }, [currentScreen, playAmbient]);

  // Whether an in-progress save exists — refreshed each time we head to the menu.
  const refreshSavedGame = () => {
    try {
      setHasSavedGame(!!localStorage.getItem(SAVE_KEY));
    } catch {
      setHasSavedGame(false);
    }
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setCurrentScreen('demography');
  };

  const handleDemographySubmit = (data) => {
    console.log('[Demography]', data);
    setCurrentScreen('loading');
  };

  const handleDemographySkip = () => {
    console.log('[Demography] skipped');
    setCurrentScreen('loading');
  };

  // Loading screen "ENTER" click — first user gesture, safe to start audio
  const handleEnter = () => {
    playAmbient('menu');
    refreshSavedGame();
    setCurrentScreen('menu');
  };

  const handleStartGame = () => {
    // New game — discard any in-progress save so it starts clean.
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    setResume(false);
    setCurrentScreen('game');
  };

  const handleContinueGame = () => {
    // Resume the saved game in the language it was played in.
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const save = raw ? JSON.parse(raw) : null;
      if (save?.lang) setLanguage(save.lang);
    } catch { /* ignore — InkStory will fall back to a fresh start */ }
    setResume(true);
    setCurrentScreen('game');
  };

  const handleReturnToMenu = () => {
    refreshSavedGame();
    setCurrentScreen('menu');
  };

  return (
    <div className="App">
      {currentScreen === 'language' && (
        <LanguageSelect onSelect={handleLanguageSelect} />
      )}

      {currentScreen === 'demography' && (
        <Demography
          onSubmit={handleDemographySubmit}
          onSkip={handleDemographySkip}
        />
      )}

      {currentScreen === 'loading' && (
        <LoadingScreen onEnter={handleEnter} />
      )}

      {currentScreen === 'menu' && (
        <Menu
          onStartGame={handleStartGame}
          onContinueGame={handleContinueGame}
          hasSavedGame={hasSavedGame}
        />
      )}

      {currentScreen === 'game' && (
        <InkStory onReturnToMenu={handleReturnToMenu} resume={resume} />
      )}

    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </LanguageProvider>
  );
}

export default App;
