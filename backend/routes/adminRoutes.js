import express from 'express';
import { adminLogin, adminRegister } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);

adminRouter.post('/register', adminRegister); // No protection needed for registration

export default adminRouter;
