import express from "express";
import {
  addMovies,
  listMovies,
  removeMovie,
} from "../controllers/movieController.js";
import multer from "multer";


const movieRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
  destination: "uploads", // Folder to save images
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Handling multiple image uploads
movieRouter.post(
  "/add",
  upload.fields([
    { name: "posterImg", maxCount: 1 },
    { name: "backdropImg", maxCount: 1 },
  ]),
  addMovies
);

movieRouter.get("/list", listMovies);

movieRouter.post("/remove", removeMovie);

export default movieRouter;
