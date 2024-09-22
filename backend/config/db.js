import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://mekryptic:kryptichere@cluster0.ypwiy.mongodb.net/movieDataBooking?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(() => {
      console.log("MongoDB Connected...");
    });
};
