import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password:{
    type: String,
    required: true,
    minLength: 6,
  },
  Bookings:[{type: mongoose.Types.ObjectId, ref:"Booking"}],
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('User', userSchema);