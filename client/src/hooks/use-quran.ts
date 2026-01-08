import { useQuery } from "@tanstack/react-query";

// Types for external API responses
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  translation?: string;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
}

export interface RandomAyahResponse {
  code: number;
  status: string;
  data: {
    number: number;
    numberInSurah: number;
    text: string;
    surah: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
      revelationType: string;
    };
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
    };
  }[]; // We get array because we request multiple editions
}

const API_BASE = "https://api.alquran.cloud/v1";

// List all Surahs
export function useSurahs() {
  return useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/surah`);
      if (!res.ok) throw new Error("Failed to fetch surahs");
      const data = await res.json();
      return data.data as Surah[];
    },
  });
}

// Get Surah details (Arabic + Translation)
export function useSurahDetail(id: number) {
  return useQuery({
    queryKey: ["surah", id],
    queryFn: async () => {
      // Fetch Uthmani script and Asad translation
      const res = await fetch(`${API_BASE}/surah/${id}/editions/quran-uthmani,en.asad`);
      if (!res.ok) throw new Error("Failed to fetch surah details");
      const data = await res.json();
      
      // Merge the two editions
      const arabic = data.data[0];
      const translation = data.data[1];
      
      const mergedAyahs = arabic.ayahs.map((ayah: Ayah, index: number) => ({
        ...ayah,
        translation: translation.ayahs[index].text
      }));

      return {
        ...arabic,
        ayahs: mergedAyahs
      } as SurahDetail & { ayahs: (Ayah & { translation: string })[] };
    },
    enabled: !!id,
  });
}

// Get Random Ayah
export function useRandomAyah() {
  return useQuery({
    queryKey: ["random-ayah"],
    queryFn: async () => {
      // Random number between 1 and 6236 (total ayahs)
      const randomId = Math.floor(Math.random() * 6236) + 1;
      const res = await fetch(`${API_BASE}/ayah/${randomId}/editions/quran-uthmani,en.asad`);
      if (!res.ok) throw new Error("Failed to fetch random ayah");
      const data = await res.json();
      return data.data as RandomAyahResponse["data"];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
