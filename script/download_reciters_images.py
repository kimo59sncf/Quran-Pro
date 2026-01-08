import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import mimetypes
import re

def download_reciter_images(url, output_dir='reciters_images', max_pages=None):
    """
    Télécharge les images des récitants depuis la page donnée et ses pages paginées.

    Args:
        url (str): URL de base (page 1)
        output_dir (str): Dossier de destination pour les images
        max_pages (int, optional): Nombre maximum de pages à scraper (None = auto)
    """
    # Créer le dossier de destination s'il n'existe pas
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Dossier créé: {output_dir}")

    # Headers pour éviter les blocages
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

    total_downloaded = 0
    total_skipped = 0
    page_num = 1

    while True:
        if url.endswith('/'):
            current_url = f"{url}quran/page:{page_num}"
        else:
            current_url = f"{url}/quran/page:{page_num}"

        if page_num == 1:
            # Pour la première page, utiliser l'URL de base
            current_url = url

        print(f"\n=== Page {page_num}: {current_url} ===")

        try:
            response = requests.get(current_url, headers=headers, timeout=15)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Erreur d'accès à la page {page_num}: {e}")
            break

        # Analyser le HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # Chercher les images des récitants
        images = []

        # Stratégie principale: Images dans /media/person/
        all_imgs_on_page = soup.find_all('img')
        images = [img for img in all_imgs_on_page if img.get('src', '').startswith('/media/person/')]

        print(f"  Trouvé {len(images)} images de récitants sur cette page")

        if not images:
            print(f"  Aucune image de récitant trouvée sur la page {page_num}. Arrêt de la pagination.")
            break

        downloaded = 0
        skipped = 0

        for i, img in enumerate(images, 1):
            src = img.get('src')
            alt = img.get('alt', f'reciter_{page_num}_{i}').strip()

            if not src:
                continue

            # Résoudre les URLs relatives
            full_url = urljoin(current_url, src)

            # Nettoyer le nom du fichier
            clean_name = re.sub(r'[^\w\s-]', '', alt).strip().replace(' ', '_')
            if not clean_name:
                clean_name = f'reciter_{page_num}_{i}'

            # Déterminer l'extension
            parsed = urlparse(full_url)
            ext = os.path.splitext(parsed.path)[1].lower()

            # Extensions d'images communes
            valid_exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            if ext not in valid_exts:
                ext = '.jpg'  # Extension par défaut

            filename = f"{clean_name}{ext}"
            filepath = os.path.join(output_dir, filename)

            # Vérifier si le fichier existe déjà
            if os.path.exists(filepath):
                print(f"  Déjà existant: {filename}")
                skipped += 1
                continue

            try:
                print(f"  Téléchargement {i}/{len(images)}: {filename}")
                img_response = requests.get(full_url, headers=headers, timeout=15, stream=True)
                img_response.raise_for_status()

                # Vérifier le type de contenu
                content_type = img_response.headers.get('content-type', '').lower()
                if not content_type.startswith('image/'):
                    print(f"  Contenu non-image ignoré: {full_url}")
                    continue

                # Télécharger et sauvegarder
                with open(filepath, 'wb') as f:
                    for chunk in img_response.iter_content(chunk_size=8192):
                        f.write(chunk)

                print(f"  [OK] Téléchargé: {filename}")
                downloaded += 1

                # Délai respectueux entre les téléchargements
                time.sleep(1)

            except requests.RequestException as e:
                print(f"  [ERREUR] Téléchargement {full_url}: {e}")
            except OSError as e:
                print(f"  [ERREUR] Sauvegarde {filename}: {e}")

        total_downloaded += downloaded
        total_skipped += skipped

        print(f"  Résumé page {page_num}: {downloaded} téléchargés, {skipped} ignorés")

        # Vérifier si on continue la pagination
        if max_pages and page_num >= max_pages:
            print(f"  Nombre maximum de pages atteint ({max_pages})")
            break

        page_num += 1

        # Délai entre les pages
        time.sleep(2)

    print("\n=== RÉSULTAT FINAL ===")
    print(f"  Pages traitées: {page_num}")
    print(f"  Images téléchargées: {total_downloaded}")
    print(f"  Images ignorées (déjà existantes): {total_skipped}")

# Utilisation du script
if __name__ == "__main__":
    url_cible = "https://www.assabile.com"  # Page d'accueil avec les images des récitants
    dossier_destination = "client/public/reciters"  # Intégration dans l'app

    download_reciter_images(url_cible, dossier_destination)
