import showtimeModel from "../models/showtimesModel.js";



//add showtimes

const addShowtimes = async (req, res) => {

  const showtime = new showtimeModel({
    time: req.body.time
  });

  try {
    await showtime.save();
    res.json({
      success: true,
      message: "Showtime added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to add showtime",
    });
  }
};

//All added showtimes

const listShowtimes = async (req, res) => {
  try {
    const showtimes = await showtimeModel.find({});
    res.json({
      success: true,
      data: showtimes,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to fetch showtimes",
    });
  }
};

//remove added showtimes
const removeShowtimes = async (req, res) => {
  try {
    // Find the showtimes by ID
    const showtime = await showtimeModel.findById(req.body.id);

    // Check if showtimes exists
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime not found",
      });
    }

    // Delete the showtime document from the database
    await showtimeModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Showtime removed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Showtime to remove movie",
    });
  }
};

export { addShowtimes, listShowtimes, removeShowtimes };
