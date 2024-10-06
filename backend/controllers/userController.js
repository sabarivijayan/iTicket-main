import Bookings from '../models/bookingModel.js';
import Users from '../models/userModel.js'; // Ensure this import is correct
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library';


const client = new OAuth2Client('426768408989-ebem9qoce769fkr8e1hdhj70oomthfft.apps.googleusercontent.com');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'
// *****************To get all the users********************
export const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await Users.find(); 
  } catch (err) {
    return console.log(err);
  }

  if (!users) {
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
  return res.status(200).json({ users });
};


// ***************User sign-Up***************************
export const signup = async (req, res, next) => {
  const { phone, email, password } = req.body;

  if (!phone || phone.trim() === "" || !email || email.trim() === "" || !password || password.trim() === "") {
    return res.status(422).json({ message: "Please fill in all fields" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  let user;

  try {
    user = new Users({ phone, email, password: hashedPassword });
    user = await user.save();

    // Generate OTP and send it via email
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });
    const otpExpiry = Date.now() + 4 * 60 * 1000;

    // Update the user with OTP and expiry
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send the OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP FOR SIGNUP',
      text: `Your OTP for signup is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

  } catch (err) {
    return res.status(500).json({ message: "Unexpected error occurred" });
  }

  return res.status(201).json({ message: "Signup successful. Please verify OTP sent to your email." });
};



// ******************for the user login***********************
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "" || !password || password.trim() === "") {
    return res.status(422).json({ message: "Please enter both email and password" });
  }

  let existingUser;
  try {
    existingUser = await Users.findOne({ email });
  } catch (err) {
    return console.log(err);
  }

  if (!existingUser) {
    return res.status(404).json({ message: "Unable to find user from this email" });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate a token and include it in the response
  const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({ 
    message: "Login success",
    token, // Include token in response
    userId: existingUser._id 
  });
};


//  *********************to get the bookings of the user***********************
export const getBookingsOfUser = async (req, res, next) => {
  const id = req.params.id;
  let bookings;
  try {
    bookings = await Bookings.find({ userId: id });
  } catch (err) {
    return console.log(err);
  }
  if (!bookings) {
    return res.status(500).json({ message: "No bookings found for this user" });
  }
  return res.status(200).json({ bookings });
};


export const googleSignIn = async (req, res, next) => {
  const { token } = req.body;

  if (!token || token.trim() === "") {
    return res.status(422).json({ message: "Google token is required" });
  }

  try {
    console.log("Received Google Token:", token); // Log the token

    // Verify the token using Google OAuth client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this is correctly set
    });

    // Log the payload from the ticket
    const { email, name, picture, sub: googleId } = ticket.getPayload();
    console.log("Ticket Payload:", { email, name, picture, googleId });

    // Check if user exists in the database
    let user = await Users.findOne({ email });

    if (!user) {
      // User does not exist, create a new user and send OTP
      const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });
      const otpExpiry = Date.now() + 4 * 60 * 1000; // OTP valid for 4 minutes

      user = new Users({
        email,
        name,
        picture,
        otp,
        otpExpiry,
        isGoogleUser: true,  // Set flag for Google user
        googleId,
        isVerified: false,
      });
      await user.save();

      console.log("New Google User Saved:", user);
      // Send OTP to email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP FOR GOOGLE SIGN-UP',
        text: `Your OTP for verification is: ${otp}. This OTP is valid for 4 minutes.`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "OTP sent successfully. Please verify to complete signup." });
    }

    // Existing user and is verified
    if (user.isVerified) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: { email: user.email, userId: user._id, name: user.name, picture: user.picture },
      });
    }

    // User exists but not verified
    return res.status(403).json({ message: "Please verify your OTP to complete the sign-up process." });

  } catch (error) {
    console.error("Error during Google Sign-In:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Server error", error });
  }  
};



// ***********************To get the Logged-in User details*****************
export const getUserDetails = async (req, res) => {
  try {
    const user = await Users.find({_id:req.params.id});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user[0]);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(422).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiry) {
      // Clear OTP if invalid or expired
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields after successful verification
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;  // Mark the user as verified
    await user.save();

    // Generate a JWT token or handle login session
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ success: true, token, userId: user._id });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Error verifying OTP", error });
  }
};




// **************to get the userid of the loggedin user from google login***************
export const getUserByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email in the database
    const user = await Users.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Send back the user ID if found
    res.status(200).json({ userId: user._id });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};