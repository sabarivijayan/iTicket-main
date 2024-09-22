import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: Object, // Store the full movie object
      required: true,
    },
    theatres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'theatre', // Reference to the theatreModel
        required: true,
      },
    ], // Allow multiple theatres
    showtimes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime', // Reference to the showtimeModel
        required: true,
      },
    ],
    dates: [
      {
        type: Date,
        required: true,
      },
    ], // Allow multiple dates
  },
  { timestamps: true }
);

const showModel = mongoose.models.Show || mongoose.model('Show', showSchema);
export default showModel;

