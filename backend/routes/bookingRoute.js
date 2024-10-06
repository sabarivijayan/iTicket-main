import express from 'express';
import { placeBooking, handlePaymentSuccess, listBookings } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/auth.js';

const bookingRouter = express.Router();

// Routes
bookingRouter.post('/place', verifyToken,placeBooking);
bookingRouter.post('/payment-success', verifyToken, handlePaymentSuccess);
bookingRouter.get('/list', listBookings);

export default bookingRouter;
