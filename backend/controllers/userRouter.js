import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";

/** Express router providing User related routes
 * @module routers/user
 * @requires express
 */

/**
 * Express router to mount User related functions on
 * @type {object}
 * @const
 * @namespace userRouter
 */
const userRouter = express.Router();

/**
 * Route to add a set of genres and name.
 * @name PATCH /set/:user_id
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} user_id - ID of the user
 * @param {string} [name] - Name of the user (optional)
 * @param {Array<string>} [genrePrefs] - Array of genre preferences to add (optional)
 * @returns {object} 201 - Message and updated user object
 */
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

/**
 * Route to delete a set of genres.
 * @name PATCH /delete-genres/:user_id
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} user_id - ID of the user
 * @param {Array<string>} genresToDelete - Array of genre preferences to delete
 * @returns {object} 201 - Message and updated user object
 */
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

/**
 * Route to reset user password.
 * @name PATCH /resetpass/:user_id
 * @function
 * @memberof module:routers/user~userRouter
 * @inner
 * @param {string} user_id - ID of the user
 * @param {string} currentPassword - Current password of the user
 * @param {string} newPassword - New password for the user
 * @param {string} re_newPassword - Re-entered new password for the user
 * @returns {object} 201 - Message and updated user object
 * @returns {Error} 400 - User ID, current password, new password, and re-entered new password are required
 * @returns {Error} 401 - Invalid current password or passwords do not match
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 */
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