const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Auth middleware - Token received:', token ? 'YES' : 'NO');
    
    if (!token) {
      console.log('❌ Auth middleware - No token provided');
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Auth middleware - Token decoded successfully, userId:', decoded.userId);
    
    // Get the full user object from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('❌ Auth middleware - User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('✅ Auth middleware - User found:', user.email);
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;