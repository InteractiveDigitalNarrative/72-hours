// App.jsx - Main application component

// STEP 1: IMPORT
import { useState, useEffect } from 'react';
import Menu from './components/Menu.jsx';
import InkStory from './components/InkStory.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { AudioProvider, useAudioContext } from './context/AudioContext.jsx';
import './App.css';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [hasSavedGame] = useState(false);

  const { playAmbient } = useAudioContext();

  // Play menu ambient whenever we return to the menu (user has already interacted by then)
  useEffect(() => {
    if (currentScreen === 'menu') {
      playAmbient('menu');
    }
  }, [currentScreen, playAmbient]);

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
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;
