import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Boards from '../Boards/Boards';
import userEvent from '@testing-library/user-event';

jest.mock('axios');

beforeEach(() => {

  jest.clearAllMocks();
  axios.get.mockClear();
  axios.post.mockClear();

  localStorage.setItem("user_token", '123456789');
  localStorage.setItem("user_id", 'thisisatest');

  // setting up mock responses for axios get and post
  axios.get
    .mockResolvedValueOnce({ data: [] }) // initially returns empty
    .mockResolvedValueOnce({ 
      data: [{ title: 'Book 1', boardId: '1', _id: '1' }, { title: 'Book 2', _id: '2' }] // second call returns current reading list
    });

  axios.post.mockResolvedValue({
    data: { boardId: '2', title: 'Book 2', _id: '2' }
  });
});

describe('Boards Component', () => {
  it('should display Book 1 since board exists', async () => {

    render(
      <MemoryRouter>
        <Boards />
      </MemoryRouter>
    );

    // axios.get 
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    // book 1 clickable element seen in boards
    await waitFor(() => expect(screen.getByText('Book 1')).toBeInTheDocument());
  });

  it('should allow user to create board for Book 2', async () => {

    render(
      <MemoryRouter>
        <Boards />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    const dropdown = screen.getByRole('combobox');
    userEvent.click(dropdown);
    
    // check that Book 2 is available in dropdown
    const book2Option = await screen.findByText((content, node) => {
      const hasText = (node) => node.textContent === "Book 2";
      const book2Exists = hasText(node);
      return book2Exists;
    });

    // simulate creating a board for this book
    userEvent.click(book2Option);

    // book 2 clickable element seen in boards
    await waitFor(() => expect(screen.getByText('Book 2')).toBeInTheDocument());
  });

});
