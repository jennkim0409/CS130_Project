import Select from 'react-select';
import React, { useState, useEffect } from "react";
import './SignupPersonalize.css'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import SearchBooks from '../SearchBooks/SearchBooks';
import axios from 'axios';
import { set } from 'mongoose';

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

// style for react-select component
const selectStyles = {
    container: (provided) => ({
        ...provided,
        width: '60%', 
        minWidth: '300px',
        textAlign: "center",
    }),
    control: (provided) => ({
        ...provided,
        borderRadius: "10px",
        width: '100%',
    }),
};
// overriding leftSide style
const leftSideStyle = {
    display: 'flex',
    justifyContent: 'flex-end', 
};

function SignupPersonalize() {
    const [bookName, setBookName] = useState('');
    const [matchedBooks, setMatchedBooks] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [addedBooks, setAddedBooks] = useState({});
    const [genrePreferences, setGenrePreferences] = useState([]);
    const [additionalGenres, setAdditionalGenres] = useState([]);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    const navigate = useNavigate();

    useEffect(() => {
        if (matchedBooks.length) {
            console.log("Matched books: ", matchedBooks);
        }
    }, [matchedBooks]);

    const search = (name) => {
        const loadingToast = toast.loading("Loading...");

        // get list of books that match by name
        axios.get('http://localhost:5555/api/handlebooks/searchBooksName/', {
            params: { q: name }, // query param
            headers: {
                Authorization: localStorage.getItem("user_token")
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
            toast.dismiss(loadingToast);
        })
        .catch(error => {
            console.error("Error searching for matching books: ", error);

            // error message
            const error_message = error.response.data.message;
            toast.error(error_message);
            toast.dismiss(loadingToast);
        });
    };

    /* save the book(s) that a user "Add"s from the list of matched books */
    const save_book = (bookToInsert) => {
        bookToInsert.userId = localStorage.getItem("user_id");
        bookToInsert.bookshelfType = 'current';

        axios.post('http://localhost:5555/api/handlebooks/addBook', { ...bookToInsert }, {
                headers: {
                    Authorization: localStorage.getItem("user_token")
                }
            })
            .then(response => {
                console.log("Book successfully added to current shelf: ", response.data);

                toast.success("Successfully added book!");
                setAddedBooks(prev => ({ ...prev, [bookToInsert.isbn]: true }));
                setAdditionalGenres([...additionalGenres, bookToInsert.subject]);
            })
            .catch(error => {
                console.error("Error adding book to current shelf: ", error.response);
                
                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });
    }

    /* Save the genre preferences and name */
    const save = () => {
        // @kaylee TO DO: save name (waiting for muskan route)

        // This is an array of all the additional genres retrieved from their selected books
        const condensedAdditionalGenres = [...new Set(additionalGenres.flat())];
        // This is an array of the genres they entered in Genre Preferences
        const condensedGenrePreferences = genrePreferences.map(obj => obj.value);
        console.log(condensedGenrePreferences);
        console.log(condensedAdditionalGenres);

        // @kaylee TO DO: save genre preferences (waiting for muskan route)
        
        navigate('/explore');
    };

    return (
        <div className="personalize-container">
            <div className="header">
                <div className="text">Account Preferences</div>
            </div>

            <div className="all-information">
                <div className="information" style={{maxWidth: '500px'}}>
                    <div className="leftSide" style={leftSideStyle}>
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
                                    onChange={opt => setGenrePreferences(opt)}
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
                        </div>
                    </div>
                </div>
                <div className="search-books">
                    <h4>Provide a Few Books You’re Currently Reading</h4>
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

                    {matchedBooks.length > 0 &&
                        <SearchBooks books={matchedBooks} save_book={save_book} addedBooks={addedBooks}/>
                    }  
                </div>
                <div className='save-button'>
                    <div className="submit-personalize" onClick={save}>Done!</div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default SignupPersonalize;
