@echo off
echo Lancement de Quran-Pro en mode developpement local...
echo.

REM Verifier si npm est installe
npm --version >nul 2>&1
if errorlevel 1 (
    echo Erreur: npm n'est pas installe. Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Verifier si les dependances sont installees
if not exist node_modules (
    echo Installation des dependances...
    npm install
    if errorlevel 1 (
        echo Erreur lors de l'installation des dependances.
        pause
        exit /b 1
    )
)

echo Dependances verifiees.
echo.

REM Lancer le serveur de developpement
echo Lancement du serveur de developpement sur http://localhost:5001...
start "" npm run dev

REM Attendre un peu pour que le serveur demarre
timeout /t 5 /nobreak >nul

REM Ouvrir le navigateur
echo Ouverture du navigateur...
start http://localhost:5001

echo.
echo Serveur lance avec succes!
echo Appuyez sur une touche pour fermer cette fenetre (le serveur continuera de tourner)...
pause >nul
