import { Router } from 'express';
import { registerUser, verifyOtp, loginUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = Router();

// Register a new user via Google OAuth
userRouter.post('/register', registerUser);

// Verify OTP and generate JWT token
userRouter.post('/verify-otp', verifyOtp);

// Login an existing user and generate JWT token
userRouter.post('/login', loginUser);

// Example of a protected route using JWT authentication
userRouter.get('/protected-route', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'You have access to this protected route', user: req.user });
});

export default userRouter;
