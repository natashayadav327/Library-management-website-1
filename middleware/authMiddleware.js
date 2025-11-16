/**
 * Authentication Middleware
 * Protects routes requiring user authentication
 */

/**
 * Ensure user is authenticated
 * Checks if user has an active session
 * Redirects to login page if not authenticated
 */
exports.ensureAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    // User is authenticated, proceed
    return next();
  }
  
  // Remember the original URL to redirect after login
  req.session.returnTo = req.originalUrl || '/admin';
  
  // User is not authenticated, redirect to login
  res.redirect('/auth/login');
};

/**
 * Redirect to admin if already authenticated
 * Useful for login/signup pages
 */
exports.redirectIfAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Already logged in, redirect to admin
    return res.redirect('/admin/books');
  }
  
  // Not logged in, proceed to login/signup page
  next();
};
