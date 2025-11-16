/**
 * Authentication Controller
 * Handles user signup, login, and logout
 */

const User = require('../models/User');

/**
 * @desc    Show signup form
 * @route   GET /auth/signup
 * @access  Public
 */
exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    layout: false,
    error: null,
    email: ''
  });
};

/**
 * @desc    Process signup form
 * @route   POST /auth/signup
 * @access  Public
 */
exports.postSignup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).render('auth/signup', {
        layout: false,
        error: 'Email and password are required',
        email: email || ''
      });
    }
    
    // Check password length
    if (password.length < 6) {
      return res.status(400).render('auth/signup', {
        layout: false,
        error: 'Password must be at least 6 characters',
        email
      });
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).render('auth/signup', {
        layout: false,
        error: 'Passwords do not match',
        email
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('auth/signup', {
        layout: false,
        error: 'An account with this email already exists',
        email
      });
    }
    
    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password
    });
    
    // Set session
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    
    console.log(`✅ New user signed up: ${user.email}`);
    
    // Redirect to homepage
    res.redirect('/');
    
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).render('auth/signup', {
        layout: false,
        error: messages.join(', '),
        email: req.body.email || ''
      });
    }
    
    res.status(500).render('auth/signup', {
      layout: false,
      error: 'An error occurred during signup. Please try again.',
      email: req.body.email || ''
    });
  }
};

/**
 * @desc    Show login form
 * @route   GET /auth/login
 * @access  Public
 */
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    layout: false,
    error: null,
    email: ''
  });
};

/**
 * @desc    Process login form
 * @route   POST /auth/login
 * @access  Public
 */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).render('auth/login', {
        layout: false,
        error: 'Email and password are required',
        email: email || ''
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).render('auth/login', {
        layout: false,
        error: 'Invalid email or password',
        email
      });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).render('auth/login', {
        layout: false,
        error: 'Invalid email or password',
        email
      });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    
    console.log(`✅ User logged in: ${user.email}`);
    
    // Redirect to homepage
    res.redirect('/');
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('auth/login', {
      layout: false,
      error: 'An error occurred during login. Please try again.',
      email: req.body.email || ''
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  const userEmail = req.session.userEmail;
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }
    
    console.log(`✅ User logged out: ${userEmail}`);
    res.redirect('/');
  });
};
