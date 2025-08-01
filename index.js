import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import router from "./routes/properties.js";
import userRouter from "./routes/user.js";
import companyPropertiesRouter from "./routes/companyproperties.js";
import privatePropertiesRouter from "./routes/privateproperties.js"; // Add this import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/logos", express.static(path.join(process.cwd(), "uploads/logos")));

// Improved MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/yourdb";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

// Connect to MongoDB before starting the server
connectDB().then(() => {
  // Routes
  app.use("/api", router);
  app.use("/api/users", userRouter);
  app.use("/api/company-properties", companyPropertiesRouter);
  app.use("/api/private-properties", privatePropertiesRouter); // Add this line

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});