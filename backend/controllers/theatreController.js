import theatreModel from "../models/theatreModel.js";


//add theatres

const addTheatres = async (req, res) => {

  const theatre = new theatreModel({
    name: req.body.name,
    location: req.body.location,
    capacity: req.body.capacity,
  });

  try {
    await theatre.save();
    res.json({
      success: true,
      message: "Theatre added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to add theatre",
    });
  }
};

//All added theatres

const listTheatres = async (req, res) => {
  try {
    const theatres = await theatreModel.find({});
    res.json({
      success: true,
      data: theatres,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed to fetch theatres",
    });
  }
};

//remove added theatres
const removeTheatres = async (req, res) => {
  try {
    // Find the theatres by ID
    const theatre = await theatreModel.findById(req.body.id);

    // Check if theatre exists
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }

    // Delete the theatre document from the database
    await theatreModel.findByIdAndDelete(req.body.id);

    res.json({
      success: true,
      message: "Theatre removed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Theatre to remove movie",
    });
  }
};

export { addTheatres, listTheatres, removeTheatres };
