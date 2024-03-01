import React, {useState} from 'react';

import {Photo} from '../Bookshelf/Photo';
import recommended from '../Bookshelf/recommendations.json';
import '../LoginSignup/LoginSignup.css';

const Recommendations = () => {
  // items imported from .json (links to images)
  // hash table into readingList and recommendedList
  const [items, setItems] = useState({
    recommendations: recommended,
  })

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
        <div className="submit">Shuffle</div>
      </div>

      <br/><br/><br/>

      <div>
          {items.recommendations.map((book, index) => (
            <div style= {recListStyle} key= {index}>
              {/* book cover */}
              <Photo key={book.image_url} url={book.image_url} index={index} height= '18vw' width= '12vw' />
              {/* book info */} 
              <div style= {{ marginLeft: '5%' }}>
                <h3 style= {{ margin: '0px' }} >{book.title}</h3>
                <h5 style= {{ margin: '0px' }}>{book.author}</h5>
                <h5 style= {{ width: '40vw' }}>{book.description}</h5>
                <h5>Subject: {book.subjects.join(", ")}</h5>
              </div>
              {/* save button */} 
              <div className="submit gray" style= {{ width: '10vw' }} >Save</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Recommendations;
