const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Fallback to cookie if no header provided
  if (!token && req.cookies) {
    token = req.cookies.customer_token;
    if (token) console.log('[AUTH] Token found in customer_token cookie');
  }

  if (!token) {
    console.warn('[AUTH] No token detected in headers or cookies');
    req.user = null; // Important for guest support
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey', (err, user) => {
    if (err) {
      console.error('[AUTH] JWT Verification Error:', err.message);
      req.user = null;
      return next();
    }
    console.log('[AUTH] User authenticated successfully:', user.id);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
