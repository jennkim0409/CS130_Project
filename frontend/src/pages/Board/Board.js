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
  const { boardId } = useParams(); // This hooks into the router and gives you the dynamic part of the URL
  const [togglePublic, setTogglePublic] = useState(true);
  const [boardDetails, setBoardDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [discoverOptions, setDiscoverOptions] = useState([]);
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
    } 
    catch (error) {
        console.error("Error getting board data: ", error);
        toast.error("Error getting board data: ", error);
    }
  }

  // todo @ kaylee : get a list of boards with user's name from backend
  // also togglePublic stores whether a user wants board to be public or not
  // so store this in backend as well!
  async function getDropdownOptions() {
    try {
      // code to get a list of other boards of the same book
      // use setDiscoverOptions to update what gets shown in dropdown
      // once implemented, you can get rid of this example array ! just wanted to show what dropdown looks like
      const example = [
        { id: 1, name: 'jenn' },
        { id: 2, name: 'kaylee' },
        { id: 3, name: 'charlene' },
      ];
      setDiscoverOptions(example);
    } catch (error) {
      console.error("Error fetching dropdown options: ", error);
      toast.error("Error fetching dropdown options");
    }
  }

  // get board details and discover options upon initialization
  useEffect(() => {
    getBoardDetails();
    getDropdownOptions();
  }, [boardId]);

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
      <div className="discover" ref={discoverRef} onClick={() => setShowDropdown(!showDropdown)} data-tooltip-id="my-tooltip-1">
        Discover
      </div>
      {showDropdown && (
          <div className="dropdown-content" ref={dropdownRef}>
            {discoverOptions.map((option, index) => (
              <div key={index} className="dropdown-item" onClick={()=>console.log(option.name)}>
                {option.name}
              </div>
            ))}
          </div>
      )}
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
      <div className="privacy">
        <label>
          <h4 style={{margin: '5px'}}>Make Public?</h4>
            <Toggle
              defaultChecked={togglePublic}
              onChange={() => setTogglePublic(!!togglePublic)}
            />
        </label>
      </div>
      <div className="modal">
        {/* Render your layout and data based on boardId */}
        <ModalAndPin boardId={boardId}/>
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
