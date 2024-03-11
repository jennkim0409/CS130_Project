import express from "express";
// import mongoose from 'mongoose';
import cors from "cors"

import connectDB from "./mongoDB.js"
import { PORT, mongodbURL } from "./config.js";
import loginRouter from "./controllers/login.js"
import boardRouter from "./controllers/board.js"
import registerRouter from "./controllers/registration.js"
import userRouter from "./controllers/userRouter.js"
import handlebooksRouter from "./controllers/handle_books.js";
// import fetchBookInfoRouter from "./controllers/fetchBookInfo.js";
import authenticateMiddleware from "./utils/middleware/auth.js";
import recommendationRouter from "./controllers/recommendationRouter.js";

const app = express();

// DB connection

connectDB(mongodbURL);

// mongoose.connect(mongodbURL)
//     .then(() => {
//         console.log('Connected to DB');
//         app.get('/', (request, response) => {
//             console.log(request)
//             return response.status(250).send()
//         });
//     }).catch((error) => {
//         console.log(error);
//     });

app.use(cors());
app.use(express.json());
app.use('/api/*', authenticateMiddleware);
app.use('/api/user', userRouter);
app.use('/api/handlebooks', handlebooksRouter);
app.use('/api/recommend', recommendationRouter);
app.use('/auth/register', registerRouter)
app.use('/auth/login', loginRouter)
app.use('/api/board', boardRouter);


// Passing the port and a callback function 
app.listen(PORT, () => {
    console.log(`App listening to port: ${PORT}`)
});

export default app;