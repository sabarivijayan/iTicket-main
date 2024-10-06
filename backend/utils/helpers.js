import jwt from "jsonwebtoken";

// Generate OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, googleId: user.googleId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
