import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema } = mongoose;


// Template for defining schema 
// ID is handled by the DB automatically
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        name: String,
        passwordHash: String,
        genrePrefs: [{
            type: String
        }]
    }
);

userSchema.plugin(uniqueValidator)
userSchema.set('toJSON', {
	transform: (document, returnedObject)=>{
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		delete returnedObject.passwordHash
        return returnedObject
	}
})

const User = mongoose.model('User', userSchema)

export default User