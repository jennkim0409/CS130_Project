import express from "express";
import bcrypt from "bcrypt";

import User from "../models/user.js";

const registerRouter = express.Router();

registerRouter.post('/', async (req, res) => {
    try {
      const { username, password} = req.body

      if(!username || !password){
        res.status(400)
            .json({message: "username and password required."});
      } 

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        username: username,
        passwordHash: hashedPassword,
      });
  
      // Save the user to the database
      const saved_user = await newUser.save();

      res.status(201).json({ message: 'User registered successfully', user: saved_user});
    } catch (error) {
      if(error.message.includes('Username is already taken')){
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
  });

  export default registerRouter;

  
  