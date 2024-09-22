import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  movieName: { type: String, required: true },
  theatreName: { type: String, required: true },
  showtime: { type: String, required: true },
  date: { type: Date, required: true },
  bookedSeats: { type: [String], required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  userId: { type: String },
}, { timestamps: true });

const bookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default bookingModel;
