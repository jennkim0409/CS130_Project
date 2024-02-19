import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js"
import authenticateMiddleware from "../utils/middleware/auth.js";

const loginRouter = express.Router();

// route to get user data
loginRouter.get('/info', async (request, response) => {
	const user = await User.findOne({ username: request.user });
	response.json(user);
});

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