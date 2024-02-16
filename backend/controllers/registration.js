import express from "express";
import bcrypt from "bcrypt";

import User from "../models/user.js";
import Bookshelf from "../models/bookshelf.js";

const registerRouter = express.Router();

registerRouter.post('/', async (req, res) => {
    try {
      const { username, password, email} = req.body

      if(!username || !password || !email){
        res.status(400)
            .json({message: "username, password and name are required."});
      }

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        username: username,
        passwordHash: hashedPassword,
        email: email
      });
  
      // Save the user to the database
      const saved_user = await newUser.save();
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

      res.status(201).json({ message: 'User registered successfully', user: saved_user});
    } catch (error) {
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });

  export default registerRouter;

  
  