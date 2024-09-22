import express from 'express';
import {
  addShows,
  getShowById,
  listShows,
  removeShows,
} from '../controllers/showController.js';

const showRouter = express.Router();

// Add a new show with multiple showtimes, theatres, and dates
showRouter.post('/add', addShows);

// List all shows
showRouter.get('/list', listShows);

// Remove a show
showRouter.post('/remove', removeShows);

// Get a show by ID
showRouter.get('/:id', getShowById);

export default showRouter;