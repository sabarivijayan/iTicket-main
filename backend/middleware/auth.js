import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Ensure you set this in your environment variables

// Middleware to verify the token
export const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header (Bearer <token>)
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    // Verify the token using the secret
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach the user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
