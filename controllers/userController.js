
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

// Utilitaire de génération du token JWT
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// POST /api/users/register — Inscription
const registerUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Nom, email et mot de passe requis'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({
            email: normalizedEmail
        });

        if (userExists) {
            return res.status(409).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création du compte : rôle utilisateur par défaut
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            age
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role)
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        return res.status(500).json({
            message: 'Erreur interne du serveur'
        });
    }
};

// POST /api/users/login — Connexion
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email et mot de passe requis'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        // Comparaison du mot de passe avec le hash enregistré
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role)
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Erreur interne du serveur'
        });
    }
};

// GET /api/users/profile — Profil protégé
const getUserProfile = async (req, res) => {
    return res.status(200).json(req.user);
};

// GET /api/users — Liste des utilisateurs (admin uniquement)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        return res.status(200).json(users);

    } catch (err) {
        return res.status(500).json({
            message: 'Erreur interne du serveur'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers
};
