import Bookings from "../models/bookingModel.js";
import Users from "../models/userModel.js"; // Ensure this import is correct
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use a strong secret key

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

export const signup = async (req, res, next) => {
  const { phone, email, password } = req.body;

  // Validate input fields
  if (
    !phone ||
    phone.trim() === "" ||
    !email ||
    email.trim() === "" ||
    !password ||
    password.trim() === ""
  ) {
    return res.status(422).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(422)
      .json({ message: "Please enter a valid email address" });
  }

  if (password.length < 6) {
    return res
      .status(422)
      .json({ message: "Password must be at least 6 characters long" });
  }

  if (phone.length < 10 || phone.length > 15) {
    return res
      .status(422)
      .json({ message: "Please enter a valid phone number" });
  }

  const hashedPassword = bcrypt.hashSync(password);
  let user;
  try {
    user = new Users({
      phone,
      email,
      password: hashedPassword,
    });
    user = await user.save();
  } catch (err) {
    return console.log(err);
  }
  if (!user) {
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
  return res.status(201).json({ id: user._id });
};

// ******************User login & Token generation***********************
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "" || !password || password.trim() === "") {
    return res
      .status(422)
      .json({ message: "Please enter both email and password" });
  }

  let existingUser;
  try {
    existingUser = await Users.findOne({ email });
  } catch (err) {
    return console.log(err);
  }

  if (!existingUser) {
    return res
      .status(404)
      .json({ message: "Unable to find user with this email" });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: existingUser._id, email: existingUser.email },
    JWT_SECRET,
    {
      expiresIn: "1h", // Token valid for 1 hour
    }
  );

  return res.status(200).json({ message: "Login success", token });
};
// ***************** To send OTP for email verification ********************
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiry
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiry = Date.now() + 4 * 60 * 1000; // 4 minutes expiry

    // Save OTP to user's record
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    await existingUser.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "OTP FOR LOGIN",
      text: `Hi,\n\nPlease use the following OTP to verify your Login\n\nOTP: ${otp}`,
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);

    // Send successful response after email is sent
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error sending OTP" });
    }
  }
};

// ********************Verify OTP & Generate Token***********************
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

    if (user.otp !== otp || Date.now() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token upon successful OTP verification
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h", // Token valid for 1 hour
    });

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const googleSignIn = async (req, res, next) => {
  const { email } = req.body;

  if (!email || email.trim() === "") {
    console.log("Email is missing or empty");
    return res.status(422).json({ message: "Email is required" });
  }

  try {
    console.log("Searching for user with email:", email);
    // Check if a user with this email exists
    const user = await Users.findOne({ email });

    if (user) {
      console.log("User found with ID:", user._id);
      // User exists, return the user ID
      return res.status(200).json({ userId: user._id });
    } else {
      console.log("User not found with email:", email);
      // User does not exist
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await Users.find({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ***************** Protect Routes with verifyToken middleware ***********
export const getBookingsOfUser = async (req, res, next) => {
  const id = req.user.id; // Extract user ID from the verified token
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