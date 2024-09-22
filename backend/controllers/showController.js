import showModel from "../models/showModel.js";
import movieModel from "../models/movieModel.js";
import theatreModel from "../models/theatreModel.js";
import showtimeModel from "../models/showtimesModel.js";

// Add a show
const addShows = async (req, res) => {
  try {
    const { movieId, theatreIds, showtimeIds, dates } = req.body;

    // Fetch the movie details
    const movie = await movieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Fetch all theatres and showtimes
    const theatres = await theatreModel.find({ _id: { $in: theatreIds } });
    const showtimes = await showtimeModel.find({ _id: { $in: showtimeIds } });

    if (theatres.length !== theatreIds.length || showtimes.length !== showtimeIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some theatres or showtimes not found",
      });
    }

    // Save the show with multiple theatres and dates
    const show = new showModel({
      movie, // Save the entire movie object
      theatres: theatreIds,
      showtimes: showtimeIds,
      dates: dates.map(date => new Date(date)), // Convert each date to Date object
    });

    await show.save();
    res.json({
      success: true,
      message: "Show added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to add show",
    });
  }
};

// List all shows with populated movie, theatres, and showtime information
const listShows = async (req, res) => {
  try {
    const shows = await showModel
      .find({})
      .populate('movie', 'title posterImg backdropImg genre description rating duration') // Populate movie title and posterImg
      .populate('theatres', 'name location capacity') // Populate all theatres
      .populate('showtimes', 'time'); // Populate all showtimes

    res.json({
      success: true,
      data: shows,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to fetch shows",
    });
  }
};

// Remove a show
const removeShows = async (req, res) => {
  try {
    const show = await showModel.findById(req.body.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    await showModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Show removed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to remove show",
    });
  }
};

// Get a single show with populated movie, theatres, and showtimes information
const getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    const show = await showModel
      .findById(id)
      .populate('movie', 'title posterImg backdropImg genre description rating duration')
      .populate('theatres', 'name location')
      .populate('showtimes', 'time');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    res.json({
      success: true,
      data: show,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch show details',
    });
  }
};

export { addShows, listShows, removeShows, getShowById };
