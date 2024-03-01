import express from 'express';
import fetch from 'node-fetch';
import Bookshelf from '../models/bookshelf.js';
import Book from '../models/book.js';
import User from '../models/user.js';

const recommendationRouter = express.Router();

const searchBookByName = async(title) => {
    const baseUrl = 'https://openlibrary.org/search.json';
    const query = encodeURIComponent(title);
    const limit = 1;
    const url = `${baseUrl}?q=${query}&limit=${limit}`;
    console.log(`Searching for title: ${title}`);
    try {
      const response = await fetch(url);
      const data = await response.json();
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
          cover_url: book.cover_url, 
          author_name: book.author_name,
          summary: description,
          publish_date: book.publish_date,
          isbn: book.isbn,
          subject: book.subject,
          id_goodreads: book.id_goodreads,
        };
      }));
  
      const completeBooks = booksWithDetailsAndCovers.filter(book => book.summary !== null).slice(0, 5);
      return completeBooks
  
    } catch (error) {
      console.error('Error fetching book by title', error);
    }
  };

const searchBookByGenre = async(genre) => {
    const baseURL = 'https://openlibrary.org/subjects';
    const limit = 10;
    const url = `${baseURL}/${genre}.json?limit=${limit}`;
    console.log(`Searching for books in genre: ${genre}`);
    try{
        const response = await fetch(url);
        const data = await response.json();
        const recommendedBooks = data.works.map(work => ({
            title: work.title,
        }));

        console.log("This is recommendedBooks", recommendedBooks)
        let book_details =[]
        for (let book of recommendedBooks) {
            console.log("book title", book.title);
            const details = await searchBookByName(book.title);
            if((details.length === 0)){
                continue;
            }
            book_details.push(details)
        }
        console.log("this is book details",book_details)


        return book_details;
    } catch(error){
        console.error(`Error searching for books in genre ${genre}:`, error.message);
        return [];
    }
    

};


recommendationRouter.post('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try{
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const genrePrefs = user.genrePrefs;

        const recommendedBooks = [];
        for(let genre of genrePrefs){
            let books = await searchBookByGenre(genre);
            console.log((books.length))
            if((books.length === 0)){
                continue;
            }
            recommendedBooks.push(...books);
            console.log((recommendedBooks.length))
        }
        res.json(recommendedBooks)


    } catch(error){
        console.error('Error fetching user or searching for books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

export default recommendationRouter;
