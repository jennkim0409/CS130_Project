import request from "supertest";
import bcrypt from "bcrypt";
import { closeDatabaseConnection } from "../db.js";

import { app, server } from "../index.js";
import User from "../models/user.js";
import Bookshelf from "../models/bookshelf.js";
import Book from "../models/book.js";

let token;
let userId;
let mockBook;
let mockBookId;
const mockUser = {
    username: "testuser",
    password: "testpassword",
};

beforeAll(async () => {
    try {
        const res = await request(app)
        .post('/auth/register')
        .send(mockUser);

        userId = res.body.user.id;
        token = res.body.token;
        console.log("THIS IS USER ID: ", userId);
        console.log("THIS IS USER TOKEN: ", token);

            //userId, bookshelfType
        mockBook = {
            userId: userId,
            bookshelfType: "finished",
            title: "Test Book",
            cover: "Test Cover",
            author: "Test Author",
            summary: ["Test Summary"],
            isbn: ["1234567890", "0987654321"],
            subject: ["Test Subject"]
        };
    } catch (error) {
      console.log(error);
    }
}, 10000);



describe('POST /api/handlebooks/addBook', () => {
    it('should add a book successfully with valid token', async () => {
        console.log("this is the book", mockBook);
        const response = await request(app)
            .post('/api/handlebooks/addBook')
            .set('Authorization', token) // Use the token
            .send(mockBook);

        console.log("THIS IS THE BOOK RES: ", response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'Book added successfully');
        expect(response.body.book).toMatchObject({
            title: mockBook.title,
            cover: mockBook.cover,
            author: mockBook.author,
            summary: mockBook.summary,
            isbn: mockBook.isbn,
            subject: mockBook.subject
        });
        expect(response.body.bookshelf).toHaveProperty('userId', userId);
        expect(response.body.bookshelf).toHaveProperty('type', mockBook.bookshelfType);
        expect(response.body.bookshelf.books[0].bookId).toBe(response.body.book.id);
        mockBookId = response.body.book.id;
    });
});

describe('POST /api/handlebooks/moveBook', () => {
    it('should move a book successfully from one bookshelf to another', async () => {
      const mockMoveBookPayload = {
        userId: userId,
        bookId: mockBookId,
        fromShelf: "finished",
        toShelf: "current",
        newOrder: 0
      };
  
        const moveResponse = await request(app)
        .post('/api/handlebooks/moveBook')
        .set('Authorization', token) // Use the token
        .send(mockMoveBookPayload);

        expect(moveResponse.statusCode).toBe(200);
        expect(moveResponse.body).toHaveProperty('message', 'Book moved successfully');
        console.log("MOVE Book reS", moveResponse.body)
        expect(moveResponse.body.fromShelf.books).toHaveLength(0);
        expect(moveResponse.body.toShelf.books).toHaveLength(1);

        const targetShelfResponse = await request(app)
        .get('/api/handlebooks/getBooks')
        .query({ userId, type: "current" })
        .set('Authorization', token);

        expect(targetShelfResponse.statusCode).toBe(200);

        const movedBook = targetShelfResponse.body.find(book => book._id === mockBookId);
        expect(movedBook).toBeDefined();
    });
  });

afterAll(async () => {
    // Disconnect from the database after all tests
    try {
        await User.deleteOne({ username: mockUser.username });
    } catch (error) {
      console.log(error);
    } finally {
      server.close();
      closeDatabaseConnection();
    }
}, 10000);
