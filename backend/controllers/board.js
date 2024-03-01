import express from 'express';
import Board from "../models/board.js";
import Book from '../models/book.js';
import Item from '../models/item.js';

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

boardRouter.post('/removeBoard', async(req, res) => {
    try{
        const {boardId} = req.body;
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        await Item.deleteMany({ _id: { $in: board.items } });
        await Board.findByIdAndDelete(boardId);

        res.status(200).json({ message: 'Board and all associated items have been removed successfully' });
    }
    catch(error){
        res.status(500).json({ message: 'Error removing board', error: error.message });
    }
});


// route: given board ID, get that board
boardRouter.get('/getBoard', async (req,res) => {
    try {
        const {boardId} = req.query;
        const board = await Board.findById(boardId);
        if(!board){
            return res.status(404).json({ message: 'Board not found' });
        }
        res.json(board);
    }
    catch(error){
        res.status(500).json({ message: 'Error fetching board', error: error.message });
    }
});


boardRouter.get('/getBoardsbyBook', async (req, res) => {
    try{
        const {userId, bookTitle, bookAuthor} = req.query;
        const boards = await Board.find({
            userId: { $ne: userId }, // Exclude boards that belong to the user
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            visibility: true
        });

        if (!boards || boards.length === 0) {
            return res.status(404).json({ message: 'No boards found for the given book' });
        }
        res.json(boards);
    } catch(error){
        res.status(500).json({ message: 'Error getting boards', error: error.message });
    }
});

// route: given board ID and ID of an item in that board, remove that item from the board's list of items
    // (and delete that item from the Items table in DB)
boardRouter.post('/removeItem', async (req, res) => {
    try {
        const { boardId, itemId } = req.body;
        const board = await Board.findByIdAndUpdate(boardId, { $pull: { items: itemId } }, { new: true });
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        await Item.findByIdAndDelete(itemId);
        res.status(200).json({ message: 'Item removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error: error.message });
    }
});


// route: given board id and ID of an item, insert that item in the board's list of items
    // (and add it to the Items table in DB)
boardRouter.post('/addItem', async (req, res) => {
    try {
        const {boardId, title, ordering_id, description, pin_size, quote, text_color} = req.body;

        const newItem = new Item({ title, ordering_id, description, pin_size, quote, text_color });
        const savedItem = await newItem.save();

        const board = await Board.findByIdAndUpdate(boardId, { $addToSet: { items: savedItem._id } }, { new: true });
        if(!board){
            return res.status(404).json({ message: 'Board not found' });
        }
        res.status(200).json({ message: 'Item added successfully', board });
    }
    catch(error){
        res.status(500).json({ message: 'Error adding item', error: error.message });
    }
});

export default boardRouter;
