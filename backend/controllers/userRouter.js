import express from "express";
import User from "../models/user.js";

const userRouter = express.Router();

// route to add a set of genres and name 
userRouter.patch("/set/:user_id", async (request, response) => {
    const user_id = request.params.user_id
    const { name, genrePrefs } = request.body;
    let updateObject = {};

    // For the first time when name is provided 
    if (name) {
        updateObject.name = name;
    }

    if (genrePrefs && genrePrefs.length > 0) {
        updateObject.$addToSet = { genrePrefs: { $each: genrePrefs } };
    }
    
    const user = await User.findOneAndUpdate(
        { _id: user_id }, 
        updateObject,
        { new: true, runValidators: true }
    );
    
    response.status(201).json({ message: 'User Prefs added successfully', user});
})

// route to delete a set of genres
userRouter.patch("/delete-genres/:user_id", async (request, response) => {
    const user_id = request.params.user_id;
    const { genresToDelete } = request.body;
    // console.log(genresToDelete)
    
    const user = await User.findOneAndUpdate(
        { _id: user_id }, 
        { $pullAll: { 
            "genrePrefs": genresToDelete 
            } 
        },
        { new: true, runValidators: true }
    );
    
    response.status(201).json({ message: 'Genres deleted successfully', user });
});

export default userRouter;