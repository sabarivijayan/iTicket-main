import express from "express";
import { getAllUsers, getBookingsOfUser, getUserByEmail, getUserDetails, googleSignIn, login, signup, verifyOtp } from "../controllers/userController.js";

const 
userRouter = express.Router();

// To get the all users
userRouter.get("/", getAllUsers); //localhost:5000/user

userRouter.get("/:id", getUserDetails);

// To signup a user
userRouter.post("/signup", signup);

// login
userRouter.post("/login", login);

// To get the bookings of the user
userRouter.get("/bookings/:id", getBookingsOfUser);

userRouter.post("/google-signin",  googleSignIn);

// Verify OTP
userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/getUserByEmail",  getUserByEmail);


export default userRouter;