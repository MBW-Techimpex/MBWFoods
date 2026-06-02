const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');

const auditLogger = async (req, res, next) => {
  // Only log state-changing operations
  if (req.method !== 'GET' && req.cookies.token) {
    const originalJson = res.json;
    
    // Attempt to identify the admin if req.admin not yet set by auth middleware
    let adminId = req.admin ? req.admin.id : null;
    if (!adminId && req.cookies.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'supersecretkey');
        adminId = decoded.id;
      } catch (e) {}
    }

    // Capture the response logic
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const url = req.originalUrl;
          let module = 'general';
          if (url.includes('/api/products')) module = 'products';
          else if (url.includes('/api/orders')) module = 'orders';
          else if (url.includes('/api/settings')) module = 'settings';
          else if (url.includes('/api/auth')) module = 'auth';

          let actionType = `${req.method.toLowerCase()}_${module}`;
          if (url.includes('/login')) actionType = 'login';
          if (url.includes('/logout')) actionType = 'logout';

          // Fire and forget, but handle error to prevent crashing main process
          ActivityLog.create({
            admin_id: adminId,
            action_type: actionType,
            module: module,
            details: {
              method: req.method,
              url: url,
              responseStatus: res.statusCode
            },
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }).catch(err => {
            console.error('[Audit Logger] Background failure (Server state preserved):', err.message);
          });
        } catch (err) {
          console.error('[Audit Logger] Synchronous failure:', err);
        }
      }
      return originalJson.apply(res, arguments);
    };
  }
  next();
};

module.exports = auditLogger;
