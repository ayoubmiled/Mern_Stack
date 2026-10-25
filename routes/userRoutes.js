
const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers
} = require('../controllers/userController');

const {
    protect,
    adminOnly
} = require('../middlewares/authMiddleware');

// Routes d'authentification publiques
router.post('/register', registerUser);
router.post('/login', loginUser);

// Route privée protégée par un token JWT
router.get('/profile', protect, getUserProfile);

// Route réservée aux administrateurs
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
