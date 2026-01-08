import requests
import os

RECITERS_API = "https://www.mp3quran.net/api/v3/reciters"

def find_matching_reciters():
    # Récupérer les réciteurs de l'API
    response = requests.get(RECITERS_API)
    data = response.json()
    reciters = data['reciters']

    # Récupérer les noms des fichiers photos
    photos_dir = './Quran-Pro/client/public/reciters'
    photos = [f.replace('.png', '').replace('.jpg', '') 
              for f in os.listdir(photos_dir) 
              if f.endswith(('.png', '.jpg'))]

    print('=== PHOTOS DISPONIBLES ===')
    print(f'{len(photos)} photos trouvées\n')

    # Mappings existants
    existing_mappings = {
        'sudais': 'Abdul_Rahman_Al_Sudais.png',
        's_gmd': 'Saad_El_Ghamidi.png',
        'alafasy': 'Mishary_Rashid_Alafasy.png',
        'basfar': 'Abdullah_Ibn_Ali_Basfar.png',
        'maher': 'Maher_Al_Mueaqly.png',
        'basit': 'Abdulbasit_Abdusamad.png',
        'rifai': 'Hani_Ar_Rifai.png',
        'minsh': 'Mohamed_Siddiq_El-Minshawi.png',
        'tabl': 'Mohamed_Tablawi.png',
        'shatri': 'Abu_Bakr_Al_Shatri.png',
        'ahmed': 'Abdul_Aziz_Al_Ahmed.png',
        'sufi': 'Abdul_Rashid_Ali_Sufi.png',
        'haneef': 'Abdul_Wadud_Haneef.png',
        'arkani': 'Abdul_Wali_Al_Arkani.png',
        'khayat': 'Abdullah_Al_Khayat.png',
        'juhani': 'Abdullah_Awad_Al_Juhani.png',
        'matrood': 'Abdullah_Matrood.png',
        'kalbani': 'Adel_Al_Kalbani.png',
        'ajm': 'Ahmed_Al_Ajmi.png',
        'saud': 'Ahmed_Saoud.png',
        'zubair': 'AlFateh_Muhammad_Zubair.png',
        'huthaify': 'Ali_Al_huthaify.png',
        'jaber': 'Ali_Jaber.png',
        'alzain': 'Alzain_Mohamed_Ahmed.png',
        'swed': 'Ayman_Swed.jpg',
        'anwar': 'Band_Al_Anwar.png',
        'badil': 'Band_Al_Badil.png',
        'asri': 'El_Asri.png',
        'abbad': 'Fares_Abbad.png',
        'saleh': 'Hassan_Saleh.png',
        'akhdar': 'Ibrahim_Al_Akhdar.png',
        'jibrin': 'Ibrahim_Al-Jibrin.png',
        'abkar': 'Idriss_Abkar.png',
        'qahtani': 'Khaled_Al_Qahtani.png',
        'jalil': 'Khalid_Al_Jalil.jpg',
        'tunaiji': 'Khalifa_Al_Tunaiji.png',
        'koshi': 'Laayoun_El_Kouchi.png',
        'francais': 'Le_Saint_Coran_traduit_en_francais.png',
        'banna': 'Mahmoud_Ali_Al_banna.png',
        'hussary': 'Mahmoud_Khalil_Al_Hussary.png',
        'barak': 'Mohamed__El_Barak.jpg',
        'mohisni': 'Mohamed_Al_Mohisni.png',
        'hamdan': 'Mohamed_Al_Tayeb_Hamdan.jpg',
        'heyani': 'Mohamed_Aljabery_Al_Heyani.png',
        'kantaoui': 'Mohamed_El_Kantaoui.png',
        'marrakchi': 'Mohamed_El_Marrakchi.png',
        'shareef': 'Mohammad_Rachad_Al_Shareef.png',
        'dokali': 'Muhammad_Al-Aalim_Al-Dokali.png',
        'luhaidan': 'Muhammad_Al-Luhaidan.png',
        'ayoub': 'Muhammad_Ayyub.png',
        'jibreel': 'Muhammad_Jibreel.png',
        'junaid': 'Muhammad_Taha_Al_Junaid.png',
        'lahouni': 'Mustafa_Al_Lahouni.png',
        'ismail': 'Mustafa_Ismail.png',
        'gharbi': 'Mustapha_Gharbi.png',
        'nabil': 'Nabil_Ar_Rifai.png',
        'qatami': 'Nasser_Al_Qatami.png',
        'kazabri': 'Omar_Al_Kazabri.png',
        'budair': 'Salah_Al_Budair.png',
        'hashem': 'Salah_Al_Hashem.png',
        'bukhatir': 'Salah_Bukhatir.png',
        'yusuf': 'Sami_Yusuf.png',
        'shur': 'Saud_Shuraim.png',
        'sayegh': 'Tawfeeq_As_Sayegh.png',
        'jazairi': 'Yassen_Al_Jazairi.png',
        'dosari': 'Yasser_Al-Dosari.png',
        'kamel': 'Abdallah_Kamel.jpg',
        'hssain': 'Abdelhamed_Hssain.png',
        'hassani': 'Abdessalam_Al_Hassani.png',
        'tahour': 'Abdessalam_Al_Tahour.png'
    }

    used_photos = set([p.replace('.png', '').replace('.jpg', '') for p in existing_mappings.values()])
    unused_photos = [p for p in photos if p not in used_photos]

    print(f'=== PHOTOS NON UTILISÉES ({len(unused_photos)}) ===')
    for p in sorted(unused_photos):
        print(f'  - {p}')
    print('\n')

    print('=== RÉCITEURS SANS PHOTO ===\n')
    
    no_photo_reciters = []
    for reciter in reciters:
        if reciter.get('moshaf') and len(reciter['moshaf']) > 0:
            server = reciter['moshaf'][0]['server']
            parts = server.split('/')
            if len(parts) > 3:
                code = parts[3].replace('/', '')
                if code not in existing_mappings:
                    no_photo_reciters.append({
                        'name': reciter['name'],
                        'code': code,
                        'server': server
                    })
    
    for r in no_photo_reciters:
        print(f"{r['name']}")
        print(f"  Code: {r['code']}")
        print(f"  Server: {r['server']}")
        print()
    
    print(f'\nTotal: {len(no_photo_reciters)} réciteurs sans photo')

find_matching_reciters()
