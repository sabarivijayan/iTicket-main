import express from "express";
import {
  addTheatres,
  listTheatres,
  removeTheatres,
} from "../controllers/theatreController.js";

const theatreRouter = express.Router();

// Handling multiple image uploads
theatreRouter.post("/add", addTheatres);

theatreRouter.get("/list", listTheatres);

theatreRouter.post("/remove", removeTheatres);

export default theatreRouter;
