// AudioContext.jsx — app-wide audio state via React Context
import { createContext, useContext } from 'react';
import { useAudio } from '../hooks/useAudio';

const AudioCtx = createContext(null);

// Wrap your app with this provider so any component can access audio
export function AudioProvider({ children }) {
  const audio = useAudio();
  return <AudioCtx.Provider value={audio}>{children}</AudioCtx.Provider>;
}

// Hook to consume audio context — returns no-ops if used outside provider
export function useAudioContext() {
  return (
    useContext(AudioCtx) ?? {
      muted: false,
      toggleMute: () => {},
      playAmbient: () => {},
      playSfx: () => {},
      setWindVolume: () => {},
      switchWindTrack: () => {},
      WIND_VOLS: [0.07, 0.28, 0.52],
    }
  );
}
