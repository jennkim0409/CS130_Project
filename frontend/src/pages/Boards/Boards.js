import React, {useState} from "react";
import "./Boards.css";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

/* Idea is that this array is already created and utilized by the 
    Reading bookshelf in Shelves. And every time a book already has a pinterest board,
    it'll be removed from this array. The value is the key value that we use to 
    identify the books from backend
*/
const reading = [
    {label: "Cat in the Hat", value: "2123521", bookcover: "https://m.media-amazon.com/images/I/41j05R2RKJL._SY445_SX342_.jpg" },
    {label: "The Giving Tree", value: "123512", bookcover: "https://m.media-amazon.com/images/I/41fR2KV7jzL._SY445_SX342_.jpg" },
    {label: "Atomic Habits", value: "584982", bookcover: "https://m.media-amazon.com/images/W/MEDIAX_849526-T3/images/I/51ZJ9RjiC0L._SY445_SX342_.jpg" },
    {label: "The Hunger Games", value: "346345", bookcover: "https://m.media-amazon.com/images/I/51vOc7NtICL.jpg" },
    {label: "Pachinko", value: "6786786", bookcover: "https://m.media-amazon.com/images/I/41JF5hKN8EL.jpg" },
    {label: "If Cats Disappeared from the World", value: "938124", bookcover:  "https://m.media-amazon.com/images/W/MEDIAX_849526-T3/images/I/71tQ71QaNML._SY522_.jpg"},
];

function Boards() {
    const navigate = useNavigate();
    const [selectedBook, setSelectedBook] = useState(null); // track current selection
    const [selectedBooks, setSelectedBooks] = useState([]); // track books that are selected to have board page

    const createBoard = (opt) => {
        // check if the book is not already in selectedBooks
        if (!selectedBooks.find(book => book.value === opt.value)) {
            // find the book in the reading array and add to selectedBooks array
            const selectedBook = reading.find(book => book.value === opt.value);
            setSelectedBooks([...selectedBooks, selectedBook]);
            // Optionally navigate or perform other actions here
        }
        // reset selection so that the select dropbox goes back to default look
        setSelectedBook(null);
        // navigating would be after the user clicks on the book
        // navigate(`/boards/${book_id}`);
    }

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
        isDisabled: selectedBooks.some(selectedBook => selectedBook.value === book.value),
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
                    <div key={book.value} className="selectedBook">
                        <img 
                        className="bookImage" 
                        src={book.bookcover} 
                        alt={book.label}
                        onClick={()=>navigate(`/boards/${book.value}`)}
                        />
                        <h3 style={{cursor: "default"}}>{book.label}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Boards;