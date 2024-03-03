import mongoose from "mongoose";
const { Schema } = mongoose;


const bookshelfSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['current', 'finished', 'recommended'],
  },
  books:
  [{
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book'
    },
    order: Number // New field to track the order of books
  }]

});

bookshelfSchema.set('toJSON', {
	transform: (document, returnedObject)=>{
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
    return returnedObject
	}
})

const Bookshelf = mongoose.model('Bookshelf', bookshelfSchema);

export default Bookshelf;
