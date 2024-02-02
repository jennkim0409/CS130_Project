import express from "express";
import mongoose from 'mongoose';
import { PORT, mongodbURL} from "./config.js";

const app = express();

// Passing the port and a callback function 
app.listen(PORT, () => {
    console.log(`App listening to port: ${PORT}`)
});




// DB connection
mongoose.connect(mongodbURL).then(() => {
    console.log('Connected to DB');
    app.get('/', (request,response) => {
        console.log(request)
        return response.status(250).send()
    });
    
}).catch((error) => {
    console.log(error);
});
