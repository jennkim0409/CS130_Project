
import mongoose from "mongoose";
const { Schema } = mongoose;

// TO DO: update Book schema so that we can add a Board object to it (optional)

// id handled automatically
const boardSchema = new Schema({
    bookTitle: { // for exploring other users' boards for a particular book
        type: String,
        required: true
    },
    bookAuthor: { // for exploring other users' boards for a particular book
        type: String,
        required: true
    },
    items:
        [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
        }]
  });

boardSchema.set('toJSON', {
	transform: (document, returnedObject)=>{
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
    return returnedObject
	}
})

const Board = mongoose.model('Board', boardSchema);
export default Board;