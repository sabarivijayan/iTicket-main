import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret_key';

// Generate JWT token for the user
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      googleId: user.googleId,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
