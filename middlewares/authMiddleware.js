
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

// 1. Protection des routes privées : vérifie la validité du JWT
const protect = async (req, res, next) => {
    let token;

    // Vérification de l'en-tête Authorization avec Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        try {
            // Extraction du token
            token = req.headers.authorization.split(' ')[1];

            // Vérification de la signature et de l'expiration du token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // Récupération de l'utilisateur sans son mot de passe
            req.user = await User.findById(decoded.id)
                .select('-password');

            if (!req.user) {
                return res.status(401).json({
                    message: 'Non autorisé, utilisateur introuvable'
                });
            }

            // Passage au middleware ou contrôleur suivant
            return next();

        } catch (err) {
            return res.status(401).json({
                message: 'Non autorisé, token invalide ou expiré'
            });
        }
    }

    // Aucun token fourni
    return res.status(401).json({
        message: 'Non autorisé, aucun token fourni'
    });
};

// 2. Contrôle d'accès basé sur les rôles (RBAC)
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        message: 'Accès refusé : droits administrateur requis'
    });
};

module.exports = { protect, adminOnly };
