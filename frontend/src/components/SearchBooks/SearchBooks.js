import React, {useState} from 'react';
import './SearchBooks.css';

function SearchBooks({ books, save_book, addedBooks }) {
    return (
        <div className="search-response">
            <h4>Top Results</h4>
            <div className="resulting-books">
            {books.map((book, index) => (
                <div key={index} className="individual-book">
                    <div className="individual-book-title">{book.title}</div>
                    <div className="individual-book-author">{book.author}</div>
                    <img src={book.cover} alt={`Book cover of ${book.title}`} style={{ height: '150px' }} />
                    <div 
                    className={addedBooks[book.isbn] ? 'button-added' : 'button-add'}
                    onClick={() => save_book(book)}>
                        {addedBooks[book.isbn] ? "Added" : "Add"}
                    </div>
                </div>
            ))}
        </div>
        </div>
    );

}
export default SearchBooks;