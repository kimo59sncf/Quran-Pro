#!/bin/bash

# Script de lancement pour serveur VPS Quran-Pro
# Utilisation: ./launch-vps.sh [--production] [--port PORT] [--host HOST]

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valeurs par défaut
PRODUCTION=false
PORT=5001
HOST="0.0.0.0"

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --production|-p)
            PRODUCTION=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--production] [--port PORT] [--host HOST]"
            echo "  --production, -p    Lancer en mode production"
            echo "  --port PORT         Port d'écoute (défaut: 5001)"
            echo "  --host HOST         Adresse d'écoute (défaut: 0.0.0.0)"
            exit 0
            ;;
        *)
            echo -e "${RED}Argument inconnu: $1${NC}"
            echo "Utilisez --help pour voir l'aide"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}=== Lancement de Quran-Pro sur VPS ===${NC}"
echo

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erreur: Node.js n'est pas installé.${NC}"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Erreur: npm n'est pas installé.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js et npm détectés${NC}"

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances...${NC}"
    if ! npm install; then
        echo -e "${RED}Erreur lors de l'installation des dépendances.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dépendances installées${NC}"
else
    echo -e "${GREEN}✓ Dépendances déjà installées${NC}"
fi

# Configuration des variables d'environnement
export PORT=$PORT
export HOST=$HOST

if [ "$PRODUCTION" = true ]; then
    export NODE_ENV=production
    SCRIPT="start"
    echo -e "${YELLOW}Mode production activé${NC}"
else
    export NODE_ENV=development
    SCRIPT="dev"
    echo -e "${YELLOW}Mode développement activé${NC}"
fi

# Afficher les informations de configuration
echo -e "${BLUE}Configuration:${NC}"
echo "  - Mode: $NODE_ENV"
echo "  - Port: $PORT"
echo "  - Host: $HOST"
echo

# Fonction pour nettoyer à l'arrêt
cleanup() {
    echo -e "\n${YELLOW}Arrêt du serveur...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 0
}

# Gérer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Lancer le serveur
echo -e "${GREEN}Lancement du serveur...${NC}"
if [ "$PRODUCTION" = true ]; then
    npm run build
    npm run start &
else
    npm run dev &
fi

SERVER_PID=$!

# Attendre un peu que le serveur démarre
sleep 3

# Vérifier si le serveur fonctionne
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Serveur lancé avec succès (PID: $SERVER_PID)${NC}"
    echo -e "${GREEN}✓ Application accessible sur http://$HOST:$PORT${NC}"
    echo
    echo -e "${YELLOW}Pour arrêter le serveur, appuyez sur Ctrl+C${NC}"
    echo -e "${YELLOW}Ou utilisez: kill $SERVER_PID${NC}"

    # Garder le script en cours d'exécution
    wait $SERVER_PID
else
    echo -e "${RED}✗ Échec du lancement du serveur${NC}"
    exit 1
fi
