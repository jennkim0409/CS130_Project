import React, {useState} from "react";
import "./Shelves.css";
import Bookshelf from '../../components/Bookshelf/Bookshelf';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBooks from '../../components/SearchBooks/SearchBooks';
import expiredToken from '../../components/ExpiredToken';

function Shelves() {
    const [searchTerm, setSearchTerm] = useState('');
    const [matchedBooks, setMatchedBooks] = useState([]);
    const [addedBooks, setAddedBooks] = useState({});

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            search(); 
        }
    }

    const handleTermChange = (e) => {
        setSearchTerm(e.target.value);
        if (searchTerm === '') {
            setMatchedBooks([]);
        }
    }

    const search = () => {
        const loadingToast = toast.loading("Loading...");

        // get list of books that match by name
        axios.get('http://localhost:5555/api/handlebooks/searchBooksName/', {
            params: { q: searchTerm }, // query param
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
            if (error.response.data.message === "Unauthorized- Invalid Token" || 
                error.response.data.message === "Unauthorized- Missing token") {
                expiredToken();
            }
            toast.error(error_message);
            toast.dismiss(loadingToast);
        });
    }

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
            })
            .catch(error => {
                console.error("Error adding book to current shelf: ", error.response);
                
                // error message
                const error_message = error.response.data.message;
                if (error.response.data.message === "Unauthorized- Invalid Token" || 
                    error.response.data.message === "Unauthorized- Missing token") {
                    expiredToken();
                }
                toast.error(error_message);
            });
    }

    return(
        <div className="Library">
            <h2 style={{textAlign: "center"}}>My Shelves</h2>
            <div className="items">
            <div className="search-bar">
                <input placeholder="Search for a book by title" onChange={handleTermChange} onKeyUp={handleKeyPress}/>
                {matchedBooks.length > 0 && searchTerm !== '' &&
                        <SearchBooks books={matchedBooks} save_book={save_book} addedBooks={addedBooks}/>
                }  
            </div>
            <Bookshelf/>
            </div>
        </div>
    );
}
export default Shelves;