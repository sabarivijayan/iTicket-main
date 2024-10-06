import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    posterImg: {
        type: String,
        required: true
    },
    backdropImg: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    genre: {
        type: [String], // You can store multiple genres as an array of strings
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
  },
  { timestamps: true }
);

const movieModel = mongoose.models.movie || mongoose.model("Movie", movieSchema);
export default movieModel;