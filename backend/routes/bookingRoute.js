import express from 'express';
import { placeBooking, handlePaymentSuccess, listBookings } from '../controllers/bookingController.js';

const bookingRouter = express.Router();

// Routes
bookingRouter.post('/place', placeBooking);
bookingRouter.post('/payment-success', handlePaymentSuccess);
bookingRouter.get('/list', listBookings);

export default bookingRouter;
