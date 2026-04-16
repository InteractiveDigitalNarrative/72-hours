// App.jsx - Main application component

import { useState, useEffect } from 'react';
import Menu from './components/Menu.jsx';
import InkStory from './components/InkStory.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import LanguageSelect from './components/LanguageSelect.jsx';
import Demography from './components/Demography.jsx';
import { AudioProvider, useAudioContext } from './context/AudioContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import './App.css';

function AppContent() {
  const { language, setLanguage } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState('language');
  const [hasSavedGame] = useState(false);

  const { playAmbient } = useAudioContext();

  // Play menu ambient whenever we return to the menu (user has already interacted by then)
  useEffect(() => {
    if (currentScreen === 'menu') {
      playAmbient('menu');
    }
  }, [currentScreen, playAmbient]);

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
    setCurrentScreen('menu');
  };

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleContinueGame = () => {
    setCurrentScreen('game');
  };

  const handleReturnToMenu = () => {
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
        <InkStory onReturnToMenu={handleReturnToMenu} />
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
