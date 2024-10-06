import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import movieRouter from "./routes/movieRoute.js";
import theatreRouter from "./routes/theatreRoute.js";
import showtimeRouter from "./routes/showtimeRoute.js";
import showRouter from "./routes/showRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import bookingRouter from "./routes/bookingRoute.js";


// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// DB connection
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow requests from frontend
  methods: 'GET, PUT, POST, DELETE',
  credentials: true, // Allow credentials (cookies, headers)
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// API endpoints
app.use("/api/movie", movieRouter);
app.use("/images", express.static("uploads"));
app.use("/api/theatre", theatreRouter);
app.use("/api/showtime", showtimeRouter);
app.use("/api/show", showRouter); // Use the showRouter for show-related routes
app.use("/api/admin", adminRouter); // Use adminRouter for admin routes
app.use("/api/user", userRouter);   // Use userRouter for user-related routes
app.use("/api/booking", bookingRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
