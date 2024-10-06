import express from "express";
import { getAllUsers, getBookingsOfUser, getUserByEmail, getUserDetails, googleSignIn, login, sendOtp, signup, verifyOtp } from "../controllers/user-controller.js";
import { verifyToken } from "../middleware/auth.js";


const userRouter = express.Router();

// To get the all users
userRouter.get("/", getAllUsers); //localhost:5000/user

userRouter.get("/:id", getUserDetails);

// To signup a user
userRouter.post("/signup", signup);

// login
userRouter.post("/login", login);

// To get the bookings of the user
userRouter.get("/bookings/:id", verifyToken, getBookingsOfUser);

userRouter.post("/google-signin",  googleSignIn);

// Send OTP
userRouter.post("/send-otp", sendOtp);

// Verify OTP
userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/getUserByEmail",  getUserByEmail);


export default userRouter