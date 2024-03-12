import express from "express";
import cors from "cors";

import { PORT } from "./config.js";
import loginRouter from "./controllers/login.js";
import boardRouter from "./controllers/board.js";
import registerRouter from "./controllers/registration.js";
import userRouter from "./controllers/userRouter.js";
import handlebooksRouter from "./controllers/handle_books.js";
// import fetchBookInfoRouter from "./controllers/fetchBookInfo.js";
import authenticateMiddleware from "./utils/middleware/auth.js";
import recommendationRouter from "./controllers/recommendationRouter.js";
import {
  closeDatabaseConnection,
  connectToDatabase,
  connectToTestDatabase,
} from "./db.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/*", authenticateMiddleware);
app.use("/auth/login/info", authenticateMiddleware);
app.use("/api/user", userRouter);
app.use("/api/handlebooks", handlebooksRouter);
app.use("/api/recommend", recommendationRouter);
app.use("/auth/register", registerRouter);
app.use("/auth/login", loginRouter);
app.use("/api/board", boardRouter);

if (process.env.NODE_ENV !== "test") {
  connectToDatabase();
}

if (process.env.NODE_ENV === "test") {
  connectToTestDatabase();
}

// Close the database connection when the application is shutting down
process.on("SIGINT", () => {
  closeDatabaseConnection();
  process.exit(0);
});

export const server = app.listen(PORT, () => {
  console.log(`App listening to port: ${PORT}`);
});