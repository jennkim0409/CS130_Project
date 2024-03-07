import React, {useState, useEffect} from 'react';
import './Board.css';
import { useParams, useNavigate } from 'react-router-dom';
import ModalAndPin from '../../components/ModalAndPin/ModalAndPin';
import { ReactComponent as BackIcon } from '../../assets/back.svg'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Board = () => {
  const navigate = useNavigate();
  const { boardId } = useParams(); // This hooks into the router and gives you the dynamic part of the URL
  const [boardDetails, setBoardDetails] = useState(null);

  async function getBoardDetails() {
    const loadingToast = toast.loading("Loading...");
    try {
      const response = await axios.get('http://localhost:5555/api/board/getBoard/', {
          params: { boardId },
          headers: { Authorization: localStorage.getItem("user_token") }
      });
  
      console.log("board details from Board.js: ");
      console.log(response.data);
      setBoardDetails(response.data);
      toast.dismiss(loadingToast);
    } 
    catch (error) {
        console.error("Error getting board data: ", error);
        toast.error("Error getting board data: ", error);
        toast.dismiss(loadingToast);
    }
  }

  // get board details upon initialization
  useEffect(() => {
    getBoardDetails();
  }, [boardId]);

  if (!boardDetails) {
    return <div>Loading...</div>;
  }

  // Here, you can fetch data based on boardId, or import a layout component and pass boardId to it
  return (
    <div className='board'>
      <div onClick={() => navigate('/boards')} className="go_back">
        <BackIcon className="back_svg"/>
        <h3>Go Back</h3>
      </div> 
      <div className="boardInfo">
        <div className="book-cover">
          {/* Assuming the boardDetails contains a bookCover property */}
          <img src={boardDetails.bookCover} alt="Book Cover" />
        </div>
        <div className="book-details">
          <div className="book-title">{boardDetails.bookTitle}</div>
          <div className="book-author">{boardDetails.bookAuthor}</div>
        </div>
      </div>
      <div className="modal">
        {/* Render your layout and data based on boardId */}
        <ModalAndPin boardId={boardId} />
      </div>
    </div>
  );
};

export default Board;