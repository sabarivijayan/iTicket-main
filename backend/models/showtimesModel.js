import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      enum: ['9:30 AM', '12:30 PM', '3:30 PM', '7:00 PM', '10:30 PM', '12:30 PM'], // Predefined showtimes
    },
  },
  { timestamps: true }
);

const showtimeModel = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);
export default showtimeModel;
