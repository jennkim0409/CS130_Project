
import mongoose from "mongoose";
const { Schema } = mongoose;

// id handled automatically
const itemSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['text', 'image']
    },
    data: {
        type: String, // both text & images stored as strings
        required: true
    }
  });

itemSchema.set('toJSON', {
	transform: (document, returnedObject)=>{
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
    return returnedObject
	}
})

const Item = mongoose.model('Item', itemSchema);
export default Item;