import { useQuery } from "@tanstack/react-query";

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  image?: string;
  popularity: number; // 1 = most popular, 2 = popular, 3 = less popular, 0 = not popular
  moshaf: {
    id: number;
    name: string;
    server: string;
    surah_total: number;
    surah_list: string;
  }[];
}

// Function to get reciter popularity based on server code
function getReciterPopularity(code: string): number {
  const popularityMap: Record<string, number> = {
    'basit': 1, // Abdul Basit Abdul Samad
    'hussary': 1, // Mahmoud Khalil Al-Hussary
    'husr': 1, // Mahmoud Khalil Al-Hussary (alternative)
    'minsh': 1, // Mohamed Siddiq Al-Minshawi
    'ismail': 1, // Mustafa Ismail
    'mustafa': 1, // Mustafa Ismail (alternative)
    'sudais': 2, // Abderrahman As-Sudais
    'sds': 2, // Abderrahman As-Sudais (alternative)
    'shur': 2, // Saud Ash-Shuraym
    'juhani': 2, // Abdullah Awad Al Juhany
    'jhn': 2, // Abdullah Awad Al Juhany (alternative)
    'maher': 2, // Maher Al Mueaqly
    'alafasy': 2, // Mishary Rashid Al-Afasy
    'afs': 2, // Mishary Rashid Al-Afasy (alternative)
    's_gmd': 2, // Saad Al-Ghamdi
    'shatri': 2, // Abu Bakr Al-Shatri
    'ajm': 2, // Ahmed Al Ajmi
    'rifai': 2, // Hani Ar-Rifai
    'hani': 2, // Hani Ar-Rifai (alternative)
    'tunaiji': 2, // Khalifah Al-Tunaiji
    'dosari': 3, // Yasser Al-Dosari
    'yasser': 3, // Yasser Al-Dosari (alternative)
    'qatami': 3, // Nasser Al-Qatami
    'qtm': 3, // Nasser Al-Qatami (alternative)
    'luhaidan': 3, // Muhammad Al-Luhaidan
    'lhdan': 3, // Muhammad Al-Luhaidan (alternative)
  };
  return popularityMap[code] || 0;
}

