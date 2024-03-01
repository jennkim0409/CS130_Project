import express from 'express';
import fetch from 'node-fetch';
import User from '../models/user.js';

const recommendationRouter = express.Router();

const searchBookByGenre = async(genre) => {
    const baseURL = 'https://openlibrary.org/subjects';
    const limit = 5;
    const url = `${baseURL}/${genre}.json?limit=${limit}`;
    console.log(`Searching for books in genre: ${genre}`);
    try{
        const response = await fetch(url);
        const data = await response.json();
        const recommendedBooks = data.works.map(work => ({
            title: work.title,
            cover: work.cover_id,
            author: work.authors ? work.authors[0].name : 'Unknown Author', // Assuming the first author is the main author
            summary: work.title,
            publish_date: work.first_publish_year || 'Unknown Publish Date',
            isbn: work.isbn ? work.isbn[0] : 'ISBN not available', // Assuming the first ISBN is the primary one
            subject: genre,
            id_goodreads: work.id_goodreads || 'Goodreads ID not available'
        }));

        return recommendedBooks;
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
        for(const genre of genrePrefs){
            const books = await searchBookByGenre(genre);
            recommendedBooks.push(...books);
        }
        res.json(recommendedBooks)
    } catch(error){
        console.error('Error fetching user or searching for books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default recommendationRouter;
