const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    const decoded = jwt.verify(tokenValue, JWT_SECRET);
    req.user = decoded;
    // Add this line to ensure backward compatibility
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

// Check if user has admin role
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Require Admin Role!" });
  }
};

// Check if user has delivery role
exports.isDelivery = (req, res, next) => {
  if (req.user && req.user.role === 'delivery') {
    next();
  } else {
    res.status(403).json({ message: "Require Delivery Role!" });
  }
};
