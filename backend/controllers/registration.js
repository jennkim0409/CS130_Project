import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import Bookshelf from "../models/bookshelf.js";

/** Express router providing Register related routes
 * @module routers/register
 * @requires express
 */

/**
 * Express router to mount Register related functions on
 * @type {object}
 * @const
 * @namespace registerRouter
 */
const registerRouter = express.Router();

/**
 * Route for user registration.
 * @name POST /
 * @function
 * @memberof module:routers/register~registerRouter
 * @inner
 * @param {string} username - Username of the user (required)
 * @param {string} password - Password of the user (required)
 * @returns {object} 201 - Message, user object, and token
 * @returns {Error} 400 - Username and password required
 * @returns {Error} 400 - Username is already taken
 * @returns {Error} 500 - Internal server error
 */
registerRouter.post('/', async (req, res) => {
    try {
      const { username, password} = req.body

      if(!username || !password){
        return res.status(400)
            .json({message: "username and password required."});
      } 

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        username: username,
        passwordHash: hashedPassword,
      });
  
      // Save the user to the database
      const saved_user = await newUser.save();
      //Create a token for the user 
      const userForToken = {
        username: saved_user.username,
        id: saved_user._id,
        }
      const SECRET = "hello"
      const token = jwt.sign(userForToken, SECRET, { expiresIn: 60 * 60 })
      
      // Create the three bookshelves for the user
      const bookshelfTypes = ['current', 'finished', 'recommended'];
      const bookshelfPromises = bookshelfTypes.map(type => 
        new Bookshelf({
          userId: saved_user._id, // Assuming you want to use the MongoDB generated _id
          type,
          books: []
        }).save()
      );

      // Wait for all bookshelves to be created
      await Promise.all(bookshelfPromises);

      return res.status(201).json({ message: 'User registered successfully', user: saved_user, token: token});
    } catch (error) {
      if(error.message.includes('Username is already taken')){
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });

  export default registerRouter;

  
  