// Function to get reciter image path from name
function getReciterImagePath(reciter: Reciter): string | undefined {
  const server = reciter.moshaf[0]?.server;
  if (server) {
    const parts = server.split('/');
    if (parts.length > 3) {
      const code = parts[3].replace('/', '');
      const nameMappings: Record<string, string> = {
        // Most popular reciters (popularity 1)
        'basit': 'Abdulbasit_Abdusamad.png',
        'hussary': 'Mahmoud_Khalil_Al_Hussary.png',
        'husr': 'Mahmoud_Khalil_Al_Hussary.png',
        'minsh': 'Mohamed_Siddiq_El-Minshawi.png',
        'ismail': 'Mustafa_Ismail.png',
        'mustafa': 'Mustafa_Ismail.png',
        
        // Popular reciters (popularity 2)
        'sudais': 'Abdul_Rahman_Al_Sudais.png',
        'sds': 'Abdul_Rahman_Al_Sudais.png',
        'shur': 'Saud_Shuraim.png',
        'juhani': 'Abdullah_Awad_Al_Juhani.png',
        'jhn': 'Abdullah_Awad_Al_Juhani.png',
        'maher': 'Maher_Al_Mueaqly.png',
        'alafasy': 'Mishary_Rashid_Alafasy.png',
        'afs': 'Mishary_Rashid_Alafasy.png',
        's_gmd': 'Saad_El_Ghamidi.png',
        'shatri': 'Abu_Bakr_Al_Shatri.png',
        'ajm': 'Ahmed_Al_Ajmi.png',
        'rifai': 'Hani_Ar_Rifai.png',
        'hani': 'Hani_Ar_Rifai.png',
        'tunaiji': 'Khalifa_Al_Tunaiji.png',
        
        // Less popular reciters (popularity 3)
        'dosari': 'Yasser_Al-Dosari.png',
        'yasser': 'Yasser_Al-Dosari.png',
        'qatami': 'Nasser_Al_Qatami.png',
        'qtm': 'Nasser_Al_Qatami.png',
        'luhaidan': 'Muhammad_Al-Luhaidan.png',
        'lhdan': 'Muhammad_Al-Luhaidan.png',
        
        // Other reciters with images
        'basfar': 'Abdullah_Ibn_Ali_Basfar.png',
        'bsfr': 'Abdullah_Ibn_Ali_Basfar.png',
        'tabl': 'Mohamed_Tablawi.png',
        'tblawi': 'Mohamed_Tablawi.png',
        'ahmed': 'Abdul_Aziz_Al_Ahmed.png',
        'a_ahmed': 'Abdul_Aziz_Al_Ahmed.png',
        'sufi': 'Abdul_Rashid_Ali_Sufi.png',
        'soufi': 'Abdul_Rashid_Ali_Sufi.png',
        'haneef': 'Abdul_Wadud_Haneef.png',
        'wdod': 'Abdul_Wadud_Haneef.png',
        'arkani': 'Abdul_Wali_Al_Arkani.png',
        'khayat': 'Abdullah_Al_Khayat.png',
        'kyat': 'Abdullah_Al_Khayat.png',
        'matrood': 'Abdullah_Matrood.png',
        'mtrod': 'Abdullah_Matrood.png',
        'kalbani': 'Adel_Al_Kalbani.png',
        'a_klb': 'Adel_Al_Kalbani.png',
        'saud': 'Ahmed_Saoud.png',
        'zubair': 'AlFateh_Muhammad_Zubair.png',
        'huthaify': 'Ali_Al_huthaify.png',
        'jaber': 'Ali_Jaber.png',
        'a_jbr': 'Ali_Jaber.png',
        'alzain': 'Alzain_Mohamed_Ahmed.png',
        'swed': 'Ayman_Swed.jpg',
        'anwar': 'Band_Al_Anwar.png',
        'badil': 'Band_Al_Badil.png',
        'asri': 'El_Asri.png',
        'abbad': 'Fares_Abbad.png',
        'frs_a': 'Fares_Abbad.png',
        'saleh': 'Hassan_Saleh.png',
        'akhdar': 'Ibrahim_Al_Akhdar.png',
        'akdr': 'Ibrahim_Al_Akhdar.png',
        'jibrin': 'Ibrahim_Al-Jibrin.png',
        'abkar': 'Idriss_Abkar.png',
        'abkr': 'Idriss_Abkar.png',
        'qahtani': 'Khaled_Al_Qahtani.png',
        'jalil': 'Khalid_Al_Jalil.jpg',
        'koshi': 'Laayoun_El_Kouchi.png',
        'francais': 'Le_Saint_Coran_traduit_en_francais.png',
        'banna': 'Mahmoud_Ali_Al_banna.png',
        'bna': 'Mahmoud_Ali_Al_banna.png',
        'barak': 'Mohamed__El_Barak.jpg',
        'braak': 'Mohamed__El_Barak.jpg',
        'mohisni': 'Mohamed_Al_Mohisni.png',
        'mhsny': 'Mohamed_Al_Mohisni.png',
        'hamdan': 'Mohamed_Al_Tayeb_Hamdan.jpg',
        'heyani': 'Mohamed_Aljabery_Al_Heyani.png',
        'kantaoui': 'Mohamed_El_Kantaoui.png',
        'marrakchi': 'Mohamed_El_Marrakchi.png',
        'shareef': 'Mohammad_Rachad_Al_Shareef.png',
        'dokali': 'Muhammad_Al-Aalim_Al-Dokali.png',
        'ayoub': 'Muhammad_Ayyub.png',
        'ayyoub2': 'Muhammad_Ayyub.png',
        'jibreel': 'Muhammad_Jibreel.png',
        'jbrl': 'Muhammad_Jibreel.png',
        'junaid': 'Muhammad_Taha_Al_Junaid.png',
        'lahouni': 'Mustafa_Al_Lahouni.png',
        'lahoni': 'Mustafa_Al_Lahouni.png',
        'gharbi': 'Mustapha_Gharbi.png',
        'nabil': 'Nabil_Ar_Rifai.png',
        'kazabri': 'Omar_Al_Kazabri.png',
        'omar_warsh': 'Omar_Al_Kazabri.png',
        'budair': 'Salah_Al_Budair.png',
        's_bud': 'Salah_Al_Budair.png',
        'hashem': 'Salah_Al_Hashem.png',
        'salah_hashim_m': 'Salah_Al_Hashem.png',
        'bukhatir': 'Salah_Bukhatir.png',
        'bu_khtr': 'Salah_Bukhatir.png',
        'yusuf': 'Sami_Yusuf.png',
        'sayegh': 'Tawfeeq_As_Sayegh.png',
        'twfeeq': 'Tawfeeq_As_Sayegh.png',
        'jazairi': 'Yassen_Al_Jazairi.png',
        'kamel': 'Abdallah_Kamel.jpg',
        'hssain': 'Abdelhamed_Hssain.png',
        'hassani': 'Abdessalam_Al_Hassani.png',
        'tahour': 'Abdessalam_Al_Tahour.png'
      };
      if (nameMappings[code]) {
        return `/reciters/${nameMappings[code]}`;
      }
    }
  }
  return undefined;
}

const RECITERS_API = "https://www.mp3quran.net/api/v3/reciters";

export function useReciters() {
  return useQuery({
    queryKey: ["reciters"],
    queryFn: async () => {
      const res = await fetch(RECITERS_API);
      if (!res.ok) throw new Error("Failed to fetch reciters");
      const data = await res.json();
      const reciters = data.reciters as Reciter[];

      // Add images and popularity to reciters
      const processedReciters = reciters.map(reciter => {
        const server = reciter.moshaf[0]?.server;
        let code = '';
        if (server) {
          const parts = server.split('/');
          if (parts.length > 3) {
            code = parts[3].replace('/', '');
          }
        }
        const imagePath = getReciterImagePath(reciter);
        const popularity = getReciterPopularity(code);
        
        // Debug logging
        console.log('Reciter:', reciter.name);
        console.log('  Server:', server);
        console.log('  Code:', code);
        console.log('  Image Path:', imagePath);
        console.log('  Popularity:', popularity);
        
        return {
          ...reciter,
          image: imagePath,
          popularity: popularity
        };
      });
      
      // Log summary
      const withImages = processedReciters.filter(r => r.image);
      console.log('Total reciters:', processedReciters.length);
      console.log('Reciters with images:', withImages.length);
      console.log('Reciters without images:', processedReciters.length - withImages.length);
      
      return processedReciters;
    },
  });
}
