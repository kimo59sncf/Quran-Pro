import { create } from 'zustand';

interface PlayerState {
  isPlaying: boolean;
  currentSurah: number | null; // Surah ID (1-114)
  currentReciter: any | null;
  serverUrl: string | null; // The base URL for the reciter's audio
  progress: number; // 0-100 or seconds depending on implementation
  duration: number;
  
  // Actions
  play: (surahId: number, reciter: any, serverUrl: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setReciter: (reciter: any) => void;
}

// Simple store for global player state
// In a real app, this would also connect to the <audio> element or Howler instance
export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentSurah: null,
  currentReciter: null,
  serverUrl: null,
  progress: 0,
  duration: 0,

  play: (surahId, reciter, serverUrl) => set({ 
    isPlaying: true, 
    currentSurah: surahId, 
    currentReciter: reciter,
    serverUrl
  }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false, currentSurah: null }),
  setReciter: (reciter) => set({ currentReciter: reciter }),
}));
