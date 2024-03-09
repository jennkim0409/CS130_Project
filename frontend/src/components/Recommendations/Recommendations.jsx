import React, {useState, useEffect} from 'react';
import axios from 'axios';

import {Photo} from '../Bookshelf/Photo';
import '../LoginSignup/LoginSignup.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import expiredToken from '../ExpiredToken';

/* 
Recommendation logic overview:
   -> we check to see if we have books in our recommendation shelf
      -> if so, we store as a state object
      -> if not, we fetch recommended books, add them to our recommended shelf, then store as state object
   -> later, when getting the actual recommendations for the page, we randomly choose ten
      from the recommended shelf)
   -> Q: how will the recommendations be updated when a user changes their genre preferences?
      A: each time a user updates genre preference, we will empty out recommendation shelf in backend,
      forcing the frontend to fetch recommendations again
*/
const Recommendations = () => {
  // items imported from .json (links to images)
  // hash table into readingList and recommendedList
  const [items, setItems] = useState({
    recommendations: [],
  })

  const [recommendedShelfBooks, setRecommendedShelfBooks] = useState([]);

  // runs when component mounts
  useEffect(() => {
    const getRecommendationData = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/handlebooks/getBooks/', {
          params: { userId: localStorage.getItem("user_id").replace(/"/g, ''), type: 'recommended' },
          headers: { Authorization: localStorage.getItem("user_token") }
        });
  
        const currRecBooks = response.data;
        // Check if current recommendations exist
        if (currRecBooks.length === 0) {
          const recToast = toast.loading("Fetching book recommendations.. This may take a minute!");
          const path = 'http://localhost:5555/api/recommend/' + localStorage.getItem("user_id").replace(/"/g, '');
          
          try {
            const response = await axios.post(path, {}, {
              headers: { Authorization: localStorage.getItem("user_token") }
            });
  
            const recObjects = response.data;
            let newCurrRecBooks = [];
  
            await Promise.all(recObjects.map(async (recObj) => {
              const bookFields = recObj[0];
              const bookToInsert = {
                title: bookFields.title,
                summary: bookFields.summary,
                isbn: bookFields.isbn,
                subject: bookFields.subject,
                userId: localStorage.getItem("user_id").replace(/"/g, ''),
                bookshelfType: 'recommended',
                cover: bookFields.cover_url,
                author: bookFields.author_name
              };
  
              try {
                const response = await axios.post('http://localhost:5555/api/handlebooks/addBook', bookToInsert, {
                  headers: { Authorization: localStorage.getItem("user_token") }
                });
                newCurrRecBooks.push(response.data.book);
              } catch (error) {
                console.error("Error adding book to recommended shelf: ", error.response);
                // Handle error (e.g., token invalidation) here
              }
            }));
  
            toast.dismiss(recToast);
            console.log("All book recommendation insertions completed!");
            setRecommendedShelfBooks(newCurrRecBooks);

          } catch (error) {
            console.error("Error getting recommendations: ", error);
            toast.dismiss(recToast);
          }
        } else {
          setRecommendedShelfBooks(currRecBooks);
        }
      } catch (error) {
        console.error("Error fetching initial book data: ", error);
        if (error.response.data.message === "Unauthorized- Invalid Token" || 
          error.response.data.message === "Unauthorized- Missing token") {
          expiredToken();
        }
      }
    };
  
    getRecommendationData();
  }, []);
  

  // when the recommendedShelfBooks variable is updated in getRecommendationData function
  // we will get current recommendations for the page
  useEffect(() => {
    getCurrentRecommendations();
  }, [recommendedShelfBooks]);

  // get current, randomized recommendations from the recommendation shelf
  function getCurrentRecommendations() {
    const itemsData = {};
    itemsData.recommendations = [];

    // if number of desired displayable recs is equal to or more than the number of recs we have
    // then just display the recs that we have
    const numDisplayableRecs = 10;
    if (numDisplayableRecs >= recommendedShelfBooks.length) {
      itemsData.recommendations = recommendedShelfBooks;
      setItems(itemsData);
    }
    else {
      // get randomized books from recommendation shelf
      const randomIndices = generateRandomIndices(recommendedShelfBooks.length, numDisplayableRecs);

      const currBookRecs = randomIndices.map(index => recommendedShelfBooks[index]);
      console.log("curr book recs are: ", currBookRecs);
      itemsData.recommendations = currBookRecs;
      setItems(itemsData);
    }
  }

  function generateRandomIndices(arrayLength, numIndices) {
    // create array with indices from 0 to arrayLength - 1
    let indices = Array.from({ length: arrayLength }, (_, index) => index);

    // shuffle array to randomize the indices
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // return desired number of random indices
    return indices.slice(0, numIndices);
  }

  // move saved book from recommended shelf to current shelf
  const saveBook = (bookToInsert) => {
    bookToInsert.userId = localStorage.getItem("user_id");
    bookToInsert.fromShelf = 'recommended';
    bookToInsert.toShelf = 'current';
    bookToInsert.bookId = bookToInsert.id;

    axios.post('http://localhost:5555/api/handlebooks/moveBook', { ...bookToInsert }, {
        headers: {
            Authorization: localStorage.getItem("user_token")
        }
    })
    .then(response => {
        console.log("Book successfully moved to current shelf: ", response);
        // @ charlene TO DO: once this is complete, disable the save button for this book
    })
    .catch(error => {
        console.error("Error moving book to current shelf: ", error.response);
        if (error.response.data.message === "Unauthorized- Invalid Token" || 
          error.response.data.message === "Unauthorized- Missing token") {
          expiredToken();
        }
    });
  }

  function shuffleBooks() {
    if (recommendedShelfBooks.length !== 0) {
      getCurrentRecommendations();
    }
  }

  const recListStyle = {
    display: 'flex', 
    justifyContent: 'space-between',
    marginBottom: '5%',
    marginLeft: '15%',
    marginRight: '15%',
  }

  return (
    <div>
      <div style= {{ display: 'flex', justifyContent: 'center' }}>
        <div className="submit" onClick={() => shuffleBooks()}>Shuffle</div>
      </div>

      <br/><br/><br/>

      <div>
          {items.recommendations.map((book, index) => (
            <div style= {recListStyle} key= {index}>
              {/* book cover */}
              <Photo key={book.cover} url={book.cover} index={index} height= '18vw' width= '12vw' />
              {/* book info */} 
              <div style= {{ marginLeft: '5%' }}>
                <h3 style= {{ margin: '0px', width: '40vw' }} >{book.title}</h3>
                <h5 style= {{ margin: '0px' }}>{book.author}</h5>
                <h5 style= {{ width: '40vw' }}>{book.summary[0]}</h5>
                {/* show max 10 subjects per book */} 
                <h5 style= {{ width: '40vw' }}>Subjects: {book.subject.length > 10 ? book.subject.slice(0, 10).join(", ") : book.subject.join(", ")}</h5>
              </div>
              {/* save button */} 
              <div className="submit gray" style= {{ width: '10vw' }} onClick={() => saveBook(book)}>Save</div>
            </div>
          ))}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Recommendations;
