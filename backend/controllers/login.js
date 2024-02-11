import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js"
import authenticateMiddleware from "../utils/middleware/auth.js";

const loginRouter = express.Router();

// route to get user data
loginRouter.get('/info', authenticateMiddleware, async (request, response) => {
    console.log(request.user);
	const user = await User.findOne({ username: request.user });
	response.json(user);
});

loginRouter.post('/', async (request, response) => {
    // picking username and password from request body
    const { username, password } = request.body;
    console.log(password)

    // find the user 
    const user = await User.findOne({ username: username });

    console.log(user.passwordHash)

    // check password if user is found 
    const passwordCorrect = user === null
        ? false
        : bcrypt.compare(password, user.passwordHash);

    // if password is incorrect or the user was not found then return invalid credentials
    if ((!user || !passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }


    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 })

    response
        .status(200)
        .send({ 
            token, 
            username: user.username, 
            name: user.name, 
            genrePrefs: user.genrePrefs,
         });
});

export default loginRouter;