import jwt from 'jsonwebtoken';

/**
 * Authentication middleware to protect API routes.
 * Extracts the JWT token from the Authorization header (Bearer token)
 * and verifies it. If successful, attaches the decoded payload to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is missing. Please sign in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_sercret_key');

    // Attach decoded user information to request
    req.user = {
      userId: decoded.userId,
      githubId: decoded.githubId
    };

    next();
  } catch (error) {
    console.error('❌ Authentication middleware error:', error.message);
    return res.status(401).json({ error: 'Session has expired or is invalid. Please sign in again.' });
  }
};
