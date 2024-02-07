import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js"

const loginRouter = express.Router()

// route to get user data
loginRouter.get('/', async (request, response) => {
	const users = await User.find({})
	response.json(users)
})

loginRouter.post('/', async (request, response) => {
    // picking username and password from request body
    const { request_username, request_password } = request.body

    // find the user 
    const user = await User.findOne({ username: request_username })

    // check password if user is found 
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(request_password, user.passwordHash)

    // if password is incorrect or the user was not found then return invalid credentials
    if ((!user || !passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }


    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 })

    response
        .status(200)
        .send({ token, username: user.username, name: user.name, genrePrefs: user.genrePrefs })
})

export default loginRouter