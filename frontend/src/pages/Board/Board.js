import React from 'react';
import { useParams } from 'react-router-dom';
import ModalAndPin from '../../components/ModalAndPin/ModalAndPin';

const Board = () => {
  const { boardId } = useParams(); // This hooks into the router and gives you the dynamic part of the URL

  console.log(boardId);
  // Here, you can fetch data based on boardId, or import a layout component and pass boardId to it
  return (
    <div>
      <h1>Board: {boardId}</h1>
      {/* Render your layout and data based on boardId */}
      <ModalAndPin boardId={boardId}/>
    </div>
  );
};

export default Board;