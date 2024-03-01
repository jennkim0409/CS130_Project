import React, {useState} from 'react';

import {Photo} from '../Bookshelf/Photo';
import reading from '../Bookshelf/reading.json';
import recommended from '../Bookshelf/recommended.json';
import '../LoginSignup/LoginSignup.css';

const Recommendations = () => {
  // items imported from .json (links to images)
  // hash table into readingList and recommendedList
  const [items, setItems] = useState({
    readingList: reading,
    recommendedList: recommended,
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
          {items.readingList.map((url, index) => (
            <div style= {recListStyle}>
              {/* book cover */}
              <Photo key={url} url={url} index={index} height= '18vw' width= '12vw' />
              {/* book info */} 
              <div style= {{ marginLeft: '5%' }}>
                <h3 style= {{ margin: '0px' }} >Title of Book</h3>
                <h5 style= {{ margin: '0px' }}>Author First, Last</h5>
                <h5 style= {{ width: '40vw' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.</h5>
                <h5>Subject: List of Subjects</h5>
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
