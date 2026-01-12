const fs = require('fs');
const path = require('path');

/**
 * Convertit les fichiers de timing EveryAyah en format JSON
 * Format d'entrée : timestamps en millisecondes par ligne
 * Format de sortie : JSON avec sourate, verset, tempsDébut, durée
 */

function convertTimings(inputDir, outputDir = null) {
    if (!outputDir) {
        outputDir = path.join(inputDir, 'json_output');
    }

    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Lister tous les fichiers .txt dans le dossier d'entrée
    const files = fs.readdirSync(inputDir)
        .filter(file => file.endsWith('.txt') && file !== '000_disclaimer.txt')
        .sort();

    const allTimings = {};

    console.log(`Conversion de ${files.length} fichiers de timing...`);

    files.forEach(file => {
        const surahNumber = parseInt(file.replace('.txt', ''));
        const filePath = path.join(inputDir, file);

        try {
            // Lire le contenu du fichier
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.trim());

            // Convertir les lignes en timestamps (millisecondes)
            const timestamps = lines.map(line => parseInt(line.trim()));

            if (timestamps.length === 0) {
                console.warn(`Fichier ${file} vide, ignoré`);
                return;
            }

            // Créer les données de timing pour cette sourate
            const surahTimings = [];

            for (let i = 0; i < timestamps.length - 1; i++) {
                const verseNumber = i + 1;
                const startTime = timestamps[i];
                const endTime = timestamps[i + 1];
                const duration = endTime - startTime;

                surahTimings.push({
                    sourate: surahNumber,
                    verset: verseNumber,
                    tempsDebut: startTime,
                    duree: duration
                });
            }

            // Ajouter au résultat global
            allTimings[surahNumber] = surahTimings;

            // Créer un fichier JSON séparé pour cette sourate
            const outputFile = path.join(outputDir, `surah_${surahNumber.toString().padStart(3, '0')}.json`);
            fs.writeFileSync(outputFile, JSON.stringify(surahTimings, null, 2));

            console.log(`✓ Sourate ${surahNumber} convertie (${surahTimings.length} versets)`);

        } catch (error) {
            console.error(`Erreur lors du traitement de ${file}:`, error.message);
        }
    });

    // Créer le fichier JSON global
    const globalOutputFile = path.join(outputDir, 'timings.json');
    fs.writeFileSync(globalOutputFile, JSON.stringify(allTimings, null, 2));

    console.log(`\nConversion terminée !`);
    console.log(`Fichiers créés dans : ${outputDir}`);
    console.log(`- timings.json : fichier global avec toutes les sourates`);
    console.log(`- surah_XXX.json : fichiers individuels par sourate`);

    return allTimings;
}

// Utilisation
if (require.main === module) {
    const inputDir = process.argv[2] || './everyayah/temp_extract';
    const outputDir = process.argv[3];

    if (!fs.existsSync(inputDir)) {
        console.error(`Dossier d'entrée introuvable: ${inputDir}`);
        process.exit(1);
    }

    convertTimings(inputDir, outputDir);
}

module.exports = { convertTimings };