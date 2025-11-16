/**
 * Bibliotheca Library Management System - Server
 * Node.js + Express + MongoDB backend
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');
const { ensureAuth } = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development to allow inline scripts
  crossOriginEmbedderPolicy: false
}));

// CORS - enable for localhost during development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false // Disable in production or specify allowed origins
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (must be before routes that use sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Middleware to make session data available to all EJS templates
app.use(async (req, res, next) => {
  res.locals.user = null;
  res.locals.userEmail = null;
  res.locals.userId = null;
  
  if (req.session && req.session.userId) {
    // Set user object with email for header display
    res.locals.user = { 
      _id: req.session.userId,
      email: req.session.userEmail 
    };
    res.locals.userEmail = req.session.userEmail;
    res.locals.userId = req.session.userId;
  }
  
  next();
});

// Set EJS as template engine with layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Serve static files from client directory (existing frontend)
app.use(express.static(path.join(__dirname, 'client')));

// Proxy routes for fixtures - allows frontend to work without modification
// Frontend can still use fetch('dashboard.json') or fetch('trending.json')
app.get('/dashboard.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'fixtures', 'dashboard.json'));
});

app.get('/trending.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'fixtures', 'trending.json'));
});

// API Routes
app.use('/api/books', require('./routes/api/books'));

// Authentication Routes
app.use('/auth', require('./routes/auth'));

// Admin Routes (server-rendered) - NO AUTH PROTECTION
app.use('/admin/books', require('./routes/admin/adminBooks'));

// ONE-TIME MIGRATION ROUTE - Visit /admin/migrate-books to populate DB
// TODO: Comment out or delete this line after migration is complete
app.use('/admin', require('./routes/admin/migrate'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bibliotheca API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Redirect /admin to /admin/books for convenience
app.get('/admin', (req, res) => {
  res.redirect('/admin/books');
});

// Root route - serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// API endpoint to check if user is logged in
app.get('/api/auth/status', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      email: req.session.userEmail
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📚 Bibliotheca Library Management System');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/books`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
