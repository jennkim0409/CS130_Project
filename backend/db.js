import mongoose from "mongoose";
import { mongodbURL, mongoTestDbURL} from "./config.js";

export async function connectToDatabase() {
  try {
    await mongoose.connect(mongodbURL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if unable to connect to the database
  }
}

export async function connectToTestDatabase() {
  try {
    await mongoose.connect(mongoTestDbURL);
    console.log("Connected to Test MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if unable to connect to the database
  }
}

export function closeDatabaseConnection() {
  mongoose.connection.close();
  console.log("Disconnected from MongoDB");
}