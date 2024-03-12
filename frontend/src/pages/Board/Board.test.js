import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ModalAndPin from '../../components/ModalAndPin/ModalAndPin';
import Board from './Board';
import userEvent from '@testing-library/user-event';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    useNavigate: () => jest.fn() 
  }));

describe('Board Pin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockClear();
    axios.post.mockClear();
  
    localStorage.setItem("user_token", '123456789');
    localStorage.setItem("user_id", 'thisisatest');
  
    axios.get.mockResolvedValue({ 
      data: {
        bookTitle: 'Book 1', 
        bookAuthor: 'Author 1', 
        id: '123456789', 
        userId: 'thisisauserid', 
        username: 'Person 1',
        items: [
          {quote: "quote 1", id: "1", ordering_id: "pin-1", title: "text", img_blob: ""},
          {quote: "", id: "2", ordering_id: "pin-2", title: "image", img_blob: "image", pin_size: "small"},
        ]
      }
    });
  
    axios.post.mockResolvedValue({
      data: {quote: "quote 2", id: "3", ordering_id: "pin-3", title: "text 2", img_blob: ""},
    });
  });

  it('displays saved pins from database to the modal', async () => {
    const isOwner = localStorage.getItem("user_id") === 'thisisatest';

    // isOwner is true
    render(<ModalAndPin boardId="123456789" owner={isOwner}/>);

    // wait for the pins to be fetched and displayed
    await waitFor(() => expect(screen.getByText("text")).toBeInTheDocument());
    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByAltText("pin_image")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByAltText("pin_image")).toBeInTheDocument());
    const pinImage = screen.getByAltText('pin_image');
    userEvent.click(pinImage);

    await waitFor(() => {
      expect(screen.getAllByAltText('remove')).toHaveLength(2);
    });
  });

  it('can add a pin and display it on modal', async () => {
    const isOwner = localStorage.getItem("user_id") === 'thisisatest';

    // isOwner is true
    render(<ModalAndPin boardId="123456789" owner={isOwner}/>);
    
    // simulate user creating an image pin
    userEvent.click(screen.getByAltText("add_pin"));

    const file = new File(['file data'], 'test.png', { type: 'image/png' });
    const input = await screen.findByTestId("upload_img");
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    fireEvent.change(input);

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText("Add a title"), "image 2");
      userEvent.type(screen.getByPlaceholderText("What is this pin about?"), "pin test");
      userEvent.selectOptions(screen.getByRole('combobox'), ['medium']);
    });

    // simular user saving the new pin
    userEvent.click(screen.getByText("Save"));

    // we now expect two image pins to be on the board
    await waitFor(() => {
        const pinImages = screen.getAllByAltText("pin_image");
        expect(pinImages).toHaveLength(2); 
    });
  });
});

describe('Board Component - Viewing Another User\'s Board', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockClear();
    axios.post.mockClear();

    localStorage.setItem("user_token", '987654321');
    localStorage.setItem("user_id", 'differentperson');

    // mock axios get request to return board details not owned by the current user
    axios.get.mockResolvedValue({
      data: {
        bookTitle: 'Book 1',
        bookAuthor: 'Author 1',
        id: '123456789', 
        userId: 'user2',
        username: 'Person 2',
        items: [
          {quote: "quote 1", id: "1", ordering_id: "pin-1", title: "text", img_blob: ""},
          {quote: "", id: "2", ordering_id: "pin-2", title: "image", img_blob: "image", pin_size: "small"},
        ]
      }
    });
  });

  it('should not be able to edit pins if on other user\'s board', async () => {
    const isOwner = localStorage.getItem("user_id") === 'thisisatest';

    // isOwner is false
    render(<ModalAndPin boardId="123456789" owner={isOwner}/>);

    // since the current user does not own the board, the remove option should not be visible
    await waitFor(() => expect(screen.getByAltText("pin_image")).toBeInTheDocument());
    const pinImage = screen.getByAltText('pin_image');
    userEvent.click(pinImage);

    // user shouldn't be given option to edit this board
    await waitFor(() => {
      const removeIcons = screen.queryAllByAltText('remove');
      expect(removeIcons).toHaveLength(0);
    });
  });
});
