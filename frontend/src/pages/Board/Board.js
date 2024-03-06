import React, { useState } from 'react';
import './Board.css';
import { useParams, useNavigate } from 'react-router-dom';
import ModalAndPin from '../../components/ModalAndPin/ModalAndPin';
import { ReactComponent as BackIcon } from '../../assets/back.svg';
import Toggle from 'react-toggle'

const Board = () => {
  const navigate = useNavigate();
  const { boardId } = useParams(); // This hooks into the router and gives you the dynamic part of the URL
  const [togglePublic, setTogglePublic] = useState(true);
  

  return (
    <div className='board'>
      <div onClick={() => navigate('/boards')} className="go_back">
        <BackIcon className="back_svg"/>
        <h3>Go Back</h3>
      </div>
      <div className="discover">
        Discover
      </div>
      <div className="boardInfo">
        <h1>Board: {boardId}</h1>
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
        <ModalAndPin/>
      </div>
    </div>
  );
};

export default Board;
