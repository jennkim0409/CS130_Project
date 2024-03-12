import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import userEvent from '@testing-library/user-event';
import Explore from './Explore';
import Recommendations from '../../components/Recommendations/Recommendations';
import { act } from 'react-dom/test-utils';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    useNavigate: () => jest.fn() 
  }));

describe('Explore Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockClear();
        axios.post.mockClear();
      
        localStorage.setItem("user_token", '123456789');
        localStorage.setItem("user_id", 'thisisatest');
      
        axios.get.mockResolvedValue({ 
          data: [
                { 
                title: 'Book Title 1', 
                author: 'Author 1', 
                summary: ['Summary 1'], 
                subject: ['Genre 1'], 
                cover: 'cover1', 
                isbn: '123456789' 
                },
                { 
                title: 'Book Title 2', 
                author: 'Author 2', 
                summary: ['Summary 2'], 
                subject: ['Genre 2'], 
                cover: 'cover2', 
                isbn: '987654321' 
                },
            ],
        });

        axios.post.mockResolvedValue({
            data: 
                { 
                title: 'Book Title 1', 
                author: 'Author 1', 
                summary: ['Summary 1'], 
                subject: ['Genre 1'], 
                cover: 'cover1', 
                isbn: '123456789' 
                },
        })

    });

    it('renders Explore and fetches Recommendations', async () => {
        render(<Explore />);

        // expect Shuffle Component to be present
        expect(screen.getByText('Shuffle')).toBeInTheDocument();
        // expect the books retrieved from axios get to appear
        await waitFor(() => expect(screen.getByText('Book Title 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Book Title 2')).toBeInTheDocument());

        // user is able to click shuffle
        userEvent.click(screen.getByText('Shuffle'));

        // shuffle works with the information in backend
        // our mock only contains two books so those two should appear
        await waitFor(() => expect(screen.getByText('Book Title 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Book Title 2')).toBeInTheDocument());

        await waitFor(() => {
            expect(screen.getAllByText('Save')).toHaveLength(2);
        });
    });

    it('can save books from Recommendations', async () => {
        render(<Explore />);

        // expect Shuffle Component to be present
        expect(screen.getByText('Shuffle')).toBeInTheDocument();
        // expect the books retrieved from axios get to appear
        await waitFor(() => expect(screen.getByText('Book Title 1')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText('Book Title 2')).toBeInTheDocument());

        let saveButtons = screen.getAllByText('Save');

        // save the first button, which is associated with Book 1
        // mock axios post for saveBook()
        await act(async () => {
            userEvent.click(saveButtons[0]);
        });

        // expect one button to now say "Saved" and the other to remain "Save"
        await waitFor(() => {
            expect(screen.getAllByText('Saved')).toHaveLength(1);
            expect(screen.getAllByText('Save')).toHaveLength(1); 
        });
    });


});
