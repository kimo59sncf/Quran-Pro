// Exemple d'utilisation du hook useQuranSync

import { useRef } from 'react';
import { useQuranSync, SurahTimings } from './use-quran-sync';

function QuranPlayer({ timings }: { timings: SurahTimings }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<(HTMLElement | null)[]>([]);
  const currentSurah = 1; // Par exemple, sourate Al-Fatiha

  const { currentAyahId, scrollToVerse } = useQuranSync({
    audioRef,
    timings,
    currentSurah,
    ayahRefs
  });

  return (
    <div>
      <audio
        ref={audioRef}
        src="/path/to/audio/file.mp3"
        controls
      />

      <div>
        <p>Verset actuel: {currentAyahId || 'Aucun'}</p>
        <button onClick={() => scrollToVerse(3)}>
          Aller au verset 3
        </button>
      </div>

      {/* Liste des versets avec des IDs pour le scroll */}
      <div className="verses-list">
        {/* Ici vous auriez vos composants de versets */}
        <div id="verse-1">Verset 1: بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div id="verse-2">Verset 2: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</div>
        <div id="verse-3">Verset 3: الرَّحْمَٰنِ الرَّحِيمِ</div>
        {/* ... autres versets ... */}
      </div>
    </div>
  );
}

export default QuranPlayer;