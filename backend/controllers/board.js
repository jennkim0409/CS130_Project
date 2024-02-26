import express from 'express';
import Board from "../models/board.js"
import Book from '../models/book.js';

const boardRouter = express.Router();

boardRouter.post('/addBoard', async (req, res) => {
    try {
        const { bookId, bookTitle, bookAuthor } = req.body;

        const newBoard = new Board({
            bookTitle,
            bookAuthor
        });

        const savedBoard = await newBoard.save();

        if (bookId) {
            await Book.findByIdAndUpdate(
                bookId,
                { $set: { boardId: savedBoard._id } }, 
                { new: true }
            );
        }

        res.status(201).json({ message: 'Board added successfully', board: savedBoard});
    }
    catch (error) {
        console.error('Error adding board:', error);
        res.status(500).json({ message: 'Failed to add board', error: error.message });
    }
});

// TO DO ***:
// route: given board ID, get all the items for that board
// route: given board ID and ID of an item in that board, remove that item from the board's list of items
    // (and delete that item from the Items table in DB)
// route: given board id and ID of an item, insert that item in the board's list of items
    // (and add it to the Items table in DB)

export default boardRouter;