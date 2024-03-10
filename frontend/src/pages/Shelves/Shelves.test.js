import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Shelves from './Shelves';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    useNavigate: () => jest.fn() 
  }));


describe('Shelves Fetching Books from Backend', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockClear();
        axios.post.mockClear();
        
        localStorage.setItem("user_token", '123456789');
        localStorage.setItem("user_id", 'thisisatest');
        
        // call axios get two times - one for interested and the other for finished
        axios.get.mockResolvedValueOnce({ 
            data: [
                { title: "Book One", cover_url: "http://example.com/cover1.jpg", author_name: "Author One" }
            ]
        });
        axios.get.mockResolvedValueOnce({ 
            data: [
                { title: "Book Two", cover_url: "http://example.com/cover2.jpg", author_name: "Author Two" },
                { title: "Book Three", cover_url: "http://example.com/cover2.jpg", author_name: "Author Three" }
            ]
        });
    });

    it('displays books fetched from the backend', async () => {

        render(
            <Router>
                <Shelves />
            </Router>
        );

        // we expect three books, which are removable elements
        await waitFor(() => {
            expect(screen.getAllByAltText('Remove')).toHaveLength(3);
        });
    });
});

describe('Searching book from backend book API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockClear();
        axios.post.mockClear();
        
        localStorage.setItem("user_token", '123456789');
        localStorage.setItem("user_id", 'thisisatest');
        
        // call axios get two times - one for interested and the other for finished
        axios.get.mockResolvedValue({ 
            data: [
                { title: "Book One", cover_url: "http://example.com/cover1.jpg" },
                { title: "Book Two", cover_url: "http://example.com/cover2.jpg" }
            ]
        });
    });

    it('displays books fetched from the backend', async () => {
        render(
            <Router>
                <Shelves />
            </Router>
        );
        
        // simulate a user searching for a book
        const searchField = screen.getByPlaceholderText('Search for a book by title');
        userEvent.type(searchField, 'Book{enter}');

        // wait for backend to grab books from book api
        await waitFor(() => {
            const bookTitles = screen.getAllByText(/Book/i);
            expect(bookTitles.length).toEqual(2); 
        });

        // the books get displayed as options from search result and they can be added 
        expect(screen.getByText("Book One")).toBeInTheDocument();
        expect(screen.getByText("Book Two")).toBeInTheDocument();
        expect(screen.getAllByText('Add')).toHaveLength(2);
    });
});