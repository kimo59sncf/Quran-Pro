#!/bin/bash

echo "Lancement de Quran-Pro en mode développement local..."
echo

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "Erreur: npm n'est pas installé. Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    if ! npm install; then
        echo "Erreur lors de l'installation des dépendances."
        exit 1
    fi
fi

echo "Dépendances vérifiées."
echo

# Lancer le serveur de développement
echo "Lancement du serveur de développement sur http://localhost:5001..."
npm run dev &

# Attendre un peu que le serveur démarre
sleep 5

# Ouvrir le navigateur (fonctionne sur macOS et la plupart des Linux avec xdg-open)
echo "Ouverture du navigateur..."
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:5001
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:5001
else
    echo "Navigateur non détecté. Ouvrez manuellement : http://localhost:5001"
fi

echo
echo "Serveur lancé avec succès!"
echo "Appuyez sur Ctrl+C pour arrêter le serveur..."
wait
