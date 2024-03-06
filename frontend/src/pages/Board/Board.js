import React from 'react';
import './Board.css';
import { useParams, useNavigate } from 'react-router-dom';
import ModalAndPin from '../../components/ModalAndPin/ModalAndPin';
import { ReactComponent as BackIcon } from '../../assets/back.svg'; 
import axios from 'axios';

const Board = () => {
  const navigate = useNavigate();
  const { boardId } = useParams(); // This hooks into the router and gives you the dynamic part of the URL

  async function getBoardDetails() {
    try {
      const response = await axios.get('http://localhost:5555/api/board/getBoard/', {
          params: { boardId },
          headers: { Authorization: localStorage.getItem("user_token") }
      });
  
      console.log("board details from Board.js: ");
      console.log(response.data);
    } 
    catch (error) {
        console.error("Error getting board data: ", error);
    }
  }

  // get board details upon initialization
  getBoardDetails();

  // Here, you can fetch data based on boardId, or import a layout component and pass boardId to it
  return (
    <div className='board'>
      <div onClick={() => navigate('/boards')} className="go_back">
        <BackIcon className="back_svg"/>
        <h3>Go Back</h3>
      </div> 
      <div className="boardInfo">
        {/* 
        keep in mind that we'll be using boardId, which is the unique ID, to fetch
        information about the book including title, author, book cover 
        => this area should be replaced with book cover, title, author
        */}
      </div>
      <div className="modal">
        {/* Render your layout and data based on boardId */}
        <ModalAndPin boardId={boardId} />
      </div>
    </div>
  );
};

export default Board;