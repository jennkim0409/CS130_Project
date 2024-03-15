/**
 * @namespace SignupPersonalize
 */

import React, { useState, useEffect } from "react";
import './SignupPersonalize.css'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import SearchBooks from '../SearchBooks/SearchBooks';
import axios from 'axios';
import GenrePreferences from '../GenrePreferences/GenrePreferences';

// overriding leftSide style
const leftSideStyle = {
    display: 'flex',
    justifyContent: 'flex-end', 
};

/**
 * SignupPersonalize component.
 * @memberof SignupPersonalize
 * @returns {JSX.Element} SignupPersonalize component
 */
function SignupPersonalize() {
    const [bookName, setBookName] = useState('');
    const [matchedBooks, setMatchedBooks] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [addedBooks, setAddedBooks] = useState({});
    const [genrePreferences, setGenrePreferences] = useState([]);
    const [additionalGenres, setAdditionalGenres] = useState([]);
    const [name, setName] = useState('');

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

    /**
     * Search for books.
     * @param {string} name - The name of the book to search for.
     * @memberof SignupPersonalize
     * @returns {void}
     */
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
                    isbn: book.isbn,
                    subject: book.subject,
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

    /**
     * Save a book.
     * @param {Object} bookToInsert - The book to save.
     * @memberof SignupPersonalize
     * @returns {void}
     */
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
    
                // add max of 3 genres to additionalGenres
                const genres = bookToInsert.subject.length > 3 ? bookToInsert.subject.slice(0, 3) : bookToInsert.subject;
                setAdditionalGenres([...additionalGenres, genres]);
            })
            .catch(error => {
                console.error("Error adding book to current shelf: ", error.response);
                
                // error message
                const error_message = error.response.data.message;
                toast.error(error_message);
            });
    }

    /**
     * Save genre preferences and name.
     * @memberof SignupPersonalize
     * @returns {void}
     */
    const save = () => {
        // This is an array of the additional genres retrieved from their selected books (3 max per book)
        const condensedAdditionalGenres = [...new Set(additionalGenres.flat())];
        // This is an array of the genres they entered in Genre Preferences
        const condensedGenrePreferences = genrePreferences.map(obj => obj.value);
        
        while (condensedGenrePreferences.length < 5 && condensedAdditionalGenres.length > 0) {
            const randomIndex = Math.floor(Math.random() * condensedAdditionalGenres.length);
            const randomElement = condensedAdditionalGenres[randomIndex];
            if (!condensedGenrePreferences.includes(randomElement.toLowerCase())) {
                condensedGenrePreferences.push(randomElement.toLowerCase()); // Add to condensedGenrePreferences in lowercase
                condensedAdditionalGenres.splice(randomIndex, 1); // Remove the element from condensedAdditionalGenres
            }
        }
        console.log(condensedGenrePreferences)

        // Save name and genre preferences
        const path = 'http://localhost:5555/api/user/set/' + localStorage.getItem("user_id").replace(/"/g, ''); // gets rid of double quotes in user_id
        axios.patch(path,
            { name: name, genrePrefs: condensedGenrePreferences },
            {
              headers: {
                Authorization: localStorage.getItem("user_token")
              }
            }
        )
        .then(response => {
            console.log("Name and genre preferences saved successfully: ", response.data);
            toast.success("Account preferences saved!");
            localStorage.setItem('user_name', name);
        })
        .catch(error => {
            console.error("Error saving name & genre preferences: ", error);

            // error message
            const error_message = error.response.data.message;
            toast.error(error_message);
        });
        
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
                                <input 
                                type='text'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="genre-select">
                                <h4>Genre Preferences</h4>
                                <GenrePreferences return_genres={setGenrePreferences}/>
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
