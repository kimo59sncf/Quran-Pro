import { create } from 'zustand';

interface PlayerState {
  isPlaying: boolean;
  currentSurah: number | null;
  currentReciter: any | null;
  serverUrl: string | null;
  progress: number;
  duration: number;
  playbackRate: number;
  
  // Actions
  play: (surahId: number, reciter: any, serverUrl: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setReciter: (reciter: any) => void;
  setPlaybackRate: (rate: number) => void;
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
  playbackRate: 1,

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
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
}));
