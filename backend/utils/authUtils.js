import User from '../models/userModel.js';

// Check if user exists and is OTP verified
export const isUserVerified = async (googleId) => {
  try {
    const user = await User.findOne({ googleId });
    if (user && user.otpVerified) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error('Error checking user verification status');
  }
};
