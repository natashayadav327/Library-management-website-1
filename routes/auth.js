/**
 * Authentication Routes
 * Routes for signup, login, and logout
 */

const express = require('express');
const router = express.Router();
const {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  logout
} = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/authMiddleware');

// Signup routes
router.get('/signup', redirectIfAuth, getSignup);
router.post('/signup', postSignup);

// Login routes
router.get('/login', redirectIfAuth, getLogin);
router.post('/login', postLogin);

// Logout route (POST for security)
router.post('/logout', logout);

module.exports = router;
