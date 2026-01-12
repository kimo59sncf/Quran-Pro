import { useQuery } from "@tanstack/react-query";
import { SurahTimings } from "./use-quran-sync";

export function useQuranTimings(surahNumber: number | null) {
  console.log('[useQuranTimings] Hook appelé avec surahNumber:', surahNumber);
  
  return useQuery({
    queryKey: ["quran-timings", surahNumber],
    queryFn: async (): Promise<SurahTimings> => {
      if (!surahNumber) {
        throw new Error("Surah number is required");
      }

      const paddedId = String(surahNumber).padStart(3, '0');
      const url = `/timings/surah_${paddedId}.json`;
      
      console.log('[useQuranTimings] Chargement du fichier:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        console.error('[useQuranTimings] Erreur de chargement - status:', response.status, 'url:', url);
        throw new Error(`Failed to load timings for surah ${surahNumber}`);
      }

      const data = await response.json();
      console.log('[useQuranTimings] Données chargées avec succès -', Object.keys(data).length, 'entrées');
      console.log('[useQuranTimings] Structure des données:', JSON.stringify(data).substring(0, 200) + '...');
      
      return { [surahNumber]: data };
    },
    enabled: !!surahNumber,
    staleTime: Infinity, // Les timings ne changent pas
  });
}