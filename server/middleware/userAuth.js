const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
  let token;

  // Check if an authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Try to extract and verify the token
    try {
      token = req.headers.authorization.split(' ')[1]; // Extract the token from the header
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      req.user = decoded; // Attach user data to the request object
      next(); // Proceed to the next middleware
    } catch (error) {
      // Handle errors related to token verification (such as expiration or tampering)
      console.error('Not authorized, token failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // Handle cases where no token is present
    res.status(401).json({ message: 'No token provided, authorization denied' });
  }
};

module.exports = userAuth