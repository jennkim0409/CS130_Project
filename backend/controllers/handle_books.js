import express from 'express';
import fetch from 'node-fetch';
import Bookshelf from '../models/bookshelf.js';
import Book from '../models/book.js';

const handlebooksRouter = express.Router();

handlebooksRouter.post('/addBook', async (req, res) => {
  try {
    const { userId, bookshelfType, title, cover, author, summary, isbn, subject } = req.body;
    const newBook = new Book({
      title,
      cover,
      author,
      summary,
      isbn,
      subject
    });
    const savedBook = await newBook.save();

    if (userId && bookshelfType) {
      // Find the bookshelf
      const bookshelf = await Bookshelf.findOne({ userId: userId, type: bookshelfType });

      if (!bookshelf) {
        return res.status(404).json({ message: 'Bookshelf not found' });
      }

      // Determine the next order value
      let maxOrder = 0;
      bookshelf.books.forEach(book => {
        if (book.order >= maxOrder) {
          maxOrder = book.order + 1;
        }
      });

      // Add the new book with the next order value
      bookshelf.books.push({ bookId: savedBook._id, order: maxOrder });
      await bookshelf.save();

      res.status(201).json({ message: 'Book added successfully', book: savedBook, bookshelf: bookshelf });
    } else {
      return res.status(400).json({ message: 'UserId and bookshelfType are required' });
    }
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

handlebooksRouter.post('/moveBook', async (req, res) => {
    try {
        const { userId, bookId, fromShelf, toShelf, newOrder } = req.body;

        const sourceShelf = await Bookshelf.findOne({ userId, type: fromShelf });
        if (!sourceShelf) {
          return res.status(404).json({ message: 'Source bookshelf not found' });
        }
        const bookToRemoveIndex = sourceShelf.books.findIndex(book => book.bookId.equals(bookId));
        if (bookToRemoveIndex === -1) {
          return res.status(404).json({ message: 'Book not found on shelf' });
        }
        const bookToRemoveOrder = sourceShelf.books[bookToRemoveIndex].order;
    
        sourceShelf.books.splice(bookToRemoveIndex, 1);
    
        // Adjust the orders of the remaining books
        sourceShelf.books.forEach(book => {
          if (book.order > bookToRemoveOrder) {
            book.order -= 1;
          }
        });
        await sourceShelf.save();


        const targetShelf = await Bookshelf.findOne({ userId, type: toShelf });
        if (!targetShelf) {
          return res.status(404).json({ message: 'Target bookshelf not found' });
        }
        targetShelf.books.forEach(book => {
          if (book.order >= newOrder) {
            book.order += 1;
          }
        });
    
        // Sort books by the updated order to maintain consistency
        targetShelf.books.sort((a, b) => a.order - b.order);
    
        // Add the new book at its designated order
        targetShelf.books.push({ bookId, order: newOrder });
    
        await targetShelf.save();
        res.status(200).json({ message: 'Book moved successfully', fromShelf: sourceShelf, toShelf: targetShelf });
      } catch (error) {
        console.error('Error moving book:', error);
        res.status(500).json({ message: 'Failed to move book', error: error.message });
      }
});

handlebooksRouter.post('/removeBook', async (req, res) => {
  try{
    const {userId, bookshelfType, bookId} = req.body;

    const bookshelf = await Bookshelf.findOne({ userId: userId, type: bookshelfType });
    if (!bookshelf) {
      return res.status(404).json({ message: 'Bookshelf not found' });
    }

    // Find and remove the book from the bookshelf, and remember its order
    const bookIndex = bookshelf.books.findIndex(b => b.bookId.toString() === bookId);
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found on shelf' });
    }
    const removedBookOrder = bookshelf.books[bookIndex].order;
    bookshelf.books.splice(bookIndex, 1);

    // Adjust the order of the remaining books
    bookshelf.books.forEach(book => {
      if (book.order > removedBookOrder) {
        book.order -= 1;
      }
    });

    await bookshelf.save();
    res.status(200).json({ message: 'Book removed successfully', bookshelf: bookshelf });
  }
  catch(error){
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to remove book', error: error.message });
  }
});

handlebooksRouter.post('/clearBookshelf', async (req, res) => {
  try{
    const {userId, bookshelfType} = req.body;
    const updatedBookshelf = await Bookshelf.findOneAndUpdate(
      { userId: userId, type: bookshelfType },
      { $set: { books: [] } }, 
      { new: true } // Return the updated document
    );

    if (!updatedBookshelf) {
      return res.status(404).json({ message: 'Bookshelf not found' });
    }
    res.status(200).json({ message: 'Bookshelf cleared successfully', bookshelf: updatedBookshelf });
  } catch(error){
    console.error('Error clearing bookshelf:', error);
    res.status(500).json({ message: 'Failed to clear bookshelf', error: error.message });
  }
});


handlebooksRouter.get('/searchBooksName', async (req, res) => {
  const {q:title} = req.query; // Assuming the title is passed as a query parameter
  const baseUrl = 'https://openlibrary.org/search.json';
  const query = encodeURIComponent(title);
  const limit = 50;
  const url = `${baseUrl}?q=${query}&limit=${limit}`;
  console.log(`Searching for title: ${title}`);
  try {
    const response = await fetch(url);
    const data = await response.json();

    const requiredFields = ['key', 'title', 'author_name','isbn', 'subject'];
    
    let filteredBooks = data.docs.filter(book => 
      requiredFields.every(field => 
        book[field] !== undefined && book[field] !== null && (Array.isArray(book[field]) ? book[field].length > 0 : true))
    )

    filteredBooks = filteredBooks.map(book => ({
      ...book,
      author_name: Array.isArray(book.author_name) ? book.author_name[0] : book.author_name,
    }));

    const booksWithDetailsAndCovers = await Promise.all(filteredBooks.map(async (book) => {
      let coverFound = false;
      let description = null;

      for (const isbn of book.isbn) {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
        try {
          const coverResponse = await fetch(coverUrl);
          if (coverResponse.ok) {
            book.cover_url = coverUrl;
            coverFound = true;
            break;
          }
        } catch (error) {
          console.log(`No cover found for ISBN ${isbn}`);
        }
      }

      if (!coverFound) {
        book.cover_url = "";
      }

      if (book.key) {
        const detailsUrl = `https://openlibrary.org${book.key}.json`;
        try {
          const detailsResponse = await fetch(detailsUrl);
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            description = detailsData.description ? (typeof detailsData.description === 'string' ? detailsData.description : detailsData.description.value) : null;
          }
        } catch (error) {
          console.log(`Failed to fetch details for book with key ${book.key}:`, error);
        }
      }

      return {
        key: book.key,
        title: book.title,
        cover_url: book.cover_url, // Add the cover URL, whether it's blank or a found one
        author_name: book.author_name,
        summary: description,
        isbn: book.isbn,
        subject: book.subject
      };
    }));

    const completeBooks = booksWithDetailsAndCovers.filter(book => book.summary !== null).slice(0, 5);
    res.json(completeBooks);

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
});

handlebooksRouter.get('/getBooks', async (req, res) => {
  const { userId, type } = req.query;
  try {
    // Find the bookshelf for the user with the specified type
    const bookshelf = await Bookshelf.findOne({ userId, type }).populate('books'); // Assuming 'books' is a field that references book documents
    if (!bookshelf) {
      return res.status(404).json({ message: 'Bookshelf not found' });
    }

    // Respond with the books from the bookshelf
    res.json(bookshelf.books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
});

export default handlebooksRouter;