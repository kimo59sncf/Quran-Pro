import { useState, useEffect, useCallback, RefObject } from 'react';

// Type pour les données de timing d'un verset
export interface AyahTiming {
  sourate: number;
  verset: number;
  tempsDebut: number;
  duree: number;
}

// Type pour les données de timing d'une sourate complète
export interface SurahTimings {
  [surahNumber: number]: AyahTiming[];
}

interface UseQuranSyncProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  timings: SurahTimings | null;
  currentSurah: number | null;
  ayahRefs: RefObject<(HTMLElement | null)[]>;
  autoScrollEnabled?: boolean;
  offset?: number; // Offset en millisecondes pour ajuster le timing (+ ou -)
}

interface UseQuranSyncReturn {
  currentAyahId: number | null;
  scrollToVerse: (ayahId: number) => void;
}

export function useQuranSync({
  audioRef,
  timings,
  currentSurah,
  ayahRefs,
  autoScrollEnabled = true,
  offset = 0
  
}: UseQuranSyncProps): UseQuranSyncReturn {
  const [currentAyahId, setCurrentAyahId] = useState<number | null>(null);

  // Fonction pour trouver le verset actuel basé sur le temps de lecture
  const findCurrentAyah = useCallback((currentTime: number): number | null => {
    console.log('[useQuranSync] findCurrentAyah appelé avec currentTime:', currentTime);
    
    if (!timings) {
      console.log('[useQuranSync] timings est null');
      return null;
    }
    
    if (!currentSurah) {
      console.log('[useQuranSync] currentSurah est null');
      return null;
    }
    
    if (!timings[currentSurah]) {
      console.log('[useQuranSync] timings[currentSurah] est null pour surah:', currentSurah);
      return null;
    }

    const surahTimings = timings[currentSurah];
    console.log('[useQuranSync] surahTimings:', surahTimings.length, 'versets');

    // Trouver le verset qui correspond au temps actuel
    for (const timing of surahTimings) {
      const endTime = timing.tempsDebut + timing.duree;
      if (currentTime >= timing.tempsDebut && currentTime < endTime) {
        console.log('[useQuranSync] Verset trouvé:', timing.verset, '(temps:', timing.tempsDebut, '-', endTime, ')');
        return timing.verset;
      }
    }

    console.log('[useQuranSync] Aucun verset trouvé pour currentTime:', currentTime);
    return null;
  }, [timings, currentSurah]);

  // Gestionnaire pour l'événement timeUpdate
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) {
      console.log('[useQuranSync] handleTimeUpdate: audioRef.current est null');
      return;
    }

    console.log('[useQuranSync] handleTimeUpdate - Offset actuel:', offset, 'ms');
    const currentTime = (audioRef.current.currentTime * 1000) + offset; // Convertir en millisecondes et appliquer l'offset
    const ayahId = findCurrentAyah(currentTime);

    console.log('[useQuranSync] handleTimeUpdate - currentTime:', currentTime, 'offset:', offset, 'ayahId trouvé:', ayahId, 'currentAyahId actuel:', currentAyahId);

    if (ayahId !== currentAyahId) {
      console.log('[useQuranSync] Mise à jour currentAyahId de', currentAyahId, 'à', ayahId);
      setCurrentAyahId(ayahId);
    }
  }, [audioRef, findCurrentAyah, currentAyahId, offset]);

  // Fonction pour faire défiler vers un verset spécifique
  // ayahId correspond au numéro du verset (1, 2, 3...), donc on fait ayahId - 1 pour l'index du tableau
  const scrollToVerse = useCallback((ayahId: number) => {
    console.log('[useQuranSync] scrollToVerse appelé avec ayahId:', ayahId);
    console.log('[useQuranSync] ayahRefs.current:', ayahRefs.current);
    
    const verseElement = ayahRefs.current[ayahId - 1]; // Conversion numéro verset (1-based) → index tableau (0-based)
    
    console.log('[useQuranSync] verseElement à index', ayahId - 1, ':', verseElement);
    
    if (verseElement) {
      console.log('[useQuranSync] scrollIntoView exécuté');
      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      console.log('[useQuranSync] verseElement est null - impossible de scroller');
    }
  }, [ayahRefs]);

  // Effet pour attacher/détacher l'événement timeUpdate
  useEffect(() => {
    const audioElement = audioRef.current;

    console.log('[useQuranSync] useEffect attachment - audioElement:', !!audioElement, 'timings:', !!timings, 'currentSurah:', currentSurah);

    if (audioElement && timings && currentSurah) {
      console.log('[useQuranSync] Attache événement timeupdate');
      audioElement.addEventListener('timeupdate', handleTimeUpdate);

      // Réinitialiser l'état quand la sourate change
      setCurrentAyahId(null);

      return () => {
        console.log('[useQuranSync] Détache événement timeupdate');
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    } else {
      console.log('[useQuranSync] Événement timeupdate NON attaché - conditions non remplies');
    }
  }, [audioRef, handleTimeUpdate, timings, currentSurah]);

  // Effet pour faire défiler automatiquement vers le verset actuel
  useEffect(() => {
    console.log('[useQuranSync] useEffect scroll - currentAyahId:', currentAyahId, 'autoScrollEnabled:', autoScrollEnabled);
    if (currentAyahId !== null && autoScrollEnabled) {
      scrollToVerse(currentAyahId);
    }
  }, [currentAyahId, scrollToVerse, autoScrollEnabled]);

  return {
    currentAyahId,
    scrollToVerse
  };
}
