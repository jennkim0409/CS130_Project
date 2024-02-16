import express from 'express';
import Bookshelf from '../models/bookshelf.js';
import Book from '../models/book.js';

const updateRouter = express.Router();

updateRouter.post('/addBook', async (req, res) => {
  try {
    const { bookshelfId, title, cover, author, summary } = req.body;
    const newBook = new Book({
      title,
      cover,
      author,
      summary
    });
    const savedBook = await newBook.save();

    if (bookshelfId) {
      await Bookshelf.findByIdAndUpdate(bookshelfId, {
        $addToSet: { books: savedBook._id } // Use $addToSet to avoid duplicates
      });
    }
    res.status(201).json({ message: 'Book added successfully', book: savedBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

updateRouter.post('/moveBook', async (req, res) => {
    try {
        const { userId, bookId, fromShelf, toShelf } = req.body;
    
        await Bookshelf.updateOne(
          { user: userId, type: fromShelf },
          { $pull: { books: bookId } }
        );
    
        await Bookshelf.updateOne(
          { user: userId, type: toShelf },
          { $addToSet: { books: bookId } }, // $addToSet prevents duplicate entries
        );
    
        res.status(200).json({ message: 'Book moved successfully' });
      } catch (error) {
        console.error('Error moving book:', error);
        res.status(500).json({ message: 'Failed to move book', error: error.message });
      }
});

export default updateRouter;