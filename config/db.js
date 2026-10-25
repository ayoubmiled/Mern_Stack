
const mongoose = require('mongoose');

async function connectDB(uri) {
    if (!uri) {
        throw new Error(
            "L'URI MongoDB est manquant dans les variables d'environnement (.env)."
        );
    }

    if (/(?:xxxxx|your[_-]?(?:username|password|cluster)|<[^>]+>)/i.test(uri)) {
        throw new Error(
            "L'URI MongoDB contient encore des valeurs d'exemple. Remplacez MONGODB_URI dans .env par l'URI réelle de votre cluster MongoDB Atlas."
        );
    }

    await mongoose.connect(uri, {
        autoIndex: true // Génère automatiquement les index en développement
    });

    console.log('Connexion à MongoDB réussie avec succès !');
}

module.exports = connectDB;
