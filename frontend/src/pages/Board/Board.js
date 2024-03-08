import React, {useState, useEffect, useRef} from 'react';
import './Board.css';
import { useParams, useNavigate } from 'react-router-dom';
import ModalAndPin from '../../components/ModalAndPin/ModalAndPin';
import { ReactComponent as BackIcon } from '../../assets/back.svg';
import Toggle from 'react-toggle'
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip as ReactTooltip } from 'react-tooltip'

const Board = () => {
  const navigate = useNavigate();
  const { userId, boardId } = useParams(); // This hooks into the router and gives you the dynamic part of the URL
  const [togglePublic, setTogglePublic] = useState(true);
  const [boardDetails, setBoardDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [discoverOptions, setDiscoverOptions] = useState([]);
  const [username, updateUsername] = useState(localStorage.getItem('user_name'));
  const [discoverMessage, setDiscoverMessage] = useState("");
  const dropdownRef = useRef(null);
  const discoverRef = useRef(null);

  async function getBoardDetails() {
    try {
      const response = await axios.get('http://localhost:5555/api/board/getBoard/', {
          params: { boardId },
          headers: { Authorization: localStorage.getItem("user_token") }
      });
  
      console.log("board details from Board.js: ");
      console.log(response.data);
      setBoardDetails(response.data);
      updateUsername(response.data.username);
      setTogglePublic(response.data.publicVisibility);
    } 
    catch (error) {
        console.error("Error getting board data: ", error);
        toast.error("Error getting board data: ", error);
    }
  }

  async function getDropdownOptions() {
    try {
      let boardsList = [];
      if (boardDetails) {
        const response = await axios.get('http://localhost:5555/api/board/getBoardsByBook/', {
          params: { userId: localStorage.getItem("user_id").replace(/"/g, ''), bookTitle: boardDetails.bookTitle, bookAuthor: boardDetails.bookAuthor },
          headers: { Authorization: localStorage.getItem("user_token") }
        });
        boardsList = response.data;
        console.log("list of boards for this book: ", boardsList);
      }

      setDiscoverOptions(boardsList);
    } catch (error) {
      if (error.response.data.message === "No boards found for the given book") {
        setDiscoverMessage("No other users have made boards for this book yet.");
      }
      else {
        console.error("Error fetching dropdown options: ", error);
        toast.error("Error fetching dropdown options");
      }
    }
  }

  // get board details and discover options upon initialization
  useEffect(() => {
    getBoardDetails();
  }, [boardId, userId]);

  // get dropdown options once board details is initialized properly
  useEffect(() => {
    getDropdownOptions();
  }, [boardDetails]); 

  // save board's visibility in backend
  useEffect(() => {
    async function updateVisibility() {
      try {
        const response = await axios.post('http://localhost:5555/api/board/updateBoardVisibility/', 
        { boardId: boardId, publicVisibility: togglePublic }, 
        {
            headers: { Authorization: localStorage.getItem("user_token") }
        });
        console.log(response.data);
      } 
      catch (error) {
          console.error("Error saving public toggle status in backend: ", error);
      }
    }
    updateVisibility();
  }, [togglePublic]);

  // handles allowing a user to click anywhere on page to get rid of 
  // discovery boards list
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
      discoverRef.current && !discoverRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); 

  // @ jenn here's rest of info you need!
  function discoverBoard(board) {
    const url = `/boards/${board.userId}/${board.id}`;
    window.open(url, '_blank');
  }

  function handleDropDown() {
    if (discoverMessage !== "") {
      toast.info(discoverMessage, {
        autoClose: 2000,
        pauseOnHover: false,
      });
    }
    else {
      setShowDropdown(!showDropdown);
    }
  }

  if (!boardDetails) {
    return (
      <div className="loading-page">
          <h4 style={{marginBottom: '0px'}}>Loading...</h4>
          <div className="spinner"/>
          <div className="boardInfo"/>
      </div>
    );
  }

  // Here, you can fetch data based on boardId, or import a layout component and pass boardId to it
  return (
    <div className='board'>
      <div onClick={() => navigate('/boards')} className="go_back">
        <BackIcon className="back_svg"/>
        <h3>Go Back</h3>
      </div> 
      {
        userId === localStorage.getItem('user_id') ? (
          <>
            <div className="discover" ref={discoverRef} onClick={() => handleDropDown()} data-tooltip-id="my-tooltip-1">
              Discover
            </div>
            {showDropdown && (
              <div className="dropdown-content" ref={dropdownRef}>
                {discoverOptions.map((option, index) => (
                  <div key={index} className="dropdown-item" onClick={()=>discoverBoard(option)}>
                    {option.username}
                  </div>
                ))}
              </div>
            )}
          </>
        )
        :
        <div className="other-user">
          {username}'s Board
        </div>
      }
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
      {
        userId == localStorage.getItem('user_id') ?
          <div className="privacy">
            <label>
              <h4 style={{margin: '5px'}}>Make Public?</h4>
                <Toggle
                  defaultChecked={togglePublic}
                  onChange={() => setTogglePublic(!togglePublic)}
                />
            </label>
          </div>
          :
          null
      }
      <div className="modal">
        {/* Render your layout and data based on boardId */}
        <ModalAndPin boardId={boardId} owner={userId === localStorage.getItem('user_id')}/>
      </div>
      <ReactTooltip
        id="my-tooltip-1"
        place="bottom"
        content="Explore boards made by other users!"
      />  
    </div>
  );
};

export default Board;
