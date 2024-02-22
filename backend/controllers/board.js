import express from 'express';

const boardRouter = express.Router();

boardRouter.post('/addBoard', async (req, res) => {
    try {
        // need bookId to add the board to that Book's Board
        // to do: add Board to field of Book...

        const { bookId, bookTitle, bookAuthor } = req.body;

        const newBoard = new Board({
            bookTitle,
            bookAuthor
        });

        const savedBoard = await newBoard.save();

        // update Book obj with this Board // UNCOMMENT WHEN "boardId" ADDED TO BOOK MODEL
        // if (bookId) {
        //     await Book.findByIdAndUpdate(
        //         bookId,
        //         { $set: { boardId: savedBoard._id } }, 
        //         { new: true }
        //     );
        // }

        res.status(201).json({ message: 'Board added successfully', board: savedBoard});
    }
    catch (error) {
        console.error('Error adding board:', error);
        res.status(500).json({ message: 'Failed to add book', error: error.message });
    }
});

// TO DO:
// routes for adding item to board
// getting items from board

export default boardRouter;