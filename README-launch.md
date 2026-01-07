# Scripts de lancement Quran-Pro

Ce projet inclut plusieurs scripts de lancement adaptés à différentes plateformes :

## Windows (`launch.bat`)
Script batch pour Windows qui :
- Vérifie l'installation de npm
- Installe les dépendances si nécessaire
- Lance le serveur de développement
- Ouvre automatiquement le navigateur sur http://localhost:5001

**Utilisation :**
```cmd
launch.bat
```

## macOS/Linux (`launch-mac.sh`)
Script shell pour macOS et Linux qui :
- Vérifie l'installation de npm
- Installe les dépendances si nécessaire
- Lance le serveur de développement en arrière-plan
- Ouvre automatiquement le navigateur

**Utilisation :**
```bash
chmod +x launch-mac.sh
./launch-mac.sh
```

## Serveur VPS (`launch-vps.sh`)
Script avancé pour les serveurs VPS avec :
- Support du mode développement et production
- Configuration personnalisable du port et de l'hôte
- Gestion des processus en arrière-plan
- Messages colorés et gestion d'erreurs

**Utilisation :**
```bash
chmod +x launch-vps.sh

# Mode développement (défaut)
./launch-vps.sh

# Mode production
./launch-vps.sh --production

# Configuration personnalisée
./launch-vps.sh --port 8080 --host 127.0.0.1 --production

# Afficher l'aide
./launch-vps.sh --help
```

## Commandes npm disponibles
- `npm run dev` : Mode développement (port 5001)
- `npm run build` : Construction pour la production
- `npm run start` : Lancement en production (nécessite `npm run build` d'abord)
- `npm run check` : Vérification TypeScript

## Variables d'environnement
- `NODE_ENV` : `development` ou `production`
- `PORT` : Port d'écoute (défaut : 5001)
- `HOST` : Adresse d'écoute (défaut : 0.0.0.0 pour VPS, localhost pour dev)
- `DATABASE_URL` : URL de connexion à la base de données (optionnel)
