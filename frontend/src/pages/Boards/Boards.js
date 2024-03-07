import React, {useState, useEffect} from "react";
import "./Boards.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import remove from '../../assets/remove.png';

/* Idea is that this array is already created and utilized by the 
    Reading bookshelf in Shelves. And every time a book already has a pinterest board,
    it'll be removed from this array. The _id is the key _id that we use to 
    identify the books from backend
*/
function Boards() {
    const navigate = useNavigate();
    const [selectedBook, setSelectedBook] = useState(null); // track current selection
    const [selectedBooks, setSelectedBooks] = useState([]); // track books that are selected to have board page
    const [reading, setReading] = useState([]); // track books that are selected to have board page

    const userId = localStorage.getItem('user_id');

    // runs when component mounts
    useEffect(() => {
        const fetchBoardsData = async () => {
            try {
                const shelves = ["current", "finished"];
                const promises = shelves.map(async (shelfName) => {
                    const response = await axios.get('http://localhost:5555/api/handlebooks/getBooks/', {
                        params: { userId: localStorage.getItem("user_id").replace(/"/g, ''), type: shelfName },
                        headers: { Authorization: localStorage.getItem("user_token") }
                    });
                    return response.data;
                });
            
                const results = await Promise.all(promises);
                const currBooks = results.flat();
            
                console.log("results: ");
                console.log(currBooks);

                // adjust formatting to match frontend
                currBooks.forEach(book => {
                    book.label = book.title;
                });

                // filter books based on whether or not they have boards
                let updatedReading = [...reading];
                let updatedSelectedBooks = [...selectedBooks];

                currBooks.forEach(book => {
                    if (book.hasOwnProperty("boardId")) {
                        updatedSelectedBooks.push(book);
                    }   
                    updatedReading.push(book);
                });
                setReading(updatedReading);
                setSelectedBooks(updatedSelectedBooks);
            } catch (error) {
                console.error("Error fetching boards data: ", error);
            }
        };
        fetchBoardsData();
    }, []);

    // remove later
    useEffect(() => {
        console.log("reading changed: ", reading);
    }, [reading]); 

    // remove later
    useEffect(() => {
        console.log("selected books changed: ", selectedBooks);
    }, [selectedBooks]);

    const createBoard = async (opt) => {
        // check if the book is not already in selectedBooks
        if (!selectedBooks.find(book => book._id === opt._id)) {
            // find the book in the reading array and add to selectedBooks array
            const selectedBook = reading.find(book => book._id === opt._id);
            // add board for this book in backend
            let boardData = {};
            boardData.bookId = selectedBook._id;
            boardData.bookTitle = selectedBook.title;
            boardData.bookAuthor = selectedBook.author;
            boardData.bookCover = selectedBook.cover;
            boardData.publicVisibility = true; // update if we give user option to set boards private/public

            try {
                const response = await axios.post('http://localhost:5555/api/board/addBoard/', {...boardData}, 
                {
                    headers: { Authorization: localStorage.getItem("user_token") }
                });
                selectedBook.boardId = response.data.board.id;
                setSelectedBooks([...selectedBooks, selectedBook]);
            } 
            catch (error) {
                console.error("Error creating board: ", error);
            }
        }
        // reset selection so that the select dropbox goes back to default look
        setSelectedBook(null);
        // navigating would be after the user clicks on the book
        // navigate(`/boards/${book_id}`);
    }

    const removeBook = async (opt) => {
        const bookToRemove = (selectedBooks.filter(book => book._id === opt))[0];

        setSelectedBooks(currentBooks =>
            currentBooks.filter(book => book._id !== opt)
        );

        try {
            const response = await axios.post('http://localhost:5555/api/board/removeBoard/', { boardId: bookToRemove.boardId }, 
            {
                headers: { Authorization: localStorage.getItem("user_token") }
            });
            console.log(response.data);
            
        } 
        catch (error) {
            console.error("Error removing board: ", error);
        }
    };

    const selectStyles = {
        container: (provided) => ({
            ...provided,
            width: '40%', // side of select bar
            minWidth: '300px', // ensure it doesn't get too small
            textAlign: "center",
        }),
        control: (provided) => ({
            ...provided,
            borderRadius: "20px",
            width: '100%',
        }),
    };

    /* modify options shown in Select so that if already selected (a.k.a 
        book board exists) then make it disabled */
    const modifiedOptions = reading.map(book => ({
        ...book,
        isDisabled: selectedBooks.some(selectedBook => selectedBook._id === book._id),
    }));

    return(
        <div className="boards">
            <h2 style={{textAlign: "center", marginBottom: "0px"}}>My Boards</h2>

            <Select 
            className='bookSelect'
            options={modifiedOptions}
            placeholder="Search for a book from your reading list"
            onChange={opt => createBoard(opt)}
            value={selectedBook}
            autosize={true}
            styles={selectStyles}
            theme={(theme) => ({
                ...theme,
                borderRadius: 0,
                colors: {
                  ...theme.colors,
                  /* when hovering */
                  primary25: '#97AD97',
                  /* when clicking */
                  primary50: '#97AD97',
                  /* border color of the select dropbox */
                  primary: '#F0ABFB',
                },
              })}
            />

            <div className="selectedBooks">
                {selectedBooks.map(book => (
                    <div key={book._id} className="selectedBook">
                        <div className="book-image-container">
                            <img 
                            className="bookImage" 
                            src={book.cover} 
                            alt={book.label}
                            onClick={()=>navigate(`/boards/${userId}/${book.boardId}`)}
                            />
                            <div 
                                className="remove-button" 
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this book board?")) {
                                        removeBook(book._id)
                                    }
                                }}
                            >
                                <img src={remove} alt="Remove" />
                            </div>
                        </div>
                        <h3 style={{cursor: "default"}}>{book.label}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Boards;