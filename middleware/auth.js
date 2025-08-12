const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("🔍 Decoded JWT:", decoded); // see the payload shape

    
    // Normalize so req.user.id always exists
    req.user = { id: decoded.id || decoded._id || decoded.user?.id };

    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload: no user id' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { auth };
