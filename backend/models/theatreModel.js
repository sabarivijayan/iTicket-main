import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    unavailableSeats: [
      {
        showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime' },
        bookedSeats: [String],  // Track booked seat numbers for each showtime
      },
    ],
  },
  { timestamps: true }
);

const theatreModel = mongoose.models.theatre || mongoose.model("Theatre", theatreSchema);
export default theatreModel;
