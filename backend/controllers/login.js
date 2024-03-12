import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js"
import authenticateMiddleware from "../utils/middleware/auth.js";

/** Express router providing Login related routes
 * @module routers/login
 * @requires express
 */

/**
 * Express router to mount Login related functions on
 * @type {object}
 * @const
 * @namespace loginRouter
 */
const loginRouter = express.Router();

/**
 * Route for getting user data.
 * @name POST /getInfo
 * @function
 * @memberof module:routers/login~loginRouter
 * @inner
 * @returns {object} 201 - User object
 */
loginRouter.get('/info', async (request, response) => {
	const user = await User.findOne({ username: request.user });
	response.json(user);
});

/**
 * Route for user login.
 * @name POST /
 * @function
 * @memberof module:routers/login~loginRouter
 * @inner
 * @param {string} username - Username of the user (required)
 * @param {string} password - Password of the user (required)
 * @returns {object} 200 - Token, username, user_id, name, and genrePrefs of the user
 * @returns {Error} 401 - Invalid username or password
 * @returns {Error} 500 - Internal server error
 */
loginRouter.post('/', async (request, response) => {
    // picking username and password from request body
    const { username, password } = request.body;

    // find the user 
    const user = await User.findOne({ username: username });

    // check password if user is found 
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    // if password is incorrect or the user was not found then return invalid credentials
    if (!user) {
        return response.status(401).json({
            message: 'Invalid username',
            error: 'Invalid username'
        });
    }

    if ( !passwordCorrect) {
        return response.status(401).json({
            message: 'Invalid password',
            error: 'Invalid password'
        });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const SECRET = "hello"
    const token = jwt.sign(userForToken, SECRET, { expiresIn: 60 * 60 })

    response
        .status(200)
        .send({ 
            token, 
            username: user.username,
            user_id: user._id, 
            name: user.name, 
            genrePrefs: user.genrePrefs,
         });
});

export default loginRouter;