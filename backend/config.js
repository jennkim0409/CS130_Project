// Defining ports here
export const PORT = 5555;

// Getting the username and password for the DB connection 
const username = process.env.DB_USER;

const password = process.env.DB_PASSWORD;
const db_host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const db_name = process.env.DB_NAME


// Connect to DB
export const mongodbURL = `mongodb://${username}:${password}@${db_host}:${port}/${db_name}`



