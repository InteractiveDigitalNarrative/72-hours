// App.jsx - Main application component

// STEP 1: IMPORT
import { useState, useEffect } from 'react';
import Menu from './components/Menu.jsx';
import InkStory from './components/InkStory.jsx';
import { AudioProvider, useAudioContext } from './context/AudioContext.jsx';
import './App.css';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [hasSavedGame] = useState(false);

  const { playAmbient } = useAudioContext();

  // Play menu ambient whenever we're on the menu screen
  useEffect(() => {
    if (currentScreen === 'menu') {
      playAmbient('menu');
    }
  }, [currentScreen, playAmbient]);

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
