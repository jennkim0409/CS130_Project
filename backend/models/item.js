
import mongoose from "mongoose";
const { Schema } = mongoose;

// id handled automatically
const itemSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    ordering_id: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    pin_size: {
      type: String
    },
    quote: {
      type: String
    },
    text_color: {
      type: String
    },
    img_blob: {
      type: String
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