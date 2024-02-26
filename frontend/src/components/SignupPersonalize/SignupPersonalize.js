import Select from 'react-select';
import React, { useState, useEffect } from "react";
import './SignupPersonalize.css'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const genreOptions = [
    { label: 'fiction', value: 'fiction' },
    { label: 'mystery', value: 'mystery' },
    { label: 'romance', value: 'romance' },
    { label: 'science fiction', value: 'science fiction' },
    { label: 'fantasy', value: 'fantasy' },
    { label: 'thriller', value: 'thriller' },
    { label: 'horror', value: 'horror' },
    { label: 'historical fiction', value: 'historical fiction' },
    { label: 'non-fiction', value: 'non-fiction' },
    { label: 'biography', value: 'biography' },
    { label: 'autobiography', value: 'autobiography' },
    { label: 'memoir', value: 'memoir' },
    { label: 'self-help', value: 'self-help' },
    { label: 'young adult', value: 'young adult' },
    { label: "children's literature", value: "children's literature" },
    { label: 'poetry', value: 'poetry' },
    { label: 'comedy', value: 'comedy' },
    { label: 'drama', value: 'drama' },
    { label: 'adventure', value: 'adventure' },
    { label: 'crime', value: 'crime' },
];

const selectStyles = {
    container: (provided) => ({
        ...provided,
        width: '50%', // side of select bar
        minWidth: '200px', // ensure it doesn't get too small
        textAlign: "center",
    }),
    control: (provided) => ({
        ...provided,
        borderRadius: "10px",
        width: '100%',
    }),
};

function SignupPersonalize() {
    const [bookName, setBookName] = useState('');
    const [matchedBooks, setMatchedBooks] = useState([]);

    const navigate = useNavigate();

    // logs matched books every time a search is complete
    // you can get rid of this or update as you'd like!
    useEffect(() => {
        if (matchedBooks.length) {
            console.log("Matched books: ", matchedBooks);
        }
    }, [matchedBooks]);

    const search = (name) => {
        // get list of books that match by name
        axios.get('http://localhost:5555/api/handlebooks/searchBooksName/', {
            params: { q: name }, // query param
            headers: {
                // @jenn TO DO: update with user token from local storage
                Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBvcCIsImlkIjoiNjVkZDA1MTA4MTFlMTE0NzFmMjU1MTVjIiwiaWF0IjoxNzA4OTgzNTgwLCJleHAiOjE3MDg5ODcxODB9.gAEXUuy0jU1-80GOI1JJpZ3nvWnIuIy9NdsiI7CQ53I'
            }
        })
        .then(response => {
            const books = response.data.map(book => {
                return {
                    title: book.title,
                    cover: book.cover_url, 
                    author: book.author_name,
                    summary: book.summary,
                    publish_date: book.publish_date,
                    isbn: book.isbn,
                    subject: book.subject,
                    id_goodreads: book.id_goodreads
                };
            });

            setMatchedBooks(books);
        })
        .catch(error => {
            console.error("Error searching for matching books: ", error);

            // error message
            const error_message = error.response.data.message;
            toast.error(error_message);
        });
    };

    const save = () => {
        // save name (waiting for muskan route)

        // create genre preferences list
            // preferences input by user + genres of the books from matchedBooks
            // NOTE: the list of genres pertaining to each book is found in the book's "subject" field

        // save genre preferences (waiting for muskan route)

        // save "books you enjoy" to currently reading bookshelf
        // @jenn TO DO: update this code to be performed on "BooksEnjoyed" instead of matchedBooks
            // where "BooksEnjoyed" is the variable you've created for the books the user selected
            // you can call the variable whatever hehe
        matchedBooks.forEach(bookToInsert => {
            bookToInsert.userId = '65dd0510811e11471f25515c'; // @jenn TO DO: update with user id from local storage
            bookToInsert.bookshelfType = 'current';

            axios.post('http://localhost:5555/api/handlebooks/addBook', { ...bookToInsert }, {
                headers: {
                    // @jenn TO DO: update with user token from local storage
                    Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBvcCIsImlkIjoiNjVkZDA1MTA4MTFlMTE0NzFmMjU1MTVjIiwiaWF0IjoxNzA4OTgzNTgwLCJleHAiOjE3MDg5ODcxODB9.gAEXUuy0jU1-80GOI1JJpZ3nvWnIuIy9NdsiI7CQ53I'
                }
            })
            .then(response => {
                console.log("Book successfully added to current shelf: ", response.data);
            })
            .catch(error => {
                console.error("Error adding book to current shelf: ", error.response);
                
                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });
        });
        
        navigate('/explore');
    };

    return (
        <div className="personalize-container">
            <div className="header">
                <div className="text">Account Preferences</div>
            </div>

            <div className="information">
                <div className="leftSide">
                    <div className="personalize-instructions">
                    One last step! Please tell us more about yourself :)
                    </div>
                </div>
                <div className="rightSide">
                    <div className="inputs-personalize">
                        <div className='name-edit'>
                            <h4>Name</h4>
                            <input type='text'/>
                        </div>
                        <div className="genre-select">
                            <h4>Genre Preferences</h4>
                            <Select 
                                className='dropdown' 
                                options={genreOptions} 
                                onChange={opt => console.log(opt)}
                                isMulti
                                menuPlacement="auto"
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
                        </div>
                        <div className="search-books">
                                <h4>Books You Enjoy</h4>
                                <div className="book-retrieve">
                                    <input 
                                    type='text' 
                                    value={bookName}
                                    onChange={(e) => setBookName(e.target.value)}
                                    />
                                    <div className="search-button" 
                                    onClick={() => search(bookName)}
                                    >Search</div>
                                </div>
                        </div>
                    </div>
                    <div className='save-button'>
                        <div className="submit-personalize" onClick={save}>Done!</div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default SignupPersonalize;
