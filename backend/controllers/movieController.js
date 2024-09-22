import movieModel from "../models/movieModel.js";
import fs from "fs";

//add movies

const addMovies = async (req, res) => {
  // Update the field names to match the multer configuration
  let poster_filename = req.files.posterImg
    ? req.files.posterImg[0].filename
    : null;
  let backdrop_filename = req.files.backdropImg
    ? req.files.backdropImg[0].filename
    : null;

  const movie = new movieModel({
    title: req.body.title,
    description: req.body.description,
    rating: req.body.rating,
    genre: req.body.genre,
    duration: req.body.duration,
    posterImg: poster_filename, // Save poster image filename
    backdropImg: backdrop_filename, // Save backdrop image filename
  });

  try {
    await movie.save();
    res.json({
      success: true,
      message: "Movie added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to add movie",
    });
  }
};

//All added movies

const listMovies = async (req, res) => {
  try {
    const movies = await movieModel.find({});
    res.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to fetch movies",
    });
  }
};

//remove added movies
const removeMovie = async (req, res) => {
  try {
    // Find the movie by ID
    const movie = await movieModel.findById(req.body.id);

    // Check if movie exists
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Remove both posterImg and backdropImg
    if (movie.posterImg) {
      fs.unlink(`uploads/${movie.posterImg}`, (err) => {
        if (err) {
          console.error("Failed to remove poster image:", err);
        }
      });
    }

    if (movie.backdropImg) {
      fs.unlink(`uploads/${movie.backdropImg}`, (err) => {
        if (err) {
          console.error("Failed to remove backdrop image:", err);
        }
      });
    }

    // Delete the movie document from the database
    await movieModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Movie removed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to remove movie",
    });
  }
};

export { addMovies, listMovies, removeMovie };
