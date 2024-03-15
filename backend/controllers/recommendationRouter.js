import express from 'express';
import fetch from 'node-fetch';
import User from '../models/user.js';

/** Express router providing Recommendation related routes
 * @module routers/recommendation
 * @requires express
 */

/**
 * Express router to mount Recommendation related functions on
 * @type {object}
 * @const
 * @namespace recommendationRouter
 */
const recommendationRouter = express.Router();

/**
 * Searches for books by title.
 * @name searchBookByName
 * @function
 * @memberof module:routers/recommendation~recommendationRouter
 * @param {string} title - The title of the book to search for.
 * @returns {Promise<object[]>} - Array of books with details.
 * @throws {Error} - Throws an error if there's an issue fetching data.
 */
const searchBookByName = async (title) => {
    const baseUrl = 'https://openlibrary.org/search.json';
    const query = encodeURIComponent(title);
    const limit = 1;
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
                cover_url: book.cover_url, 
                author_name: book.author_name,
                summary: description,
                isbn: book.isbn,
                subject: book.subject,
            };
        }));
    
        const completeBooks = booksWithDetailsAndCovers.filter(book => book.summary !== null).slice(0, 5);
        return completeBooks
    
    } catch (error) {
        console.error('Error fetching book by title', error);
    }
};

/**
 * Searches for books by genre.
 * @name searchBookByGenre
 * @function
 * @memberof module:routers/recommendation~recommendationRouter
 * @param {string} genre - The genre of books to search for.
 * @returns {Promise<object[]>} - Array of books with details.
 * @throws {Error} - Throws an error if there's an issue fetching data.
 */
const searchBookByGenre = async (genre) => {
    const baseURL = 'https://openlibrary.org/subjects';
    const limit = 10;
    const url = `${baseURL}/${genre}.json?limit=${limit}`;
    console.log(`Searching for books in genre: ${genre}`);
    const book_details = [];
    try{
        const response = await fetch(url);
        const data = await response.json();
        const recommendedBooks = data.works.map(work => ({
            title: work.title,
        }));

        // console.log("This is recommendedBooks", recommendedBooks)
        let book_details =[]
        for (let book of recommendedBooks) {
            console.log("book title", book.title);
            const details = await searchBookByName(book.title);
            if((details.length === 0)){
                continue;
            }
            book_details.push(details)
        }

        return book_details;
    } catch(error){
        console.error(`Error searching for books in genre ${genre}:`, error.message);
    }
};

/**
 * Route for recommending books based on user preferences.
 * @name POST /:userId
 * @function
 * @memberof module:routers/recommendation~recommendationRouter
 * @inner
 * @param {string} userId - The ID of the user for whom recommendations are requested.
 * @returns {object[]} 200 - Array of recommended books.
 * @returns {Error} 404 - User not found.
 * @returns {Error} 500 - Internal server error.
 */
recommendationRouter.post('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try{
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const genrePrefs = user.genrePrefs;
        const genrePromises = genrePrefs.map(genre => searchBookByGenre(genre));
        const genreBooks = await Promise.all(genrePromises);

        const recommendedBooks = genreBooks.flat();
        console.log(recommendedBooks.length)
        res.json(recommendedBooks)

    } catch(error){
        console.error('Error fetching user or searching for books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default recommendationRouter;