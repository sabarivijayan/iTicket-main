import crypto from 'crypto';

// Generate a random OTP (6 characters)
export const generateOtp = () => {
  return crypto.randomBytes(3).toString('hex');
};
