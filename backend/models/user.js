import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: 'Username is already taken',
        },
        name: String,
        email: String,
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
	}
})

const User = mongoose.model('User', userSchema)

export default User