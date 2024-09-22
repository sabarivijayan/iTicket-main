import User from '../models/userModel.js';
import { generateOtp } from '../utils/otpUtils.js';
import { sendOtpEmail } from '../utils/emailUtils.js';
import { generateToken } from '../utils/jwtUtils.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register user with Google OAuth and send OTP for email verification
export const registerUser = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture: avatar } = ticket.getPayload();

    // Check if the user is already registered
    let user = await User.findOne({ googleId });

    if (user) {
      if (user.otpVerified) {
        const jwtToken = generateToken(user);
        return res.status(200).json({
          message: 'User already registered and verified, logging in...',
          token: jwtToken,
        });
      }
      return res.status(400).json({ message: 'Email not verified, please verify OTP.' });
    }

    // Generate OTP for email verification
    const otp = generateOtp();

    // Create a new user (OTP not verified yet)
    user = new User({
      googleId,
      email,
      name,
      avatar,
      otp,
      otpVerified: false,
    });

    await user.save();

    // Send OTP to user's email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'User registered successfully, OTP sent to your email.',
      userId: user._id,
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error registering user',
      details: error.message,
    });
  }
};

// Verify OTP for email verification
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp === otp) {
      user.otpVerified = true;
      user.otp = null; // Clear OTP after verification
      await user.save();

      const jwtToken = generateToken(user);
      res.status(200).json({
        message: 'OTP verified, email verification complete.',
        token: jwtToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid OTP.' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error verifying OTP',
      details: error.message,
    });
  }
};

// Login existing user
export const loginUser = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId } = ticket.getPayload();

    // Check if the user exists
    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otpVerified) {
      return res.status(400).json({ message: 'Please verify your email using the OTP.' });
    }

    const jwtToken = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error logging in',
      details: error.message,
    });
  }
};
