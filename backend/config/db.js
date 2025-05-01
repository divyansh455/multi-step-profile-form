// backend/config/db.js
// Handles MongoDB connection using Mongoose

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Options to avoid deprecation warnings (check Mongoose docs for latest)
      useUnifiedTopology: true,
      useNewUrlParser: true,
      // useCreateIndex: true, // May not be needed in newer Mongoose versions
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any connection errors and exit the process
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with a failure code
  }
};

export default connectDB;
