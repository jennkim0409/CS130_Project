import express from "express";
import mongoose from 'mongoose';
import cors from "cors"

import { PORT, mongodbURL } from "./config.js";
import loginRouter from "./controllers/login.js"
import registerRouter from "./controllers/registration.js"
import handlebooksRouter from "./controllers/handle_books.js";
// import fetchBookInfoRouter from "./controllers/fetchBookInfo.js";
import authenticateMiddleware from "./utils/middleware/auth.js";

const app = express();

// DB connection

mongoose.connect(mongodbURL)
    .then(() => {
        console.log('Connected to DB');
        app.get('/', (request, response) => {
            console.log(request)
            return response.status(250).send()
        });
    }).catch((error) => {
        console.log(error);
    });

app.use(cors());
app.use(express.json());
app.use('/api/*', authenticateMiddleware);
//app.use('/api/login/userdata',loginRouter)
app.use('/api/handlebooks', handlebooksRouter);
// app.use('/api/fetchbook', fetchBookInfoRouter);
app.use('/auth/register', registerRouter)
app.use('/auth/login', loginRouter)


// Passing the port and a callback function 
app.listen(PORT, () => {
    console.log(`App listening to port: ${PORT}`)
});