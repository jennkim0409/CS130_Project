import mongoose from 'mongoose';
const { Schema } = mongoose;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  cover: {
    type: String, // URL to the cover image
    required: false,
  },
  author: {
    type: String,
    required: true,
  },
  summary: [{
    type: String,
    required: true,
  }],
  publish_date: {
    type: String,
    required: true
  },
  isbn: [{
    type: String,
    required: true
  }],
  subject: [{
    type: String,
    required: true
  }],
  id_goodreads: {
    type: String,
    required: true
  }
});

bookSchema.set('toJSON', {
  transform: (document, returnedObject)=>{
    returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
    return returnedObject
  }
})

const Book = mongoose.model('Book', bookSchema);

export default Book;