import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: function() {
      return !this.isGoogleUser; // Phone required only for non-Google users
    },
  },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser; // Password required only for non-Google users
    },
    minLength: 6,
  },
  Bookings: [{ type: mongoose.Types.ObjectId, ref: 'Booking' }],
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isGoogleUser: {
    type: Boolean,
    default: false, // Flag to indicate Google sign-in
  },
  googleId: {
    type: String, // To store Google user ID
  },
});

export default mongoose.model('User', userSchema);
