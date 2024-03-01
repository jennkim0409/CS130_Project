import express from 'express';
import fetch from 'node-fetch';
import Bookshelf from '../models/bookshelf.js';
import Book from '../models/book.js';

const handlebooksRouter = express.Router();

handlebooksRouter.post('/addBook', async (req, res) => {
  try {
    const { userId, bookshelfType, title, cover, author, summary, publish_date, isbn, subject, id_goodreads } = req.body;
    const newBook = new Book({
      title,
      cover,
      author,
      summary,
      publish_date,
      isbn,
      subject,
      id_goodreads
    });
    const savedBook = await newBook.save();

    if (userId && bookshelfType) {
      const bookshelf = await Bookshelf.findOneAndUpdate(
        { userId: userId, type: bookshelfType },
        { $addToSet: { books: savedBook._id } }, // Add book to the bookshelf
      );
      
      if (!bookshelf) {
        return res.status(404).json({ message: 'Bookshelf not found and could not be created' });
      }
    } else {
      return res.status(400).json({ message: 'UserId and bookshelfType are required' });
    }
    res.status(201).json({ message: 'Book added successfully', book: savedBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

handlebooksRouter.post('/moveBook', async (req, res) => {
    try {
        const { userId, bookId, fromShelf, toShelf } = req.body;
    
        await Bookshelf.updateOne(
          { userId: userId, type: fromShelf },
          { $pull: { books: bookId } }
        );
    
        await Bookshelf.updateOne(
          { userId: userId, type: toShelf },
          { $addToSet: { books: bookId } }, // $addToSet prevents duplicate entries
        );
    
        res.status(200).json({ message: 'Book moved successfully' });
      } catch (error) {
        console.error('Error moving book:', error);
        res.status(500).json({ message: 'Failed to move book', error: error.message });
      }
});

handlebooksRouter.post('/removeBook', async (req, res) => {
  try{
    const {userId, bookshelfType, bookId} = req.body;

    const updatedBookshelf = await Bookshelf.findOneAndUpdate(
      { userId: userId, type: bookshelfType }, // Match the bookshelf by userId and type
      { $pull: { books: bookId } },
      { new: true } 
    );
    if (!updatedBookshelf) {
      return res.status(404).json({ message: 'Bookshelf not found or book not on shelf' });
    }
    res.status(200).json({ message: 'Book removed successfully', bookshelf: updatedBookshelf });
  }
  catch(error){
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to remove book', error: error.message });
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
    console.log(data)
    const requiredFields = ['key', 'title', 'author_name', 'publish_date','isbn', 'id_goodreads', 'subject'];
    
    let filteredBooks = data.docs.filter(book => 
      requiredFields.every(field => 
        book[field] !== undefined && book[field] !== null && (Array.isArray(book[field]) ? book[field].length > 0 : true))
    )

    filteredBooks = filteredBooks.map(book => ({
      ...book,
      author_name: Array.isArray(book.author_name) ? book.author_name[0] : book.author_name,
      publish_date: Array.isArray(book.publish_date) ? book.publish_date[0] : book.publish_date,
      id_goodreads: Array.isArray(book.id_goodreads) ? book.id_goodreads[0] : book.id_goodreads,
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
        book.cover_url = "https://example.com/default-cover.jpg";
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
        cover_url: book.cover_url, // Add the cover URL, whether it's the default or a found one
        author_name: book.author_name,
        summary: description,
        publish_date: book.publish_date,
        isbn: book.isbn,
        subject: book.subject,
        id_goodreads: book.id_goodreads,
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