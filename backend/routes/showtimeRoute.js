import express from "express";
import {
  addShowtimes,
  listShowtimes,
  removeShowtimes,
} from "../controllers/showtimeController.js";


const showtimeRouter = express.Router();

showtimeRouter.post("/add", addShowtimes);

showtimeRouter.get("/list", listShowtimes);

showtimeRouter.post("/remove", removeShowtimes);

export default showtimeRouter;
