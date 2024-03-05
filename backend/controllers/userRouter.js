import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";

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

userRouter.patch("/resetpass/:user_id", async (request, response) => {
    const user_id = request.params.user_id
    const { currentPassword, newPassword, re_newPassword} = request.body

    try {
        if(!user_id || !currentPassword|| !newPassword || !re_newPassword){
            return response.status(400)
                .json({message: "user ID, current password, new password and re-entered new password are required"});
          }
    
        const user = await User.findOne({ _id: user_id });

        if(!user){
            return response.status(404).json({message: "User not found"});
        }
        
        const passwordCorrect = user === null
          ? false
          : await bcrypt.compare(currentPassword, user.passwordHash);

        if(!passwordCorrect){
            return response.status(401).json({
                message: 'Entered Invalid Current Password',
                error: 'Invalid password'
            });
        }

        const matchPasswords = newPassword == re_newPassword

        if(!matchPasswords){
            return response.status(401).json({ 
                message: 'Passwords do not match', 
                error: 'Passwords do not match'
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updated_user = await User.findOneAndUpdate(
                    { _id: user_id},
                    { $set: {passwordHash: hashedPassword}},
                    {new: true}
            );

        return response.status(201).json({ message: 'Changed Password Successfully', updated_user});
    } catch(error){
        console.log(error)
        return response.status(500).json({message: "Server Error"})
    }
    
})

export default userRouter;