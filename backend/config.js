// Defining ports here
export const PORT = 5555;

// Getting the username and password for the DB connection 
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// Connect to DB
export const mongodbURL = `mongodb+srv://${username}:${password}@book-pins-db.b5atqpl.mongodb.net/?retryWrites=true&w=majority`

