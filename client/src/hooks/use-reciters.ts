import { useQuery } from "@tanstack/react-query";

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: {
    id: number;
    name: string;
    server: string;
    surah_total: number;
    surah_list: string;
  }[];
}

const RECITERS_API = "https://www.mp3quran.net/api/v3/reciters";

export function useReciters() {
  return useQuery({
    queryKey: ["reciters"],
    queryFn: async () => {
      const res = await fetch(RECITERS_API);
      if (!res.ok) throw new Error("Failed to fetch reciters");
      const data = await res.json();
      return data.reciters as Reciter[];
    },
  });
}
